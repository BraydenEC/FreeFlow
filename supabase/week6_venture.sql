-- FreeFlow Week 6 — the integrated venture: funnel events, launch list,
-- roadmap votes and the public counts.
--
-- HOW TO RUN
--   Supabase dashboard → SQL Editor → New query → paste → Run
--   Safe to re-run. It NEVER drops a table: the launch list holds real
--   people's emails. Re-running only (re)creates what is missing and replaces
--   the policies, grants and the counts function.
--
-- AFTER RUNNING
--   Table Editor → count_exclusions → add one row per email that should not
--   count as a FreeFlow user: your own account and any test accounts. (The
--   grader demo accounts, grader1-3@freeflow.website, are excluded by the
--   function already.) Never commit those emails to the repo.
--
-- WHO CAN DO WHAT
--   Anyone (signed in or not) may INSERT into funnel_events, launch_list and
--   roadmap_votes, through the /api routes. Nobody can read a row back
--   through the API: there is no select policy and no select grant. The only
--   public read is venture_counts(), which returns aggregate counts, never
--   rows. The owner reads everything in the dashboard, which bypasses RLS.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- One row per /demo funnel event. Anonymous: a random visit id, no account.
create table if not exists public.funnel_events (
  id          bigint generated always as identity primary key,
  event       text not null
              check (event in ('try_free_click', 'round_played', 'story_complete', 'night_sorted')),
  job         text
              check (job is null or job in ('designer', 'photographer', 'video-editor', 'writer', 'developer')),
  visit_id    uuid not null,
  created_at  timestamptz not null default now()
);

create index if not exists funnel_events_event_idx on public.funnel_events (event);

-- People who asked to hear when the lifetime version launches. Nothing else
-- is sent to them. consent_version records which checkbox wording they saw.
create table if not exists public.launch_list (
  id               bigint generated always as identity primary key,
  email            text not null check (char_length(email) <= 254),
  consent          boolean not null check (consent),
  consent_version  text not null check (char_length(consent_version) <= 32),
  source           text check (source is null or source in ('morning', 'game_end', 'footer')),
  created_at       timestamptz not null default now()
);

-- One address once, whatever its case. A repeat sign-up hits this index and
-- the route reports "already on the list".
create unique index if not exists launch_list_email_key on public.launch_list (lower(email));

-- One upvote per roadmap item per browser key. Not a security boundary.
create table if not exists public.roadmap_votes (
  item_id     text not null check (char_length(item_id) <= 64),
  voter_key   uuid not null,
  created_at  timestamptz not null default now(),
  primary key (item_id, voter_key)
);

-- Emails that should not count as FreeFlow users on the public tab (the
-- owner's own account, test accounts). Filled by the owner in the Table
-- Editor. Read only by venture_counts().
create table if not exists public.count_exclusions (
  email  text primary key
);

-- ---------------------------------------------------------------------------
-- Grants and Row Level Security: insert only, no reads
-- ---------------------------------------------------------------------------
-- Supabase grants every API role full access to new public tables by default.
-- Narrow that to INSERT, so a policy added by mistake later still can't
-- expose rows. count_exclusions gets nothing at all.

revoke all on public.funnel_events, public.launch_list, public.roadmap_votes, public.count_exclusions
  from anon, authenticated;
grant insert on public.funnel_events, public.launch_list, public.roadmap_votes
  to anon, authenticated;

alter table public.funnel_events    enable row level security;
alter table public.launch_list      enable row level security;
alter table public.roadmap_votes    enable row level security;
alter table public.count_exclusions enable row level security;

-- The column checks above do the validating; the policy only opens the door
-- for inserts. There is deliberately no select, update or delete policy.
drop policy if exists "Anyone: insert" on public.funnel_events;
create policy "Anyone: insert" on public.funnel_events
  for insert to anon, authenticated
  with check (true);

drop policy if exists "Anyone: insert" on public.launch_list;
create policy "Anyone: insert" on public.launch_list
  for insert to anon, authenticated
  with check (consent);

drop policy if exists "Anyone: insert" on public.roadmap_votes;
create policy "Anyone: insert" on public.roadmap_votes
  for insert to anon, authenticated
  with check (true);

-- ---------------------------------------------------------------------------
-- venture_counts(): aggregate counts only
-- ---------------------------------------------------------------------------
-- security definer so it can count rows the caller cannot read, and read
-- auth.users. It returns numbers, never rows or emails. Users exclude the
-- grader demo accounts and anything in count_exclusions. A new function is
-- executable by PUBLIC by default, so that is revoked right after creating
-- it, before execute is granted to the two API roles.

create or replace function public.venture_counts()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'users', (
      select count(*)
      from auth.users u
      where coalesce(u.email, '') !~ '^grader[0-9]+@freeflow\.website$'
        and not exists (
          select 1 from public.count_exclusions e
          where lower(e.email) = lower(coalesce(u.email, ''))
        )
    ),
    'launchList', (select count(*) from public.launch_list),
    'tryFreeClicks', (select count(*) from public.funnel_events where event = 'try_free_click'),
    'roundsPlayed', (select count(*) from public.funnel_events where event = 'round_played'),
    'votes', coalesce(
      (select json_object_agg(item_id, n)
       from (select item_id, count(*) as n from public.roadmap_votes group by item_id) v),
      '{}'::json
    )
  );
$$;

revoke all on function public.venture_counts() from public;
grant execute on function public.venture_counts() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
-- Expect: rls_on = 4; insert_policies = 3 and no other policies on these
-- tables; anon_select_grants = 0; counts is a JSON object of numbers.

select
  (select count(*) from pg_tables
     where schemaname = 'public'
       and tablename in ('funnel_events', 'launch_list', 'roadmap_votes', 'count_exclusions')
       and rowsecurity) as rls_on,
  (select count(*) from pg_policies
     where schemaname = 'public'
       and tablename in ('funnel_events', 'launch_list', 'roadmap_votes')
       and cmd = 'INSERT') as insert_policies,
  (select count(*) from pg_policies
     where schemaname = 'public'
       and tablename in ('funnel_events', 'launch_list', 'roadmap_votes', 'count_exclusions')
       and cmd <> 'INSERT') as other_policies,
  (select count(*) from information_schema.role_table_grants
     where table_schema = 'public'
       and table_name in ('funnel_events', 'launch_list', 'roadmap_votes', 'count_exclusions')
       and grantee in ('anon', 'authenticated')
       and privilege_type = 'SELECT') as anon_select_grants,
  public.venture_counts() as counts;
