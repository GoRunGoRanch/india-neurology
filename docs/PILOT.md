# India Stroke Hub — Delhi pilot

Implements the smallest working pilot of `India_Stroke_Hub_Claude_Instructions.pdf`: 20 Delhi hospitals,
real source-linked candidate records, a private preview, and a read-only reviewer queue.

## How it fits together

```
research agents ──► batch-N.json ──► scripts/merge-research.py ──► src/lib/data/pilot/delhi.json
 (public, permitted     (claims + evidence)     (drops blocked sources, keeps prior     (committed)
  sources only)                                  reviews, flags duplicates, marks
                                                 changed evidence "stale")
                                                         │
                         ┌───────────────────────────────┴──────────────────────────────┐
                 Vercel PREVIEW (behind Vercel Authentication)            PRODUCTION kneetie.in
                 or local DIRECTORY_MODE=pilot                            demo data only until
                 → real candidates, DRAFT badges, evidence panel,         claims are approved
                   /review queue (noindex)                                (/review returns 404)
```

Switch: `src/lib/data/mode.ts`. Previews show candidates automatically; set `DIRECTORY_MODE=demo` on a
preview to hide them, or `DIRECTORY_MODE=pilot` locally (`.env.local`) to show them.

## Data model (per claim)

| Record | Holds | Review state |
| --- | --- | --- |
| Hospital | name, chain, campus, address, city, state, official site & phone | per record |
| Hospital service | stroke unit, thrombolysis, thrombectomy, neurointervention, 24×7, CT, MRI… | per service |
| Physician | name, titles as listed, designation, specialty, official profile URL | per record |
| Affiliation | physician ↔ hospital campus, role | per affiliation |
| Physician procedure | mechanical thrombectomy operator — only from explicit evidence about that doctor | per claim |

Every claim has evidence: URL, short excerpt (≤ 25 words) or labelled summary, source type, source date if
shown, and the date checked. States: `draft`, `pending_review`, `verified`, `disputed`, `stale`. A missing
claim means **unknown**, never "not available".

## Source policy

- **Allowed:** official hospital sites (campus, department and doctor-profile pages), government sites
  (.gov.in, .nic.in, aiims.edu), and reputable news as secondary evidence for hospital capability.
- **Not used:** LinkedIn (no automation without authorisation), aggregators (Practo, Justdial, Lybrate,
  Credihealth…), anything behind a login, paywall, CAPTCHA or bot block. Blocked sources are recorded as
  source failures, not worked around. The merge script drops disallowed hosts.
- **Stored:** professional information only. No personal phones, emails, photos or ages.

## Reviewer guide (until the dashboard exists)

1. Open the preview's `/en/review` for counts, flagged items, thrombectomy-operator claims and source failures.
2. Open each profile; check every claim against its linked source.
3. A thrombectomy claim for a **doctor** needs explicit evidence or direct confirmation from the doctor or
   hospital. The hospital offering thrombectomy, or a neurointerventional title, is not enough.
4. Send decisions (approve / reject / correct, with your name and date) to the project owner. They are
   recorded in `delhi.json` as `status`, `reviewer`, `reviewedAt`; the merge script never overwrites them.

The Sprint 3 Supabase reviewer dashboard (secure sign-in, approve/reject buttons, audit log, agent
submission API) replaces step 4. The schema is already in `supabase/migrations/0001_init.sql`.

## Re-running research

```bash
python3 scripts/merge-research.py delhi 2026-10-26 src/lib/data/pilot/delhi.json research/delhi/batch-*.json
npm test
```

`tests/pilot-data.test.ts` fails the build if evidence is missing, a source is disallowed, an excerpt is
too long, a claim is "verified" without a reviewer, or a doctor's thrombectomy status is inferred.

## Owner decisions still needed

- Pilot city (Delhi chosen by default) and any must-have hospitals.
- Who reviews, and what evidence qualifies as verified.
- Re-verification interval (suggest 6 months → claims go `stale`).
- Supabase project + reviewer accounts for the dashboard; budget for scheduled re-checks.
- Whether the GitHub repo should be private (it is public now, so candidate data in it is public too).

## Estimated running costs

Vercel Hobby/Pro: $0–20/month. Supabase free tier is enough for the pilot (Pro $25/month later).
Scheduled research re-checks: model usage per city run, roughly tens of dollars, depending on depth.
