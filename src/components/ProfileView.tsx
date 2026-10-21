import Link from "next/link";
import type { ReactNode } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { Provenance } from "@/lib/data/types";
import { Icon } from "./Icon";
import { DemoBadge, DemoNotice, ReviewedDate, VerificationBadge } from "./Trust";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 py-3 sm:grid-cols-[200px_1fr]">
      <dt className="text-sm font-medium text-ink-muted">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

interface Props {
  t: Dictionary;
  lang: Locale;
  id: string;
  name: string;
  kindLabel: string;
  place: string;
  provenance: Provenance;
  children: ReactNode;
}

// Shared shell for neurologist and hospital profiles: identity, provenance, report/claim.
export function ProfileView({ t, lang, id, name, kindLabel, place, provenance, children }: Props) {
  const reportHref = `/${lang}/report?ref=${encodeURIComponent(id)}`;
  return (
    <article className="container-page section max-w-4xl space-y-6">
      {provenance.isDemo && <DemoNotice t={t} />}
      <header className="space-y-2">
        <p className="text-sm font-medium text-kneetie-600">{kindLabel}</p>
        <h1 className="text-3xl sm:text-4xl">{name}</h1>
        <p className="flex items-center gap-1.5 text-ink-soft"><Icon name="pin" className="h-4 w-4 text-kneetie-500" />{place}</p>
        <div className="flex flex-wrap items-center gap-2">
          {provenance.isDemo && <DemoBadge t={t} />}
          <VerificationBadge status={provenance.verificationStatus} t={t} />
          <ReviewedDate iso={provenance.lastVerifiedAt} lang={lang} t={t} />
        </div>
      </header>

      <dl className="card py-2">
        {children}
        <Field label={t.profile.source}>{provenance.sourceTitle ?? <span className="italic text-ink-muted">{t.common.notVerified}</span>}</Field>
      </dl>

      <section className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg">{t.profile.claimTitle}</h2>
          <p className="text-sm text-ink-soft">{t.profile.claimBody}</p>
          <p className="mt-1 text-xs text-ink-muted">{t.profile.noPaidPlacement}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Link href={`${reportHref}&kind=claim_profile`} className="btn-secondary">{t.profile.claimCta}</Link>
          <Link href={`${reportHref}&kind=correction`} className="btn border border-alert-100 bg-alert-50 text-alert-700 hover:bg-alert-100">
            <Icon name="alert" className="h-4 w-4" />{t.common.reportError}
          </Link>
        </div>
      </section>
    </article>
  );
}
