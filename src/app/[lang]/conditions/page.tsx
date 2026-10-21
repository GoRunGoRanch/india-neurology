import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { conditionContent } from "@/lib/content/conditions";
import { getDictionary, type Locale } from "@/lib/i18n";
import { CONDITIONS } from "@/lib/taxonomy";

export function generateMetadata({ params }: { params: { lang: Locale } }): Metadata {
  return { title: getDictionary(params.lang).conditions.title };
}

export default function ConditionsPage({ params }: { params: { lang: Locale } }) {
  const lang = params.lang;
  const t = getDictionary(lang);

  return (
    <div className="container-page section">
      <h1 className="text-3xl sm:text-4xl">{t.conditions.title}</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">{t.conditions.subtitle}</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CONDITIONS.map((c) => (
          <li key={c.slug}>
            <Link href={`/${lang}/conditions/${c.slug}`} className="card flex h-full flex-col gap-2 hover:border-kneetie-500">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-kneetie-100 text-kneetie-600"><Icon name="brain" /></span>
              <h2 className="text-lg">{c.name[lang]}</h2>
              <p className="line-clamp-3 text-sm text-ink-soft">{conditionContent(c.slug)?.overview}</p>
              <span className="mt-auto text-sm font-semibold text-go-700">{t.conditions.readGuide} →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
