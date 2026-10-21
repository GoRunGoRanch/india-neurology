# India Neurology Directory

A free, India-first neurological care directory and education site, with outreach driven by the
**KneeTie GoRunGo** YouTube channel (youtube.com/c/kneetiegorungo). It is a separate public site,
not a part of TruckYeahTraders.

- Brief and reference screenshots: [`docs/`](docs/)
- Sitemap, component architecture and schema: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Database DDL (Supabase / Postgres + PostGIS): [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)

## Status: Sprint 1–2 MVP (not production-ready)

Built: responsive home page, Stroke FAST page (KneeTie… Go Run Go test), emergency page, a
10-condition library, a state/city directory with filters and a map/list toggle, neurologist and
hospital profiles with their verification state, a report/claim form, English/Hindi routing, SEO
metadata and a sitemap.

Still needed before launch:

| Item | Status |
|---|---|
| Directory data | **Demo only.** Every record is named "Demo …" and has no phone number. |
| Condition pages | **Draft.** They are awaiting clinical review, and each page says so. |
| Hindi strings | Draft. They need native-speaker review. |
| Admin verification console | Sprint 3. The schema and RLS for it are ready. |
| Report / claim submissions | Saved to Supabase `claims` once env vars are set. Until then the form says submissions are not open. |
| Domain, brand, legal review | Open (see ARCHITECTURE.md §5). |

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:3000. The site redirects to `/en`, or to `/hi` for Hindi browsers.

## Checks

```bash
npm test
```

```bash
npm run typecheck
```

```bash
npm run build
```

The tests cover search filtering, English/Hindi dictionary parity, and demo-data safety. A test
fails if any demo record has a phone number, a verified status, or a name that doesn't start
with "Demo".

## Deploy (Vercel)

1. Push this folder to a new GitHub repository (for example `GoRunGoRanch/india-neurology`).
2. In Vercel, choose **Add New → Project**, import the repository, and keep the **Next.js** preset.
3. Set the environment variable `NEXT_PUBLIC_SITE_URL` to the final domain.
4. Deploy. Add the domain under **Settings → Domains** once it is chosen.

### Optional: Supabase

1. Create a Supabase project in the Mumbai (ap-south-1) region for data residency.
2. Open **SQL Editor**, paste `supabase/migrations/0001_init.sql`, and run it.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel, then redeploy.
   The report form will start saving to the `claims` table.

## Where to change things

| What | File |
|---|---|
| Site name, YouTube channel, featured video, Roblox game link, emergency numbers | `src/lib/site.ts` |
| UI text (English / Hindi) | `src/lib/i18n/en.ts`, `src/lib/i18n/hi.ts` |
| Condition page content and review sign-off | `src/lib/content/conditions.ts` |
| States, cities, services, conditions | `src/lib/taxonomy.ts` |
| Demo records | `src/lib/data/demo/records.ts` |

To embed a featured lesson on Home, Stroke and Learn, set `featuredVideoId` in `site.ts` to a
YouTube video ID.

To sign off a condition page, set `reviewStatus: "reviewed"`, `reviewer`, and `reviewedAt` on
that entry. The draft banner then disappears.
