"use client";

import { useState } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { CONDITIONS, STATES, findState } from "@/lib/taxonomy";
import { Icon } from "./Icon";

// Plain GET form to /find, so it still works if JavaScript fails; JS only narrows the city list.
export function LocationSearch({ t, lang }: { t: Dictionary; lang: Locale }) {
  const [state, setState] = useState("");
  const cities = findState(state)?.cities ?? [];

  return (
    <form action={`/${lang}/find`} method="get" className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
      <div>
        <label htmlFor="ls-state" className="field-label">{t.home.stateLabel}</label>
        <select id="ls-state" name="state" className="field" value={state} onChange={(e) => setState(e.target.value)}>
          <option value="">{t.home.allStates}</option>
          {STATES.map((s) => <option key={s.code} value={s.code}>{s.name[lang]}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="ls-city" className="field-label">{t.home.cityLabel}</label>
        <select id="ls-city" name="city" className="field" disabled={!state} key={state}>
          <option value="">{t.home.allCities}</option>
          {cities.map((c) => <option key={c.slug} value={c.slug}>{c.name[lang]}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="ls-condition" className="field-label">{t.home.conditionLabel}</label>
        <select id="ls-condition" name="condition" className="field" defaultValue="">
          <option value="">{t.home.allConditions}</option>
          {CONDITIONS.map((c) => <option key={c.slug} value={c.slug}>{c.name[lang]}</option>)}
        </select>
      </div>
      <button type="submit" className="btn-primary">
        <Icon name="search" className="h-4 w-4" />
        {t.home.searchCta}
      </button>
    </form>
  );
}
