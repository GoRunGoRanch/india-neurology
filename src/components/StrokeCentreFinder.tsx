"use client";

import Link from "next/link";
import { useState } from "react";
import type { ClaimStatus } from "@/lib/data/pilot/types";
import { haversineKm } from "@/lib/data/search";
import type { Dictionary, Locale } from "@/lib/i18n";
import { Icon } from "./Icon";

export interface Centre {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  pin: { lat: number; lng: number; verified: boolean } | null;
  /** Review status of the hospital-level claims; null = no evidence (unknown). */
  thrombolysis: ClaimStatus | null;
  thrombectomy: ClaimStatus | null;
  team24x7: boolean;
}

type Located = { state: "idle" | "locating" | "denied" } | { state: "ok"; lat: number; lng: number };

function navigateHref(c: Centre) {
  // Unconfirmed pins are not used for navigation; Google resolves the name and address instead.
  const destination = c.pin?.verified ? `${c.pin.lat},${c.pin.lng}` : [c.name, c.address].filter(Boolean).join(", ");
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

function CentreCard({ c, status, t, lang, km }: { c: Centre; status: ClaimStatus; t: Dictionary; lang: Locale; km: number | null }) {
  const verified = status === "verified";
  return (
    <li className="card flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-lg">{c.name}</h3>
          {c.address && <p className="text-sm text-ink-soft">{c.address}</p>}
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${verified ? "bg-run-100 text-run-700" : "bg-slate-100 text-ink-soft"}`}>
          {verified ? t.finder.verified : t.finder.unverified}
        </span>
      </div>
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
        {km !== null && <span className="font-semibold text-ink">{km.toFixed(1)} {t.finder.kmAway}</span>}
        {!c.pin && <span>{t.finder.noPin}</span>}
        {c.pin && !c.pin.verified && <span>{t.finder.pinUnverified}</span>}
        {c.team24x7 && <span>{t.finder.team24x7}</span>}
      </p>
      <div className="flex flex-wrap gap-2">
        <a href={navigateHref(c)} target="_blank" rel="noopener noreferrer" className="btn-primary">
          <Icon name="pin" className="h-4 w-4" /> {t.finder.navigate}
        </a>
        {c.phone ? (
          <a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`} className="btn-secondary">
            <Icon name="phone" className="h-4 w-4" /> {t.finder.callAhead}
          </a>
        ) : (
          <span className="self-center text-sm italic text-ink-muted">{t.finder.noPhone}</span>
        )}
        <Link href={`/${lang}/hospitals/${c.id}`} className="self-center text-sm font-semibold text-go-700 hover:underline">{t.finder.profile} →</Link>
      </div>
    </li>
  );
}

export function StrokeCentreFinder({ centres, t, lang }: { centres: Centre[]; t: Dictionary; lang: Locale }) {
  const [loc, setLoc] = useState<Located>({ state: "idle" });

  function locate() {
    if (!navigator.geolocation) return setLoc({ state: "denied" });
    setLoc({ state: "locating" });
    // Used only in this browser tab to sort the list; never sent anywhere.
    navigator.geolocation.getCurrentPosition(
      (p) => setLoc({ state: "ok", lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setLoc({ state: "denied" }),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
    );
  }

  const distance = (c: Centre) => (loc.state === "ok" && c.pin ? haversineKm(loc, c.pin) : null);
  const sorted = (list: Centre[]) =>
    [...list].sort((a, b) => {
      const da = distance(a), db = distance(b);
      if (da !== null && db !== null) return da - db;
      if (da !== null) return -1;
      if (db !== null) return 1;
      return a.name.localeCompare(b.name);
    });
  // Verified centres first, then unverified; disputed claims never appear.
  const section = (key: "thrombectomy" | "thrombolysis") => {
    const list = centres.filter((c) => c[key] && c[key] !== "disputed");
    return [...sorted(list.filter((c) => c[key] === "verified")), ...sorted(list.filter((c) => c[key] !== "verified"))];
  };

  const sections = [
    { key: "thrombectomy" as const, title: t.finder.evtTitle, body: t.finder.evtBody },
    { key: "thrombolysis" as const, title: t.finder.ivtTitle, body: t.finder.ivtBody },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={locate} disabled={loc.state === "locating"} className="btn-secondary">
          <Icon name="pin" className="h-4 w-4" /> {loc.state === "locating" ? t.finder.locating : t.finder.useLocation}
        </button>
        <p className="text-xs text-ink-muted">{loc.state === "denied" ? t.finder.locationDenied : t.finder.locationPrivacy}</p>
      </div>

      {sections.map((s) => {
        const list = section(s.key);
        return (
          <section key={s.key} className="space-y-3">
            <div>
              <h2 className="text-2xl">{s.title}</h2>
              <p className="text-sm text-ink-soft">{s.body}</p>
            </div>
            {list.length === 0 ? (
              <p className="card text-sm text-ink-muted">{t.finder.none}</p>
            ) : (
              <ul className="grid gap-4 md:grid-cols-2">
                {list.map((c) => {
                  const d = distance(c);
                  return <CentreCard key={c.id} c={c} status={c[s.key] as ClaimStatus} t={t} lang={lang} km={d === null ? null : Math.round(d * 10) / 10} />;
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
