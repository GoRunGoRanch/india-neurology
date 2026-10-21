import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { getDictionary, type Locale } from "@/lib/i18n";

export function generateMetadata({ params }: { params: { lang: Locale } }): Metadata {
  return { title: getDictionary(params.lang).providers.title };
}

export default function ForProvidersPage({ params }: { params: { lang: Locale } }) {
  const lang = params.lang;
  const p = getDictionary(lang).providers;
  return (
    <div className="container-page section max-w-3xl space-y-6">
      <h1 className="text-3xl sm:text-4xl">{p.title}</h1>
      <p className="text-lg text-ink-soft">{p.subtitle}</p>
      <section className="card">
        <h2 className="text-xl">{p.howTitle}</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">{p.how.map((h) => <li key={h}>{h}</li>)}</ol>
      </section>
      <section className="card">
        <h2 className="text-xl">{p.rulesTitle}</h2>
        <ul className="mt-3 space-y-2">
          {p.rules.map((r) => <li key={r} className="flex gap-2"><Icon name="shield" className="mt-0.5 h-5 w-5 shrink-0 text-run-600" />{r}</li>)}
        </ul>
      </section>
      <div className="flex flex-wrap gap-3">
        <Link href={`/${lang}/report?kind=claim_profile`} className="btn-primary">{p.claimCta}</Link>
        <Link href={`/${lang}/report?kind=new_listing`} className="btn-secondary">{p.newCta}</Link>
      </div>
    </div>
  );
}
