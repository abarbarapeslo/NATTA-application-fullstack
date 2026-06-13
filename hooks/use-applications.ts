import { useCallback, useEffect, useState } from "react";
import { applications as nattaApplications, auth as nattaAuth, NattaApiError } from "@/lib/natta-api";
import { useFirebaseUser } from "@/hooks/use-firebase-user";
import type {
  ApplicationStats,
  ApplicationStatus,
  ApplicationWithDetails,
} from "@/types/natta-router";

type LoadStatus = "idle" | "loading" | "ready" | "error";

const emptyStats: ApplicationStats = {
  total: 0,
  applied: 0,
  inProgress: 0,
  accepted: 0,
  rejected: 0,
};

/**
 * Reads + writes applications via the NATTA backend (same Postgres the
 * website uses). Each application is tied to a real `opportunityId` — the
 * old "create a free-form application" flow is gone, by product decision.
 */
export function useApplications() {
  const user = useFirebaseUser();
  const uid = user?.uid ?? null;

  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [stats, setStats] = useState<ApplicationStats>(emptyStats);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (mode: "initial" | "refresh" | "silent") => {
      if (!uid) {
        setApplications([]);
        setStats(emptyStats);
        setStatus("idle");
        return;
      }
      if (mode === "initial") setStatus("loading");
      else if (mode === "refresh") setRefreshing(true);
      setError(null);
      try {
        const [list, statsRes] = await Promise.all([
          nattaApplications.list(),
          nattaAuth.applicationStats(),
        ]);
        setApplications(list);
        setStats(statsRes);
        setStatus("ready");
      } catch (err) {
        const message =
          err instanceof NattaApiError ? err.message : "Could not load applications.";
        setError(message);
        setStatus("error");
      } finally {
        if (mode === "refresh") setRefreshing(false);
      }
    },
    [uid],
  );

  const reload = useCallback(() => load("initial"), [load]);
  const refresh = useCallback(() => load("refresh"), [load]);
  const silentRefresh = useCallback(() => load("silent"), [load]);

  useEffect(() => {
    reload();
  }, [reload]);

  const applyToOpportunity = useCallback(
    async (input: {
      opportunityId: number;
      notes?: string;
      programStartDate?: Date;
      programEndDate?: Date;
    }) => {
      const created = await nattaApplications.create(input);
      // refresh to pull in `opportunity` details + stats
      await reload();
      return created;
    },
    [reload],
  );

  const updateStatus = useCallback(
    async (applicationId: number, newStatus: ApplicationStatus) => {
      await nattaApplications.updateStatus({ applicationId, status: newStatus });
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status: newStatus } : a)),
      );
      // stats need to update too
      try {
        const fresh = await nattaAuth.applicationStats();
        setStats(fresh);
      } catch {
        // best effort
      }
    },
    [],
  );

  const removeApplication = useCallback(
    async (applicationId: number) => {
      await nattaApplications.delete(applicationId);
      setApplications((prev) => prev.filter((a) => a.id !== applicationId));
      try {
        const fresh = await nattaAuth.applicationStats();
        setStats(fresh);
      } catch {
        // best effort
      }
    },
    [],
  );

  return {
    applications,
    stats,
    status,
    refreshing,
    error,
    reload,
    refresh,
    silentRefresh,
    applyToOpportunity,
    updateStatus,
    removeApplication,
  };
}
