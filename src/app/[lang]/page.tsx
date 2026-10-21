import Link from "next/link";
import { ConditionChips } from "@/components/ConditionChips";
import { Icon } from "@/components/Icon";
import { LocationSearch } from "@/components/LocationSearch";
import { ResultCard } from "@/components/ResultCard";
import { DemoNotice } from "@/components/Trust";
import { YouTubeFeature } from "@/components/YouTubeFeature";
import { repository } from "@/lib/data/repository";
import { getDictionary, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";

export default async function Home({ params }: { params: { lang: Locale } }) {
  const lang = params.lang;
  const t = getDictionary(lang);
  const preview = (await repository.search({ type: "all", condition: "stroke" })).slice(0, 3);

  return (
    <>
      {/* Hero — warm gradient and bold multi-colour headline from reference 2 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-kneetie-50 via-paper to-paper">
        <div className="container-page section">
          <span className="eyebrow">{t.home.eyebrow}</span>
          <h1 className="mt-4 max-w-3xl text-4xl leading-[1.1] sm:text-6xl">
            {lang === "en" ? (
              <>Find <span className="text-kneetie-500">Neurological Care</span> Across <span className="text-run-600">India</span></>
            ) : (
              t.home.title
            )}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">{t.home.subtitle}</p>
          <div className="mt-8">
            <LocationSearch t={t} lang={lang} />
          </div>
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">{t.home.chipsTitle}</h2>
            <ConditionChips lang={lang} />
          </div>
        </div>
      </section>

      {/* Emergency banner */}
      <section className="container-page">
        <div className="flex flex-col gap-4 rounded-3xl bg-alert-600 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15"><Icon name="alert" className="h-6 w-6" /></span>
            <div>
              <h2 className="text-xl sm:text-2xl">{t.home.emergencyTitle}</h2>
              <p className="mt-1 max-w-2xl text-white/90">{t.home.emergencyBody}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={`tel:${site.emergency.national}`} className="btn bg-white text-alert-700 hover:bg-alert-50">
              <Icon name="phone" className="h-4 w-4" /> {t.emergencyBar.call}
            </a>
            <Link href={`/${lang}/stroke`} className="btn border border-white/60 text-white hover:bg-white/10">{t.home.emergencyCta}</Link>
          </div>
        </div>
      </section>

      {/* Featured learning — YouTube channel */}
      <section className="container-page section">
        <YouTubeFeature t={t} lang={lang} />
      </section>

      {/* Specialist care */}
      <section className="container-page pb-12 sm:pb-16">
        <Link href={`/${lang}/care`} className="group grid gap-4 rounded-3xl border border-go-100 bg-go-50 p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-8">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-go-600 text-white"><Icon name="brain" className="h-6 w-6" /></span>
          <span>
            <span className="block text-xl font-bold sm:text-2xl">{t.care.homeTitle}</span>
            <span className="mt-1 block text-ink-soft">{t.care.homeBody}</span>
          </span>
          <span className="btn-secondary group-hover:bg-white">{t.care.homeCta} →</span>
        </Link>
      </section>

      {/* Directory preview */}
      <section className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl">{t.home.previewTitle}</h2>
            <p className="mt-1 max-w-2xl text-ink-soft">{t.home.previewBody}</p>
          </div>
          <Link href={`/${lang}/find`} className="btn-secondary">{t.home.previewCta} →</Link>
        </div>
        {repository.usingDemoData && <div className="mt-6"><DemoNotice t={t} /></div>}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {preview.map((r) => <ResultCard key={r.listing.id} result={r} t={t} lang={lang} />)}
        </div>
      </section>

      {/* Trust */}
      <section className="container-page section">
        <h2 className="text-2xl sm:text-3xl">{t.home.trustTitle}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { icon: "shield" as const, title: t.home.trust1Title, body: t.home.trust1Body },
            { icon: "check" as const, title: t.home.trust2Title, body: t.home.trust2Body },
            { icon: "brain" as const, title: t.home.trust3Title, body: t.home.trust3Body },
          ].map((c) => (
            <div key={c.title} className="card">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-run-100 text-run-700"><Icon name={c.icon} /></span>
              <h3 className="mt-3 text-lg">{c.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{c.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
