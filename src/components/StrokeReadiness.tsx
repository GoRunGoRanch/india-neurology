import Link from "next/link";
import { CAPABILITIES, type PublicAttestation } from "@/lib/attestation";
import { formatDate, type Dictionary, type Locale } from "@/lib/i18n";

/** The six director-confirmed stroke capabilities for one hospital, plus the Verify button. */
export function StrokeReadiness({ hospitalId, attestation, t, lang }: { hospitalId: string; attestation?: PublicAttestation; t: Dictionary; lang: Locale }) {
  const v = t.verify;
  const a = attestation?.answers;
  return (
    <section className="card space-y-3" aria-labelledby="readiness">
      <h2 id="readiness" className="text-xl">{v.readinessTitle}</h2>
      {attestation && a ? (
        <>
          <p className="text-sm text-run-700">
            {v.confirmedBy} ({attestation.submitter_designation}), {v.confirmedOn} {formatDate(attestation.reviewed_at, lang)}
          </p>
          <ul className="divide-y divide-slate-100 text-sm">
            {CAPABILITIES.map((c) => {
              const ans = a.capabilities[c];
              const extra =
                c === "thrombolysis" && ans !== "no" && a.agents.length ? a.agents.map((x) => v.agents[x]).join(", ")
                : c === "evt_referral" && ans !== "no" && a.transferModes.length ? a.transferModes.map((x) => v.transfer[x]).join(", ") + (a.referralCentre ? ` → ${a.referralCentre}` : "")
                : null;
              return (
                <li key={c} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                  <span>{v.capabilities[c]}{extra && <span className="block text-xs text-ink-muted">{extra}</span>}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ans === "no" ? "bg-slate-100 text-ink-soft" : "bg-run-100 text-run-700"}`}>{v.answers[ans]}</span>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="text-sm text-ink-muted">{v.notConfirmed}</p>
      )}
      <Link href={`/${lang}/hospitals/${hospitalId}/verify`} className="btn-secondary">{v.button}</Link>
    </section>
  );
}
