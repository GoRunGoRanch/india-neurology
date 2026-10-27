-- Reviewer decisions for pilot research claims (India Stroke Hub brief §5–6).
-- The research itself lives in the repo (src/lib/data/pilot/*.json); this stores only who decided
-- what, about which claim, based on which evidence. Every change is kept in claim_review_events.

create type claim_review_status as enum ('draft', 'pending_review', 'verified', 'disputed', 'stale');

-- One current decision per claim. claim_id is stable, e.g.
-- "delhi/h:sgrh-rajinder-nagar:service:thrombectomy" or "delhi/x:<physician>:mechanical_thrombectomy".
create table claim_reviews (
  claim_id text primary key,
  status claim_review_status not null,
  evidence_hash text not null,          -- the evidence the reviewer saw; a mismatch later => stale
  corrected_value text,                 -- reviewer's correction, shown instead of the researched value
  note text,                            -- internal; never exposed publicly
  reviewer_id uuid not null references users(id),
  reviewer_name text not null,
  reviewed_at timestamptz not null default now()
);

-- Append-only audit trail. Written only by the trigger below.
create table claim_review_events (
  id bigserial primary key,
  claim_id text not null,
  from_status claim_review_status,
  to_status claim_review_status not null,
  evidence_hash text not null,
  corrected_value text,
  note text,
  reviewer_id uuid references users(id),
  reviewer_name text,
  created_at timestamptz not null default now()
);
create index claim_review_events_claim on claim_review_events (claim_id, created_at desc);

create or replace function log_claim_review() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into claim_review_events (claim_id, from_status, to_status, evidence_hash, corrected_value, note, reviewer_id, reviewer_name)
  values (new.claim_id, case when tg_op = 'UPDATE' then old.status end, new.status, new.evidence_hash,
          new.corrected_value, new.note, new.reviewer_id, new.reviewer_name);
  return new;
end $$;

create trigger claim_reviews_audit after insert or update on claim_reviews
  for each row execute function log_claim_review();

alter table claim_reviews enable row level security;
alter table claim_review_events enable row level security;

-- Only verifiers/admins read or write decisions, and only as themselves. No deletes: withdraw a
-- claim by marking it disputed, so history is never lost.
create policy reviewer_read on claim_reviews for select using (has_role('verifier') or has_role('admin'));
create policy reviewer_insert on claim_reviews for insert
  with check ((has_role('verifier') or has_role('admin')) and reviewer_id = auth.uid());
create policy reviewer_update on claim_reviews for update
  using (has_role('verifier') or has_role('admin'))
  with check ((has_role('verifier') or has_role('admin')) and reviewer_id = auth.uid());
create policy reviewer_read on claim_review_events for select using (has_role('verifier') or has_role('admin'));

-- What the public site needs to render decisions: no internal notes, no reviewer ids.
create view public_claim_reviews as
  select claim_id, status, evidence_hash, corrected_value, reviewer_name, reviewed_at from claim_reviews;
grant select on public_claim_reviews to anon, authenticated;

-- Mirror auth users into public.users so roles can reference them.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into users (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();
