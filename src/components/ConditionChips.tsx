import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { CONDITIONS } from "@/lib/taxonomy";

const TONES = ["bg-kneetie-50 text-kneetie-700 border-kneetie-100", "bg-go-50 text-go-700 border-go-100", "bg-run-50 text-run-700 border-run-100", "bg-alert-50 text-alert-700 border-alert-100"];

export function ConditionChips({ lang }: { lang: Locale }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {CONDITIONS.map((c, i) => (
        <li key={c.slug}>
          <Link href={`/${lang}/conditions/${c.slug}`} className={`inline-flex min-h-[40px] items-center rounded-full border px-4 text-sm font-medium hover:shadow-sm ${TONES[i % TONES.length]}`}>
            {c.name[lang]}
          </Link>
        </li>
      ))}
    </ul>
  );
}
