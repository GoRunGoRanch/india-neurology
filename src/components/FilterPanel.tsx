"use client";

import { useState } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { SearchQuery } from "@/lib/data/types";
import { CONDITIONS, FACILITY_TYPES, LANGUAGES, SERVICES, STATES, findState } from "@/lib/taxonomy";
import { Icon } from "./Icon";

interface Props {
  t: Dictionary;
  lang: Locale;
  query: SearchQuery;
  view: "list" | "map";
}

// GET form: every filter state is a shareable URL and works without JavaScript.
export function FilterPanel({ t, lang, query, view }: Props) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(query.state ?? "");
  const [type, setType] = useState(query.type ?? "all");
  const cities = findState(state)?.cities ?? [];

  return (
    <div>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="filters" className="btn-secondary w-full lg:hidden">
        <Icon name="search" className="h-4 w-4" />
        {t.find.showFilters}
      </button>
      <form id="filters" action={`/${lang}/find`} method="get" className={`${open ? "block" : "hidden"} mt-3 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 lg:mt-0 lg:block`}>
        <h2 className="text-base">{t.find.filters}</h2>
        <input type="hidden" name="view" value={view} />

        <div>
          <label htmlFor="f-type" className="field-label">{t.find.type}</label>
          <select id="f-type" name="type" className="field" value={type} onChange={(e) => setType(e.target.value as SearchQuery["type"] & string)}>
            <option value="all">{t.find.typeAll}</option>
            <option value="neurologist">{t.find.typeNeurologist}</option>
            <option value="hospital">{t.find.typeHospital}</option>
          </select>
        </div>

        <div>
          <label htmlFor="f-q" className="field-label">{t.find.nameSearch}</label>
          <input id="f-q" name="q" type="search" className="field" defaultValue={query.q ?? ""} placeholder={t.find.namePlaceholder} />
        </div>

        <div>
          <label htmlFor="f-state" className="field-label">{t.home.stateLabel}</label>
          <select id="f-state" name="state" className="field" value={state} onChange={(e) => setState(e.target.value)}>
            <option value="">{t.home.allStates}</option>
            {STATES.map((s) => <option key={s.code} value={s.code}>{s.name[lang]}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="f-city" className="field-label">{t.home.cityLabel}</label>
          <select id="f-city" name="city" className="field" disabled={!state} defaultValue={query.state === state ? query.city ?? "" : ""} key={state}>
            <option value="">{t.home.allCities}</option>
            {cities.map((c) => <option key={c.slug} value={c.slug}>{c.name[lang]}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="f-condition" className="field-label">{t.home.conditionLabel}</label>
          <select id="f-condition" name="condition" className="field" defaultValue={query.condition ?? ""}>
            <option value="">{t.home.allConditions}</option>
            {CONDITIONS.map((c) => <option key={c.slug} value={c.slug}>{c.name[lang]}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="f-service" className="field-label">{t.find.service}</label>
          <select id="f-service" name="service" className="field" defaultValue={query.service ?? ""}>
            <option value="">{t.common.any}</option>
            {SERVICES.map((s) => <option key={s.code} value={s.code}>{s.name[lang]}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="f-language" className="field-label">{t.find.language}</label>
          <select id="f-language" name="language" className="field" defaultValue={query.language ?? ""}>
            <option value="">{t.common.any}</option>
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
        </div>

        {type !== "neurologist" && (
          <div>
            <label htmlFor="f-facility" className="field-label">{t.find.facilityType}</label>
            <select id="f-facility" name="facility" className="field" defaultValue={query.facility ?? ""}>
              <option value="">{t.common.any}</option>
              {FACILITY_TYPES.map((f) => <option key={f.code} value={f.code}>{f.name[lang]}</option>)}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="f-sort" className="field-label">{t.find.sort}</label>
          <select id="f-sort" name="sort" className="field" defaultValue={query.sort === "name" ? "name" : "relevance"}>
            <option value="relevance">{t.find.sortRelevance}</option>
            <option value="name">{t.find.sortName}</option>
          </select>
          <p className="mt-1 text-xs text-ink-muted">{t.find.distanceUnavailable}</p>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1">{t.find.apply}</button>
          <a href={`/${lang}/find`} className="btn-secondary">{t.common.clear}</a>
        </div>
      </form>
    </div>
  );
}
