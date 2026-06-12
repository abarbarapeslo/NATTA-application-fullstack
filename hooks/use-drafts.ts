import { useCallback, useEffect, useState } from "react";
import firestore from "@react-native-firebase/firestore";
import { draftsCol, serverTimestamp, type Draft } from "@/lib/firestore";
import { useFirebaseUser } from "@/hooks/use-firebase-user";

export function useDrafts() {
  const user = useFirebaseUser();
  const uid = user?.uid ?? null;
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!uid) {
      setDrafts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const snap = await draftsCol(uid).orderBy("updatedAt", "desc").get();
      setDrafts(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Draft, "id">) })),
      );
    } catch (err) {
      console.warn("[drafts] reload failed", err);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    reload();
  }, [reload]);

  const createDraft = useCallback(
    async (title: string) => {
      if (!uid) throw new Error("Not signed in");
      const now = serverTimestamp();
      const ref = await draftsCol(uid).add({
        title: title.trim() || "Untitled",
        content: "",
        createdAt: now,
        updatedAt: now,
      });
      const created: Draft = { id: ref.id, title: title.trim() || "Untitled", content: "" };
      setDrafts((prev) => [created, ...prev]);
      return created;
    },
    [uid],
  );

  const updateDraft = useCallback(
    async (id: string, patch: Partial<Pick<Draft, "title" | "content">>) => {
      if (!uid) return;
      await draftsCol(uid).doc(id).set(
        { ...patch, updatedAt: serverTimestamp() },
        { merge: true },
      );
      setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    },
    [uid],
  );

  const removeDraft = useCallback(
    async (id: string) => {
      if (!uid) return;
      await draftsCol(uid).doc(id).delete();
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    },
    [uid],
  );

  return { drafts, loading, reload, createDraft, updateDraft, removeDraft };
}
