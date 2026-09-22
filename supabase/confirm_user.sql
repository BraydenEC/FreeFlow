-- ServicePro — manually confirm an account
--
-- HOW TO RUN
--   Supabase → SQL Editor → New query → paste this file → Run
--
-- WHY THIS EXISTS
-- Email confirmation is on by design, but the outbound mailer was not
-- delivering while it was being set up, which left the owner's own account
-- unconfirmed and locked out of the app it belongs to. The Users table UI
-- has no "confirm" action in this Supabase version.
--
-- The SQL Editor runs as a privileged role that can write to auth.users
-- directly, so confirmation can be granted without an email round trip. This
-- is an owner-only escape hatch, not part of the sign-up flow: every other
-- account still has to click a link.
--
-- Note: auth.users.confirmed_at is a GENERATED column — it derives from
-- email_confirmed_at and phone_confirmed_at, and writing to it directly
-- errors. Setting email_confirmed_at is enough; confirmed_at follows.

update auth.users
   set email_confirmed_at = coalesce(email_confirmed_at, now()),
       updated_at         = now()
 where email = 'braydencredeur@gmail.com';

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
-- Expect one row with a timestamp in both columns.

select email,
       email_confirmed_at,
       confirmed_at,
       created_at
  from auth.users
 where email = 'braydencredeur@gmail.com';
