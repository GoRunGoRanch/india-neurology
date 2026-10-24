import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { Icon } from "./Icon";

export function YouTubeFeature({ t, lang }: { t: Dictionary; lang: Locale }) {
  return (
    <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:grid-cols-2">
      <div className="relative aspect-video bg-gradient-to-br from-kneetie-500 via-alert-500 to-go-600 md:aspect-auto">
        {site.featuredVideoId ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${site.featuredVideoId}`}
            title={t.home.featuredTitle}
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <a href={site.youtubeChannelUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 grid place-items-center text-white" aria-label={t.home.featuredCta}>
            <span className="text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/95 text-alert-600 shadow-lg">
                <Icon name="play" className="ml-1 h-7 w-7" />
              </span>
              <span className="mt-3 block text-lg font-extrabold drop-shadow">KneeTie… Go Run Go!</span>
              <span className="block text-sm opacity-90">youtube.com/c/kneetiegorungo</span>
            </span>
          </a>
        )}
      </div>
      <div className="space-y-4 p-6 sm:p-8">
        <span className="eyebrow">{t.home.featuredEyebrow}</span>
        <h2 className="text-2xl sm:text-3xl">{t.home.featuredTitle}</h2>
        <p className="text-ink-soft">{t.home.featuredBody}</p>
        <div className="flex flex-wrap gap-3">
          <a href={site.youtubeChannelUrl} target="_blank" rel="noopener noreferrer" className="btn-alert">
            <Icon name="play" className="h-4 w-4" />
            {t.home.featuredCta}
          </a>
          <a href={site.youtubeShortsUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">{t.learn.allShorts}</a>
          <Link href={`/${lang}/stroke`} className="btn-secondary">{t.home.featuredSecondary}</Link>
        </div>
      </div>
    </div>
  );
}
