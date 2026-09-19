-- ServicePro Pricing — Week 3 schema
--
-- HOW TO RUN
--   Supabase dashboard → SQL Editor → New query → paste → Run
--   Safe to re-run: drops and recreates the table.
--
-- Additive. Does not touch projects (Week 0), core_outputs (Week 1),
-- or research_records (Week 2).

drop table if exists public.pricing_scenarios;

create table public.pricing_scenarios (
  id          uuid primary key default gen_random_uuid(),

  name        text not null,
  scenario    text not null
              check (scenario in ('conservative', 'base', 'optimistic')),

  -- THE POINT OF THIS TABLE.
  --
  -- Storing the full input set alongside the computed outputs makes a saved
  -- scenario reproducible: recompute the inputs and compare against mrr/arr,
  -- and any silent change to the pricing maths shows up as a mismatch. A row
  -- that stored only the outputs would be a number with no provenance, which
  -- is exactly what this module is meant to avoid.
  inputs      jsonb   not null,

  mrr         numeric(12,2) not null check (mrr >= 0),
  arr         numeric(12,2) not null check (arr >= 0),

  created_at  timestamptz not null default now(),

  -- ARR is a run-rate: twelve times current MRR, not the sum of a growing
  -- projection. Conflating the two overstates revenue, so the relationship is
  -- enforced here rather than trusted.
  constraint arr_is_twelve_times_mrr
    check (abs(arr - (mrr * 12)) < 0.02)
);

-- ---------------------------------------------------------------------------
-- Row Level Security — read and insert only, same as research_records
-- ---------------------------------------------------------------------------

alter table public.pricing_scenarios enable row level security;

drop policy if exists "Public read access" on public.pricing_scenarios;
create policy "Public read access"
  on public.pricing_scenarios for select
  to anon, authenticated using (true);

drop policy if exists "Public insert access" on public.pricing_scenarios;
create policy "Public insert access"
  on public.pricing_scenarios for insert
  to anon, authenticated with check (true);

-- Verify: expect 0 rows, and the ARR constraint to reject a mismatched pair.
select count(*) as rows_present from public.pricing_scenarios;
