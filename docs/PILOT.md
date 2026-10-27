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

## Reviewer dashboard

`/en/review` — works on previews and on kneetie.in once Supabase is connected. Sign-in is by emailed
one-time link (no passwords), and only accounts the owner invites **and** grants the `verifier` role can
act. Without Supabase it shows a read-only queue.

- **Queues:** To review (draft, pending, needs re-check) · Flagged · Thrombectomy · Approved · Rejected · All,
  plus a hospital filter that also pulls in that hospital's doctors.
- **Per claim:** Approve, Reject / withdraw, or Needs more checking; an internal note; and a corrected value
  (saved with Approve; the researched value stays visible in history).
- **Thrombectomy operator claims** cannot be approved without a note recording the explicit evidence or
  direct confirmation (who, how, when). Approving a hospital's thrombectomy service never marks its doctors.
- **Stale:** an approval only holds for the evidence it was made on. If a re-research run changes that
  evidence, or the approval is older than `REVIEW_MAX_AGE_DAYS` (default 180), the claim drops to
  "Needs re-check" automatically.
- **Audit:** every decision is appended to `claim_review_events` by a database trigger; rows in
  `claim_reviews` cannot be deleted (withdraw = reject). Recent decisions show at the bottom of the page.
- **Linking:** an approved doctor–hospital affiliation appears on both pages on the next request (cache is
  revalidated when you act); no site edit or redeploy.

Where decisions show: previews show every candidate with its current status. Production stays on demo data
until the owner sets `DIRECTORY_MODE=published` on Vercel; then kneetie.in shows **only approved claims** —
a hospital or doctor appears once its name is approved, a link once the affiliation is approved.

## Supabase setup (owner, ~15 minutes)

1. supabase.com → New project. Region **Mumbai (ap-south-1)**. Keep the database password in your
   password manager.
2. SQL Editor → run `supabase/migrations/0001_init.sql`, then `0002_claim_reviews.sql`.
3. Authentication → Sign In / Providers → Email: keep enabled, **turn off "Allow new users to sign up"**.
4. Authentication → URL Configuration: Site URL `https://www.kneetie.in`; Redirect URLs:
   `https://www.kneetie.in/auth/callback`, `https://kneetie.in/auth/callback`,
   `https://*-knee-tie-go-run-go.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`.
5. Authentication → Users → **Invite user** with the reviewer's email. Then in SQL Editor (the name you set
   is shown publicly next to approved claims):

   ```sql
   insert into users (id, display_name)
     select id, 'Dr. Viveck Baluja' from auth.users where email = 'REVIEWER_EMAIL'
     on conflict (id) do update set display_name = excluded.display_name;
   insert into user_roles (user_id, role_code)
     select id, 'verifier' from auth.users where email = 'REVIEWER_EMAIL';
   ```
6. Project Settings → API: copy the **Project URL** and the **anon public** key into Vercel → india-neurology →
   Settings → Environment Variables as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (all environments), then redeploy. The app never needs the `service_role` key — don't add it anywhere.

Backups: Supabase Pro takes daily backups (restore from Database → Backups). On the free tier, export
`claim_reviews` and `claim_review_events` (Table editor → Export CSV) after review sessions.

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
- Supabase project + reviewer accounts (setup above); budget for scheduled re-checks.
- When to switch production to `DIRECTORY_MODE=published`.
- Whether the GitHub repo should be private (it is public now, so candidate data in it is public too).

## Estimated running costs

Vercel Hobby/Pro: $0–20/month. Supabase free tier is enough for the pilot (Pro $25/month later).
Scheduled research re-checks: model usage per city run, roughly tens of dollars, depending on depth.
