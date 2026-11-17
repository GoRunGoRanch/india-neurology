"use client";

import Link from "next/link";
import { useState } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { Icon } from "./Icon";

type Mode = "kneetie" | "fast";
const TONES = ["bg-kneetie-500", "bg-go-500", "bg-run-500", "bg-alert-500"];

/**
 * Step-by-step KneeTie GoRunGo or FAST check. Any "yes" stops the test immediately and shows the
 * emergency screen; nothing is stored or sent anywhere.
 */
export function StrokeTest({ t, lang }: { t: Dictionary; lang: Locale }) {
  const s = t.strokeTest;
  const [mode, setMode] = useState<Mode | null>(null);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<"alert" | "clear" | null>(null);
  const [noted, setNoted] = useState<string | null>(null);

  const steps = mode === "fast" ? s.fastSteps : s.kneetieSteps;
  const restart = () => {
    setMode(null);
    setStep(0);
    setResult(null);
    setNoted(null);
  };
  const answer = (sawSign: boolean) => {
    if (sawSign) return setResult("alert");
    if (step + 1 < steps.length) setStep(step + 1);
    else setResult("clear");
  };
  const recordTime = () =>
    setNoted(new Date().toLocaleTimeString(lang === "hi" ? "hi-IN" : "en-IN", { hour: "numeric", minute: "2-digit" }));

  if (result === "alert") {
    return (
      <div role="alert" className="space-y-4">
        <section className="rounded-3xl bg-alert-600 p-6 text-white">
          <h2 className="flex items-start gap-2 text-2xl"><Icon name="alert" className="mt-1 h-6 w-6 shrink-0" />{s.alertTitle}</h2>
          <p className="mt-2 text-white/90">{s.alertBody}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={`tel:${site.emergency.ambulanceCommon}`} className="btn bg-white text-alert-700 hover:bg-alert-50"><Icon name="phone" className="h-4 w-4" />{t.finder.call108}</a>
            <a href={`tel:${site.emergency.national}`} className="btn border border-white/60 text-white hover:bg-white/10"><Icon name="phone" className="h-4 w-4" />{t.finder.call112}</a>
          </div>
        </section>
        <section className="card space-y-2">
          <h3 className="text-lg">{s.timeTitle}</h3>
          <p className="text-sm text-ink-soft">{s.timeBody}</p>
          {noted ? (
            <p className="text-2xl font-bold text-ink">{s.recorded}: {noted}</p>
          ) : (
            <button type="button" onClick={recordTime} className="btn-secondary"><Icon name="clock" className="h-4 w-4" />{s.recordTime}</button>
          )}
        </section>
        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/${lang}/stroke-centres`} className="btn-primary"><Icon name="pin" className="h-4 w-4" />{s.findCentre}</Link>
          <button type="button" onClick={restart} className="text-sm font-semibold text-go-700 hover:underline">{s.restart}</button>
        </div>
      </div>
    );
  }

  if (result === "clear") {
    return (
      <div className="space-y-4">
        <section className="card space-y-2 border-run-200 bg-run-50">
          <h2 className="text-xl text-run-700">{s.clearTitle}</h2>
          <p className="text-ink-soft">{s.clearBody}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a href={`tel:${site.emergency.ambulanceCommon}`} className="btn-alert"><Icon name="phone" className="h-4 w-4" />{t.finder.call108}</a>
            <button type="button" onClick={restart} className="btn-secondary">{s.restart}</button>
          </div>
        </section>
      </div>
    );
  }

  if (!mode) {
    return (
      <section className="space-y-3">
        <h2 className="text-xl">{s.chooseTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {([
            ["kneetie", s.kneetie, s.kneetieBody],
            ["fast", s.fast, s.fastBody],
          ] as const).map(([m, title, body]) => (
            <button key={m} type="button" onClick={() => setMode(m)} className="card text-left transition hover:border-kneetie-500 hover:shadow-md">
              <span className="block text-xl font-bold text-ink">{title}</span>
              <span className="mt-1 block text-sm text-ink-soft">{body}</span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  const current = steps[step];
  return (
    <section className="card space-y-5" aria-live="polite">
      <div className="flex items-center justify-between text-sm text-ink-muted">
        <span>{mode === "fast" ? s.fast : s.kneetie} · {s.step} {step + 1} {s.of} {steps.length}</span>
        <button type="button" onClick={() => (step === 0 ? restart() : setStep(step - 1))} className="font-semibold text-go-700 hover:underline">{s.back}</button>
      </div>
      <div className="flex items-center gap-3">
        <span className={`grid h-14 min-w-14 place-items-center rounded-2xl px-3 text-2xl font-extrabold text-white ${TONES[step % TONES.length]}`}>{current.word}</span>
        <h2 className="text-2xl">{current.label}</h2>
      </div>
      <p className="text-lg text-ink">{current.question}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => answer(true)} className="btn-alert min-h-[56px] text-lg">{s.yes}</button>
        <button type="button" onClick={() => answer(false)} className="btn-secondary min-h-[56px] text-lg">{s.no}</button>
      </div>
    </section>
  );
}
