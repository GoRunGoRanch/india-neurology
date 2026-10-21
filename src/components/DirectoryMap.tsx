"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

export interface MapPoint {
  id: string;
  name: string;
  href: string;
  lat: number;
  lng: number;
  kind: "neurologist" | "hospital";
}

// Leaflet + OpenStreetMap tiles. Loaded only when the visitor picks the map view.
export function DirectoryMap({ points, label }: { points: MapPoint[]; label: string }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !el.current) return;
      map = L.map(el.current, { scrollWheelZoom: false }).setView([22.5, 79], 4);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      const layer = L.featureGroup();
      for (const p of points) {
        const marker = L.circleMarker([p.lat, p.lng], {
          radius: 8,
          weight: 2,
          color: "#ffffff",
          fillColor: p.kind === "hospital" ? "#dc2626" : "#4f46e5",
          fillOpacity: 0.9,
        });
        const link = document.createElement("a");
        link.href = p.href;
        link.textContent = p.name;
        link.style.fontWeight = "600";
        marker.bindPopup(link);
        layer.addLayer(marker);
      }
      layer.addTo(map);
      if (points.length > 0) map.fitBounds(layer.getBounds(), { padding: [30, 30], maxZoom: 11 });
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [points]);

  return <div ref={el} role="region" aria-label={label} className="h-[420px] w-full overflow-hidden rounded-2xl border border-slate-200 sm:h-[560px]" />;
}
