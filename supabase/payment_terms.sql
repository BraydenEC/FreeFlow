-- FreeFlow — payment terms per project
--
-- HOW TO RUN
--   Supabase → SQL Editor → New query → paste this file → Run
--
-- Safe to re-run.
--
-- WHY
-- The cash-flow forecast has to answer "when does this money arrive", and a
-- project records a deadline, not a payment date. Until now a single global
-- assumption of 30 days bridged the gap for everybody, which made the
-- forecast wrong for anyone whose clients pay on 15 or 60.
--
-- Terms really belong to the CLIENT, and clients are still free text on each
-- project rather than records of their own (see docs/extras/ROADMAP.md item
-- 4). Per-project is the honest intermediate: it is correct, it is settable,
-- and it survives unchanged when clients become entities — the column simply
-- starts being populated from the client instead of by hand.
--
-- NULL means "use my account default", which lives in the preferences row.
-- That keeps the common case to zero typing while allowing the client who
-- always pays late to say so.

alter table public.projects
  add column if not exists payment_terms_days integer;

alter table public.projects
  drop constraint if exists projects_payment_terms_days_check;

-- A negative term would mean being paid before the deadline, and a term
-- beyond a year is far likelier to be a typo than a contract.
alter table public.projects
  add constraint projects_payment_terms_days_check
  check (payment_terms_days is null
         or (payment_terms_days >= 0 and payment_terms_days <= 365));

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
-- Expect the column present, the constraint shown, and every existing row
-- null — meaning they all fall back to the account default.

select
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'projects'
      and column_name = 'payment_terms_days') as column_present,
  (select pg_get_constraintdef(oid) from pg_constraint
    where conrelid = 'public.projects'::regclass
      and conname = 'projects_payment_terms_days_check') as constraint_def,
  (select count(*) from public.projects where payment_terms_days is null)
    as rows_using_account_default;
