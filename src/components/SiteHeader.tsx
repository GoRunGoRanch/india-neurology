import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { Icon } from "./Icon";
import { LanguageToggle } from "./LanguageToggle";

export function navItems(t: Dictionary, lang: Locale) {
  return [
    { href: `/${lang}/find?type=neurologist`, label: t.nav.findNeurologist },
    { href: `/${lang}/find?type=hospital`, label: t.nav.findHospital },
    { href: `/${lang}/conditions`, label: t.nav.conditions },
    { href: `/${lang}/stroke`, label: t.nav.strokeFast },
    { href: `/${lang}/learn`, label: t.nav.learn },
    { href: `/${lang}/for-providers`, label: t.nav.forProviders },
  ];
}

export function Logo({ lang }: { lang: Locale }) {
  return (
    <Link href={`/${lang}`} className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-kneetie-500 to-alert-500 text-white">
        <Icon name="brain" className="h-5 w-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold text-ink sm:text-base">{site.name[lang]}</span>
        <span className="block text-[11px] font-medium text-kneetie-600">with {site.educationPartner}</span>
      </span>
    </Link>
  );
}

export function SiteHeader({ t, lang }: { t: Dictionary; lang: Locale }) {
  const items = navItems(t, lang);
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-page flex items-center justify-between gap-4 py-3">
        <Logo lang={lang} />
        <nav aria-label="Main" className="hidden items-center gap-1 xl:flex">
          {items.map((i) => (
            <Link key={i.href} href={i.href} className="whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium text-ink-soft hover:bg-slate-100 hover:text-ink">
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="hidden xl:block">
          <LanguageToggle lang={lang} label={t.nav.language} />
        </div>
        {/* Mobile menu: <details> works without JavaScript. */}
        <details className="group relative xl:hidden">
          <summary className="flex min-h-[44px] min-w-[44px] cursor-pointer list-none items-center justify-center rounded-xl border border-slate-300" aria-label={t.nav.menu}>
            <Icon name="menu" />
          </summary>
          <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
            <nav aria-label="Mobile" className="flex flex-col">
              {items.map((i) => (
                <Link key={i.href} href={i.href} className="rounded-lg px-3 py-3 text-base font-medium hover:bg-slate-100">
                  {i.label}
                </Link>
              ))}
              <Link href={`/${lang}/care`} className="rounded-lg px-3 py-3 text-base font-medium hover:bg-slate-100">
                {t.nav.care}
              </Link>
              <Link href={`/${lang}/emergency`} className="mt-1 rounded-lg bg-alert-50 px-3 py-3 font-semibold text-alert-700">
                {t.emergencyBar.whatToDo} — 112
              </Link>
            </nav>
            <div className="mt-3 border-t border-slate-200 pt-3">
              <LanguageToggle lang={lang} label={t.nav.language} />
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
