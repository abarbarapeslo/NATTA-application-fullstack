/**
 * Typed fetch wrapper for the NATTA backend tRPC API.
 *
 * Uses tRPC's HTTP convention directly (POST batch endpoint) without taking
 * a hard dependency on the backend's `AppRouter` type (which lives in a
 * different repo). Each procedure has a small typed function below.
 *
 * Auth: Firebase ID token is attached as `Authorization: Bearer ...` on
 * every request. The backend validates with Firebase Admin SDK.
 *
 * Serialization: superjson, matching the backend.
 */

import superjson from "superjson";
import { API_BASE_URL } from "@/constants/oauth";
import { getFirebaseAuth } from "@/lib/firebase";
import type {
  Application,
  ApplicationStats,
  ApplicationStatus,
  ApplicationWithDetails,
  NattaUser,
  Opportunity,
  OpportunityFilters,
  SavedOpportunity,
} from "@/types/natta-router";

const BASE = (API_BASE_URL || "").replace(/\/$/, "");

class NattaApiError extends Error {
  constructor(
    public httpStatus: number,
    public code: string | undefined,
    message: string,
  ) {
    super(message);
    this.name = "NattaApiError";
  }
}

async function authHeader(): Promise<Record<string, string>> {
  try {
    const user = getFirebaseAuth().currentUser;
    if (!user) return {};
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

async function call<TInput, TOutput>(
  procedure: string,
  kind: "query" | "mutation",
  input?: TInput,
): Promise<TOutput> {
  if (!BASE) {
    throw new NattaApiError(
      0,
      "NO_BASE_URL",
      "EXPO_PUBLIC_API_BASE_URL is not set — cannot call NATTA backend.",
    );
  }

  const url = `${BASE}/api/trpc/${procedure}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(await authHeader()),
  };

  const body = input === undefined ? undefined : JSON.stringify(superjson.serialize(input));

  const fetchInit: RequestInit =
    kind === "query"
      ? { method: "GET", headers }
      : { method: "POST", headers, body: body ?? "{}" };

  // tRPC query sends input via `?input=<urlencoded superjson>` for GETs
  const finalUrl =
    kind === "query" && input !== undefined
      ? `${url}?input=${encodeURIComponent(JSON.stringify(superjson.serialize(input)))}`
      : url;

  const res = await fetch(finalUrl, fetchInit);
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const code = json?.error?.data?.code;
    const message = json?.error?.message ?? `HTTP ${res.status}`;
    throw new NattaApiError(res.status, code, message);
  }

  // tRPC v11 response shape: { result: { data: <superjson> } }
  const data = json?.result?.data;
  if (data && typeof data === "object" && "json" in data) {
    return superjson.deserialize(data) as TOutput;
  }
  return data as TOutput;
}

// --- auth -------------------------------------------------------------------

export const auth = {
  me: () => call<void, NattaUser | null>("auth.me", "query"),
  logout: () => call<void, { success: true }>("auth.logout", "mutation"),
  updateProfile: (input: { bio?: string; interests?: string[] }) =>
    call<typeof input, { success: true }>("auth.updateProfile", "mutation", input),
  applicationStats: () => call<void, ApplicationStats>("auth.applicationStats", "query"),
  registerDevice: (input: { fcmToken: string; platform: "android" | "ios" | "web" }) =>
    call<typeof input, { success: true }>("auth.registerDevice", "mutation", input),
  unregisterDevice: (input: { fcmToken: string }) =>
    call<typeof input, { success: true }>("auth.unregisterDevice", "mutation", input),
};

// --- opportunities ----------------------------------------------------------

export const opportunities = {
  list: (filters?: OpportunityFilters) =>
    call<OpportunityFilters | undefined, Opportunity[]>(
      "opportunities.list",
      "query",
      filters,
    ),
  getById: (id: number) =>
    call<number, Opportunity | undefined>("opportunities.getById", "query", id),
  featured: () => call<void, Opportunity[]>("opportunities.featured", "query"),
};

// --- applications -----------------------------------------------------------

export const applications = {
  list: () => call<void, ApplicationWithDetails[]>("applications.list", "query"),
  create: (input: {
    opportunityId: number;
    notes?: string;
    programStartDate?: Date;
    programEndDate?: Date;
  }) => call<typeof input, Application>("applications.create", "mutation", input),
  updateStatus: (input: { applicationId: number; status: ApplicationStatus }) =>
    call<typeof input, Application>("applications.updateStatus", "mutation", input),
  delete: (id: number) =>
    call<number, { success: true }>("applications.delete", "mutation", id),
  getById: (id: number) =>
    call<number, Application | undefined>("applications.getById", "query", id),
};

// --- savedOpportunities -----------------------------------------------------

export const savedOpportunities = {
  list: () => call<void, SavedOpportunity[]>("savedOpportunities.list", "query"),
  save: (opportunityId: number) =>
    call<number, { success: true; alreadySaved: boolean }>(
      "savedOpportunities.save",
      "mutation",
      opportunityId,
    ),
  unsave: (opportunityId: number) =>
    call<number, { success: true }>(
      "savedOpportunities.unsave",
      "mutation",
      opportunityId,
    ),
  isSaved: (opportunityId: number) =>
    call<number, boolean>("savedOpportunities.isSaved", "query", opportunityId),
};

// --- system -----------------------------------------------------------------

export const system = {
  health: () => call<{ timestamp: number }, { ok: true }>(
    "system.health",
    "query",
    { timestamp: Date.now() },
  ),
};

export { NattaApiError };
