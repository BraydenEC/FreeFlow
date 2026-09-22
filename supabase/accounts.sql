-- ServicePro — user accounts migration
--
-- HOW TO RUN
--   1. Supabase → Authentication → Providers → Email → turn "Confirm email" OFF
--   2. Sign up on the live site with the email in BACKFILL_EMAIL below
--   3. Supabase → SQL Editor → paste this file → Run
--   4. Read the verify block at the bottom: moved_projects should be 6
--
-- Safe to re-run. Every statement is idempotent; the backfill only touches
-- rows that have no owner yet.
--
-- WHY THE ORDER MATTERS
-- The backfill assigns every existing row to one auth.users record. That
-- record exists only after step 2. Run this first and the backfill is a
-- no-op — harmless, but you would have to run it again.

-- ---------------------------------------------------------------------------
-- 1. Ownership columns
-- ---------------------------------------------------------------------------
-- Nullable on purpose. A row with no owner is legacy data: invisible under the
-- per-user policies below, still readable where reads stay public.

alter table public.projects
  add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.core_outputs
  add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.research_records
  add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.pricing_scenarios
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists projects_user_id_idx          on public.projects (user_id);
create index if not exists core_outputs_user_id_idx      on public.core_outputs (user_id);
create index if not exists research_records_user_id_idx  on public.research_records (user_id);
create index if not exists pricing_scenarios_user_id_idx on public.pricing_scenarios (user_id);

-- ---------------------------------------------------------------------------
-- 2. Backfill — seed rows move to the first account
-- ---------------------------------------------------------------------------

do $$
declare
  owner uuid;
begin
  select id into owner from auth.users
    where email = 'braydencredeur@gmail.com' limit 1;   -- BACKFILL_EMAIL

  if owner is null then
    raise notice 'No user with that email yet — sign up first, then re-run. Nothing moved.';
    return;
  end if;

  update public.projects          set user_id = owner where user_id is null;
  update public.core_outputs      set user_id = owner where user_id is null;
  update public.research_records  set user_id = owner where user_id is null;
  update public.pricing_scenarios set user_id = owner where user_id is null;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Preferences
-- ---------------------------------------------------------------------------
-- One row per user, whole prefs object as JSON. The shape is owned by
-- lib/prefs/schema.ts; the server re-parses on every read and write, so a
-- hand-edited row that no longer matches the schema repairs to defaults
-- instead of breaking the page.

create table if not exists public.user_prefs (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  prefs       jsonb       not null,
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4. Row Level Security
-- ---------------------------------------------------------------------------
-- Private tables: own rows only, for every verb the app uses.
-- Public tables (research, pricing): anyone reads; only signed-in users write,
-- and only as themselves.

alter table public.projects          enable row level security;
alter table public.core_outputs      enable row level security;
alter table public.research_records  enable row level security;
alter table public.pricing_scenarios enable row level security;
alter table public.user_prefs        enable row level security;

-- projects — private
drop policy if exists "Public read access" on public.projects;
drop policy if exists "Own rows: select" on public.projects;
drop policy if exists "Own rows: insert" on public.projects;
drop policy if exists "Own rows: update" on public.projects;
drop policy if exists "Own rows: delete" on public.projects;
create policy "Own rows: select" on public.projects for select to authenticated using (user_id = auth.uid());
create policy "Own rows: insert" on public.projects for insert to authenticated with check (user_id = auth.uid());
create policy "Own rows: update" on public.projects for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Own rows: delete" on public.projects for delete to authenticated using (user_id = auth.uid());

-- core_outputs — private
drop policy if exists "Public read access"   on public.core_outputs;
drop policy if exists "Public insert access" on public.core_outputs;
drop policy if exists "Own rows: select" on public.core_outputs;
drop policy if exists "Own rows: insert" on public.core_outputs;
create policy "Own rows: select" on public.core_outputs for select to authenticated using (user_id = auth.uid());
create policy "Own rows: insert" on public.core_outputs for insert to authenticated with check (user_id = auth.uid());

-- research_records — public read, signed-in write
drop policy if exists "Public insert access" on public.research_records;
drop policy if exists "Public read access"   on public.research_records;
drop policy if exists "Signed-in insert"     on public.research_records;
create policy "Public read access" on public.research_records for select to anon, authenticated using (true);
create policy "Signed-in insert"   on public.research_records for insert to authenticated with check (user_id = auth.uid());

-- pricing_scenarios — public read, signed-in write
drop policy if exists "Public insert access" on public.pricing_scenarios;
drop policy if exists "Public read access"   on public.pricing_scenarios;
drop policy if exists "Signed-in insert"     on public.pricing_scenarios;
create policy "Public read access" on public.pricing_scenarios for select to anon, authenticated using (true);
create policy "Signed-in insert"   on public.pricing_scenarios for insert to authenticated with check (user_id = auth.uid());

-- user_prefs — private
drop policy if exists "Own row: select" on public.user_prefs;
drop policy if exists "Own row: insert" on public.user_prefs;
drop policy if exists "Own row: update" on public.user_prefs;
create policy "Own row: select" on public.user_prefs for select to authenticated using (user_id = auth.uid());
create policy "Own row: insert" on public.user_prefs for insert to authenticated with check (user_id = auth.uid());
create policy "Own row: update" on public.user_prefs for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
-- Expect after a correct run: moved_projects = 6, orphan_projects = 0,
-- policies per table: projects 4, core_outputs 2, research 2, pricing 2, prefs 3.

select
  (select count(*) from public.projects where user_id is not null) as moved_projects,
  (select count(*) from public.projects where user_id is null)     as orphan_projects,
  (select count(*) from public.core_outputs where user_id is null) as orphan_core,
  (select count(*) from public.research_records where user_id is null) as orphan_research,
  (select count(*) from public.pricing_scenarios where user_id is null) as orphan_pricing,
  (select string_agg(tablename || ':' || n, ', ' order by tablename)
     from (select tablename, count(*) n from pg_policies
           where schemaname = 'public' group by tablename) t) as policies;
