import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { StrokeToolCard } from "@/components/StrokeToolCard";
import { CARE_CONTENT as c } from "@/lib/content/care";
import { formatDate, getDictionary, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";

export function generateMetadata({ params }: { params: { lang: Locale } }): Metadata {
  const t = getDictionary(params.lang);
  return { title: t.care.title, description: t.care.subtitle };
}

const TEAM_TONES = ["bg-kneetie-100 text-kneetie-700", "bg-alert-100 text-alert-700", "bg-go-100 text-go-700"];

export default function CarePage({ params }: { params: { lang: Locale } }) {
  const lang = params.lang;
  const t = getDictionary(lang);

  return (
    <>
      <section className="bg-gradient-to-b from-go-50 to-paper">
        <div className="container-page section max-w-4xl">
          <span className="eyebrow">{t.care.eyebrow}</span>
          <h1 className="mt-4 text-4xl sm:text-5xl">
            {lang === "en" ? <>Neurology &amp; <span className="text-go-600">Neurointerventional</span> Care</> : t.care.title}
          </h1>
          <p className="mt-3 text-lg text-ink-soft">{t.care.subtitle}</p>
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-muted">
            <div><dt className="inline">{t.conditions.reviewer}: </dt><dd className="inline">{c.reviewer ?? t.common.neverReviewed}</dd></div>
            <div><dt className="inline">{t.conditions.reviewDate}: </dt><dd className="inline">{c.reviewedAt ? formatDate(c.reviewedAt, lang) : "—"}</dd></div>
          </dl>
        </div>
      </section>

      <div className="container-page max-w-4xl space-y-10 pb-12">
        {c.reviewStatus !== "reviewed" && (
          <p role="note" className="flex gap-2 rounded-2xl border border-kneetie-500 bg-kneetie-50 p-4 text-sm font-medium text-kneetie-700">
            <Icon name="alert" className="h-5 w-5 shrink-0" />{t.conditions.draftBanner}
          </p>
        )}
        {lang !== "en" && <p className="text-sm italic text-ink-muted">{t.common.translationPending}</p>}

        <p className="text-lg" lang="en">{c.intro}</p>

        <section aria-labelledby="teams">
          <h2 id="teams" className="text-2xl sm:text-3xl">{t.care.teamsTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {c.teams.map((team, i) => (
              <article key={team.id} id={team.id} className="card scroll-mt-28" lang="en">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${TEAM_TONES[i]}`}>{i + 1}</span>
                <h3 className="mt-3 text-lg">{team.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{team.summary}</p>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {team.points.map((p) => (
                    <li key={p} className="flex gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-run-600" />{p}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="pathway" className="rounded-3xl bg-ink p-6 text-white sm:p-8">
          <h2 id="pathway" className="text-2xl">{c.pathwayTitle}</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-5" lang="en">
            {c.pathway.map((p, i) => (
              <li key={p.step} className="rounded-2xl bg-white/10 p-4">
                <span className="text-sm font-bold text-kneetie-500">{i + 1}</span>
                <p className="mt-1 font-semibold">{p.step}</p>
                <p className="mt-1 text-sm text-white/80">{p.body}</p>
              </li>
            ))}
          </ol>
          <a href={`tel:${site.emergency.national}`} className="btn-alert mt-6"><Icon name="phone" className="h-4 w-4" />{t.emergencyBar.call}</a>
        </section>

        <section aria-labelledby="procedures">
          <h2 id="procedures" className="text-2xl sm:text-3xl">{t.care.proceduresTitle}</h2>
          <div className="mt-6 space-y-4">
            {c.procedures.map((p) => (
              <article key={p.id} id={p.id} className="card scroll-mt-28">
                <h3 className="text-lg" lang="en">{p.name}</h3>
                <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-[120px_1fr]" lang="en">
                  <dt className="font-medium text-ink-muted">{t.care.what}</dt><dd>{p.what}</dd>
                  <dt className="font-medium text-ink-muted">{t.care.usedFor}</dt><dd>{p.usedFor}</dd>
                </dl>
                {p.service && (
                  <Link href={`/${lang}/find?type=hospital&service=${p.service}`} className="mt-3 inline-block text-sm font-semibold text-go-700 hover:underline">
                    {t.care.findCentres} →
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>

        <StrokeToolCard t={t} lang={lang} />

        <div className="grid gap-4 md:grid-cols-2" lang="en">
          <section className="card border-alert-100 bg-alert-50">
            <h2 className="text-xl text-alert-700">{c.whenTitle}</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">{c.when.map((w) => <li key={w}>{w}</li>)}</ul>
          </section>
          <section className="card">
            <h2 className="text-xl">{c.askTitle}</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">{c.ask.map((a) => <li key={a}>{a}</li>)}</ul>
          </section>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href={`/${lang}/find?type=hospital&service=thrombectomy`} className="btn-primary">{t.care.findThrombectomy} →</Link>
          <Link href={`/${lang}/find?type=neurologist`} className="btn-secondary">{t.nav.findNeurologist}</Link>
        </div>
        <p className="text-xs text-ink-muted">{t.common.notMedicalAdvice}</p>
      </div>
    </>
  );
}
