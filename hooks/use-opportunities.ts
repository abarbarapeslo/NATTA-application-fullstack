import { useCallback, useEffect, useState } from "react";
import {
  opportunities as nattaOpportunities,
  NattaApiError,
} from "@/lib/natta-api";
import type {
  Opportunity,
  OpportunityFilters,
} from "@/types/natta-router";

type LoadStatus = "idle" | "loading" | "ready" | "error";
type LoadMode = "initial" | "refresh" | "silent";

/**
 * Each hook here exposes three ways to reload data:
 *
 * - `reload()` — `initial` mode: switches `status` to `loading`, used for
 *   the first fetch (shows the big centered spinner on the screen).
 * - `refresh()` — `refresh` mode: sets `refreshing=true`, used by
 *   <RefreshControl /> when the user pulls down (shows the small spinner
 *   at the top, existing data stays on screen).
 * - `silentRefresh()` — `silent` mode: updates state in the background
 *   with no UI spinner. Used by `useFocusEffect` so coming back to the
 *   screen doesn't flash a loading indicator.
 *
 * Pattern overall: cache-first (load once on mount), pull-to-refresh for
 * the user to fetch fresh data, silent focus refresh for screens whose
 * data might have been mutated elsewhere (Saved, Home).
 */

export function useOpportunities(filters?: OpportunityFilters) {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (mode: LoadMode) => {
      if (mode === "initial") setStatus("loading");
      else if (mode === "refresh") setRefreshing(true);
      setError(null);
      try {
        const list = await nattaOpportunities.list(filters);
        setItems(list);
        setStatus("ready");
      } catch (err) {
        setError(err instanceof NattaApiError ? err.message : "Could not load opportunities.");
        setStatus("error");
      } finally {
        if (mode === "refresh") setRefreshing(false);
      }
    },
    [JSON.stringify(filters ?? {})], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const reload = useCallback(() => load("initial"), [load]);
  const refresh = useCallback(() => load("refresh"), [load]);
  const silentRefresh = useCallback(() => load("silent"), [load]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    opportunities: items,
    status,
    refreshing,
    error,
    reload,
    refresh,
    silentRefresh,
  };
}

export function useFeaturedOpportunities() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (mode: LoadMode) => {
    if (mode === "initial") setStatus("loading");
    else if (mode === "refresh") setRefreshing(true);
    try {
      const list = await nattaOpportunities.featured();
      setItems(list);
      setStatus("ready");
    } catch {
      setStatus("error");
    } finally {
      if (mode === "refresh") setRefreshing(false);
    }
  }, []);

  const reload = useCallback(() => load("initial"), [load]);
  const refresh = useCallback(() => load("refresh"), [load]);
  const silentRefresh = useCallback(() => load("silent"), [load]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { featured: items, status, refreshing, reload, refresh, silentRefresh };
}

