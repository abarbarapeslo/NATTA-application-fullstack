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

export function useOpportunities(filters?: OpportunityFilters) {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const list = await nattaOpportunities.list(filters);
      setItems(list);
      setStatus("ready");
    } catch (err) {
      setError(err instanceof NattaApiError ? err.message : "Could not load opportunities.");
      setStatus("error");
    }
  }, [JSON.stringify(filters ?? {})]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    reload();
  }, [reload]);

  return { opportunities: items, status, error, reload };
}

export function useFeaturedOpportunities() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [status, setStatus] = useState<LoadStatus>("idle");

  const reload = useCallback(async () => {
    setStatus("loading");
    try {
      const list = await nattaOpportunities.featured();
      setItems(list);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { featured: items, status, reload };
}

export function useSavedOpportunities() {
  const [items, setItems] = useState<SavedOpportunity[]>([]);
  const [status, setStatus] = useState<LoadStatus>("idle");

  const reload = useCallback(async () => {
    setStatus("loading");
    try {
      const list = await nattaSaved.list();
      setItems(list);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const save = useCallback(async (opportunityId: number) => {
    await nattaSaved.save(opportunityId);
    await reload();
  }, [reload]);

  const unsave = useCallback(
    async (opportunityId: number) => {
      await nattaSaved.unsave(opportunityId);
      setItems((prev) => prev.filter((s) => s.opportunityId !== opportunityId));
    },
    [],
  );

  return { saved: items, status, reload, save, unsave };
}
