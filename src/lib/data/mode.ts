/**
 * Which listings the site shows:
 * - "pilot": every real, source-linked candidate, reviewed or not. Private builds only: Vercel
 *   preview deployments (behind Vercel Authentication) or DIRECTORY_MODE=pilot locally.
 * - "published": only claims a reviewer approved (DIRECTORY_MODE=published). Set this on
 *   production when the owner decides approved records should go public.
 * - "demo": labelled demonstration data (production default).
 */
export type DirectoryMode = "demo" | "pilot" | "published";

function resolveMode(): DirectoryMode {
  const m = process.env.DIRECTORY_MODE;
  if (m === "pilot" || m === "published" || m === "demo") return m;
  return process.env.VERCEL_ENV === "preview" ? "pilot" : "demo";
}

export const directoryMode: DirectoryMode = resolveMode();
export const showCandidates = directoryMode === "pilot";

/** Owner-controlled re-verification interval; approved claims older than this become "stale". */
export const reviewMaxAgeDays = Number(process.env.REVIEW_MAX_AGE_DAYS) || 180;
