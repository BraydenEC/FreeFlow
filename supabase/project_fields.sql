-- FreeFlow — contract, payment link, and the pre-work pipeline stage
--
-- HOW TO RUN
--   Supabase → SQL Editor → New query → paste this file → Run
--
-- Safe to re-run. Every statement is idempotent.
--
-- WHY
-- From the Week 2 validation interview (docs/extras/VALIDATION_FINDINGS.md).
-- The interviewee's pipeline starts before ours did:
--
--   "I always have a contract signed beforehand and in case I ever need to
--    escalate."
--
-- He credits that signature with never having been stood up, and the product
-- had nowhere to record it. Work began at 'in_progress'; his begins at a
-- signed contract. Hence a fifth status and two columns to hold the artifact.
--
--   "stripe"
--
-- Invoices go out and come back through Stripe, and a row had no link to the
-- payment that settled it. Hence payment_url.

-- ---------------------------------------------------------------------------
-- 1. Columns
-- ---------------------------------------------------------------------------
-- All nullable. Every existing row predates them, and a contract date that
-- was never recorded is genuinely unknown rather than zero.

alter table public.projects
  add column if not exists contract_signed_on date,
  add column if not exists contract_url       text,
  add column if not exists payment_url        text;

-- ---------------------------------------------------------------------------
-- 2. The new pipeline stage
-- ---------------------------------------------------------------------------
-- 'contracted' — signed, work not yet started. It sits before 'in_progress'.
--
-- The constraint is dropped and recreated rather than altered, because a CHECK
-- cannot be extended in place. Postgres names an inline column check
-- <table>_<column>_check, which is what the original CREATE TABLE produced.

alter table public.projects
  drop constraint if exists projects_status_check;

alter table public.projects
  add constraint projects_status_check
  check (status in ('contracted', 'in_progress', 'awaiting_review',
                    'invoice_sent', 'overdue'));

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
-- Expect: three new columns listed, and a constraint mentioning 'contracted'.

select
  (select string_agg(column_name, ', ' order by column_name)
     from information_schema.columns
    where table_schema = 'public' and table_name = 'projects'
      and column_name in ('contract_signed_on', 'contract_url', 'payment_url'))
    as new_columns,
  (select pg_get_constraintdef(oid)
     from pg_constraint
    where conrelid = 'public.projects'::regclass
      and conname = 'projects_status_check')
    as status_constraint;
