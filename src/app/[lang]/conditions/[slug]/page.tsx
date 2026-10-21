import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { conditionContent } from "@/lib/content/conditions";
import { formatDate, getDictionary, locales, type Locale } from "@/lib/i18n";
import { CONDITIONS, conditionBySlug } from "@/lib/taxonomy";

export function generateStaticParams() {
  return locales.flatMap((lang) => CONDITIONS.map((c) => ({ lang, slug: c.slug })));
}

export function generateMetadata({ params }: { params: { lang: Locale; slug: string } }): Metadata {
  const c = conditionBySlug(params.slug);
  return c ? { title: c.name[params.lang], description: conditionContent(c.slug)?.overview } : {};
}

function Section({ title, items, tone = "default" }: { title: string; items: string[]; tone?: "default" | "alert" }) {
  return (
    <section className={`card ${tone === "alert" ? "border-alert-100 bg-alert-50" : ""}`}>
      <h2 className={`text-xl ${tone === "alert" ? "text-alert-700" : ""}`}>{title}</h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5">
        {items.map((i) => <li key={i}>{i}</li>)}
      </ul>
    </section>
  );
}

export default function ConditionPage({ params }: { params: { lang: Locale; slug: string } }) {
  const lang = params.lang;
  const t = getDictionary(lang);
  const def = conditionBySlug(params.slug);
  const c = conditionContent(params.slug);
  if (!def || !c) notFound();

  return (
    <article className="container-page section max-w-3xl space-y-6">
      <header>
        <p className="text-sm text-ink-muted"><Link href={`/${lang}/conditions`} className="hover:underline">{t.nav.conditions}</Link> / {def.name[lang]}</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">{def.name[lang]}</h1>
        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-muted">
          <div><dt className="inline">{t.conditions.reviewer}: </dt><dd className="inline">{c.reviewer ?? t.common.neverReviewed}</dd></div>
          <div><dt className="inline">{t.conditions.reviewDate}: </dt><dd className="inline">{c.reviewedAt ? formatDate(c.reviewedAt, lang) : "—"}</dd></div>
        </dl>
      </header>

      {c.reviewStatus !== "reviewed" && (
        <p role="note" className="flex gap-2 rounded-2xl border border-kneetie-500 bg-kneetie-50 p-4 text-sm font-medium text-kneetie-700">
          <Icon name="alert" className="h-5 w-5 shrink-0" />{t.conditions.draftBanner}
        </p>
      )}
      {lang !== "en" && <p className="text-sm italic text-ink-muted">{t.common.translationPending}</p>}

      <section className="card">
        <h2 className="text-xl">{t.conditions.overview}</h2>
        <p className="mt-2" lang="en">{c.overview}</p>
      </section>
      <Section title={t.conditions.symptoms} items={c.symptoms} />
      <Section title={t.conditions.redFlags} items={c.redFlags} tone="alert" />
      <Section title={t.conditions.evaluation} items={c.evaluation} />
      <Section title={t.conditions.treatment} items={c.treatment} />

      <section className="card">
        <h2 className="text-xl">{t.conditions.faqs}</h2>
        <div className="mt-3 divide-y divide-slate-100">
          {c.faqs.map((f) => (
            <details key={f.q} className="py-3">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="mt-2 text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-go-600 p-6 text-white">
        <h2 className="text-xl">{t.conditions.nearbyCare}</h2>
        <Link href={`/${lang}/find?condition=${def.slug}`} className="btn mt-4 bg-white text-go-700 hover:bg-go-50">{t.conditions.findCareCta} →</Link>
      </section>

      <p className="text-xs text-ink-muted">{t.common.notMedicalAdvice}</p>
    </article>
  );
}
