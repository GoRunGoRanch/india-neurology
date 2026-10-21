import type { Metadata } from "next";
import Link from "next/link";
import { FastSteps } from "@/components/FastSteps";
import { Icon } from "@/components/Icon";
import { YouTubeFeature } from "@/components/YouTubeFeature";
import { getDictionary, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";

export function generateMetadata({ params }: { params: { lang: Locale } }): Metadata {
  return { title: getDictionary(params.lang).stroke.title };
}

export default function StrokePage({ params }: { params: { lang: Locale } }) {
  const lang = params.lang;
  const t = getDictionary(lang);
  const s = t.stroke;

  return (
    <>
      <section className="bg-gradient-to-b from-kneetie-50 to-paper">
        <div className="container-page section text-center">
          <span className="eyebrow">{s.eyebrow}</span>
          <h1 className="mt-4 text-4xl sm:text-5xl">
            {lang === "en" ? (
              <>The <span className="text-kneetie-500">KneeTie…</span> <span className="text-go-600">Go</span> <span className="text-run-600">Run</span> <span className="text-alert-600">Go</span> Test</>
            ) : s.title}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-ink-soft">{s.subtitle}</p>
          <div className="mt-10 text-left"><FastSteps t={t} /></div>
          <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-4 rounded-2xl border border-alert-100 bg-alert-50 p-5 sm:flex-row sm:justify-between">
            <p className="flex items-center gap-2 font-semibold text-alert-700"><Icon name="alert" className="h-5 w-5 shrink-0" />{s.anyFailure}</p>
            <a href={`tel:${site.emergency.national}`} className="btn-alert shrink-0"><Icon name="phone" className="h-4 w-4" />{s.callNow}</a>
          </div>
        </div>
      </section>

      <section className="container-page section">
        <h2 className="text-2xl sm:text-3xl">{s.fastTitle}</h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {s.fast.map((f) => (
            <div key={f.letter} className="card">
              <dt className="flex items-baseline gap-2"><span className="text-4xl font-extrabold text-alert-600">{f.letter}</span><span className="font-semibold">{f.label}</span></dt>
              <dd className="mt-2 text-sm text-ink-soft">{f.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Two separate entry points, as in reference 4: learning game and stroke-centre finder */}
      <section className="container-page grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-gradient-to-br from-run-500 to-go-600 p-8 text-white">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20"><Icon name="play" className="h-6 w-6" /></span>
          <h2 className="mt-4 text-2xl">{s.gameTitle}</h2>
          <p className="mt-2 text-white/90">{s.gameBody}</p>
          {site.robloxGameUrl ? (
            <a href={site.robloxGameUrl} target="_blank" rel="noopener noreferrer" className="btn mt-6 bg-white text-run-700 hover:bg-run-50">{s.gameCta} <Icon name="external" className="h-4 w-4" /></a>
          ) : (
            <p className="mt-6 inline-flex rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold">{s.gameSoon}</p>
          )}
        </div>
        <div className="card flex flex-col p-8">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-alert-100 text-alert-600"><Icon name="pin" className="h-6 w-6" /></span>
          <h2 className="mt-4 text-2xl">{s.finderTitle}</h2>
          <p className="mt-2 text-ink-soft">{s.finderBody}</p>
          <Link href={`/${lang}/find?type=hospital&service=thrombolysis`} className="btn-primary mt-6 self-start">{s.finderCta} →</Link>
        </div>
      </section>

      <section className="container-page section">
        <YouTubeFeature t={t} lang={lang} />
      </section>
    </>
  );
}
