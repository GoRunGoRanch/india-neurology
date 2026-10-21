import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { getDictionary, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";

export function generateMetadata({ params }: { params: { lang: Locale } }): Metadata {
  return { title: getDictionary(params.lang).emergency.title };
}

export default function EmergencyPage({ params }: { params: { lang: Locale } }) {
  const lang = params.lang;
  const t = getDictionary(lang);
  const e = t.emergency;

  return (
    <div className="container-page section max-w-3xl space-y-8">
      <h1 className="text-3xl sm:text-4xl">{e.title}</h1>

      <section aria-labelledby="call" className="rounded-3xl bg-alert-600 p-6 text-white sm:p-8">
        <h2 id="call" className="text-2xl sm:text-3xl">{e.callTitle}</h2>
        <p className="mt-2 text-white/90">{e.callBody}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a href={`tel:${site.emergency.national}`} className="btn min-h-[56px] bg-white text-lg text-alert-700 hover:bg-alert-50">
            <Icon name="phone" /> {e.call112}
          </a>
          <a href={`tel:${site.emergency.ambulanceCommon}`} className="btn min-h-[56px] border border-white/60 text-white hover:bg-white/10">
            <Icon name="phone" /> {e.call108}
          </a>
        </div>
      </section>

      <section aria-labelledby="do" className="card">
        <h2 id="do" className="text-xl">{e.doTitle}</h2>
        <ul className="mt-3 space-y-2">
          {e.do.map((d) => (
            <li key={d} className="flex gap-2"><Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-run-600" />{d}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="dont" className="card border-alert-100">
        <h2 id="dont" className="text-xl">{e.dontTitle}</h2>
        <ul className="mt-3 space-y-2">
          {e.dont.map((d) => (
            <li key={d} className="flex gap-2"><Icon name="alert" className="mt-0.5 h-5 w-5 shrink-0 text-alert-600" />{d}</li>
          ))}
        </ul>
      </section>

      <p className="rounded-2xl bg-slate-100 p-4 text-sm font-medium text-ink-soft">{e.notDispatch}</p>
      <Link href={`/${lang}/stroke`} className="btn-primary">{e.learnFast} →</Link>
    </div>
  );
}
