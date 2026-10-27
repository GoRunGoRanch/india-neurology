"use client";

import { useFormState, useFormStatus } from "react-dom";
import { reviewClaim, type ReviewState } from "@/app/[lang]/review/actions";

function Buttons() {
  const { pending } = useFormStatus();
  const cls = "rounded-xl px-3 py-1.5 text-sm font-semibold disabled:opacity-50";
  return (
    <div className="flex flex-wrap gap-2">
      <button name="decision" value="verified" disabled={pending} className={`${cls} bg-run-600 text-white hover:bg-run-700`}>Approve</button>
      <button name="decision" value="disputed" disabled={pending} className={`${cls} bg-alert-600 text-white hover:bg-alert-700`}>Reject / withdraw</button>
      <button name="decision" value="pending_review" disabled={pending} className={`${cls} border border-slate-300 bg-white hover:bg-slate-50`}>Needs more checking</button>
    </div>
  );
}

/** Approve / reject / hold one claim, with an optional note and correction. */
export function ClaimReviewForm({ claimId, value, isProcedure }: { claimId: string; value: string; isProcedure: boolean }) {
  const [state, action] = useFormState<ReviewState | null, FormData>(reviewClaim, null);
  const correctable = !["available", "explicit_claim"].includes(value);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="claimId" value={claimId} />
      <textarea
        name="note"
        rows={isProcedure ? 2 : 1}
        placeholder={isProcedure ? "Required to approve: who confirmed this doctor performs thrombectomy, how, and when" : "Note for the audit trail (optional, not public)"}
        className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-sm"
      />
      {correctable && (
        <details className="text-sm">
          <summary className="cursor-pointer text-ink-muted">Correct the value</summary>
          <input name="correctedValue" defaultValue="" placeholder={value} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-1.5" />
          <p className="mt-1 text-xs text-ink-muted">Saved with Approve. The researched value stays in the history.</p>
        </details>
      )}
      <Buttons />
      {state && <p role="status" className={`text-sm ${state.ok ? "text-run-700" : "text-alert-700"}`}>{state.message}</p>}
    </form>
  );
}
