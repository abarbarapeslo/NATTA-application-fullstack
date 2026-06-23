import { ENV } from "./env";

/**
 * Minimal Claude (Anthropic Messages API) client.
 *
 * We call the HTTP API directly with `fetch` instead of pulling in the
 * Anthropic SDK — keeps the server bundle lean and mirrors how the bundled
 * Forge helper (`server/_core/llm.ts`) works. The API key is read from the
 * server environment and never leaves the backend.
 *
 * Docs: https://docs.anthropic.com/en/api/messages
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

export type ClaudeMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AskClaudeOptions = {
  messages: ClaudeMessage[];
  system?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
};

type AnthropicResponse = {
  content?: Array<{ type: string; text?: string }>;
  stop_reason?: string;
};

export async function askClaude(options: AskClaudeOptions): Promise<string> {
  if (!ENV.anthropicApiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const payload: Record<string, unknown> = {
    model: options.model ?? ENV.anthropicModel,
    max_tokens: options.maxTokens ?? 1024,
    messages: options.messages,
  };

  if (options.system) payload.system = options.system;
  if (typeof options.temperature === "number") payload.temperature = options.temperature;

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ENV.anthropicApiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Claude request failed: ${response.status} ${response.statusText} – ${errorText}`,
    );
  }

  const data = (await response.json()) as AnthropicResponse;
  const text = (data.content ?? [])
    .filter((block) => block.type === "text" && typeof block.text === "string")
    .map((block) => block.text as string)
    .join("")
    .trim();

  if (!text) {
    throw new Error("Claude returned an empty response");
  }

  return text;
}
