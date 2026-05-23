import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import {
  applicationsCol,
  serverTimestamp,
  type Application,
} from "@/lib/firestore";
import { useFirebaseUser } from "@/hooks/use-firebase-user";

const LEGACY_APPLICATIONS_KEY = "@natta_applications";
const MIGRATION_FLAG = "@natta_applications_migrated_to_firestore";

async function migrateApplicationsOnce(uid: string) {
  const flag = `${MIGRATION_FLAG}:${uid}`;
  if (await AsyncStorage.getItem(flag)) return;

  const raw =
    (await AsyncStorage.getItem(`${LEGACY_APPLICATIONS_KEY}:${uid}`)) ??
    (await AsyncStorage.getItem(LEGACY_APPLICATIONS_KEY));
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Application[];
      const batch = firestore().batch();
      for (const app of parsed) {
        const ref = applicationsCol(uid).doc();
        batch.set(ref, {
          name: app.name ?? "",
          type: app.type ?? "",
          deadline: app.deadline ?? "",
          status: app.status ?? "Draft",
          startDate: app.startDate ?? "",
          endDate: app.endDate ?? "",
          createdAt: serverTimestamp(),
        });
      }
      await batch.commit();
    } catch (err) {
      console.warn("[applications] migration failed", err);
    }
  }
  await AsyncStorage.setItem(flag, "1");
}

export function useApplications() {
  const user = useFirebaseUser();
  const uid = user?.uid ?? null;
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!uid) {
      setApplications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await migrateApplicationsOnce(uid);
      const snap = await applicationsCol(uid).orderBy("deadline").get();
      setApplications(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Application, "id">) })),
      );
    } catch (err) {
      console.warn("[applications] reload failed", err);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    reload();
  }, [reload]);

  const addApplication = useCallback(
    async (entry: Omit<Application, "id" | "createdAt">) => {
      if (!uid) return;
      const ref = await applicationsCol(uid).add({
        ...entry,
        createdAt: serverTimestamp(),
      });
      setApplications((prev) => [...prev, { id: ref.id, ...entry }]);
    },
    [uid],
  );

  const updateApplication = useCallback(
    async (id: string, patch: Partial<Omit<Application, "id" | "createdAt">>) => {
      if (!uid) return;
      await applicationsCol(uid).doc(id).set(patch, { merge: true });
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      );
    },
    [uid],
  );

  const removeApplication = useCallback(
    async (id: string) => {
      if (!uid) return;
      await applicationsCol(uid).doc(id).delete();
      setApplications((prev) => prev.filter((a) => a.id !== id));
    },
    [uid],
  );

  return {
    applications,
    loading,
    reload,
    addApplication,
    updateApplication,
    removeApplication,
  };
}
