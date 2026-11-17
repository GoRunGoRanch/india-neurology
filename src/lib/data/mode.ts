/**
 * Which listings the site shows:
 * - "pilot": every real, source-linked candidate, reviewed or not, each labelled with its review
 *   status. Default on every Vercel deployment (production and preview): the owner chose on
 *   2026-11-16 to publish labelled candidates while review proceeds.
 * - "published": only claims a reviewer approved (DIRECTORY_MODE=published).
 * - "demo": labelled demonstration data (local default when DIRECTORY_MODE is unset).
 */
export type DirectoryMode = "demo" | "pilot" | "published";

function resolveMode(): DirectoryMode {
  const m = process.env.DIRECTORY_MODE;
  if (m === "pilot" || m === "published" || m === "demo") return m;
  return process.env.VERCEL_ENV ? "pilot" : "demo";
}

export const directoryMode: DirectoryMode = resolveMode();
export const showCandidates = directoryMode === "pilot";

/** Owner-controlled re-verification interval; approved claims older than this become "stale". */
export const reviewMaxAgeDays = Number(process.env.REVIEW_MAX_AGE_DAYS) || 180;
