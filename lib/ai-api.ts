/**
 * Client for the AI tools backend (Claude-powered tRPC procedures).
 *
 * The AI procedures live on the bundled Express/tRPC server (`server/`), which
 * may be deployed separately from the main NATTA backend. We therefore allow a
 * dedicated `EXPO_PUBLIC_AI_API_URL`, falling back to `EXPO_PUBLIC_API_BASE_URL`
 * when both are served from the same host.
 *
 * Auth: the user's Firebase ID token is sent as `Authorization: Bearer ...`.
 * The server verifies it before calling Claude — the Anthropic key never
 * reaches the client.
 */

import superjson from "superjson";
import { API_BASE_URL } from "@/constants/oauth";
import { getFirebaseAuth } from "@/lib/firebase";

const AI_BASE = (
  process.env.EXPO_PUBLIC_AI_API_URL ||
  API_BASE_URL ||
  ""
).replace(/\/$/, "");

export class AiApiError extends Error {
  constructor(
    public httpStatus: number,
    public code: string | undefined,
    message: string,
  ) {
    super(message);
    this.name = "AiApiError";
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const user = getFirebaseAuth().currentUser;
  if (!user) {
    throw new AiApiError(401, "NO_AUTH", "You need to be signed in to use AI features.");
  }
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

// The AI server runs on Render's free tier and may cold-start (~30-50s) after
// idling. Give requests a generous ceiling so a waking server still succeeds,
// but fail with a clear message instead of hanging forever.
const AI_REQUEST_TIMEOUT_MS = 90_000;

async function mutate<TInput, TOutput>(
  procedure: string,
  input: TInput,
): Promise<TOutput> {
  if (!AI_BASE) {
    throw new AiApiError(
      0,
      "NO_BASE_URL",
      "AI backend URL is not set (EXPO_PUBLIC_AI_API_URL / EXPO_PUBLIC_API_BASE_URL).",
    );
  }

  const url = `${AI_BASE}/api/trpc/${procedure}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(await authHeader()),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(superjson.serialize(input)),
      signal: controller.signal,
    });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new AiApiError(
        0,
        "TIMEOUT",
        "The AI service took too long to respond. The server may be waking up — please try again in a moment.",
      );
    }
    throw new AiApiError(
      0,
      "NETWORK",
      "Could not reach the AI service. Check your connection and try again.",
    );
  } finally {
    clearTimeout(timeout);
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const code = json?.error?.data?.code;
    const message = json?.error?.message ?? `HTTP ${res.status}`;
    throw new AiApiError(res.status, code, message);
  }

  const data = json?.result?.data;
  if (data && typeof data === "object" && "json" in data) {
    return superjson.deserialize(data) as TOutput;
  }
  return data as TOutput;
}

export type ResumeAction = "improve" | "shorten" | "expand" | "fix_grammar" | "custom";

export const resumeAi = {
  /**
   * Rewrites/improves a piece of resume or application text with Claude.
   * Returns the AI-generated text.
   */
  improve: (input: {
    content: string;
    action: ResumeAction;
    instruction?: string;
    title?: string;
  }) =>
    mutate<typeof input, { text: string }>("ai.improveResume", input).then(
      (r) => r.text,
    ),
};
