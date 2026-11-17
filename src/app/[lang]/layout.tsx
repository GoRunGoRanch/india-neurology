import "../globals.css";
import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Sans_Bengali, Noto_Sans_Devanagari, Noto_Sans_Kannada, Noto_Sans_Tamil, Noto_Sans_Telugu } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { BilingualCaptions } from "@/components/BilingualCaptions";
import { EmergencyBar } from "@/components/EmergencyBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SCRIPT_PATTERN, getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import { toEnglish } from "@/lib/i18n/bilingual";
import { site } from "@/lib/site";

const latin = Noto_Sans({ subsets: ["latin"], variable: "--font-latin", display: "swap" });
const deva = Noto_Sans_Devanagari({ subsets: ["devanagari"], weight: ["400", "600", "700", "800"], variable: "--font-deva", display: "swap", preload: false });
const beng = Noto_Sans_Bengali({ subsets: ["bengali"], weight: ["400", "600", "700", "800"], variable: "--font-beng", display: "swap", preload: false });
const taml = Noto_Sans_Tamil({ subsets: ["tamil"], weight: ["400", "600", "700", "800"], variable: "--font-taml", display: "swap", preload: false });
const telu = Noto_Sans_Telugu({ subsets: ["telugu"], weight: ["400", "600", "700", "800"], variable: "--font-telu", display: "swap", preload: false });
const knda = Noto_Sans_Kannada({ subsets: ["kannada"], weight: ["400", "600", "700", "800"], variable: "--font-knda", display: "swap", preload: false });

/** The script font each language needs, after the Latin font used for English captions. */
const SCRIPT_FONT: Record<Locale, { className: string; stack: string }> = {
  en: { className: deva.variable, stack: "var(--font-latin), var(--font-deva)" },
  hi: { className: deva.variable, stack: "var(--font-latin), var(--font-deva)" },
  mr: { className: deva.variable, stack: "var(--font-latin), var(--font-deva)" },
  bn: { className: beng.variable, stack: "var(--font-latin), var(--font-beng)" },
  ta: { className: taml.variable, stack: "var(--font-latin), var(--font-taml)" },
  te: { className: telu.variable, stack: "var(--font-latin), var(--font-telu)" },
  kn: { className: knda.variable, stack: "var(--font-latin), var(--font-knda)" },
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  if (!isLocale(params.lang)) return {};
  const t = getDictionary(params.lang);
  return {
    metadataBase: new URL(site.url),
    title: { default: site.name[params.lang], template: `%s · ${site.name[params.lang]}` },
    description: t.meta.description,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])) },
    openGraph: { siteName: site.name[params.lang], locale: `${params.lang}_IN`, type: "website" },
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f97316" };

export default function LangLayout({ children, params }: { children: ReactNode; params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang;
  const t = getDictionary(lang);

  return (
    <html lang={lang} className={`${latin.variable} ${SCRIPT_FONT[lang].className}`} style={{ ["--font-sans" as string]: SCRIPT_FONT[lang].stack }}>
      <body className="font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-2">
          Skip to content
        </a>
        <EmergencyBar t={t} lang={lang} />
        <SiteHeader t={t} lang={lang} />
        <main id="main">{children}</main>
        <SiteFooter t={t} lang={lang} />
        {lang !== "en" && <BilingualCaptions pairs={toEnglish(lang)} script={SCRIPT_PATTERN[lang]} />}
      </body>
    </html>
  );
}
