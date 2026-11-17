"use client";

import { usePathname, useRouter } from "next/navigation";
import { LANGUAGE_NAMES, locales, type Locale } from "@/lib/i18n/config";

/**
 * Language menu. Each option shows the language in its own script plus its English name, because
 * dropdown options can't carry the English caption line other text gets.
 */
export function LanguageToggle({ lang, label }: { lang: Locale; label: string }) {
  const router = useRouter();
  const pathname = usePathname() ?? `/${lang}`;
  const rest = pathname.split("/").slice(2).join("/");

  return (
    <label className="inline-flex items-center gap-1.5 text-sm">
      <span className="sr-only">{label}</span>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-ink-muted" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
      </svg>
      <select
        value={lang}
        aria-label={label}
        onChange={(e) => {
          const l = e.target.value as Locale;
          document.cookie = `locale=${l}; path=/; max-age=31536000; samesite=lax`;
          router.push(`/${l}${rest ? `/${rest}` : ""}`);
        }}
        className="rounded-xl border border-slate-300 bg-white px-2 py-1.5 font-medium"
      >
        {locales.map((l) => (
          <option key={l} value={l} lang={l}>
            {l === "en" ? "English" : `${LANGUAGE_NAMES[l].native} · ${LANGUAGE_NAMES[l].en}`}
          </option>
        ))}
      </select>
    </label>
  );
}
