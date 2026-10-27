import type { ClaimView } from "@/lib/data/types";
import { formatDate, type Dictionary, type Locale } from "@/lib/i18n";
import { serviceName } from "@/lib/taxonomy";
import { ClaimStatusBadge } from "./Trust";

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function claimLabel(c: ClaimView, t: Dictionary, lang: Locale, names: Record<string, string> = {}) {
  const [kind, arg] = c.field.split(":");
  if (kind === "service") return `${t.pilot.fields.service}: ${serviceName(arg, lang)}`;
  if (kind === "affiliation") return `${t.pilot.fields.affiliation}: ${names[arg] ?? arg}`;
  if (kind === "procedure") return t.pilot.fields.procedure;
  return t.pilot.fields[kind as keyof Dictionary["pilot"]["fields"]] ?? c.field;
}

/** Every claim with its own status and source links — the core of the verification rules. */
export function EvidenceList({ claims, t, lang, names }: { claims: ClaimView[]; t: Dictionary; lang: Locale; names?: Record<string, string> }) {
  return (
    <section className="card space-y-4">
      <div>
        <h2 className="text-lg">{t.pilot.evidenceTitle}</h2>
        <p className="text-sm text-ink-soft">{t.pilot.evidenceBody}</p>
      </div>
      <ul className="divide-y divide-slate-100">
        {claims.map((c) => (
          <li key={c.field} className="space-y-2 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{claimLabel(c, t, lang, names)}</span>
              {c.value && !["available", "explicit_claim"].includes(c.value) && <span className="text-ink-soft">— {c.value}</span>}
              <ClaimStatusBadge status={c.status} t={t} />
              {c.reviewer && c.reviewedAt && (
                <span className="text-xs text-ink-muted">{t.pilot.reviewedBy} {c.reviewer}, {formatDate(c.reviewedAt, lang)}</span>
              )}
              {c.flags?.map((f) => (
                <span key={f} className="rounded-full bg-kneetie-50 px-2 py-0.5 text-xs text-kneetie-700">{t.pilot.flag}: {f.replace(/_/g, " ")}</span>
              ))}
            </div>
            {c.originalValue && <p className="text-xs text-ink-muted">({t.pilot.correctedFrom}: {c.originalValue})</p>}
            {c.evidence.length === 0 ? (
              <p className="text-xs italic text-ink-muted">{t.pilot.noEvidence}</p>
            ) : (
              <ul className="space-y-1.5">
                {c.evidence.map((e, i) => (
                  <li key={i} className="rounded-xl bg-slate-50 p-2 text-sm">
                    <p className="text-ink-soft">{e.kind === "verbatim" ? <q>{e.excerpt}</q> : <><span className="font-medium">{t.pilot.summary}: </span>{e.excerpt}</>}</p>
                    <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-ink-muted">
                      <a href={e.url} rel="noopener noreferrer nofollow" target="_blank" className="text-go-700 underline">{hostOf(e.url)}</a>
                      <span>{t.pilot.checked}: {formatDate(e.checkedAt, lang)}</span>
                      {e.sourceDate && <span>{t.pilot.sourceDate}: {e.sourceDate}</span>}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
