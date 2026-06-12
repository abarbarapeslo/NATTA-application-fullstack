import { useCallback, useEffect, useState } from "react";
import {
  opportunities as nattaOpportunities,
  savedOpportunities as nattaSaved,
  NattaApiError,
} from "@/lib/natta-api";
import type {
  Opportunity,
  OpportunityFilters,
  SavedOpportunity,
} from "@/types/natta-router";

type LoadStatus = "idle" | "loading" | "ready" | "error";

/**
 * Each hook here exposes:
 * - `status` — full-screen state (initial load shows a spinner)
 * - `refreshing` — set only while a pull-to-refresh is running; existing
 *   data stays on screen the whole time
 * - `refresh()` — manual reload that drives the RefreshControl
 *
 * Screens also reload on focus via React Navigation's `useFocusEffect`, so
 * coming back to a screen always shows fresh data.
 */

export function useOpportunities(filters?: OpportunityFilters) {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (mode: "initial" | "refresh") => {
      if (mode === "initial") setStatus("loading");
      else setRefreshing(true);
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

  useEffect(() => {
    reload();
  }, [reload]);

  return { opportunities: items, status, refreshing, error, reload, refresh };
}

export function useFeaturedOpportunities() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (mode: "initial" | "refresh") => {
    if (mode === "initial") setStatus("loading");
    else setRefreshing(true);
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

  useEffect(() => {
    reload();
  }, [reload]);

  return { featured: items, status, refreshing, reload, refresh };
}

export function useSavedOpportunities() {
  const [items, setItems] = useState<SavedOpportunity[]>([]);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (mode: "initial" | "refresh") => {
    if (mode === "initial") setStatus("loading");
    else setRefreshing(true);
    try {
      const list = await nattaSaved.list();
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

  useEffect(() => {
    reload();
  }, [reload]);

  const save = useCallback(
    async (opportunityId: number) => {
      await nattaSaved.save(opportunityId);
      await refresh();
    },
    [refresh],
  );

  const unsave = useCallback(async (opportunityId: number) => {
    await nattaSaved.unsave(opportunityId);
    setItems((prev) => prev.filter((s) => s.opportunityId !== opportunityId));
  }, []);

  return { saved: items, status, refreshing, reload, refresh, save, unsave };
}
