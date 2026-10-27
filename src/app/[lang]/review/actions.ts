"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { PILOT_DATASETS, baseClaims, evidenceHash } from "@/lib/data/pilot";
import { REVIEWS_TAG } from "@/lib/data/reviews";
import { currentReviewer, supabaseServer } from "@/lib/supabase/server";

export interface ReviewState {
  ok: boolean;
  message: string;
}

const DECISIONS = new Set(["verified", "disputed", "pending_review"]);

/** Records one reviewer decision. RLS re-checks the role and that reviewer_id is the caller. */
export async function reviewClaim(_prev: ReviewState | null, form: FormData): Promise<ReviewState> {
  const reviewer = await currentReviewer();
  if (!reviewer?.isReviewer) return { ok: false, message: "Your account does not have reviewer access." };

  const claimId = String(form.get("claimId") ?? "");
  const decision = String(form.get("decision") ?? "");
  const note = String(form.get("note") ?? "").trim().slice(0, 2000) || null;
  const corrected = String(form.get("correctedValue") ?? "").trim().slice(0, 500) || null;
  if (!DECISIONS.has(decision)) return { ok: false, message: "Unknown decision." };

  // Look the claim up server-side; the evidence hash is computed here, never taken from the browser.
  const claim = PILOT_DATASETS.flatMap(baseClaims).find((c) => c.id === claimId);
  if (!claim) return { ok: false, message: "That claim no longer exists in the research data." };

  if (decision === "verified" && claim.field.startsWith("procedure:") && (!note || note.length < 15)) {
    return {
      ok: false,
      message:
        "Approving that a doctor performs thrombectomy needs a note recording the explicit evidence or direct confirmation (who confirmed, how, when).",
    };
  }
  if (corrected && decision !== "verified") {
    return { ok: false, message: "A corrected value can only be saved together with Approve." };
  }

  const { error } = await supabaseServer().from("claim_reviews").upsert({
    claim_id: claim.id,
    status: decision,
    evidence_hash: evidenceHash(claim.evidence),
    corrected_value: corrected,
    note,
    reviewer_id: reviewer.id,
    reviewer_name: reviewer.name,
    reviewed_at: new Date().toISOString(),
  });
  if (error) return { ok: false, message: `Not saved: ${error.message}` };

  revalidateTag(REVIEWS_TAG);
  revalidatePath("/", "layout");
  const label = decision === "verified" ? "Approved" : decision === "disputed" ? "Rejected" : "Marked pending";
  return { ok: true, message: `${label} by ${reviewer.name}.` };
}

export async function signOut(form: FormData) {
  await supabaseServer().auth.signOut();
  const lang = String(form.get("lang") ?? "en") === "hi" ? "hi" : "en";
  redirect(`/${lang}/review`);
}
