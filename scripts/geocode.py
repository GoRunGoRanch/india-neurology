#!/usr/bin/env python3
"""Candidate map pins for a pilot dataset from OpenStreetMap Nominatim (1 request/second, ODbL).

Usage: python3 scripts/geocode.py <dataset.json> <city name> <out-geo.json>

Only results OpenStreetMap tags as hospitals are kept. Every pin becomes a draft "location" claim a
reviewer must confirm; unmatched hospitals stay "not yet on the map" rather than guessed.
"""
import json
import re
import subprocess
import sys
import time
import urllib.parse

UA = "KneeTieIndia-geocoder/1.0 (+https://www.kneetie.in)"
HOSPITAL = {"amenity/hospital", "landuse/hospital", "healthcare/hospital", "building/hospital"}


def search(q):
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode({"q": q, "format": "jsonv2", "countrycodes": "in", "limit": 5})
    time.sleep(1.2)
    out = subprocess.run(["curl", "-sS", "--max-time", "30", "-A", UA, url], capture_output=True, text=True, check=True).stdout
    return json.loads(out)


SUFFIXES = re.compile(r"\s*(&|and)\s*(medical\s+)?(research\s+centre|medical\s+college|research\s+institute).*$", re.I)


def short_names(name):
    """Shorter forms OpenStreetMap is more likely to carry, e.g. 'Jaslok Hospital & Research Centre' -> 'Jaslok Hospital'."""
    out = []
    paren = re.findall(r"\(([^)]+)\)", name)
    base = re.sub(r"\s*\([^)]*\)", "", name).split(",")[0].strip()
    parts = [x.strip() for x in re.split(r"\s+(?:&|and)\s+", base) if "hospital" in x.lower()]
    for n in [*paren, *parts, SUFFIXES.sub("", base), base]:
        n = n.strip()
        if n and n != name and n not in out:
            out.append(n)
    return out


def main():
    dataset, city, out_path = sys.argv[1:]
    ds = json.load(open(dataset))
    pins = {}
    for h in ds["hospitals"]:
        queries = [("name_and_address", f"{h['name']}, {h['address']}")] if h.get("address") else []
        queries += [("name_only", f"{h['name']}, {city}")]
        if h.get("campus"):
            queries += [("name_and_campus", f"{h['name']}, {h['campus']}, {city}")]
        for n in short_names(h["name"]):
            if h.get("campus"):
                queries += [("short_name_and_campus", f"{n}, {h['campus']}, {city}")]
            queries += [("short_name", f"{n}, {city}")]
        queries += [(m, q) for m, q in h.get("geocodeHints", [])]
        for method, q in queries:
            hits = [r for r in search(q) if f"{r.get('category')}/{r.get('type')}" in HOSPITAL and city.split()[0] in r["display_name"]]
            if hits:
                r = hits[0]
                flags = [] if method == "name_and_address" else ["matched_by_name_not_official_address"]
                pins[h["key"]] = {
                    "lat": round(float(r["lat"]), 6), "lng": round(float(r["lon"]), 6), "flags": flags,
                    "evidence": {"field": "location", "url": f"https://www.openstreetmap.org/{r['osm_type']}/{r['osm_id']}",
                                 "excerpt": "OpenStreetMap match: " + " ".join(r["display_name"].split()[:22]),
                                 "kind": "summary", "sourceType": "map", "sourceDate": None, "checkedAt": time.strftime("%Y-%m-%d")},
                }
                break
        print(h["key"], "->", "pinned" if h["key"] in pins else "not found")
    json.dump(pins, open(out_path, "w"), indent=1, ensure_ascii=False)
    print(f"{len(pins)} of {len(ds['hospitals'])} pinned")


if __name__ == "__main__":
    main()
