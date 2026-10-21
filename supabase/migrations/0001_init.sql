-- India Neurology Directory — initial schema
-- Postgres 15 + PostGIS (Supabase). Public read goes through views that hide soft-deleted
-- rows; writes go through admin roles only.

create extension if not exists postgis;
create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type verification_status as enum ('unverified', 'pending', 'verified', 'rejected');
create type facility_type as enum (
  'hospital', 'clinic', 'stroke_centre', 'rehab_centre', 'diagnostic_centre', 'telehealth'
);
create type source_kind as enum (
  'medical_council_register', 'hospital_website', 'government_list', 'self_submission',
  'partner_feed', 'field_verification', 'other'
);
create type claim_kind as enum ('claim_profile', 'correction', 'takedown', 'new_listing');
create type claim_status as enum ('open', 'in_review', 'accepted', 'rejected');
create type review_status as enum ('draft', 'in_review', 'reviewed');

-- Common columns are repeated per table (Postgres has no table mixins).

-- ---------------------------------------------------------------------------
-- Provenance
-- ---------------------------------------------------------------------------
create table sources (
  id uuid primary key default gen_random_uuid(),
  kind source_kind not null,
  title text not null,
  url text,
  retrieved_at timestamptz,
  licence_notes text,                     -- lawful basis / terms of use for this source
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Geography
-- ---------------------------------------------------------------------------
create table locations (
  id uuid primary key default gen_random_uuid(),
  canonical_id text unique not null,      -- e.g. 'in-mh-mumbai'
  state_code text not null,               -- ISO 3166-2:IN suffix, e.g. 'MH'
  state_name text not null,
  district text,
  city text not null,
  pincode text,
  geom geography(Point, 4326),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index locations_state_city on locations (state_code, city);
create index locations_geom on locations using gist (geom);

-- ---------------------------------------------------------------------------
-- Facilities
-- ---------------------------------------------------------------------------
create table facilities (
  id uuid primary key default gen_random_uuid(),
  canonical_id text unique not null,
  name text not null,
  type facility_type not null,
  location_id uuid references locations(id),
  address text,
  geom geography(Point, 4326),
  geocode_verified boolean not null default false,  -- distance sort only when true
  phone text,
  website text,
  email text,
  accessibility jsonb not null default '{}'::jsonb, -- {wheelchair:true, lift:true, ...}
  hours_notes text,
  is_demo boolean not null default false,
  verification_status verification_status not null default 'unverified',
  last_verified_at timestamptz,
  source_id uuid references sources(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index facilities_geom on facilities using gist (geom);
create index facilities_name_trgm on facilities using gin (name gin_trgm_ops);

create table facility_services (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references facilities(id) on delete cascade,
  service_code text not null,             -- matches src/lib/taxonomy.ts SERVICES
  available_24x7 boolean,
  notes text,
  verification_status verification_status not null default 'unverified',
  last_verified_at timestamptz,
  source_id uuid references sources(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (facility_id, service_code)
);

-- ---------------------------------------------------------------------------
-- Providers
-- ---------------------------------------------------------------------------
create table providers (
  id uuid primary key default gen_random_uuid(),
  canonical_id text unique not null,
  display_name text not null,
  specialty text not null,                -- 'neurology', 'paediatric_neurology', ...
  gender text,
  bio text,
  phone text,
  email text,
  website text,
  is_demo boolean not null default false,
  verification_status verification_status not null default 'unverified',
  last_verified_at timestamptz,
  claimed_by uuid,                        -- users.id once a claim is accepted
  source_id uuid references sources(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index providers_name_trgm on providers using gin (display_name gin_trgm_ops);

create table qualifications (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  degree text not null,                   -- 'MBBS', 'MD Medicine', 'DM Neurology', ...
  institution text,
  year int,
  registration_council text,              -- 'NMC' or state council
  registration_number text,
  verification_status verification_status not null default 'unverified',
  last_verified_at timestamptz,
  source_id uuid references sources(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table provider_facility_affiliations (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  facility_id uuid not null references facilities(id) on delete cascade,
  role text,
  schedule_notes text,
  verification_status verification_status not null default 'unverified',
  source_id uuid references sources(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (provider_id, facility_id)
);

create table languages (
  code text primary key,                  -- ISO 639-1/3: 'en', 'hi', 'bn', 'ta', ...
  name_en text not null,
  name_native text not null
);

create table provider_languages (
  provider_id uuid not null references providers(id) on delete cascade,
  language_code text not null references languages(code),
  primary key (provider_id, language_code)
);

-- ---------------------------------------------------------------------------
-- Conditions and content
-- ---------------------------------------------------------------------------
create table conditions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  icd10_range text,
  parent_id uuid references conditions(id),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table provider_conditions (
  provider_id uuid not null references providers(id) on delete cascade,
  condition_id uuid not null references conditions(id) on delete cascade,
  primary key (provider_id, condition_id)
);

create table content_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  kind text not null,                     -- 'condition', 'page'
  condition_id uuid references conditions(id),
  locale text not null default 'en',
  title text not null,
  body jsonb not null,                    -- structured sections
  review_status review_status not null default 'draft',
  medical_reviewer text,
  reviewed_at timestamptz,
  next_review_due date,
  citations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table translations (
  id uuid primary key default gen_random_uuid(),
  entity_table text not null,
  entity_id uuid not null,
  field text not null,
  locale text not null,
  value text not null,
  reviewed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_table, entity_id, field, locale)
);

-- ---------------------------------------------------------------------------
-- Verification, claims, accounts, audit
-- ---------------------------------------------------------------------------
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table roles (
  code text primary key                   -- 'admin', 'editor', 'medical_reviewer', 'verifier'
);
insert into roles (code) values ('admin'), ('editor'), ('medical_reviewer'), ('verifier');

create table user_roles (
  user_id uuid not null references users(id) on delete cascade,
  role_code text not null references roles(code),
  primary key (user_id, role_code)
);

create table verification_events (
  id uuid primary key default gen_random_uuid(),
  entity_table text not null,
  entity_id uuid not null,
  from_status verification_status,
  to_status verification_status not null,
  method text not null,                   -- 'register_lookup', 'phone_call', 'document', ...
  notes text,
  source_id uuid references sources(id),
  actor_id uuid references users(id),
  created_at timestamptz not null default now()
);

create table claims (
  id uuid primary key default gen_random_uuid(),
  kind claim_kind not null,
  status claim_status not null default 'open',
  entity_table text,
  entity_id uuid,
  submitter_name text,
  submitter_contact text,                 -- minimal; no medical history collected
  message text not null,
  consent_given boolean not null,
  resolved_by uuid references users(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table audit_log (
  id bigserial primary key,
  actor_id uuid references users(id),
  action text not null,
  entity_table text not null,
  entity_id uuid,
  diff jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
create or replace function has_role(r text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from user_roles where user_id = auth.uid() and role_code = r)
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'sources','locations','facilities','facility_services','providers','qualifications',
    'provider_facility_affiliations','languages','provider_languages','conditions',
    'provider_conditions','content_pages','translations','users','roles','user_roles',
    'verification_events','claims','audit_log'
  ] loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

-- Public read of directory and content (soft-deleted rows hidden).
create policy public_read on locations for select using (deleted_at is null);
create policy public_read on facilities for select using (deleted_at is null);
create policy public_read on facility_services for select using (deleted_at is null);
create policy public_read on providers for select using (deleted_at is null);
create policy public_read on qualifications for select using (deleted_at is null);
create policy public_read on provider_facility_affiliations for select using (deleted_at is null);
create policy public_read on languages for select using (true);
create policy public_read on provider_languages for select using (true);
create policy public_read on conditions for select using (deleted_at is null);
create policy public_read on provider_conditions for select using (true);
create policy public_read on content_pages for select using (deleted_at is null and review_status = 'reviewed');
create policy public_read on translations for select using (true);

-- Anyone may submit a claim/correction with consent; nobody but staff may read them.
create policy public_insert on claims for insert with check (consent_given and status = 'open');
create policy staff_read on claims for select using (has_role('admin') or has_role('verifier'));
create policy staff_update on claims for update using (has_role('admin') or has_role('verifier'));

-- Staff writes on directory tables.
do $$
declare t text;
begin
  foreach t in array array[
    'sources','locations','facilities','facility_services','providers','qualifications',
    'provider_facility_affiliations','provider_languages','provider_conditions'
  ] loop
    execute format(
      'create policy staff_write on %I for all using (has_role(''admin'') or has_role(''verifier'')) with check (has_role(''admin'') or has_role(''verifier''))', t);
  end loop;
end $$;
create policy staff_write on content_pages for all
  using (has_role('admin') or has_role('editor') or has_role('medical_reviewer'))
  with check (has_role('admin') or has_role('editor') or has_role('medical_reviewer'));
create policy staff_write on translations for all
  using (has_role('admin') or has_role('editor')) with check (has_role('admin') or has_role('editor'));
create policy staff_insert on verification_events for insert
  with check (has_role('admin') or has_role('verifier'));
create policy staff_read on verification_events for select
  using (has_role('admin') or has_role('verifier'));
create policy admin_read on audit_log for select using (has_role('admin'));
create policy self_read on users for select using (id = auth.uid() or has_role('admin'));
create policy self_read on user_roles for select using (user_id = auth.uid() or has_role('admin'));
create policy public_read on roles for select using (true);
