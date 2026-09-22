-- FreeFlow Research — Week 2 schema
--
-- HOW TO RUN
--   Supabase dashboard → SQL Editor → New query → paste → Run
--   Safe to re-run: drops and recreates the table.
--
-- Additive. Does not touch `projects` (Week 0) or `core_outputs` (Week 1).

drop table if exists public.research_records;

create table public.research_records (
  id             uuid primary key default gen_random_uuid(),

  -- The original note, kept verbatim so any record can be audited against
  -- what was actually written, or re-run under a newer prompt.
  raw_input      text        not null,

  title          text        not null,
  summary        text        not null,

  category       text        not null
                 check (category in ('competitor', 'substitute', 'benchmark',
                                     'risk', 'insight')),

  region         text        not null check (region in ('global', 'mexico')),

  -- THE POINT OF THIS TABLE.
  --
  -- source_url is deliberately NULLABLE and confidence is NOT NULL. Together
  -- they make an unsourced claim representable but *visible*: a record can be
  -- saved without a source, and it will carry confidence = 'estimated' and
  -- render as unsourced in the UI.
  --
  -- Making source_url NOT NULL would be worse, not better — it would push
  -- people to paste a plausible-looking link to satisfy the constraint, which
  -- is fabrication with extra steps. The schema surfaces the weakness instead
  -- of forbidding it.
  source_url     text,
  verified_on    date,
  confidence     text        not null
                 check (confidence in ('verified', 'reported', 'estimated')),

  -- A claim cannot be 'verified' without a source to verify it against.
  -- This is the one honesty rule worth enforcing in the database rather than
  -- the application, because it is about the meaning of the data itself.
  constraint verified_requires_source
    check (confidence <> 'verified' or source_url is not null),

  -- Provenance, same discipline as core_outputs.
  extractor      text        not null check (extractor in ('model', 'heuristic')),
  prompt_version text        not null,

  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- Read is public; writes go through the server route, which uses the same anon
-- key, so an insert policy is required for saving to work at all. Scoped to
-- insert only — no update, no delete.

alter table public.research_records enable row level security;

drop policy if exists "Public read access" on public.research_records;
create policy "Public read access"
  on public.research_records for select
  to anon, authenticated using (true);

drop policy if exists "Public insert access" on public.research_records;
create policy "Public insert access"
  on public.research_records for insert
  to anon, authenticated with check (true);

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
-- Expect 0 rows and the constraint to reject a verified claim with no source.

select count(*) as rows_present from public.research_records;
