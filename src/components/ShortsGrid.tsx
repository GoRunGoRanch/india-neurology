"use client";

import { useState } from "react";
import type { Short } from "@/lib/content/shorts";
import { Icon } from "./Icon";

// Thumbnail first; the YouTube player loads only when a visitor taps a Short.
function ShortTile({ short, playLabel }: { short: Short; playLabel: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <li className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[9/16] bg-ink">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${short.id}?autoplay=1&rel=0`}
            title={short.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0" aria-label={`${playLabel}: ${short.title}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://i.ytimg.com/vi/${short.id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover opacity-90 group-hover:opacity-100" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-alert-600 text-white shadow-lg group-hover:scale-105">
                <Icon name="play" className="ml-0.5 h-5 w-5" />
              </span>
            </span>
          </button>
        )}
      </div>
      <p className="line-clamp-2 p-3 text-sm font-medium" lang="en">{short.title}</p>
    </li>
  );
}

export function ShortsGrid({ shorts, playLabel }: { shorts: Short[]; playLabel: string }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {shorts.map((s) => <ShortTile key={s.id} short={s} playLabel={playLabel} />)}
    </ul>
  );
}
