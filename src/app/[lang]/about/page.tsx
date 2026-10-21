import type { Metadata } from "next";
import { getDictionary, type Locale } from "@/lib/i18n";

export function generateMetadata({ params }: { params: { lang: Locale } }): Metadata {
  return { title: getDictionary(params.lang).about.title };
}

export default function AboutPage({ params }: { params: { lang: Locale } }) {
  const t = getDictionary(params.lang);
  const a = t.about;
  const blocks = [
    { id: "editorial", title: a.editorialTitle, body: a.editorial },
    { id: "verification", title: a.verificationTitle, body: a.verification },
    { id: "independence", title: a.moneyTitle, body: a.money },
    { id: "privacy", title: a.privacyTitle, body: a.privacy },
  ];
  return (
    <div className="container-page section max-w-3xl space-y-6">
      <h1 className="text-3xl sm:text-4xl">{a.title}</h1>
      <p className="text-lg text-ink-soft">{a.mission}</p>
      {blocks.map((b) => (
        <section key={b.id} id={b.id} className="card scroll-mt-28">
          <h2 className="text-xl">{b.title}</h2>
          <p className="mt-2 text-ink-soft">{b.body}</p>
        </section>
      ))}
      <p className="text-sm text-ink-muted">{a.educationBy} {t.common.notMedicalAdvice}</p>
    </div>
  );
}
