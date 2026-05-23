import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  educationCol,
  experienceCol,
  projectsCol,
  userDoc,
  serverTimestamp,
  type Education,
  type Experience,
  type Project,
  type UserProfile,
} from "@/lib/firestore";
import {
  useFirebaseUser,
  displayNameFromUser,
} from "@/hooks/use-firebase-user";

const LEGACY_PROFILE_STORAGE_KEY = "@natta_profile";
const LEGACY_LEGACY_KEY = "@aipply_profile";
const MIGRATION_FLAG = "@natta_profile_migrated_to_firestore";

type LoadedProfile = {
  profile: UserProfile;
  education: Education[];
  experience: Experience[];
  projects: Project[];
};

const empty = (name: string): LoadedProfile => ({
  profile: { name, title: "", bio: "", skills: [] },
  education: [],
  experience: [],
  projects: [],
});

async function migrateAsyncStorageOnce(uid: string) {
  const flagKey = `${MIGRATION_FLAG}:${uid}`;
  const alreadyMigrated = await AsyncStorage.getItem(flagKey);
  if (alreadyMigrated) return;

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
          name: parsed.name ?? "",
          title: parsed.title ?? "",
          bio: parsed.bio ?? "",
          skills: Array.isArray(parsed.skills) ? parsed.skills : [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      const batch = (await import("@react-native-firebase/firestore")).default().batch();
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
  const [data, setData] = useState<LoadedProfile>(() =>
    empty(displayNameFromUser(firebaseUser)),
  );
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!uid) {
      setData(empty(displayNameFromUser(firebaseUser)));
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await migrateAsyncStorageOnce(uid);

      const [docSnap, eduSnap, expSnap, projSnap] = await Promise.all([
        userDoc(uid).get(),
        educationCol(uid).get(),
        experienceCol(uid).get(),
        projectsCol(uid).get(),
      ]);

      const profileData = docSnap.data() as UserProfile | undefined;
      const profile: UserProfile = {
        name: profileData?.name?.trim() || displayNameFromUser(firebaseUser),
        title: profileData?.title ?? "",
        bio: profileData?.bio ?? "",
        photoURL: profileData?.photoURL,
        skills: profileData?.skills ?? [],
      };
      const education: Education[] = eduSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Education, "id">),
      }));
      const experience: Experience[] = expSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Experience, "id">),
      }));
      const projects: Project[] = projSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Project, "id">),
      }));

      setData({ profile, education, experience, projects });
    } catch (err) {
      console.warn("[profile] reload failed", err);
    } finally {
      setLoading(false);
    }
  }, [uid, firebaseUser]);

  useEffect(() => {
    reload();
  }, [reload]);

  const saveProfile = useCallback(
    async (partial: Partial<Pick<UserProfile, "name" | "title" | "bio" | "skills" | "photoURL">>) => {
      if (!uid) return;
      await userDoc(uid).set(
        { ...partial, updatedAt: serverTimestamp() },
        { merge: true },
      );
      setData((prev) => ({ ...prev, profile: { ...prev.profile, ...partial } }));
    },
    [uid],
  );

  const addEducation = useCallback(
    async (entry: Omit<Education, "id">) => {
      if (!uid) return;
      const ref = await educationCol(uid).add(entry);
      setData((prev) => ({
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
      setData((prev) => ({
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
      setData((prev) => ({
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
      setData((prev) => ({
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
      setData((prev) => ({
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
      setData((prev) => ({
        ...prev,
        projects: prev.projects.filter((p) => p.id !== id),
      }));
    },
    [uid],
  );

  return {
    ...data,
    loading,
    reload,
    saveProfile,
    addEducation,
    addExperience,
    addProject,
    removeEducation,
    removeExperience,
    removeProject,
  };
}
