-- FreeFlow — Supabase schema + seed data
--
-- HOW TO RUN
--   1. Supabase dashboard → SQL Editor → New query
--   2. Paste this entire file
--   3. Run
--   4. Confirm rows under Table Editor → projects
--
-- Safe to re-run: it drops and recreates the table.

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

drop table if exists public.projects;

create table public.projects (
  id            uuid primary key default gen_random_uuid(),
  name          text        not null,
  client        text        not null,

  -- Constrained rather than free text so a typo can't produce a project the
  -- UI has no badge for. These four values match ProjectStatus in TypeScript.
  status        text        not null
                check (status in ('in_progress', 'awaiting_review',
                                  'invoice_sent', 'overdue')),

  deadline      date        not null,
  hours_logged  numeric(6,2)  not null default 0,
  hourly_rate   numeric(8,2)  not null default 0,

  -- Fixed-fee total. NULL means the project bills hourly and its value is
  -- hours_logged * hourly_rate. One nullable column supports both billing
  -- models without a second table.
  invoice_total numeric(10,2),

  is_paid       boolean     not null default false,
  paid_at       date,
  created_at    timestamptz not null default now(),

  -- A project cannot be paid without a payment date, or vice versa. Without
  -- this, "This Month's Earnings" could silently miss revenue.
  constraint paid_requires_date
    check ((is_paid = false and paid_at is null)
        or (is_paid = true  and paid_at is not null))
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
--
-- This sprint ships no authentication, so the browser holds the `anon` key and
-- every visitor queries as `anon`.
--
-- Both failure modes are bad and quiet:
--   * RLS disabled  → the table is publicly WRITABLE
--   * RLS enabled with no policy → every SELECT returns an empty array, the app
--     silently falls back to mock data, and it looks like it's working
--
-- So: RLS on, and exactly one read-only policy.

alter table public.projects enable row level security;

drop policy if exists "Public read access" on public.projects;

create policy "Public read access"
  on public.projects
  for select
  to anon, authenticated
  using (true);

-- No insert/update/delete policies exist, so writes are refused for anon.
-- Seeding below runs in the SQL editor as a privileged role, which bypasses RLS.

-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------
--
-- Deadlines are relative to CURRENT_DATE, not hardcoded, so the dashboard reads
-- correctly whenever it is opened or graded. Figures are tuned so the three
-- derived metrics land exactly on the values in the handoff spec:
--
--   Unpaid Invoices ......... $3,450   (invoiced, not yet paid)
--   This Month's Earnings ... $4,200   (collected this calendar month)
--   Active Projects ......... 5        (anything not yet invoiced)

insert into public.projects
  (name, client, status, deadline, hours_logged, hourly_rate,
   invoice_total, is_paid, paid_at)
values
  ('Website Redesign',      'TechSolutions',
   'in_progress',     current_date + 3,   64.5,  75.00, null, false, null),

  ('Mobile App Development', 'Nova Corp',
   'in_progress',     current_date + 12,  52.00, 120.00, null, false, null),

  ('API Integration',       'Vertex Labs',
   'in_progress',     current_date + 9,   26.00,  95.00, null, false, null),

  ('Logo & Style Guide',    'GreenTree',
   'awaiting_review', current_date + 21,  11.00, 100.00, null, false, null),

  -- 46 x $75 = $3,450 → the entire "Unpaid Invoices" figure
  ('Brand Identity Refresh', 'Solstice Inc',
   'overdue',         current_date - 2,   46.00,  75.00, null, false, null),

  -- Fixed fee: invoice_total ($4,200) deliberately differs from hours x rate
  -- ($3,735) so the precedence rule in projectValue() is actually exercised.
  -- greatest(...) keeps paid_at inside the current month even on the 1st-5th,
  -- which would otherwise zero out the earnings card.
  ('Marketing Site Launch', 'Halcyon Studio',
   'invoice_sent',    current_date - 14,  41.50,  90.00, 4200.00, true,
   greatest(current_date - 5, date_trunc('month', current_date)::date));

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
-- Expect: 6 rows, unpaid_invoices = 3450.00, month_earnings = 4200.00, active = 5

select
  count(*) as total_projects,

  coalesce(sum(coalesce(invoice_total, hours_logged * hourly_rate))
    filter (where not is_paid and status in ('invoice_sent', 'overdue')), 0)
      as unpaid_invoices,

  coalesce(sum(coalesce(invoice_total, hours_logged * hourly_rate))
    filter (where is_paid
              and date_trunc('month', paid_at) = date_trunc('month', current_date)), 0)
      as month_earnings,

  count(*) filter (where status <> 'invoice_sent') as active_projects
from public.projects;
