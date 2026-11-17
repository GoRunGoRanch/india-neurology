import type { Metadata } from "next";
import Link from "next/link";
import { StrokeTest } from "@/components/StrokeTest";
import { getDictionary, type Locale } from "@/lib/i18n";

export function generateMetadata({ params }: { params: { lang: Locale } }): Metadata {
  const t = getDictionary(params.lang);
  return { title: t.strokeTest.title, description: t.strokeTest.subtitle };
}

export default function StrokeTestPage({ params }: { params: { lang: Locale } }) {
  const lang = params.lang;
  const t = getDictionary(lang);
  return (
    <div className="container-page section max-w-3xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl sm:text-4xl">{t.strokeTest.title}</h1>
        <p className="text-ink-soft">{t.strokeTest.subtitle}</p>
      </header>
      <StrokeTest t={t} lang={lang} />
      <p className="text-xs text-ink-muted">
        {t.strokeTest.reviewNote} <Link href={`/${lang}/stroke`} className="underline">{t.nav.strokeFast}</Link>
      </p>
    </div>
  );
}
