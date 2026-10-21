import type { Metadata } from "next";
import { ReportForm } from "@/components/ReportForm";
import { getDictionary, type Locale } from "@/lib/i18n";

export function generateMetadata({ params }: { params: { lang: Locale } }): Metadata {
  return { title: getDictionary(params.lang).report.title, robots: { index: false } };
}

export default function ReportPage({ params, searchParams }: { params: { lang: Locale }; searchParams: { kind?: string; ref?: string } }) {
  const t = getDictionary(params.lang);
  return (
    <div className="container-page section max-w-2xl space-y-6">
      <h1 className="text-3xl">{t.report.title}</h1>
      <p className="text-ink-soft">{t.report.subtitle}</p>
      <ReportForm t={t} initialKind={searchParams.kind} listingRef={searchParams.ref} />
    </div>
  );
}
