-- FreeFlow Core — Week 1 schema
--
-- HOW TO RUN
--   Supabase dashboard → SQL Editor → New query → paste → Run
--   Safe to re-run: drops and recreates the table.
--
-- This is additive. It does not touch the Week 0 `projects` table.

drop table if exists public.core_outputs;

create table public.core_outputs (
  id              uuid primary key default gen_random_uuid(),

  -- The original brief, kept verbatim. Without it there is no way to audit an
  -- extraction after the fact, or to re-run it against a newer prompt.
  raw_input       text        not null,

  project_name    text        not null,
  client          text,

  -- Extraction fields are NULLABLE on purpose. A brief that never mentions a
  -- rate must produce a row that says so. Making these NOT NULL would force
  -- the extractor to invent values, which is the one failure mode this
  -- module exists to avoid.
  hourly_rate     numeric(8,2),
  hours_logged    numeric(6,2),
  deadline        date,

  status          text        not null
                  check (status in ('in_progress', 'awaiting_review',
                                    'invoice_sent', 'overdue')),

  confidence_note text        not null,

  -- Provenance. Which code path produced this row, and under which prompt.
  -- Week 0 shipped a fallback that was invisible in production for six
  -- deployments; this column is the fix for that class of bug.
  extractor       text        not null check (extractor in ('model', 'heuristic')),
  prompt_version  text        not null,

  created_at      timestamptz not null default now()
);

create index core_outputs_created_at_idx on public.core_outputs (created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
--
-- Unlike `projects`, this table is WRITTEN from the app, so it needs an insert
-- policy as well as a read policy. There is still no authentication this
-- sprint, so both apply to `anon`.
--
-- This is a deliberate, documented tradeoff: a public insert policy means
-- anyone holding the anon key can add rows. Acceptable for a single-user
-- coursework demo with no sensitive data; it would NOT be acceptable in a real
-- product, where these policies would be scoped to auth.uid().
--
-- Update and delete are intentionally omitted. Saved outputs are an append-only
-- audit trail, so the public key cannot rewrite or erase history.

alter table public.core_outputs enable row level security;

drop policy if exists "Public read access" on public.core_outputs;
create policy "Public read access"
  on public.core_outputs for select
  to anon, authenticated
  using (true);

drop policy if exists "Public insert access" on public.core_outputs;
create policy "Public insert access"
  on public.core_outputs for insert
  to anon, authenticated
  with check (true);

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
-- Expect 0 rows and exactly 2 policies (select, insert) — no update, no delete.

select
  (select count(*) from public.core_outputs) as row_count,
  (select count(*) from pg_policies
     where schemaname = 'public' and tablename = 'core_outputs') as policy_count,
  (select string_agg(cmd, ', ' order by cmd) from pg_policies
     where schemaname = 'public' and tablename = 'core_outputs') as commands;
