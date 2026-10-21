import type { Dictionary } from "@/lib/i18n";

// The four KneeTie… Go Run Go cards from reference screenshot 1.
const TONES = [
  { card: "border-kneetie-100 bg-kneetie-50", num: "bg-kneetie-500", word: "text-kneetie-600" },
  { card: "border-go-100 bg-go-50", num: "bg-go-500", word: "text-go-600" },
  { card: "border-run-100 bg-run-50", num: "bg-run-500", word: "text-run-600" },
  { card: "border-alert-100 bg-alert-50", num: "bg-alert-500", word: "text-alert-600" },
];

export function FastSteps({ t }: { t: Dictionary }) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {t.stroke.steps.map((s, i) => (
        <li key={s.word} className={`relative rounded-2xl border p-5 pt-7 ${TONES[i].card}`}>
          <span className={`absolute -top-3 left-4 grid h-7 w-7 place-items-center rounded-lg text-sm font-bold text-white ${TONES[i].num}`}>{i + 1}</span>
          <p className={`text-2xl font-extrabold ${TONES[i].word}`}>{s.word}</p>
          <p className="mt-1 font-semibold">{s.label}</p>
          <p className="mt-2 text-sm text-ink-soft">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}
