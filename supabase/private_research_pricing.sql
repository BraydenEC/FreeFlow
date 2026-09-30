-- FreeFlow Security — make research_records and pricing_scenarios PRIVATE
--
-- HOW TO RUN
--   Supabase dashboard → SQL Editor → New query → paste → Run
--   Safe to re-run: drops and recreates the policies.
--
-- WHY
--   These two tables were created in the pre-accounts weeks with a
--   "Public read access" policy (to anon, using (true)). That means anyone
--   holding the public anon key could SELECT every row of every user's
--   research records and pricing scenarios. The accounts migration hardened
--   projects / core_outputs / user_prefs to per-user but deliberately left
--   these two open. This closes that gap: a user's saved research and pricing
--   is their own, not the internet's.
--
--   user_id already exists on both tables (added and back-filled by
--   accounts.sql), and RLS is already enabled, so this only replaces the read
--   policy. Insert stays scoped to auth.uid() as before. No update/delete
--   policy is added: these remain an append-only trail, matching their original
--   design — with RLS on and no such policy, updates and deletes are denied.
--
-- SIDE EFFECT
--   Any legacy rows whose user_id is NULL (created before the back-fill, if any)
--   become unreadable. That is the correct outcome: an unowned row should not
--   be world-readable. If you need to reclaim such rows, set their user_id
--   first.

-- ---------------------------------------------------------------------------
-- research_records
-- ---------------------------------------------------------------------------
alter table public.research_records enable row level security;

drop policy if exists "Public read access" on public.research_records;

drop policy if exists "Own rows: select" on public.research_records;
create policy "Own rows: select" on public.research_records
  for select to authenticated using (user_id = auth.uid());

-- keep insert scoped to the signed-in user (recreated idempotently)
drop policy if exists "Signed-in insert" on public.research_records;
create policy "Signed-in insert" on public.research_records
  for insert to authenticated with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- pricing_scenarios
-- ---------------------------------------------------------------------------
alter table public.pricing_scenarios enable row level security;

drop policy if exists "Public read access" on public.pricing_scenarios;

drop policy if exists "Own rows: select" on public.pricing_scenarios;
create policy "Own rows: select" on public.pricing_scenarios
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "Signed-in insert" on public.pricing_scenarios;
create policy "Signed-in insert" on public.pricing_scenarios
  for insert to authenticated with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
-- Expect, for each table: NO policy named "Public read access", and a
-- "for select" policy whose qualifier references auth.uid(). Anon reads should
-- now return zero rows.
select
  tablename,
  policyname,
  cmd,
  roles,
  qual
from pg_policies
where schemaname = 'public'
  and tablename in ('research_records', 'pricing_scenarios')
order by tablename, cmd;
