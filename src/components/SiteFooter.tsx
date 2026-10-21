import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { Logo, navItems } from "./SiteHeader";

export function SiteFooter({ t, lang }: { t: Dictionary; lang: Locale }) {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3 lg:col-span-2">
          <Logo lang={lang} />
          <p className="max-w-md text-sm text-ink-muted">{t.footer.tagline}</p>
          <p className="max-w-md rounded-xl bg-alert-50 p-3 text-xs text-alert-700">{t.emergency.notDispatch}</p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">{t.footer.explore}</h2>
          <ul className="space-y-2 text-sm text-ink-soft">
            {navItems(t, lang).map((i) => (
              <li key={i.href}><Link href={i.href} className="hover:text-ink">{i.label}</Link></li>
            ))}
            <li><Link href={`/${lang}/emergency`} className="hover:text-ink">{t.emergency.title}</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">{t.footer.trust}</h2>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li><Link href={`/${lang}/about#editorial`} className="hover:text-ink">{t.footer.editorialPolicy}</Link></li>
            <li><Link href={`/${lang}/about#verification`} className="hover:text-ink">{t.footer.verificationPolicy}</Link></li>
            <li><Link href={`/${lang}/about`} className="hover:text-ink">{t.nav.about}</Link></li>
            <li><Link href={`/${lang}/report`} className="hover:text-ink">{t.common.reportError}</Link></li>
            <li><a href={site.youtubeChannelUrl} className="hover:text-ink" target="_blank" rel="noopener noreferrer">{t.footer.youtube}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200">
        <p className="container-page py-4 text-xs text-ink-muted">{t.common.notMedicalAdvice} · {t.footer.rights}</p>
      </div>
    </footer>
  );
}
