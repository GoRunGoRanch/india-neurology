"use client";

import { useFormState, useFormStatus } from "react-dom";
import { reviewAttestation, type ReviewState } from "@/app/[lang]/review/actions";

function Buttons() {
  const { pending } = useFormStatus();
  const cls = "rounded-xl px-3 py-1.5 text-sm font-semibold disabled:opacity-50";
  return (
    <div className="flex flex-wrap gap-2">
      <button name="decision" value="approved" disabled={pending} className={`${cls} bg-run-600 text-white hover:bg-run-700`}>Approve and publish</button>
      <button name="decision" value="rejected" disabled={pending} className={`${cls} bg-alert-600 text-white hover:bg-alert-700`}>Reject</button>
    </div>
  );
}

/** Approve / reject one hospital director submission. */
export function AttestationReviewForm({ id }: { id: string }) {
  const [state, action] = useFormState<ReviewState | null, FormData>(reviewAttestation, null);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="attestationId" value={id} />
      <textarea name="note" rows={2} placeholder="Required to approve: how you confirmed this person speaks for the hospital (official number called, who answered, when)" className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-sm" />
      <Buttons />
      {state && <p role="status" className={`text-sm ${state.ok ? "text-run-700" : "text-alert-700"}`}>{state.message}</p>}
    </form>
  );
}
