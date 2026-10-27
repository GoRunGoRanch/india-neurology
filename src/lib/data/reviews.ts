import { supabaseAnonKey, supabaseConfigured, supabaseUrl } from "../supabase/config";
import type { ReviewDecision } from "./pilot";

export const REVIEWS_TAG = "claim-reviews";

/**
 * Current reviewer decisions from the public view (no internal notes). Cached briefly and
 * revalidated immediately when a reviewer acts, so approvals show on both linked pages.
 */
export async function fetchDecisions(): Promise<ReviewDecision[]> {
  if (!supabaseConfigured) return [];
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/public_claim_reviews?select=*`, {
      headers: { apikey: supabaseAnonKey, authorization: `Bearer ${supabaseAnonKey}` },
      next: { revalidate: 60, tags: [REVIEWS_TAG] },
    });
    if (!res.ok) throw new Error(`public_claim_reviews ${res.status}`);
    return (await res.json()) as ReviewDecision[];
  } catch (err) {
    // Fail closed: with no decisions, nothing is shown as verified.
    console.error("Could not load claim reviews", err);
    return [];
  }
}
