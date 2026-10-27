import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { claimLabel } from "@/components/EvidenceList";
import { ClaimReviewForm } from "@/components/review/ClaimReviewForm";
import { ReviewerSignIn } from "@/components/review/ReviewerSignIn";
import { ClaimStatusBadge } from "@/components/Trust";
import { reviewMaxAgeDays, showCandidates } from "@/lib/data/mode";
import { PILOT_DATASETS, baseClaims, hospitalId, resolveClaims, type ResolvedClaim, type ReviewDecision } from "@/lib/data/pilot";
import type { ClaimStatus } from "@/lib/data/pilot/types";
import { formatDate, getDictionary, type Locale } from "@/lib/i18n";
import { supabaseConfigured } from "@/lib/supabase/config";
import { currentReviewer, supabaseServer } from "@/lib/supabase/server";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Reviewer dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const STATUSES: ClaimStatus[] = ["draft", "pending_review", "verified", "disputed", "stale"];
const VIEWS = {
  queue: { label: "To review", test: (c: ResolvedClaim) => ["draft", "pending_review", "stale"].includes(c.status) },
  flagged: { label: "Flagged", test: (c: ResolvedClaim) => c.flags.length > 0 && c.status !== "verified" && c.status !== "disputed" },
  thrombectomy: { label: "Thrombectomy", test: (c: ResolvedClaim) => c.field === "procedure:mechanical_thrombectomy" || c.field === "service:thrombectomy" },
  verified: { label: "Approved", test: (c: ResolvedClaim) => c.status === "verified" },
  disputed: { label: "Rejected", test: (c: ResolvedClaim) => c.status === "disputed" },
  all: { label: "All", test: () => true },
} as const;
type View = keyof typeof VIEWS;

interface FullDecision extends ReviewDecision {
  note: string | null;
}
interface ReviewEvent {
  id: number;
  claim_id: string;
  from_status: ClaimStatus | null;
  to_status: ClaimStatus;
  note: string | null;
  reviewer_name: string | null;
  created_at: string;
}

function Shell({ children }: { children: ReactNode }) {
  return <div className="container-page section max-w-5xl space-y-6">{children}</div>;
}

export default async function ReviewPage({ params, searchParams }: { params: { lang: Locale }; searchParams: { view?: string; hospital?: string } }) {
  if (!showCandidates && !supabaseConfigured) notFound();
  const lang = params.lang;
  const t = getDictionary(lang);

  const reviewer = supabaseConfigured ? await currentReviewer() : null;
  const header = (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        <h1 className="text-3xl">Reviewer dashboard</h1>
        <p className="text-ink-soft">Approve, reject or hold each research claim. Only approved claims are ever shown as verified.</p>
      </div>
      {reviewer && (
        <form action={signOut} className="flex items-center gap-2 text-sm text-ink-muted">
          <input type="hidden" name="lang" value={lang} />
          <span>{reviewer.name}</span>
          <button className="underline">Sign out</button>
        </form>
      )}
    </header>
  );

  if (supabaseConfigured && !reviewer) return <Shell>{header}<ReviewerSignIn next={`/${lang}/review`} /></Shell>;
  if (reviewer && !reviewer.isReviewer) {
    return (
      <Shell>
        {header}
        <p className="card text-sm">You are signed in as {reviewer.email}, but this account does not have the reviewer role yet. Ask the project owner to grant it (see docs/PILOT.md).</p>
      </Shell>
    );
  }
  const canAct = Boolean(reviewer?.isReviewer);

  let decisions: FullDecision[] = [];
  let events: ReviewEvent[] = [];
  if (canAct) {
    const sb = supabaseServer();
    const [d, e] = await Promise.all([
      sb.from("claim_reviews").select("*"),
      sb.from("claim_review_events").select("*").order("created_at", { ascending: false }).limit(15),
    ]);
    decisions = (d.data ?? []) as FullDecision[];
    events = (e.data ?? []) as ReviewEvent[];
  }
  const notes = new Map(decisions.map((d) => [d.claim_id, d.note]));

  const all = PILOT_DATASETS.flatMap((ds) => resolveClaims(baseClaims(ds), decisions, reviewMaxAgeDays));
  const names = Object.fromEntries(all.map((c) => [c.recordId, c.recordName]));
  const view: View = searchParams.view && searchParams.view in VIEWS ? (searchParams.view as View) : "queue";
  const hospital = searchParams.hospital ?? "";
  const physiciansAtHospital = new Set(all.filter((c) => c.otherRecordId === hospital).map((c) => c.recordId));
  const inHospital = (c: ResolvedClaim) => !hospital || c.recordId === hospital || physiciansAtHospital.has(c.recordId);
  const scoped = all.filter(inHospital);
  const shown = scoped.filter(VIEWS[view].test);

  const groups = new Map<string, ResolvedClaim[]>();
  for (const c of shown) groups.set(c.recordId, [...(groups.get(c.recordId) ?? []), c]);
  const hospitals = PILOT_DATASETS.flatMap((ds) => ds.hospitals.map((h) => ({ id: hospitalId(h.key), name: h.name })));
  const href = (v: View) => `/${lang}/review?view=${v}${hospital ? `&hospital=${encodeURIComponent(hospital)}` : ""}`;

  return (
    <Shell>
      {header}
      {!supabaseConfigured && (
        <p className="rounded-xl bg-go-50 p-3 text-sm text-go-700">
          Read-only: Supabase is not connected yet, so decisions can&apos;t be saved. Follow the setup steps in docs/PILOT.md.
        </p>
      )}

      <dl className="flex flex-wrap gap-3 text-sm">
        {STATUSES.map((s) => (
          <div key={s} className="flex items-center gap-1"><ClaimStatusBadge status={s} t={t} /> {scoped.filter((c) => c.status === s).length}</div>
        ))}
      </dl>

      <nav className="flex flex-wrap items-center gap-2" aria-label="Queues">
        {(Object.keys(VIEWS) as View[]).map((v) => (
          <Link key={v} href={href(v)} aria-current={v === view ? "page" : undefined}
            className={`rounded-full px-3 py-1 text-sm font-medium ${v === view ? "bg-ink text-white" : "border border-slate-300 bg-white hover:bg-slate-50"}`}>
            {VIEWS[v].label} ({scoped.filter(VIEWS[v].test).length})
          </Link>
        ))}
        <form className="ml-auto flex items-center gap-2 text-sm" action={`/${lang}/review`}>
          <input type="hidden" name="view" value={view} />
          <select name="hospital" defaultValue={hospital} className="rounded-xl border border-slate-300 px-2 py-1.5" aria-label="Hospital">
            <option value="">All hospitals</option>
            {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
          <button className="rounded-xl border border-slate-300 bg-white px-3 py-1.5">Filter</button>
        </form>
      </nav>

      {groups.size === 0 && <p className="card text-sm text-ink-muted">Nothing in this queue.</p>}

      <div className="space-y-4">
        {[...groups.entries()].map(([recordId, claims]) => (
          <section key={recordId} className="card space-y-3">
            <header className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg">{claims[0].recordName}</h2>
              <span className="text-xs text-ink-muted">
                {claims[0].recordKind === "hospital" ? "Hospital" : "Physician"}
                {showCandidates && <> · <Link className="text-go-700 underline" href={`/${lang}/${claims[0].recordKind === "hospital" ? "hospitals" : "neurologists"}/${recordId}`}>View page</Link></>}
              </span>
            </header>
            <ul className="divide-y divide-slate-100">
              {claims.map((c) => (
                <li key={c.id} className="grid gap-3 py-3 md:grid-cols-[1fr_minmax(0,320px)]">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{claimLabel(c, t, lang, names)}</span>
                      <ClaimStatusBadge status={c.status} t={t} />
                      {c.flags.map((f) => <span key={f} className="rounded-full bg-kneetie-50 px-2 py-0.5 text-xs text-kneetie-700">{f.replace(/_/g, " ")}</span>)}
                    </div>
                    {!["available", "explicit_claim"].includes(c.value) && (
                      <p className="text-sm">{c.value}{c.originalValue && <span className="text-xs text-ink-muted"> (research said: {c.originalValue})</span>}</p>
                    )}
                    {c.evidence.length === 0 ? (
                      <p className="text-xs italic text-alert-700">No source attached. Do not approve without checking it yourself.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {c.evidence.map((e, i) => (
                          <li key={i} className="rounded-xl bg-slate-50 p-2 text-sm">
                            <p className="text-ink-soft">{e.kind === "verbatim" ? <q>{e.excerpt}</q> : <>Summary: {e.excerpt}</>}</p>
                            <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-ink-muted">
                              <a href={e.url} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-go-700 underline">{e.url}</a>
                              <span>{e.sourceType}</span>
                              <span>checked {e.checkedAt}</span>
                              {e.sourceDate && <span>source date {e.sourceDate}</span>}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                    {c.reviewer && (
                      <p className="text-xs text-ink-muted">
                        Last decision by {c.reviewer} on {formatDate(c.reviewedAt as string, lang)}
                        {c.status === "stale" && " — the evidence or the re-check interval has changed since; please review again"}
                        {notes.get(c.id) && <> · Note: {notes.get(c.id)}</>}
                      </p>
                    )}
                  </div>
                  {canAct && <ClaimReviewForm claimId={c.id} value={c.value} isProcedure={c.field.startsWith("procedure:")} />}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {canAct && (
        <section className="card space-y-2">
          <h2 className="text-lg">Recent decisions (audit trail)</h2>
          {events.length === 0 ? <p className="text-sm text-ink-muted">No decisions yet.</p> : (
            <ul className="space-y-1 text-sm">
              {events.map((e) => {
                const c = all.find((x) => x.id === e.claim_id);
                return (
                  <li key={e.id} className="text-ink-soft">
                    {new Date(e.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} · {e.reviewer_name}: {c ? `${c.recordName} — ${claimLabel(c, t, lang, names)}` : e.claim_id} → {e.to_status}
                    {e.from_status && ` (was ${e.from_status})`}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <section className="card space-y-2">
        <h2 className="text-lg">{t.review.failures}</h2>
        <ul className="space-y-1 break-all text-xs text-ink-soft">
          {PILOT_DATASETS.flatMap((ds) => ds.sourceFailures).map((f, i) => <li key={i}>{f.url} — {f.reason}</li>)}
        </ul>
      </section>
    </Shell>
  );
}
