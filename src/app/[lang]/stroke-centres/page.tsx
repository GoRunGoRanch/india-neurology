import type { Metadata } from "next";
import { StrokeCentreFinder, type Centre } from "@/components/StrokeCentreFinder";
import { Icon } from "@/components/Icon";
import { CandidateNotice } from "@/components/Trust";
import { repository } from "@/lib/data/repository";
import type { Facility } from "@/lib/data/types";
import { getDictionary, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { findCity } from "@/lib/taxonomy";

export async function generateMetadata({ params }: { params: { lang: Locale } }): Promise<Metadata> {
  const t = getDictionary(params.lang);
  return { title: t.finder.title, description: t.finder.subtitle, robots: repository.usingCandidateData ? { index: false } : undefined };
}

function toCentre(f: Facility): Centre {
  const status = (code: string) => f.claims?.find((c) => c.field === `service:${code}`)?.status ?? null;
  return {
    id: f.id,
    stateCode: f.stateCode,
    citySlug: f.citySlug,
    name: f.name,
    address: f.address,
    phone: f.phone,
    pin: f.geo,
    thrombolysis: status("thrombolysis"),
    thrombectomy: status("thrombectomy"),
    team24x7: Boolean(status("stroke_24x7")) && status("stroke_24x7") !== "disputed",
  };
}

export default async function StrokeCentresPage({ params }: { params: { lang: Locale } }) {
  const lang = params.lang;
  const t = getDictionary(lang);
  const results = await repository.search({ type: "hospital" });
  // Demo listings are never offered as places to take a stroke patient.
  const centres = results
    .map((r) => r.listing)
    .filter((l): l is Facility => l.kind === "hospital" && !l.isDemo)
    .map(toCentre)
    .filter((c) => c.thrombolysis || c.thrombectomy);
  const cityOptions = [...new Map(centres.map((c) => [c.citySlug, { slug: c.citySlug, name: findCity(c.stateCode, c.citySlug)?.name[lang] ?? c.citySlug }])).values()]
    .sort((a, b) => a.name.localeCompare(b.name));
  const cities = cityOptions.map((c) => c.name);

  return (
    <div className="container-page section max-w-5xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl sm:text-4xl">{t.finder.title}</h1>
        <p className="text-ink-soft">{t.finder.subtitle}</p>
      </header>

      <section aria-labelledby="call-first" className="rounded-3xl bg-alert-600 p-5 text-white sm:p-6">
        <h2 id="call-first" className="flex items-center gap-2 text-xl sm:text-2xl"><Icon name="alert" className="h-6 w-6" />{t.finder.emergencyTitle}</h2>
        <p className="mt-1 text-white/90">{t.finder.emergencyBody}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href={`tel:${site.emergency.ambulanceCommon}`} className="btn bg-white text-alert-700 hover:bg-alert-50"><Icon name="phone" className="h-4 w-4" /> {t.finder.call108}</a>
          <a href={`tel:${site.emergency.national}`} className="btn border border-white/60 text-white hover:bg-white/10"><Icon name="phone" className="h-4 w-4" /> {t.finder.call112}</a>
        </div>
      </section>

      {repository.usingCandidateData && <CandidateNotice t={t} />}
      <p className="rounded-2xl bg-go-50 p-4 text-sm text-go-700">
        {t.finder.availability} {t.finder.liveStatus}{" "}
        {cities.length > 0 && <>{t.finder.coverage} {cities.join(", ")}. </>}
        {t.finder.moreCities}
      </p>

      <StrokeCentreFinder centres={centres} cities={cityOptions} t={t} lang={lang} />
    </div>
  );
}
