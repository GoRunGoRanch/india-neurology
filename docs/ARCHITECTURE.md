# India Neurology Directory — Architecture

Source brief: [brief.pdf](brief.pdf) (six reference screenshots saved as `reference-1.png` … `reference-6.png`).

Working name: **India Neurology Directory**. Education and outreach by **KneeTie GoRunGo**
(youtube.com/c/kneetiegorungo). The final domain and brand are still to be decided and need a
trademark check (see "Open decisions"). Every user-facing name comes from `src/lib/site.ts`, so a
rename is a one-file change.

## 1. Sitemap

Every route is under a locale prefix: `/en/...` and `/hi/...`. `/` redirects to the visitor's
preferred locale.

```
/[lang]                         Home: hero + state/city search, condition chips, emergency banner,
                                featured learning card (YouTube), directory preview
/[lang]/find                    Directory search (type = neurologist | hospital | all)
   ?type=&state=&city=&condition=&service=&language=&facility=&q=&view=list|map
/[lang]/neurologists/[id]       Provider profile
/[lang]/hospitals/[id]          Facility profile
/[lang]/conditions              Condition library (10 MVP conditions)
/[lang]/conditions/[slug]       Condition page: overview, symptoms, red flags, evaluation,
                                treatment pathways, FAQs, nearby care, reviewer + review date
/[lang]/stroke                  Stroke FAST: KneeTie… Go Run Go test (child-friendly FAST),
                                learning game entry, stroke-centre finder entry
/[lang]/emergency               Emergency help: call 112, FAST, "don't delay" guidance
/[lang]/learn                   Learning hub driven by the KneeTie GoRunGo YouTube channel
/[lang]/about                   Mission, editorial policy, verification policy, disclaimers
/[lang]/for-providers           How listing works, claim a profile, correction requests
/[lang]/report                  Report an error / request takedown (linked from every profile)
/[lang]/admin  (Sprint 3)       Verification queue, claims, moderation, translations
```

The emergency page is one tap from every page: a red bar sits above the header site-wide.

## 2. Component architecture

```
src/
  app/
    layout.tsx                  Root html shell
    [lang]/layout.tsx           EmergencyBar, SiteHeader (nav + language toggle), SiteFooter
    [lang]/page.tsx             Home
    [lang]/find/page.tsx        Server component: parses searchParams → searchDirectory()
    [lang]/neurologists/[id]    ProfileView
    [lang]/hospitals/[id]       ProfileView
    [lang]/conditions/...       ConditionCard, ConditionArticle
    [lang]/stroke, emergency, learn, about, for-providers, report
    api/reports/route.ts        Accepts correction/claim submissions (Supabase when configured)
  components/
    EmergencyBar, SiteHeader, LanguageToggle, SiteFooter
    LocationSearch              State → city cascading selects + condition (server-rendered form)
    ConditionChips
    FilterPanel                 Desktop sidebar / mobile <details> drawer
    ResultCard                  Name, city, services, contact, last reviewed, VerificationBadge
    VerificationBadge           verified | pending | unverified | demo
    MissingValue                Renders "Not yet verified" instead of blank or invented data
    DirectoryMap (client)       Leaflet + OpenStreetMap, loaded only in map view
    FastSteps                   KneeTie / Go / Run / Go! cards (from reference 1)
    YouTubeFeature              Channel CTA + optional featured video embed
    DemoNotice                  Banner shown whenever demo records are on screen
  lib/
    site.ts                     Brand, domain, channel links, emergency numbers
    i18n/                       en.ts, hi.ts dictionaries, getDictionary(), locale helpers
    data/types.ts               Domain types mirroring the SQL schema
    data/repository.ts          DirectoryRepository interface
    data/demo/                  Demo provider — every record is_demo = true
    data/search.ts              Pure filtering / sorting (unit tested)
    taxonomy.ts                 Conditions, services, facility types, languages, states/cities
  middleware.ts                 Locale redirect
supabase/migrations/            Postgres + PostGIS schema, RLS
tests/                          Vitest: search, i18n key parity, demo data integrity
```

Data flows through the `DirectoryRepository` interface. The MVP ships with the demo
repository, so the site runs with no database. Switching to Supabase is a second implementation
of the same interface; pages do not change.

## 3. Database schema

Full DDL: [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql).

| Table | Purpose |
|---|---|
| `locations` | State / district / city / pincode with `geography(Point)` |
| `facilities` | Hospitals, clinics, rehab centres; coordinates, contact, accessibility |
| `facility_services` | Service codes per facility (e.g. `thrombolysis`, `eeg`, `mri`) with verification |
| `providers` | Neurologists and allied clinicians |
| `qualifications` | Degree, institution, year, registration council and number |
| `provider_facility_affiliations` | Many-to-many with role and schedule notes |
| `languages` + `provider_languages` | Languages spoken (ISO 639) |
| `conditions` | Taxonomy (slug, ICD-10 range, parent) |
| `provider_conditions` | Conditions a provider lists as focus areas |
| `sources` | Where each fact came from (registry, hospital site, self-claim, …) |
| `verification_events` | Append-only history of each verification decision |
| `claims` | Profile claims, corrections, takedown requests |
| `content_pages` | Condition pages and other editorial content, reviewer and review date |
| `translations` | Per-field translations for any entity |
| `users`, `roles`, `user_roles` | Admin/editor/reviewer accounts (Supabase Auth linked) |
| `audit_log` | Every admin write |

Every entity table has `id uuid`, a stable `canonical_id` slug, `created_at`, `updated_at`,
`deleted_at` (soft delete), `is_demo`, `verification_status`, `last_verified_at` and `source_id`.

## 4. Trust and safety rules built into the code

- **No fabricated listings.** Demo records are named "Demo …", carry `is_demo = true`, have no
  phone numbers, and display a DEMO badge plus a page-level notice. A unit test fails the build
  if any demo record looks real.
- **Missing data is labelled.** `MissingValue` renders "Not yet verified" instead of blank or
  guessed data.
- **No ratings, no rankings, no paid placement.** Sort options are relevance, name, and distance.
  Distance appears only when the record has verified coordinates and the visitor shares location.
- **Not an emergency dispatch service.** This is stated on the emergency page and in the footer.
- **Medical content** carries `reviewStatus`, reviewer and review date. Pages still awaiting clinical
  review say so at the top.

## 5. Open decisions (needed before production)

1. Domain and brand name (trademark check). `kneetie.in` is the existing pediatric stroke site.
2. Hosting: Vercel (recommended, matches other projects) plus a Supabase project.
3. Verified directory data source and the lawful basis for using it (NMC/state medical council
   registers, hospital self-submission, partnerships).
4. Clinical reviewer sign-off for each condition page.
5. Native-speaker review of the Hindi strings (current Hindi is a draft).
6. Legal review: DPDP Act 2023, NMC professional-conduct and advertising rules.
7. Roblox game URL and any KneeTie GoRunGo brand assets (logo files, illustrations).
