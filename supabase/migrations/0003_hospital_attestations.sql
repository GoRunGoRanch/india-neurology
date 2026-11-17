-- Hospital directors confirm their campus's stroke readiness (CT, CTA head/neck, CT perfusion,
-- thrombolysis, thrombectomy, thrombectomy referral). Anyone can submit from the public "Verify"
-- form, so a submission is only a request: it is published after a KneeTie reviewer confirms it
-- with the hospital (for example by calling the hospital's official number).

create type attestation_status as enum ('pending', 'approved', 'rejected');

create table hospital_attestations (
  id uuid primary key default gen_random_uuid(),
  hospital_id text not null check (char_length(hospital_id) between 3 and 120),
  answers jsonb not null,
  submitter_name text not null check (char_length(submitter_name) between 2 and 120),
  submitter_designation text not null check (char_length(submitter_designation) between 2 and 120),
  submitter_email text not null check (char_length(submitter_email) between 5 and 200),
  submitter_phone text not null check (char_length(submitter_phone) between 6 and 30),
  status attestation_status not null default 'pending',
  submitted_at timestamptz not null default now(),
  reviewer_id uuid references users(id),
  reviewer_name text,
  review_note text,
  reviewed_at timestamptz
);
create index hospital_attestations_hospital on hospital_attestations (hospital_id, submitted_at desc);

-- Append-only audit trail of reviewer decisions.
create table hospital_attestation_events (
  id bigserial primary key,
  attestation_id uuid not null,
  hospital_id text not null,
  from_status attestation_status,
  to_status attestation_status not null,
  note text,
  reviewer_id uuid,
  reviewer_name text,
  created_at timestamptz not null default now()
);

create or replace function log_attestation_review() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into hospital_attestation_events (attestation_id, hospital_id, from_status, to_status, note, reviewer_id, reviewer_name)
    values (new.id, new.hospital_id, old.status, new.status, new.review_note, new.reviewer_id, new.reviewer_name);
  end if;
  return new;
end $$;

create trigger hospital_attestations_audit after update on hospital_attestations
  for each row execute function log_attestation_review();

alter table hospital_attestations enable row level security;
alter table hospital_attestation_events enable row level security;

-- The public may only submit new, unreviewed requests. They cannot read any submission back.
create policy public_submit on hospital_attestations for insert to anon, authenticated
  with check (status = 'pending' and reviewer_id is null and reviewer_name is null and review_note is null and reviewed_at is null);
-- Reviewers read and decide, only as themselves. No deletes.
create policy reviewer_read on hospital_attestations for select using (has_role('verifier') or has_role('admin'));
create policy reviewer_update on hospital_attestations for update
  using (has_role('verifier') or has_role('admin'))
  with check ((has_role('verifier') or has_role('admin')) and reviewer_id = auth.uid());
create policy reviewer_read on hospital_attestation_events for select using (has_role('verifier') or has_role('admin'));

-- Public view: approved only, no submitter name, email or phone.
create view public_hospital_attestations as
  select id, hospital_id, answers, submitter_designation, reviewed_at
  from hospital_attestations where status = 'approved';
grant select on public_hospital_attestations to anon, authenticated;
grant insert on hospital_attestations to anon, authenticated;
