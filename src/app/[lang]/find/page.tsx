import type { Metadata } from "next";
import Link from "next/link";
import { DirectoryMap, type MapPoint } from "@/components/DirectoryMap";
import { FilterPanel } from "@/components/FilterPanel";
import { Icon } from "@/components/Icon";
import { ResultCard, listingHref } from "@/components/ResultCard";
import { CandidateNotice, DemoNotice } from "@/components/Trust";
import { repository } from "@/lib/data/repository";
import { parseSearchParams } from "@/lib/data/search";
import { getDictionary, type Locale } from "@/lib/i18n";

type Params = Record<string, string | string[] | undefined>;

export function generateMetadata({ params }: { params: { lang: Locale } }): Metadata {
  return { title: getDictionary(params.lang).find.title };
}

function withView(searchParams: Params, view: "list" | "map") {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) if (typeof v === "string" && v && k !== "view") qs.set(k, v);
  qs.set("view", view);
  return `?${qs.toString()}`;
}

export default async function FindPage({ params, searchParams }: { params: { lang: Locale }; searchParams: Params }) {
  const lang = params.lang;
  const t = getDictionary(lang);
  const query = parseSearchParams(searchParams);
  const view = searchParams.view === "map" ? "map" : "list";
  const results = await repository.search(query);

  const points: MapPoint[] = results.flatMap(({ listing: l }) =>
    l.geo ? [{ id: l.id, name: l.name, href: listingHref(lang, l), lat: l.geo.lat, lng: l.geo.lng, kind: l.kind }] : [],
  );

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl">{t.find.title}</h1>
      {repository.usingDemoData && <div className="mt-4"><DemoNotice t={t} /></div>}
        {repository.usingCandidateData && <div className="mt-4"><CandidateNotice t={t} /></div>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside><FilterPanel t={t} lang={lang} query={query} view={view} /></aside>

        <section aria-live="polite">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="font-medium">{results.length} {t.find.resultsCount}</p>
            <div role="group" aria-label={`${t.find.list} / ${t.find.map}`} className="inline-flex rounded-xl border border-slate-300 bg-white p-0.5 text-sm">
              {(["list", "map"] as const).map((v) => (
                <Link key={v} href={withView(searchParams, v)} aria-current={view === v ? "true" : undefined}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium ${view === v ? "bg-go-600 text-white" : "text-ink-soft hover:bg-slate-100"}`}>
                  <Icon name={v} className="h-4 w-4" />{t.find[v]}
                </Link>
              ))}
            </div>
          </div>

          {results.length === 0 ? (
            <div className="card text-center">
              <p className="font-medium">{t.find.noResults}</p>
              <p className="mt-1 text-sm text-ink-muted">{t.find.noResultsHint}</p>
            </div>
          ) : view === "map" ? (
            <div className="space-y-2">
              <DirectoryMap points={points} label={t.find.map} />
              <p className="text-xs text-ink-muted">{t.find.mapNote}</p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {results.map((r) => <ResultCard key={r.listing.id} result={r} t={t} lang={lang} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
