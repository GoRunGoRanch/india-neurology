import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { ShortsGrid } from "@/components/ShortsGrid";
import { StrokeAppCard } from "@/components/StrokeAppCard";
import { BRAIN_HEALTH_SHORTS, STROKE_SHORTS } from "@/lib/content/shorts";
import { YouTubeFeature } from "@/components/YouTubeFeature";
import { getDictionary, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";

export function generateMetadata({ params }: { params: { lang: Locale } }): Metadata {
  return { title: getDictionary(params.lang).learn.title };
}

export default function LearnPage({ params }: { params: { lang: Locale } }) {
  const lang = params.lang;
  const t = getDictionary(lang);
  const hrefs = [`/${lang}/stroke`, `/${lang}/emergency`, `/${lang}/conditions`];
  const tones = ["bg-kneetie-500", "bg-alert-500", "bg-go-500"];

  return (
    <div className="container-page section space-y-12">
      <header className="max-w-3xl">
        <h1 className="text-3xl sm:text-4xl">{t.learn.title}</h1>
        <p className="mt-2 text-ink-soft">{t.learn.subtitle}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={site.youtubeChannelUrl} target="_blank" rel="noopener noreferrer" className="btn-alert"><Icon name="play" className="h-4 w-4" />{t.learn.channelCta}</a>
          <a href={`${site.youtubeChannelUrl}?sub_confirmation=1`} target="_blank" rel="noopener noreferrer" className="btn-secondary">{t.learn.subscribe}</a>
        </div>
      </header>

      <YouTubeFeature t={t} lang={lang} />

      <StrokeAppCard t={t} />

      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl">{t.learn.shortsTitle}</h2>
            <p className="mt-1 max-w-2xl text-ink-soft">{t.learn.shortsBody}</p>
          </div>
          <a href={site.youtubeShortsUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">{t.learn.allShorts} <Icon name="external" className="h-4 w-4" /></a>
        </div>
        <ShortsGrid shorts={STROKE_SHORTS} playLabel={t.learn.play} />
      </section>

      <section>
        <h2 className="mb-6 text-2xl">{t.learn.brainHealthTitle}</h2>
        <ShortsGrid shorts={BRAIN_HEALTH_SHORTS} playLabel={t.learn.play} />
      </section>

      <section>
        <h2 className="text-2xl">{t.learn.journeysTitle}</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {t.learn.journeys.map((j, i) => (
            <li key={j.title}>
              <Link href={hrefs[i]} className="card flex h-full flex-col gap-3 hover:border-kneetie-500">
                <span className={`grid h-10 w-10 place-items-center rounded-xl text-lg font-bold text-white ${tones[i]}`}>{i + 1}</span>
                <h3 className="text-lg">{j.title}</h3>
                <p className="text-sm text-ink-soft">{j.body}</p>
                <span className="mt-auto text-sm font-semibold text-go-700">{t.learn.start} →</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
