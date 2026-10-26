import type { Dictionary } from "@/lib/i18n";
import { site } from "@/lib/site";
import { Icon } from "./Icon";

const STEPS = [
  { word: "KneeTie", tone: "bg-kneetie-500" },
  { word: "Go", tone: "bg-go-500" },
  { word: "Run", tone: "bg-run-500" },
  { word: "Go!", tone: "bg-alert-500" },
];

// Promotes the KneeTie.in family stroke app. While site.strokeApp.live is false the card shows
// "Coming soon" and no link, so visitors never land on a broken page.
export function StrokeAppCard({ t }: { t: Dictionary }) {
  const a = t.strokeApp;
  const { url, live } = site.strokeApp;

  return (
    <div className="grid gap-6 overflow-hidden rounded-3xl border border-kneetie-200 bg-gradient-to-br from-kneetie-50 via-white to-run-50 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow">{a.eyebrow}</span>
          <span className="rounded-full bg-run-100 px-2.5 py-0.5 text-xs font-bold text-run-700">{a.beta}</span>
        </div>
        <h2 className="mt-3 text-2xl sm:text-3xl">{a.title}</h2>
        <p className="mt-2 max-w-2xl text-ink-soft">{a.body}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {live ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary">
              {a.cta} <Icon name="external" className="h-4 w-4" />
            </a>
          ) : (
            <span className="inline-flex min-h-[44px] items-center rounded-xl border border-dashed border-kneetie-500 px-5 text-sm font-semibold text-kneetie-700">
              {a.soon}
            </span>
          )}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-alert-700">
          <Icon name="alert" className="h-3.5 w-3.5 shrink-0" />{a.emergencyNote}
        </p>
      </div>
      <ol aria-hidden="true" className="flex gap-2 md:flex-col">
        {STEPS.map((s) => (
          <li key={s.word} className={`rounded-xl px-4 py-2 text-center text-sm font-extrabold text-white ${s.tone}`}>{s.word}</li>
        ))}
      </ol>
    </div>
  );
}
