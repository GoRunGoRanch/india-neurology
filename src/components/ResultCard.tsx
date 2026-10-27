import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { SearchResult } from "@/lib/data/types";
import { facilityTypeName, findCity, findState, serviceName, specialtyName } from "@/lib/taxonomy";
import { Icon } from "./Icon";
import { CandidateBadge, DemoBadge, MissingValue, ReviewedDate, VerificationBadge } from "./Trust";

export function listingHref(lang: Locale, r: SearchResult["listing"]) {
  return `/${lang}/${r.kind === "hospital" ? "hospitals" : "neurologists"}/${r.id}`;
}

export function placeName(lang: Locale, stateCode: string, citySlug: string) {
  const city = findCity(stateCode, citySlug)?.name[lang] ?? citySlug;
  const state = findState(stateCode)?.name[lang] ?? stateCode;
  return `${city}, ${state}`;
}

export function ResultCard({ result, t, lang }: { result: SearchResult; t: Dictionary; lang: Locale }) {
  const l = result.listing;
  const services = l.kind === "hospital" ? l.services.map((s) => s.code) : l.teleconsult ? ["telemedicine"] : [];
  const subtitle =
    l.kind === "hospital"
      ? [facilityTypeName(l.type, lang), l.chain].filter(Boolean).join(" · ")
      : l.isCandidate
        ? [specialtyName(l.specialty, lang), l.designation].filter(Boolean).join(" · ")
        : t.profile.neurologist;

  return (
    <article className="card flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-lg">
            <Link href={listingHref(lang, l)} className="hover:text-go-700 hover:underline">{l.name}</Link>
          </h3>
          <p className="text-sm text-ink-muted">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {l.isDemo && <DemoBadge t={t} />}
          {l.isCandidate && <CandidateBadge t={t} />}
          <VerificationBadge status={l.verificationStatus} t={t} />
        </div>
      </div>
      <p className="flex items-center gap-1.5 text-sm text-ink-soft">
        <Icon name="pin" className="h-4 w-4 shrink-0 text-kneetie-500" />
        {placeName(lang, l.stateCode, l.citySlug)}
        {result.distanceKm !== null && <span className="text-ink-muted">· {result.distanceKm} {t.common.kmAway}</span>}
      </p>
      <div className="text-sm">
        <span className="font-medium">{t.find.services}: </span>
        <MissingValue value={services} t={t}>{services.map((s) => serviceName(s, lang)).join(", ")}</MissingValue>
      </div>
      <div className="text-sm">
        <span className="font-medium">{t.find.contact}: </span>
        <MissingValue value={l.phone} t={t}>
          <a href={`tel:${l.phone}`} className="text-go-700 underline">{l.phone}</a>
        </MissingValue>
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <ReviewedDate iso={l.lastVerifiedAt} lang={lang} t={t} />
        <Link href={listingHref(lang, l)} className="text-sm font-semibold text-go-700 hover:underline">{t.common.viewProfile} →</Link>
      </div>
    </article>
  );
}
