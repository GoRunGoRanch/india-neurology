import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Field, ProfileView } from "@/components/ProfileView";
import { placeName } from "@/components/ResultCard";
import { MissingValue } from "@/components/Trust";
import { repository } from "@/lib/data/repository";
import { getDictionary, type Locale } from "@/lib/i18n";
import { conditionBySlug, facilityTypeName, languageName, serviceName } from "@/lib/taxonomy";

export async function generateMetadata({ params }: { params: { lang: Locale; id: string } }): Promise<Metadata> {
  const f = await repository.facility(params.id);
  return f ? { title: f.name, robots: f.isDemo || f.isCandidate ? { index: false } : undefined } : {};
}

export default async function HospitalPage({ params }: { params: { lang: Locale; id: string } }) {
  const lang = params.lang;
  const t = getDictionary(lang);
  const f = await repository.facility(params.id);
  if (!f) notFound();
  const clinicians = await repository.providersAtFacility(f.id);
  const access = Object.entries(f.accessibility).filter(([, v]) => v).map(([k]) => k);

  return (
    <ProfileView t={t} lang={lang} id={f.id} name={f.name} kindLabel={facilityTypeName(f.type, lang)} place={placeName(lang, f.stateCode, f.citySlug)} provenance={f}>
      {f.chain && <Field label={t.pilot.chain}>{f.chain}</Field>}
      <Field label={t.profile.services}>
        <MissingValue value={f.services} t={t}>
          <ul className="space-y-1">
            {f.services.map((s) => (
              <li key={s.code} className="flex flex-wrap items-center gap-2">
                {serviceName(s.code, lang)}
                {!s.verified && <span className="text-xs italic text-ink-muted">({t.common.notVerified})</span>}
              </li>
            ))}
          </ul>
        </MissingValue>
      </Field>
      <Field label={t.profile.focusAreas}>
        <MissingValue value={f.conditions} t={t}>
          {f.conditions.map((c, i) => (
            <span key={c}>{i > 0 && ", "}<Link href={`/${lang}/conditions/${c}`} className="text-go-700 underline">{conditionBySlug(c)?.name[lang] ?? c}</Link></span>
          ))}
        </MissingValue>
      </Field>
      <Field label={t.profile.cliniciansHere}>
        <MissingValue value={clinicians} t={t}>
          {clinicians.map((p, i) => (
            <span key={p.id}>{i > 0 && ", "}<Link href={`/${lang}/neurologists/${p.id}`} className="text-go-700 underline">{p.name}</Link></span>
          ))}
        </MissingValue>
      </Field>
      <Field label={t.profile.address}><MissingValue value={f.address} t={t} /></Field>
      <Field label={t.profile.phone}><MissingValue value={f.phone} t={t}><a href={`tel:${f.phone}`} className="text-go-700 underline">{f.phone}</a></MissingValue></Field>
      <Field label={t.profile.website}><MissingValue value={f.website} t={t}><a href={f.website ?? ""} rel="noopener noreferrer" className="text-go-700 underline">{f.website}</a></MissingValue></Field>
      <Field label={t.profile.languages}><MissingValue value={f.languages} t={t}>{f.languages.map(languageName).join(", ")}</MissingValue></Field>
      <Field label={t.profile.accessibility}><MissingValue value={access} t={t}>{access.join(", ")}</MissingValue></Field>
    </ProfileView>
  );
}
