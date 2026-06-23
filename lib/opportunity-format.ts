/**
 * Helpers to format Opportunity fields for display, matching how the
 * NATTA website renders them. Centralized here so every screen looks the
 * same (Search, Browse, Detail, Saved, Home).
 */

import type { Opportunity } from "@/types/natta-router";

/**
 * Backend `deadline` is a Postgres timestamp or null. When it's null, the
 * NATTA website displays "Inscrições Contínuas" — meaning the opportunity
 * has no fixed deadline and accepts applications continuously. We mirror
 * that here (PT label even though the rest of the app is English, by
 * product decision).
 */
export const ROLLING_DEADLINE_LABEL = "Inscrições Contínuas";

export function formatDeadline(value: Date | string | null | undefined): string {
  if (value == null || value === "") return ROLLING_DEADLINE_LABEL;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) return value;
    return new Date(parsed).toLocaleDateString();
  }
  try {
    return value.toLocaleDateString();
  } catch {
    return "—";
  }
}

/** True when this opportunity has no fixed deadline ("Inscrições Contínuas"). */
export function isRollingDeadline(value: Date | string | null | undefined): boolean {
  return value == null || value === "";
}

export function formatFunding(opp: Opportunity): string | null {
  const parts: string[] = [];
  if (opp.fundingAmount) parts.push(opp.fundingAmount);
  if (opp.funding && opp.funding !== opp.fundingAmount) parts.push(opp.funding);
  if (opp.fee) parts.push(opp.fee);
  return parts.length ? parts.join(" • ") : null;
}

/** Pull the first non-empty region for compact card display. */
export function primaryRegion(opp: Opportunity): string | null {
  if (!opp.regions || opp.regions.length === 0) return null;
  return opp.regions[0] ?? null;
}

/** Build a compact tag list used on cards (avoid duplicates with type). */
export function cardTags(opp: Opportunity): string[] {
  const tags: string[] = [];
  if (opp.fields) tags.push(...opp.fields);
  if (opp.mode) tags.push(opp.mode);
  if (opp.stage) tags.push(opp.stage);
  // de-duplicate while preserving order
  return Array.from(new Set(tags.filter(Boolean)));
}

/** Build the full tag list used on the detail screen. */
export function detailTags(opp: Opportunity): string[] {
  const tags: string[] = [];
  if (opp.fields) tags.push(...opp.fields);
  if (opp.regions) tags.push(...opp.regions);
  if (opp.mode) tags.push(opp.mode);
  if (opp.stage) tags.push(opp.stage);
  return Array.from(new Set(tags.filter(Boolean)));
}
