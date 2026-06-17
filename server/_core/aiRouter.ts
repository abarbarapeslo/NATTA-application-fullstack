import { z } from "zod";
import { askClaude } from "./anthropic";
import { firebaseProtectedProcedure, router } from "./trpc";

/**
 * AI tools for the mobile app, powered by Claude (Anthropic).
 *
 * Every procedure requires a valid Firebase ID token (firebaseProtectedProcedure)
 * so the Anthropic key — which lives only on the server — can't be abused by
 * anonymous callers.
 */

const RESUME_ACTIONS = ["improve", "shorten", "expand", "fix_grammar", "custom"] as const;
type ResumeAction = (typeof RESUME_ACTIONS)[number];

const ACTION_INSTRUCTIONS: Record<Exclude<ResumeAction, "custom">, string> = {
  improve:
    "Rewrite the text to be clearer, more professional and more impactful. Use strong action verbs and concrete, results-oriented phrasing. Keep it truthful — do not invent facts, numbers or experiences.",
  shorten:
    "Make the text more concise while keeping every important point. Remove filler and redundancy. Do not invent new information.",
  expand:
    "Develop the text with more detail and supporting context, keeping it professional and relevant. Do not invent facts, numbers or experiences that are not implied by the original.",
  fix_grammar:
    "Fix grammar, spelling and punctuation. Keep the original meaning, tone and language. Make only minimal stylistic changes.",
};

function buildSystemPrompt(): string {
  return [
    "You are an expert career-writing assistant for a professional opportunities app called NATTA.",
    "You help users polish resumes, cover letters, essays and other application texts.",
    "Rules:",
    "- Always respond in the SAME LANGUAGE as the user's text.",
    "- Return ONLY the rewritten text, with no preamble, explanations, quotes or markdown code fences.",
    "- Never fabricate facts, employers, dates, metrics or credentials.",
    "- Preserve the user's intent and any concrete details they provided.",
  ].join("\n");
}

function buildUserPrompt(input: {
  content: string;
  action: ResumeAction;
  instruction?: string;
  title?: string;
}): string {
  const directive =
    input.action === "custom"
      ? (input.instruction?.trim() || "Improve the text.")
      : ACTION_INSTRUCTIONS[input.action];

  const titleLine = input.title?.trim()
    ? `Document title: ${input.title.trim()}\n\n`
    : "";

  return [
    titleLine,
    `Task: ${directive}`,
    "",
    "Text:",
    '"""',
    input.content,
    '"""',
  ].join("\n");
}

export const aiRouter = router({
  improveResume: firebaseProtectedProcedure
    .input(
      z.object({
        content: z.string().min(1, "content is required").max(20000),
        action: z.enum(RESUME_ACTIONS).default("improve"),
        instruction: z.string().max(1000).optional(),
        title: z.string().max(200).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const text = await askClaude({
        system: buildSystemPrompt(),
        messages: [{ role: "user", content: buildUserPrompt(input) }],
        maxTokens: 2000,
        temperature: input.action === "fix_grammar" ? 0.2 : 0.6,
      });

      return { text } as const;
    }),
});
