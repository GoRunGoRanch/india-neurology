#!/usr/bin/env python3
"""Merge research-agent batch files into one pilot dataset (src/lib/data/pilot/<pilot>.json).

Usage: python3 scripts/merge-research.py <pilot> <generatedAt> <out.json> batch-1.json [batch-2.json ...]

Every merged claim starts as "draft". Existing review decisions in <out.json> are kept, so a re-run
never silently overwrites a reviewer's work: if the evidence for a reviewed claim changed, the
claim is set back to "stale" for re-review instead.
"""
import json
import re
import sys
from pathlib import Path

BLOCKED_HOSTS = ("linkedin.", "practo.", "justdial.", "lybrate.", "credihealth.", "sehat.", "docprime.")
DRAFT = {"status": "draft", "reviewer": None, "reviewedAt": None}


def norm_name(n):
    n = re.sub(r"\b(dr|prof|professor|col|brig|lt|gen)\b\.?", "", n.lower())
    return re.sub(r"[^a-z]", "", n)


def clean_evidence(items, failures):
    out = []
    for e in items or []:
        url = e.get("url") or ""
        if not url.startswith("http") or any(h in url for h in BLOCKED_HOSTS):
            failures.append({"url": url, "reason": "dropped at merge: not a permitted source"})
            continue
        words = (e.get("excerpt") or "").split()
        if len(words) > 30:
            e["excerpt"] = " ".join(words[:30]) + " …"
        e.setdefault("kind", "summary")
        e.setdefault("sourceType", "official")
        e.setdefault("sourceDate", None)
        e.setdefault("checkedAt", "2026-10-26")
        out.append(e)
    return out


def keep_review(prev, key, evidence):
    """Carry a prior review forward; mark stale if its evidence changed."""
    old = prev.get(key)
    if not old or old["review"]["status"] == "draft":
        return dict(DRAFT)
    if old["evidence"] != evidence:
        return {**old["review"], "status": "stale"}
    return old["review"]


def main():
    pilot, generated, out_path, *batches = sys.argv[1:]
    out = Path(out_path)
    prev_ds = json.loads(out.read_text()) if out.exists() else {}
    prev = {}
    for h in prev_ds.get("hospitals", []):
        prev["h:" + h["key"]] = {"review": h["review"], "evidence": h["evidence"]}
        for s in h["services"]:
            prev[f"s:{h['key']}:{s['code']}"] = {"review": {k: s[k] for k in DRAFT}, "evidence": s["evidence"]}
    for p in prev_ds.get("physicians", []):
        prev["p:" + p["key"]] = {"review": p["review"], "evidence": p["evidence"]}
    for a in prev_ds.get("affiliations", []) + prev_ds.get("procedures", []):
        k = f"a:{a['physicianKey']}:{a.get('hospitalKey', a.get('procedure'))}"
        prev[k] = {"review": {x: a[x] for x in DRAFT}, "evidence": a["evidence"]}

    ds = {"pilot": pilot, "generatedAt": generated, "hospitals": [], "physicians": [], "affiliations": [], "procedures": [], "sourceFailures": []}
    fails = ds["sourceFailures"]
    seen_h, seen_p = set(), {}
    for b in batches:
        data = json.loads(Path(b).read_text())
        fails.extend(data.get("sourceFailures", []))
        for h in data.get("hospitals", []):
            if h["key"] in seen_h:
                continue
            seen_h.add(h["key"])
            h["evidence"] = clean_evidence(h.get("evidence"), fails)
            # No evidence, no claim: a field filled from general knowledge goes back to unknown.
            sourced = {e.get("field") for e in h["evidence"]}
            for field, key in (("address", "address"), ("phone", "officialPhone"), ("website", "officialWebsite"), ("ownership", "ownership")):
                if h.get(key) and field not in sourced:
                    h[key] = None
            services = []
            for s in h.get("services", []):
                ev = clean_evidence(s.get("evidence"), fails)
                if not ev:
                    continue  # a service with no surviving evidence stays "unknown"
                services.append({"code": s["code"], "value": "available", "evidence": ev, **keep_review(prev, f"s:{h['key']}:{s['code']}", ev)})
            h["services"] = services
            h.setdefault("notes", None)
            h["review"] = keep_review(prev, "h:" + h["key"], h["evidence"])
            ds["hospitals"].append(h)
        for p in data.get("physicians", []):
            p["evidence"] = clean_evidence(p.get("evidence"), fails)
            p["flags"] = list(p.get("flags") or [])
            n = norm_name(p["name"])
            if n in seen_p and seen_p[n] != p["key"]:
                # Conservative matching: never merge people automatically, flag for review.
                p["flags"].append("possible_duplicate")
                for q in ds["physicians"]:
                    if q["key"] == seen_p[n] and "possible_duplicate" not in q["flags"]:
                        q["flags"].append("possible_duplicate")
            seen_p.setdefault(n, p["key"])
            p["review"] = keep_review(prev, "p:" + p["key"], p["evidence"])
            ds["physicians"].append(p)
        for a in data.get("affiliations", []):
            a["evidence"] = clean_evidence(a.get("evidence"), fails)
            a["flags"] = list(a.get("flags") or [])
            ds["affiliations"].append({**a, **keep_review(prev, f"a:{a['physicianKey']}:{a['hospitalKey']}", a["evidence"])})
        for x in data.get("procedures", []):
            x["evidence"] = clean_evidence(x.get("evidence"), fails)
            if x.get("value") != "explicit_claim" or not x["evidence"]:
                continue
            ds["procedures"].append({**x, **keep_review(prev, f"a:{x['physicianKey']}:{x['procedure']}", x["evidence"])})

    hkeys = {h["key"] for h in ds["hospitals"]}
    pkeys = {p["key"] for p in ds["physicians"]}
    ds["affiliations"] = [a for a in ds["affiliations"] if a["hospitalKey"] in hkeys and a["physicianKey"] in pkeys]
    ds["procedures"] = [x for x in ds["procedures"] if x["physicianKey"] in pkeys]
    out.write_text(json.dumps(ds, ensure_ascii=False, indent=1) + "\n")
    print(f"{pilot}: {len(ds['hospitals'])} hospitals, {len(ds['physicians'])} physicians, "
          f"{len(ds['affiliations'])} affiliations, {len(ds['procedures'])} procedure claims, {len(fails)} source failures")


if __name__ == "__main__":
    main()
