/**
 * Pilot candidate records (real, source-linked, NOT yet reviewed) are shown only on private
 * builds: Vercel preview deployments (behind Vercel Authentication) or a local run with
 * DIRECTORY_MODE=pilot. Production (kneetie.in) keeps demo data until a reviewer approves claims.
 */
export const showCandidates =
  process.env.DIRECTORY_MODE === "pilot" ||
  (process.env.VERCEL_ENV === "preview" && process.env.DIRECTORY_MODE !== "demo");
