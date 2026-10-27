import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Field, ProfileView } from "@/components/ProfileView";
import { placeName } from "@/components/ResultCard";
import { MissingValue } from "@/components/Trust";
import { repository } from "@/lib/data/repository";
import { getDictionary, type Locale } from "@/lib/i18n";
import { conditionBySlug, languageName, specialtyName } from "@/lib/taxonomy";

export async function generateMetadata({ params }: { params: { lang: Locale; id: string } }): Promise<Metadata> {
  const p = await repository.provider(params.id);
  return p ? { title: p.name, robots: p.isDemo || p.isCandidate ? { index: false } : undefined } : {};
}

export default async function NeurologistPage({ params }: { params: { lang: Locale; id: string } }) {
  const lang = params.lang;
  const t = getDictionary(lang);
  const p = await repository.provider(params.id);
  if (!p) notFound();
  const facilities = await repository.facilitiesByIds(p.facilityIds);
  const verifiedQuals = p.qualifications.filter((q) => q.verified);
  const registration = verifiedQuals.find((q) => q.registrationNumber);

  return (
    <ProfileView t={t} lang={lang} id={p.id} name={p.name} kindLabel={p.isCandidate ? specialtyName(p.specialty, lang) : t.profile.neurologist} place={placeName(lang, p.stateCode, p.citySlug)} provenance={p} names={Object.fromEntries(facilities.map((f) => [f.id, f.name]))}>
      {p.designation && <Field label={t.pilot.designation}>{p.designation}</Field>}
      {p.titles && <Field label={t.pilot.titlesListed}><span>{p.titles}</span> <span className="text-xs italic text-ink-muted">({t.common.notVerified})</span></Field>}
      {p.isCandidate && (
        <Field label={t.pilot.operator}>
          {p.thrombectomyOperator ? <span>{p.thrombectomyOperator === "verified" ? t.pilot.status.verified : t.pilot.operatorClaim}</span> : <span className="italic text-ink-muted">{t.pilot.operatorUnknown}</span>}
        </Field>
      )}
      <Field label={t.profile.qualifications}>
        <MissingValue value={verifiedQuals} t={t}>{verifiedQuals.map((q) => q.degree).join(", ")}</MissingValue>
      </Field>
      <Field label={t.profile.registration}>
        <MissingValue value={registration} t={t}>{registration?.registrationCouncil} {registration?.registrationNumber}</MissingValue>
      </Field>
      <Field label={t.profile.focusAreas}>
        <MissingValue value={p.conditions} t={t}>
          {p.conditions.map((c, i) => (
            <span key={c}>{i > 0 && ", "}<Link href={`/${lang}/conditions/${c}`} className="text-go-700 underline">{conditionBySlug(c)?.name[lang] ?? c}</Link></span>
          ))}
        </MissingValue>
      </Field>
      <Field label={t.profile.affiliations}>
        <MissingValue value={facilities} t={t}>
          {facilities.map((f, i) => (
            <span key={f.id}>{i > 0 && ", "}<Link href={`/${lang}/hospitals/${f.id}`} className="text-go-700 underline">{f.name}</Link></span>
          ))}
        </MissingValue>
      </Field>
      <Field label={t.profile.languages}><MissingValue value={p.languages} t={t}>{p.languages.map(languageName).join(", ")}</MissingValue></Field>
      <Field label={t.profile.teleconsult}><MissingValue value={p.teleconsult} t={t}>{p.teleconsult ? t.profile.yes : t.profile.no}</MissingValue></Field>
      <Field label={t.profile.phone}><MissingValue value={p.phone} t={t}><a href={`tel:${p.phone}`} className="text-go-700 underline">{p.phone}</a></MissingValue></Field>
      <Field label={t.profile.website}><MissingValue value={p.website} t={t}><a href={p.website ?? ""} rel="noopener noreferrer" className="text-go-700 underline">{p.website}</a></MissingValue></Field>
    </ProfileView>
  );
}
