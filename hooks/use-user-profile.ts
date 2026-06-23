import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import {
  educationCol,
  experienceCol,
  projectsCol,
  userDoc,
  serverTimestamp,
  type Education,
  type Experience,
  type Project,
} from "@/lib/firestore";
import {
  useFirebaseUser,
  nicknameFromUser,
} from "@/hooks/use-firebase-user";
import { auth as nattaAuth, NattaApiError } from "@/lib/natta-api";
import { buildAvatarDataUri } from "@/lib/avatar";

const LEGACY_PROFILE_STORAGE_KEY = "@natta_profile";
const LEGACY_LEGACY_KEY = "@aipply_profile";
const MIGRATION_FLAG = "@natta_profile_migrated_to_firestore";

/**
 * What the Profile screen renders.
 *
 * Hybrid data sources:
 * - `name` (nickname) always comes from Firebase Auth (`displayName`)
 * - `bio` + `interests` come from the NATTA backend (Postgres, shared with
 *   the website) via `auth.me` / `auth.updateProfile`
 * - `title`, `education`, `experience`, `projects`, `skills` are app-only —
 *   stored in Firestore (`users/{uid}` + subcollections)
 *
 * If the backend is sleeping (Render free tier cold start), the API fields
 * stay empty until the first successful fetch; the rest still renders.
 */
type LoadedProfile = {
  name: string;
  title: string;
  bio: string;
  photoURL: string;
  interests: string[];
  skills: string[];
  apiStatus: "idle" | "loading" | "ready" | "error";
};

type ExtraSections = {
  education: Education[];
  experience: Experience[];
  projects: Project[];
};

const emptyProfile = (name: string, photoURL = ""): LoadedProfile => ({
  name,
  title: "",
  bio: "",
  photoURL,
  interests: [],
  skills: [],
  apiStatus: "idle",
});

const emptyExtras: ExtraSections = {
  education: [],
  experience: [],
  projects: [],
};

/**
 * Union of two tag lists, keeping `primary` order and appending any items from
 * `extra` that aren't already present (case-insensitive). Used to merge the
 * legacy Firestore `skills` into the canonical NATTA `interests`.
 */
function mergeUnique(primary: string[], extra: string[]): string[] {
  const seen = new Set(primary.map((s) => s.trim().toLowerCase()));
  const out = [...primary];
  for (const item of extra) {
    const key = item.trim().toLowerCase();
    if (key && !seen.has(key)) {
      seen.add(key);
      out.push(item.trim());
    }
  }
  return out;
}

async function migrateAsyncStorageOnce(uid: string) {
  const flagKey = `${MIGRATION_FLAG}:${uid}`;
  if (await AsyncStorage.getItem(flagKey)) return;

  const scopedKey = `${LEGACY_PROFILE_STORAGE_KEY}:${uid}`;
  const raw =
    (await AsyncStorage.getItem(scopedKey)) ??
    (await AsyncStorage.getItem(LEGACY_PROFILE_STORAGE_KEY)) ??
    (await AsyncStorage.getItem(LEGACY_LEGACY_KEY));

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      await userDoc(uid).set(
        {
          title: parsed.title ?? "",
          skills: Array.isArray(parsed.skills) ? parsed.skills : [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      const batch = firestore().batch();
      for (const item of parsed.education ?? []) {
        const ref = educationCol(uid).doc();
        batch.set(ref, {
          institution: item.institution ?? "",
          degree: item.degree ?? "",
          period: item.period ?? "",
        });
      }
      for (const item of parsed.experience ?? []) {
        const ref = experienceCol(uid).doc();
        batch.set(ref, {
          title: item.title ?? "",
          company: item.company ?? "",
          period: item.period ?? "",
          description: item.description ?? "",
        });
      }
      for (const item of parsed.projects ?? []) {
        const ref = projectsCol(uid).doc();
        batch.set(ref, {
          title: item.title ?? "",
          description: item.description ?? "",
          tags: Array.isArray(item.tags) ? item.tags : [],
        });
      }
      await batch.commit();
    } catch (err) {
      console.warn("[profile] migration from AsyncStorage failed", err);
    }
  }

  await AsyncStorage.setItem(flagKey, "1");
}

export function useUserProfile() {
  const firebaseUser = useFirebaseUser();
  const uid = firebaseUser?.uid ?? null;
  const [profile, setProfile] = useState<LoadedProfile>(() =>
    emptyProfile(nicknameFromUser(firebaseUser), firebaseUser?.photoURL ?? ""),
  );
  const [extras, setExtras] = useState<ExtraSections>(emptyExtras);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!uid) {
      setProfile(
        emptyProfile(nicknameFromUser(firebaseUser), firebaseUser?.photoURL ?? ""),
      );
      setExtras(emptyExtras);
      setLoading(false);
      return;
    }
    setLoading(true);
    setProfile((prev) => ({ ...prev, apiStatus: "loading" }));
    // Legacy Firestore skills, captured here so we can fold them into the
    // canonical NATTA `interests` once that fetch resolves (see migration below).
    let legacySkills: string[] = [];
    try {
      await migrateAsyncStorageOnce(uid);

      // Firestore (extras + title + skills) — fast, always works offline
      const [docSnap, eduSnap, expSnap, projSnap] = await Promise.all([
        userDoc(uid).get(),
        educationCol(uid).get(),
        experienceCol(uid).get(),
        projectsCol(uid).get(),
      ]);
      const firestoreData = (docSnap.data() ?? {}) as {
        title?: string;
        skills?: string[];
        photoURL?: string;
      };
      legacySkills = firestoreData.skills ?? [];
      setProfile((prev) => ({
        ...prev,
        name: nicknameFromUser(firebaseUser),
        title: firestoreData.title ?? "",
        // Firestore wins; fall back to the auth provider photo (e.g. Google).
        photoURL: firestoreData.photoURL ?? firebaseUser?.photoURL ?? "",
        skills: legacySkills,
      }));
      setExtras({
        education: eduSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Education, "id">),
        })),
        experience: expSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Experience, "id">),
        })),
        projects: projSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Project, "id">),
        })),
      });
    } catch (err) {
      console.warn("[profile] firestore reload failed", err);
    } finally {
      setLoading(false);
    }

    // NATTA backend (bio + interests) — may cold-start on Render free tier
    try {
      const me = await nattaAuth.me();
      let interests = me?.interests ?? [];

      // One-time merge: fold legacy Firestore `skills` into `interests` (the
      // unified "Skills & Interests" field), then clear the old skills so we
      // don't migrate again on the next load.
      if (legacySkills.length > 0) {
        const merged = mergeUnique(interests, legacySkills);
        try {
          if (merged.length !== interests.length) {
            await nattaAuth.updateProfile({ interests: merged });
            interests = merged;
          }
          await userDoc(uid).set(
            { skills: [], updatedAt: serverTimestamp() },
            { merge: true },
          );
          legacySkills = [];
        } catch (merrErr) {
          // Migration is best-effort; keep skills for a later attempt.
          console.warn("[profile] skills→interests migration failed", merrErr);
        }
      }

      setProfile((prev) => ({
        ...prev,
        bio: me?.bio ?? "",
        interests,
        skills: legacySkills,
        apiStatus: "ready",
      }));
    } catch (err) {
      if (err instanceof NattaApiError) {
        console.warn("[profile] NATTA backend fetch failed", err.code, err.message);
      } else {
        console.warn("[profile] NATTA backend fetch failed", err);
      }
      setProfile((prev) => ({ ...prev, apiStatus: "error" }));
    }
  }, [uid, firebaseUser]);

  useEffect(() => {
    reload();
  }, [reload]);

  // --- Save handlers -------------------------------------------------------

  /** Title + skills live in Firestore. */
  const saveLocalProfile = useCallback(
    async (partial: Partial<Pick<LoadedProfile, "title" | "skills">>) => {
      if (!uid) return;
      await userDoc(uid).set(
        { ...partial, updatedAt: serverTimestamp() },
        { merge: true },
      );
      setProfile((prev) => ({ ...prev, ...partial }));
    },
    [uid],
  );

  /**
   * Downscales the picked image to a small base64 data URI and stores it on the
   * Firestore user doc (`photoURL`). No external storage is used — see
   * `lib/avatar.ts`. Returns the stored data URI.
   */
  const saveAvatar = useCallback(
    async (localUri: string) => {
      if (!uid) return null;
      const dataUri = await buildAvatarDataUri(localUri);
      await userDoc(uid).set(
        { photoURL: dataUri, updatedAt: serverTimestamp() },
        { merge: true },
      );
      setProfile((prev) => ({ ...prev, photoURL: dataUri }));
      return dataUri;
    },
    [uid],
  );

  /** Clears the stored avatar from the Firestore user doc. */
  const removeAvatar = useCallback(async () => {
    if (!uid) return;
    await userDoc(uid).set(
      { photoURL: "", updatedAt: serverTimestamp() },
      { merge: true },
    );
    setProfile((prev) => ({ ...prev, photoURL: "" }));
  }, [uid]);

  /** Bio + interests live in the NATTA backend (shared with website). */
  const saveApiProfile = useCallback(
    async (partial: { bio?: string; interests?: string[] }) => {
      await nattaAuth.updateProfile(partial);
      setProfile((prev) => ({ ...prev, ...partial }));
    },
    [],
  );

  /**
   * Convenience: accept the full editable shape from the screen and route
   * each field to the right backend. Network errors from the API don't
   * undo the local save.
   */
  const saveProfile = useCallback(
    async (partial: {
      title?: string;
      bio?: string;
      skills?: string[];
      interests?: string[];
    }) => {
      const local: Partial<Pick<LoadedProfile, "title" | "skills">> = {};
      if (partial.title !== undefined) local.title = partial.title;
      if (partial.skills !== undefined) local.skills = partial.skills;
      if (Object.keys(local).length > 0) await saveLocalProfile(local);

      const api: { bio?: string; interests?: string[] } = {};
      if (partial.bio !== undefined) api.bio = partial.bio;
      if (partial.interests !== undefined) api.interests = partial.interests;
      if (Object.keys(api).length > 0) {
        try {
          await saveApiProfile(api);
        } catch (err) {
          console.warn("[profile] NATTA updateProfile failed", err);
          throw err;
        }
      }
    },
    [saveLocalProfile, saveApiProfile],
  );

  // --- Subcollection helpers (unchanged shape, all Firestore) --------------

  const addEducation = useCallback(
    async (entry: Omit<Education, "id">) => {
      if (!uid) return;
      const ref = await educationCol(uid).add(entry);
      setExtras((prev) => ({
        ...prev,
        education: [...prev.education, { id: ref.id, ...entry }],
      }));
    },
    [uid],
  );

  const addExperience = useCallback(
    async (entry: Omit<Experience, "id">) => {
      if (!uid) return;
      const ref = await experienceCol(uid).add(entry);
      setExtras((prev) => ({
        ...prev,
        experience: [...prev.experience, { id: ref.id, ...entry }],
      }));
    },
    [uid],
  );

  const addProject = useCallback(
    async (entry: Omit<Project, "id">) => {
      if (!uid) return;
      const ref = await projectsCol(uid).add(entry);
      setExtras((prev) => ({
        ...prev,
        projects: [...prev.projects, { id: ref.id, ...entry }],
      }));
    },
    [uid],
  );

  const removeEducation = useCallback(
    async (id: string) => {
      if (!uid) return;
      await educationCol(uid).doc(id).delete();
      setExtras((prev) => ({
        ...prev,
        education: prev.education.filter((e) => e.id !== id),
      }));
    },
    [uid],
  );

  const removeExperience = useCallback(
    async (id: string) => {
      if (!uid) return;
      await experienceCol(uid).doc(id).delete();
      setExtras((prev) => ({
        ...prev,
        experience: prev.experience.filter((e) => e.id !== id),
      }));
    },
    [uid],
  );

  const removeProject = useCallback(
    async (id: string) => {
      if (!uid) return;
      await projectsCol(uid).doc(id).delete();
      setExtras((prev) => ({
        ...prev,
        projects: prev.projects.filter((p) => p.id !== id),
      }));
    },
    [uid],
  );

  return {
    profile: {
      ...profile,
      name: nicknameFromUser(null) || profile.name,
    },
    education: extras.education,
    experience: extras.experience,
    projects: extras.projects,
    loading,
    reload,
    saveProfile,
    saveAvatar,
    removeAvatar,
    addEducation,
    addExperience,
    addProject,
    removeEducation,
    removeExperience,
    removeProject,
  };
}
