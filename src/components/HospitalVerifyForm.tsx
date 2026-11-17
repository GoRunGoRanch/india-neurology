"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { submitAttestation, type SubmitState } from "@/app/[lang]/hospitals/[id]/verify/actions";
import { AGENTS, ANSWERS, CAPABILITIES, TRANSFER_MODES, type Answer, type Capability } from "@/lib/attestation";
import type { Dictionary } from "@/lib/i18n";

function Submit({ t }: { t: Dictionary }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary min-h-[48px] disabled:opacity-60">
      {pending ? t.verify.sending : t.verify.submit}
    </button>
  );
}

const input = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2";

/** The hospital director's six stroke-readiness answers plus their (unpublished) contact details. */
export function HospitalVerifyForm({ hospitalId, t }: { hospitalId: string; t: Dictionary }) {
  const v = t.verify;
  const [state, action] = useFormState<SubmitState, FormData>(submitAttestation, null);
  const [picked, setPicked] = useState<Partial<Record<Capability, Answer>>>({});
  const offers = (c: Capability) => picked[c] && picked[c] !== "no";

  if (state?.status === "sent") {
    return <p role="status" className="card border-run-200 bg-run-50 text-run-700">{v.thanks}</p>;
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="hospitalId" value={hospitalId} />
      <div aria-hidden="true" className="hidden">
        <label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <fieldset className="card space-y-5">
        <legend className="px-1 text-xl font-bold">{v.capabilityTitle}</legend>
        {CAPABILITIES.map((c, i) => (
          <div key={c} className="space-y-2 border-t border-slate-100 pt-4 first:border-0 first:pt-0">
            <p className="font-semibold">{i + 1}. {v.capabilities[c]}</p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={v.capabilities[c]}>
              {ANSWERS.map((a) => (
                <label key={a} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${picked[c] === a ? "border-go-600 bg-go-50" : "border-slate-300 bg-white"}`}>
                  <input type="radio" name={`cap_${c}`} value={a} required onChange={() => setPicked({ ...picked, [c]: a })} />
                  {v.answers[a]}
                </label>
              ))}
            </div>
            {c === "thrombolysis" && offers(c) && (
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-ink-soft">{v.agentsLabel}</span>
                {AGENTS.map((a) => <label key={a} className="flex items-center gap-1.5"><input type="checkbox" name="agent" value={a} />{v.agents[a]}</label>)}
              </div>
            )}
            {c === "evt_referral" && offers(c) && (
              <div className="space-y-2 text-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-ink-soft">{v.transferLabel}</span>
                  {TRANSFER_MODES.map((m) => <label key={m} className="flex items-center gap-1.5"><input type="checkbox" name="transfer" value={m} />{v.transfer[m]}</label>)}
                </div>
                <label className="block space-y-1">
                  <span className="text-ink-soft">{v.referralCentre}</span>
                  <input name="referralCentre" maxLength={200} className={input} />
                </label>
              </div>
            )}
          </div>
        ))}
      </fieldset>

      <fieldset className="card space-y-3">
        <legend className="px-1 text-xl font-bold">{v.contactTitle}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm"><span>{v.name}</span><input name="name" required maxLength={120} autoComplete="name" className={input} /></label>
          <label className="space-y-1 text-sm"><span>{v.designation}</span><input name="designation" required maxLength={120} autoComplete="organization-title" className={input} /></label>
          <label className="space-y-1 text-sm"><span>{v.email}</span><input name="email" type="email" required maxLength={200} autoComplete="email" className={input} /></label>
          <label className="space-y-1 text-sm"><span>{v.phone}</span><input name="phone" type="tel" required maxLength={30} autoComplete="tel" className={input} /></label>
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="declaration" value="yes" required className="mt-1" />
          <span>{v.declaration}</span>
        </label>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <Submit t={t} />
        {state && (
          <p role="alert" className="text-sm text-alert-700">
            {state.status === "missing" ? v.missing : state.status === "unavailable" ? v.unavailable : v.error}
          </p>
        )}
      </div>
    </form>
  );
}
