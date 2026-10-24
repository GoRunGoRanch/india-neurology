import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { Icon } from "./Icon";

// Entry point to the clinician-only StrokeGuide page, shown on Stroke, Care and For Providers.
export function StrokeToolCard({ t, lang }: { t: Dictionary; lang: Locale }) {
  return (
    <Link href={`/${lang}/stroke-tool`} className="group flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-go-500 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ink text-white"><Icon name="brain" className="h-6 w-6" /></span>
        <span>
          <span className="block text-xs font-semibold uppercase tracking-wide text-go-700">{t.strokeTool.eyebrow}</span>
          <span className="mt-0.5 block text-lg font-bold">{t.strokeTool.cardTitle}</span>
          <span className="mt-1 block text-sm text-ink-soft">{t.strokeTool.cardBody}</span>
        </span>
      </div>
      <span className="btn-secondary shrink-0 group-hover:bg-go-50">{t.strokeTool.cardCta} →</span>
    </Link>
  );
}
