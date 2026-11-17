import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HospitalVerifyForm } from "@/components/HospitalVerifyForm";
import { repository } from "@/lib/data/repository";
import { getDictionary, type Locale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: { lang: Locale; id: string } }): Promise<Metadata> {
  const f = await repository.facility(params.id);
  return f ? { title: `${getDictionary(params.lang).verify.title} · ${f.name}`, robots: { index: false } } : {};
}

export default async function VerifyHospitalPage({ params }: { params: { lang: Locale; id: string } }) {
  const lang = params.lang;
  const t = getDictionary(lang);
  const f = await repository.facility(params.id);
  if (!f || f.isDemo) notFound();

  return (
    <div className="container-page section max-w-3xl space-y-6">
      <header className="space-y-2">
        <Link href={`/${lang}/hospitals/${f.id}`} className="text-sm font-semibold text-go-700 hover:underline">← {f.name}</Link>
        <h1 className="text-3xl sm:text-4xl">{t.verify.title}</h1>
        <p className="text-lg font-semibold text-ink">{f.name}</p>
        {f.address && <p className="text-sm text-ink-soft">{f.address}</p>}
        <p className="text-ink-soft">{t.verify.intro}</p>
        <p className="rounded-2xl bg-go-50 p-4 text-sm text-go-700">{t.verify.howReviewed}</p>
      </header>
      <HospitalVerifyForm hospitalId={f.id} t={t} />
    </div>
  );
}
