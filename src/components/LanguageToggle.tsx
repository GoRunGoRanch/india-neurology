"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";

const LABELS: Record<Locale, string> = { en: "English", hi: "हिन्दी" };

export function LanguageToggle({ lang, label }: { lang: Locale; label: string }) {
  const pathname = usePathname() ?? `/${lang}`;
  const rest = pathname.split("/").slice(2).join("/");

  return (
    <div role="group" aria-label={label} className="inline-flex rounded-xl border border-slate-300 bg-white p-0.5 text-sm">
      {locales.map((l) => (
        <Link
          key={l}
          href={`/${l}${rest ? `/${rest}` : ""}`}
          hrefLang={l}
          lang={l}
          aria-current={l === lang ? "true" : undefined}
          onClick={() => {
            document.cookie = `locale=${l}; path=/; max-age=31536000; samesite=lax`;
          }}
          className={`rounded-lg px-3 py-1.5 font-medium ${l === lang ? "bg-go-600 text-white" : "text-ink-soft hover:bg-slate-100"}`}
        >
          {LABELS[l]}
        </Link>
      ))}
    </div>
  );
}
