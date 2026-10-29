-- FreeFlow /chat — Week 5 schema
--
-- HOW TO RUN
--   Supabase dashboard → SQL Editor → New query → paste → Run
--   Safe to re-run, and unlike the earlier week files it NEVER drops the
--   table: these rows are open support tickets and the evidence for the
--   external user tests. Re-running only (re)creates what is missing and
--   replaces the policies. Later schema changes ship as new, additive files.
--
-- One row per help conversation. Every conversation leaves a summary
-- (category, area, rules fired, ratings, outcome); the full transcript is kept
-- only when it matters (a ticket, a thumbs-down, a no-match or a guardrail).
-- Rows are written by POST /api/chat/session, which replays the user's
-- messages through the rule engine rather than trusting the browser.
--
-- TICKETS
--   ticket_status is null for an ordinary conversation, 'open' once the user
--   files a ticket, and 'resolved' when the owner sets it in the Table Editor.
--   A user can open a ticket but can never resolve one, and can never write
--   to a conversation once it has a ticket — enforced below by the policies,
--   not only by the route. The owner's dashboard bypasses RLS.

create table if not exists public.chat_sessions (
  id             uuid primary key,

  user_id        uuid not null references auth.users(id) on delete cascade,
  -- Where the owner replies. Must be the signed-in user's own address (see the
  -- insert/update policies), so a ticket cannot name someone else.
  user_email     text,

  category       text not null
                 check (category in ('broken', 'how_to', 'pricing_technical', 'feedback')),
  area           text not null
                 check (area in ('dashboard', 'forecast', 'projects', 'brief', 'research',
                                 'pricing', 'marketing', 'account', 'other')),
  first_message  text not null check (char_length(first_message) <= 2000),

  rules_fired    text[] not null default '{}',
  ratings        jsonb  not null default '[]',
  outcome        text   not null
                 check (outcome in ('answered', 'no_match', 'guardrail', 'ticket')),
  transcript     jsonb,

  ticket_status  text check (ticket_status in ('open', 'resolved')),

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists chat_sessions_user_idx
  on public.chat_sessions (user_id, created_at desc);

-- The owner's working list: open tickets first.
create index if not exists chat_sessions_ticket_idx
  on public.chat_sessions (ticket_status, created_at desc)
  where ticket_status is not null;

-- ---------------------------------------------------------------------------
-- Row Level Security — own rows only; filed tickets are frozen for the user
-- ---------------------------------------------------------------------------
-- (select auth.uid()) is evaluated once per statement rather than per row.

alter table public.chat_sessions enable row level security;

drop policy if exists "Own rows: select" on public.chat_sessions;
create policy "Own rows: select" on public.chat_sessions
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Own rows: insert" on public.chat_sessions;
create policy "Own rows: insert" on public.chat_sessions
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (ticket_status is null or ticket_status = 'open')
    and (user_email is null or user_email = (select auth.jwt() ->> 'email'))
  );

drop policy if exists "Own rows: update" on public.chat_sessions;
create policy "Own rows: update" on public.chat_sessions
  for update to authenticated
  using (user_id = (select auth.uid()) and ticket_status is null)
  with check (
    user_id = (select auth.uid())
    and (ticket_status is null or ticket_status = 'open')
    and (user_email is null or user_email = (select auth.jwt() ->> 'email'))
  );

drop policy if exists "Own rows: delete" on public.chat_sessions;
create policy "Own rows: delete" on public.chat_sessions
  for delete to authenticated
  using (user_id = (select auth.uid()) and ticket_status is null);

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
-- Expect exactly 4 policies (DELETE, INSERT, SELECT, UPDATE). row_count is
-- whatever is already there; it is never reset by re-running this file.

select
  (select count(*) from public.chat_sessions) as row_count,
  (select count(*) from pg_policies
     where schemaname = 'public' and tablename = 'chat_sessions') as policy_count,
  (select string_agg(cmd, ', ' order by cmd) from pg_policies
     where schemaname = 'public' and tablename = 'chat_sessions') as commands;
