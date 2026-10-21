import "../globals.css";
import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Sans_Devanagari } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { EmergencyBar } from "@/components/EmergencyBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getDictionary, isLocale, locales } from "@/lib/i18n";
import { site } from "@/lib/site";

const latin = Noto_Sans({ subsets: ["latin"], variable: "--font-latin", display: "swap" });
const deva = Noto_Sans_Devanagari({ subsets: ["devanagari"], weight: ["400", "600", "700", "800"], variable: "--font-deva", display: "swap" });

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
    alternates: { languages: { en: "/en", hi: "/hi" } },
    openGraph: { siteName: site.name[params.lang], locale: params.lang === "hi" ? "hi_IN" : "en_IN", type: "website" },
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f97316" };

export default function LangLayout({ children, params }: { children: ReactNode; params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang;
  const t = getDictionary(lang);

  return (
    <html lang={lang} className={`${latin.variable} ${deva.variable}`} style={{ ["--font-sans" as string]: "var(--font-latin), var(--font-deva)" }}>
      <body className="font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-2">
          Skip to content
        </a>
        <EmergencyBar t={t} lang={lang} />
        <SiteHeader t={t} lang={lang} />
        <main id="main">{children}</main>
        <SiteFooter t={t} lang={lang} />
      </body>
    </html>
  );
}
