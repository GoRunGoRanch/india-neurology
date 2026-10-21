import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { Icon } from "./Icon";

// Site-wide, above the header, so emergency help is always one tap away.
export function EmergencyBar({ t, lang }: { t: Dictionary; lang: Locale }) {
  return (
    <div className="bg-alert-600 text-white">
      <div className="container-page flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2 text-sm">
        <p className="flex items-center gap-2 font-medium">
          <Icon name="alert" className="h-4 w-4 shrink-0" />
          {t.emergencyBar.text}
        </p>
        <div className="flex items-center gap-3">
          <a href={`tel:${site.emergency.national}`} className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-white px-3 font-bold text-alert-700">
            <Icon name="phone" className="h-4 w-4" />
            {t.emergencyBar.call}
          </a>
          <Link href={`/${lang}/emergency`} className="underline underline-offset-2">
            {t.emergencyBar.whatToDo}
          </Link>
        </div>
      </div>
    </div>
  );
}
