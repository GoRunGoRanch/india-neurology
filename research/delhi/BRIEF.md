# India Stroke Hub — Delhi pilot research brief (for research agents)

You are collecting **draft, evidence-linked candidate records** for a stroke/neurology directory
(kneetie.in). A human clinician reviews every claim before anything is shown as verified, so your job
is accuracy and evidence, not completeness. Today is 2026-10-26.

## Hard rules
- **Never invent anything.** If you cannot find a fact on a source you actually fetched, use `null` / "unknown".
  Unknown is fine; a wrong fact is harmful (patients may act on it).
- Every claim carries evidence: the URL you fetched, a short excerpt (verbatim, **max 25 words**) or a
  one-sentence summary (mark `kind: "summary"`), source publication date if shown, and `checkedAt: "2026-10-26"`.
- Prefer **official hospital websites** (campus pages, department pages, doctor profile pages). Government
  hospital sites (.gov.in, .nic.in, aiims.edu) are official. News articles are acceptable secondary evidence for
  hospital capability (mark `sourceType: "news"`). Aggregators (Practo, Justdial, Lybrate, credihealth, etc.) are
  NOT acceptable evidence — skip them.
- **Do not use LinkedIn at all.** Do not log in anywhere, do not bypass paywalls/CAPTCHAs/robots blocks. If a
  page fails or is blocked, record it in `sourceFailures` and move on.
- Store only professional information: name, titles, designation, department, profile URL. No personal phone
  numbers, emails, home addresses, photos, or ages. Hospital official contact numbers from the official site are OK.
- The **campus** matters: chains (Max, Fortis, Apollo, Manipal) have many campuses. Only attach a doctor to the
  campus their profile explicitly names. If ambiguous, still record it but add flag `"ambiguous_campus"`.
- **Thrombectomy:** a hospital offering thrombectomy does NOT mean a given doctor performs it. A
  neurointerventional title alone does NOT confirm a doctor performs thrombectomy. Record a physician procedure
  claim `value: "explicit_claim"` ONLY if a source explicitly states that this doctor performs (or has performed)
  mechanical thrombectomy / stroke clot retrieval. Otherwise do not create a procedure claim.
- Physicians to include: neurologists, stroke physicians, neurointerventionalists, interventional
  neuroradiologists, endovascular neurosurgeons. Cap at **~10 per hospital**, prioritising stroke /
  neurointerventional people, then department heads. Skip general neurosurgeons unless endovascular.
- Similar names across hospitals: create separate physician records, flag `"possible_duplicate"` with a note.

## Output
Write ONE JSON file to the path you are given, exactly this shape (valid JSON, no comments):

```json
{
  "agent": "batch-N",
  "hospitals": [{
    "key": "slug-like-unique-id e.g. max-saket",
    "name": "Official hospital name",
    "chain": "Max Healthcare | null",
    "campus": "Saket | null",
    "address": "street address from official site | null",
    "city": "New Delhi | Delhi",
    "state": "DL",
    "pincode": "110017 | null",
    "officialWebsite": "campus page URL | null",
    "officialPhone": "number exactly as on official site | null",
    "ownership": "government | private | trust | null",
    "evidence": [{ "field": "address|phone|website|name|ownership", "url": "", "excerpt": "", "kind": "verbatim|summary", "sourceType": "official|news|government", "sourceDate": null, "checkedAt": "2026-10-26" }],
    "services": [{
      "code": "stroke_unit|thrombolysis|thrombectomy|neurointerventional|neuro_icu|ct|mri|stroke_rehab|24x7_stroke",
      "value": "available",
      "evidence": [{ "url": "", "excerpt": "", "kind": "verbatim|summary", "sourceType": "official|news|government", "sourceDate": null, "checkedAt": "2026-10-26" }]
    }],
    "notes": "anything a reviewer should know"
  }],
  "physicians": [{
    "key": "firstname-lastname-hospitalkey",
    "name": "Dr. Full Name as shown",
    "titles": "e.g. MD, DM (Neurology) — as shown | null",
    "designation": "e.g. Principal Director & Head, Neurology | null",
    "specialty": "neurology|neurointervention|interventional_neuroradiology|endovascular_neurosurgery|stroke_neurology|paediatric_neurology",
    "subspecialty": "free text | null",
    "profileUrl": "official profile URL | null",
    "evidence": [{ "field": "name|titles|designation|specialty", "url": "", "excerpt": "", "kind": "verbatim|summary", "sourceType": "official", "sourceDate": null, "checkedAt": "2026-10-26" }],
    "flags": []
  }],
  "affiliations": [{
    "physicianKey": "", "hospitalKey": "", "role": "e.g. Consultant, Neurology",
    "evidence": [{ "url": "", "excerpt": "", "kind": "verbatim|summary", "sourceType": "official", "sourceDate": null, "checkedAt": "2026-10-26" }],
    "flags": []
  }],
  "procedures": [{
    "physicianKey": "", "procedure": "mechanical_thrombectomy", "value": "explicit_claim",
    "evidence": [{ "url": "", "excerpt": "", "kind": "verbatim", "sourceType": "official|news", "sourceDate": null, "checkedAt": "2026-10-26" }]
  }],
  "sourceFailures": [{ "url": "", "reason": "" }]
}
```

Only include a service if you found evidence it is available; omit services you couldn't confirm (they
default to "unknown"). Check the JSON is valid with `python3 -c "import json,sys; json.load(open(sys.argv[1]))" <path>`
before finishing. In your final message report counts (hospitals, physicians, affiliations, procedure claims,
failures) and any reviewer concerns — keep it short.
