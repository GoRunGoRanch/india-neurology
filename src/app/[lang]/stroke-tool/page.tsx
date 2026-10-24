import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { StrokeToolFrame } from "@/components/StrokeToolFrame";
import { getDictionary, type Locale } from "@/lib/i18n";

export function generateMetadata({ params }: { params: { lang: Locale } }): Metadata {
  const t = getDictionary(params.lang);
  return { title: t.strokeTool.title, description: t.strokeTool.subtitle };
}

export default function StrokeToolPage({ params }: { params: { lang: Locale } }) {
  const t = getDictionary(params.lang);
  const s = t.strokeTool;
  return (
    <div className="container-page section max-w-5xl space-y-6">
      <header className="max-w-3xl">
        <span className="eyebrow">{s.eyebrow}</span>
        <h1 className="mt-4 text-3xl sm:text-4xl">{s.title}</h1>
        <p className="mt-2 text-ink-soft">{s.subtitle}</p>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {s.features.map((f) => (
            <li key={f} className="flex gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-run-600" />{f}</li>
          ))}
        </ul>
      </header>
      <StrokeToolFrame t={t} />
    </div>
  );
}
