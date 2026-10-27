import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClaimStatusBadge } from "@/components/Trust";
import { showCandidates } from "@/lib/data/mode";
import { PILOT_DATASETS, PILOT_FACILITIES, PILOT_PROVIDERS, hospitalId, physicianId } from "@/lib/data/pilot";
import type { ClaimStatus } from "@/lib/data/pilot/types";
import { getDictionary, type Locale } from "@/lib/i18n";

export const metadata: Metadata = { title: "Reviewer queue", robots: { index: false, follow: false } };

const STATUSES: ClaimStatus[] = ["draft", "pending_review", "verified", "disputed", "stale"];

// Read-only reviewer queue for private pilot builds. Approve/reject needs Supabase auth (Sprint 3).
export default function ReviewPage({ params }: { params: { lang: Locale } }) {
  if (!showCandidates) notFound();
  const lang = params.lang;
  const t = getDictionary(lang);
  const claims = [...PILOT_FACILITIES, ...PILOT_PROVIDERS].flatMap((l) => l.claims ?? []);
  const counts = STATUSES.map((s) => [s, claims.filter((c) => c.status === s).length] as const);
  const hospitalName = (key: string) => PILOT_FACILITIES.find((f) => f.id === hospitalId(key))?.name ?? key;

  return (
    <div className="container-page section max-w-5xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl">{t.review.title}</h1>
        <p className="text-ink-soft">{t.review.subtitle}</p>
        <p className="rounded-xl bg-go-50 p-3 text-sm text-go-700">{t.review.approveNote}</p>
      </header>

      {PILOT_DATASETS.map((ds) => {
        const flaggedPhysicians = ds.physicians.filter((p) => p.flags.length);
        const flaggedAffiliations = ds.affiliations.filter((a) => a.flags.length);
        return (
          <section key={ds.pilot} className="space-y-6">
            <h2 className="text-2xl capitalize">{ds.pilot} · {ds.generatedAt}</h2>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                [t.review.hospitals, ds.hospitals.length],
                [t.review.physicians, ds.physicians.length],
                [t.review.affiliations, ds.affiliations.length],
                [t.review.procedures, ds.procedures.length],
                [t.review.failures, ds.sourceFailures.length],
              ].map(([label, n]) => (
                <div key={label as string} className="card p-3">
                  <dt className="text-xs text-ink-muted">{label}</dt>
                  <dd className="text-2xl font-semibold">{n}</dd>
                </div>
              ))}
            </dl>

            <div className="card space-y-2">
              <h3 className="text-lg">{t.review.byStatus}</h3>
              <p className="flex flex-wrap gap-3">
                {counts.map(([s, n]) => <span key={s} className="flex items-center gap-1"><ClaimStatusBadge status={s} t={t} /> {n} {t.review.claims}</span>)}
              </p>
            </div>

            <div className="card space-y-2">
              <h3 className="text-lg">{t.review.procedures}</h3>
              {ds.procedures.length === 0 ? <p className="text-sm text-ink-muted">{t.review.none}</p> : (
                <ul className="space-y-1 text-sm">
                  {ds.procedures.map((x) => {
                    const p = ds.physicians.find((y) => y.key === x.physicianKey);
                    return <li key={x.physicianKey}><Link className="text-go-700 underline" href={`/${lang}/neurologists/${physicianId(x.physicianKey)}`}>{p?.name ?? x.physicianKey}</Link> — <ClaimStatusBadge status={x.status} t={t} /></li>;
                  })}
                </ul>
              )}
            </div>

            <div className="card space-y-2">
              <h3 className="text-lg">{t.review.flagged}</h3>
              {flaggedPhysicians.length + flaggedAffiliations.length === 0 ? <p className="text-sm text-ink-muted">{t.review.none}</p> : (
                <ul className="space-y-1 text-sm">
                  {flaggedPhysicians.map((p) => <li key={p.key}><Link className="text-go-700 underline" href={`/${lang}/neurologists/${physicianId(p.key)}`}>{p.name}</Link> — {p.flags.join(", ")}</li>)}
                  {flaggedAffiliations.map((a) => <li key={a.physicianKey + a.hospitalKey}>{ds.physicians.find((p) => p.key === a.physicianKey)?.name ?? a.physicianKey} @ {hospitalName(a.hospitalKey)} — {a.flags.join(", ")}</li>)}
                </ul>
              )}
            </div>

            <div className="card space-y-2">
              <h3 className="text-lg">{t.review.hospitals}</h3>
              <ul className="divide-y divide-slate-100 text-sm">
                {ds.hospitals.map((h) => {
                  const docs = ds.affiliations.filter((a) => a.hospitalKey === h.key).length;
                  return (
                    <li key={h.key} className="flex flex-wrap items-center justify-between gap-2 py-2">
                      <span><span className="font-medium">{h.name}</span>{h.notes && <span className="block text-xs text-ink-muted">{h.notes}</span>}</span>
                      <span className="flex items-center gap-3 text-xs text-ink-muted">
                        {h.services.length} services · {docs} {t.review.physicians.toLowerCase()}
                        <Link className="text-go-700 underline" href={`/${lang}/hospitals/${hospitalId(h.key)}`}>{t.review.open}</Link>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="card space-y-2">
              <h3 className="text-lg">{t.review.failures}</h3>
              {ds.sourceFailures.length === 0 ? <p className="text-sm text-ink-muted">{t.review.none}</p> : (
                <ul className="space-y-1 break-all text-xs text-ink-soft">
                  {ds.sourceFailures.map((f, i) => <li key={i}>{f.url} — {f.reason}</li>)}
                </ul>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
