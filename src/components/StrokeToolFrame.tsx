"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { site } from "@/lib/site";
import { Icon } from "./Icon";

// StrokeGuide loads only after the visitor confirms they are a clinician.
export function StrokeToolFrame({ t }: { t: Dictionary }) {
  const [confirmed, setConfirmed] = useState(false);
  const s = t.strokeTool;

  if (!confirmed) {
    return (
      <div className="card space-y-4 border-go-100">
        <h2 className="text-xl">{s.gateTitle}</h2>
        <p className="text-ink-soft">{s.gateBody}</p>
        <p className="flex gap-2 rounded-xl bg-alert-50 p-3 text-sm font-medium text-alert-700">
          <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
          {s.patientNote}
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setConfirmed(true)} className="btn-primary">{s.confirm}</button>
          <a href={`tel:${site.emergency.national}`} className="btn-alert"><Icon name="phone" className="h-4 w-4" />{t.emergencyBar.call}</a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <iframe
        src={site.strokeToolUrl}
        title={s.frameTitle}
        className="h-[80vh] min-h-[600px] w-full rounded-2xl border border-slate-200 bg-white"
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      />
      <a href={site.strokeToolUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-go-700 hover:underline">
        {s.openFull} <Icon name="external" className="h-4 w-4" />
      </a>
    </div>
  );
}
