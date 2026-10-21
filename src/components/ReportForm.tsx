"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";

const KINDS = ["correction", "claim_profile", "takedown", "new_listing"] as const;

export function ReportForm({ t, initialKind, listingRef }: { t: Dictionary; initialKind?: string; listingRef?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "closed" | "error">("idle");
  const r = t.report;
  const kindLabels = { correction: r.kindCorrection, claim_profile: r.kindClaim, takedown: r.kindTakedown, new_listing: r.kindNew };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/reports", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      setStatus(res.ok ? "sent" : res.status === 503 ? "closed" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") return <p role="status" className="card bg-run-50 text-run-700">{r.sent}</p>;

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div>
        <label htmlFor="r-kind" className="field-label">{r.kind}</label>
        <select id="r-kind" name="kind" className="field" defaultValue={KINDS.includes(initialKind as never) ? initialKind : "correction"}>
          {KINDS.map((k) => <option key={k} value={k}>{kindLabels[k]}</option>)}
        </select>
      </div>
      {listingRef && (
        <div>
          <label htmlFor="r-ref" className="field-label">{r.listing}</label>
          <input id="r-ref" name="listing" className="field bg-slate-50" defaultValue={listingRef} readOnly />
        </div>
      )}
      <div>
        <label htmlFor="r-name" className="field-label">{r.name}</label>
        <input id="r-name" name="name" className="field" maxLength={120} autoComplete="name" />
      </div>
      <div>
        <label htmlFor="r-contact" className="field-label">{r.contact}</label>
        <input id="r-contact" name="contact" className="field" maxLength={160} required />
      </div>
      <div>
        <label htmlFor="r-message" className="field-label">{r.message}</label>
        <textarea id="r-message" name="message" className="field min-h-[120px]" maxLength={2000} required />
      </div>
      <label className="flex gap-2 text-sm">
        <input type="checkbox" name="consent" value="yes" required className="mt-1 h-4 w-4" />
        {r.consent}
      </label>
      {status === "closed" && <p role="alert" className="rounded-xl bg-kneetie-50 p-3 text-sm text-kneetie-700">{r.notOpen}</p>}
      {status === "error" && <p role="alert" className="rounded-xl bg-alert-50 p-3 text-sm text-alert-700">{r.error}</p>}
      <button type="submit" className="btn-primary" disabled={status === "sending"}>{r.submit}</button>
    </form>
  );
}
