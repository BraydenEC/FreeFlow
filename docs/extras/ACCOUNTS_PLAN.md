# User Accounts, Per-User Data, and Saved Preferences

**Status:** extra work outside the module sequence. Plan → build → handoff.
**Decisions confirmed with Brayden on 2026-09-21:**

| Question | Decision |
|---|---|
| Which pages need an account | `/` and `/core`. `/research`, `/pricing`, `/product` stay public so graders can reach Week 2–3 evidence by link. |
| Existing seed rows | Move to Brayden's account. New users start empty. |
| Empty dashboard | Ship a "New project" form so an account has something to hold. |
| Sign-in method | Email + password. Email confirmation OFF (school project; documented). |
| New dependency | `@supabase/ssr` — the second dependency ever added. |
| Public Save buttons | Signed-in users only. Logged out, the button reads "Sign in to save". |
| Docs | This plan + handoff update. No rubric packet. |

## Diagnosis

Everything to date is single-tenant by construction: one anon key, one shared
`projects` table, preferences in the visitor's own browser. Three things stand
in the way of accounts, and none of them is "add a login page":

1. **RLS policies grant `anon` everything.** `using (true)` on every select and
   insert. Accounts mean `using (user_id = auth.uid())`, which means every
   table gains a `user_id` column and every write must carry it.
2. **The server reads as `anon`.** `getSupabaseClient()` builds one process-wide
   client with no session. Under per-user policies it would see nothing. Server
   reads must be made *as the signed-in user*, which requires the session cookie
   to reach the Supabase client on the server — that is what `@supabase/ssr`
   does and what the hand-rolled client cannot.
3. **Empty means mock.** `lib/projects.ts` falls back to the six demo projects
   when the query returns zero rows. That was correct when the only way to get
   zero rows was a broken database. With accounts, zero rows is the normal
   state of a new user, so "empty" and "unavailable" must be told apart.

## Principles carried forward

- **Hide, never delete.** Public pages keep every byte of content. Gating is a
  redirect in the proxy, not a change to the page.
- **The database is an upgrade, not a requirement.** With no Supabase
  credentials the app still builds, deploys, and shows mock data. The proxy
  lets everything through in that state, because there is no auth to check.
- **Validate on the server, always.** The new project form and the preferences
  sync both go through API routes that re-parse with zod. RLS is the second
  wall, not the first.
- **Corrupt input never crashes.** `parsePrefs` already repairs; the server
  copy of preferences goes through the same function on read and write.

## Build

### 1. Migration — `supabase/accounts.sql`
Idempotent. Run once *after* Brayden has signed up on the live site, so the
backfill has a user to point at.

- `user_id uuid references auth.users(id) on delete cascade` on `projects`,
  `core_outputs`, `research_records`, `pricing_scenarios`. Nullable: rows with
  no owner are legacy and invisible to everyone under the new policies (except
  public reads on research and pricing, which stay open by decision).
- Backfill every null `user_id` to the user whose email is Brayden's.
- New table `user_prefs (user_id pk, prefs jsonb, updated_at)`.
- Policies:
  - `projects`: select/insert/update/delete, `authenticated`, own rows only.
  - `core_outputs`: select/insert, own rows only.
  - `research_records`, `pricing_scenarios`: select public (unchanged);
    insert `authenticated` with `user_id = auth.uid()`. The `anon` insert
    policy is dropped.
  - `user_prefs`: select/insert/update, own row only.

### 2. Supabase clients — `lib/supabase/`
- `server.ts` — `getServerSupabase()`: cookie-aware, null-safe. Used by every
  Server Component and API route. Replaces the anon client for server reads.
- `browser.ts` — `getBrowserSupabase()`: for the auth forms and sign-out.
- `lib/supabase.ts` stays for the one place it is still right: nothing.
  It is removed once no caller remains.

### 3. Proxy — `proxy.ts`
Refreshes the session cookie on every request (the `@supabase/ssr` pattern).
Redirects unauthenticated `/` and `/core` → `/signup`. Redirects authenticated
`/signup` and `/login` → `/`. Does nothing when Supabase is not configured.

### 4. Auth pages — `app/(auth)/signup`, `app/(auth)/login`
One shared `AuthForm` client component. No sidebar; centred card. Sign-up
succeeds → `/`. Errors from Supabase are shown verbatim (they are already
user-facing strings).

### 5. Session in the tree — `SessionProvider`
Root layout reads the user once on the server and provides `{ id, email }` to
client components. The sidebar shows the email and a Sign out button when
signed in, a Sign in link when not.

### 6. Data reads scoped to the user
- `lib/projects.ts`: takes the server client; distinguishes *empty* (return
  `[]`, source `supabase`) from *unavailable* (mock, source `mock`).
- `lib/core/saved.ts`, `lib/research/saved.ts`, `lib/pricing/saved.ts`: server
  client. Research and pricing remain public reads.
- All four save routes: require a user (401 otherwise), stamp `user_id`.

### 7. New project — `POST /api/projects` + `NewProjectForm`
Fields: name, client, status, deadline, billing (hourly: hours × rate, or
fixed total). Zod schema in `lib/projects/schema.ts` mirrors the table CHECK
constraints. Form lives on the dashboard, collapsed behind "New project";
the projects table gets an empty state that opens it.

### 8. Preferences sync — `user_prefs` + `PUT /api/prefs`
- Signed out: localStorage, exactly as today.
- Signed in: the server row is the truth; localStorage is a cache.
  - Layout passes the row to `PrefsProvider` as `initial`, so the server renders
    the saved layout. **This removes the one-frame flash for signed-in users.**
  - No row yet → the current local prefs are pushed up once (migration of a
    pre-account visitor's choices).
  - Every change → debounced 600 ms → `PUT /api/prefs`. Server re-parses with
    `parsePrefs`, upserts.

### 9. Tests — `scripts/test-projects.ts`
New-project schema: hourly vs fixed exclusivity, deadline format, negative and
NaN numbers, status enum, length limits. Added to `npm test`.

## Not in this sprint
Editing or deleting projects; marking paid; password reset (Supabase's built-in
mailer is rate-limited to a few per hour and reset needs it); OAuth; account
deletion. Each is a form or a Supabase setting away, none blocks the goal.

## Actions only Brayden can take
1. Supabase → Authentication → Providers → Email → turn **Confirm email** off.
2. Open the live site, sign up with `braydencredeur@gmail.com`.
3. Supabase → SQL Editor → run `supabase/accounts.sql`. The verify query at the
   bottom reports how many rows moved to the account.

---

## Build record — 2026-09-22

Built as planned. Deviations and findings, in the order they surfaced.

### The empty-vs-broken distinction was the real change

`lib/projects.ts` treated zero rows as a failure and substituted mock data.
That was right for three weeks: with a public read policy and seeded rows, the
only way to get zero was a broken database. With accounts it is the first thing
every new user sees, and answering it with six fictional projects would be a
lie told on the most important screen. Zero rows now returns an empty list with
`source = "supabase"`. Mock data survives for the two cases that are still
genuinely broken: no credentials, and a query that errored.

### Auth before validation

The research and pricing save routes parsed and validated the body before
touching Supabase, so the auth guard first landed after validation and a
logged-out POST returned `400` describing which fields were wrong. The refusal
was correct and the status was not — and it volunteered the payload shape to
anyone who asked. Auth is now the first statement in all five write handlers.
Verified: every one returns `401` with no session.

### The old client was deleted, not deprecated

`lib/supabase.ts` built one process-wide client with `persistSession: false`.
Under per-user RLS that client sees nothing, so every call site had to move to
the request-scoped `getServerSupabase()`. Leaving the old module in place would
have left a working import that silently returns empty results — the worst kind
of survivor. It is gone, and nothing references it.

### Email confirmation is ON — and is staying on

Probed directly against the live project: a sign-up returns a user row and no
session, which means Supabase requires inbox confirmation.

I recommended turning it off. Brayden decided to keep it, so it is now a
supported path rather than a tolerated one: `/auth/confirm` receives the link
server-side, `/verify-email` is a waiting room with a resend button, and an
expired link reports itself. See the 2026-09-22 addendum below.

The remaining constraint is the mailer, not the code. Supabase's built-in SMTP
sends two messages per hour for the entire project — a testing convenience, not
a delivery service — and Brayden hit that limit on his first real sign-up
attempt. My own diagnostic sign-up had consumed one of the two. That probe
answered the question, and it should have been answered by watching his sign-up
instead of spending a send.

Custom SMTP removes the limit. That is a configuration step, written up in
docs/ACTION_ITEMS.md.

### Superseded note: email confirmation

Probed directly against the live project: a sign-up returns a user row and no
session, which means Supabase is still set to require inbox confirmation. The
app handles it — the form says "Check your inbox to confirm your email, then
sign in" rather than appearing to hang — but the intended flow needs the
setting off. This is action 1 below and it blocks end-to-end verification of
every signed-in path.

One test user (`servicepro.smoketest@outlook.com`) was created by that probe
and should be deleted: Supabase → Authentication → Users.

### What is verified, and what is not

Verified locally against the live database:

| Check | Result |
|---|---|
| `/` and `/core` with no session | `307` → `/signup` |
| `/research`, `/pricing`, `/product`, `/signup`, `/login` | `200` |
| All five write endpoints with no session | `401` |
| `/research?tab=risks` unsourced badges | 11, unchanged |
| `/pricing` `$14` occurrences | 31, unchanged |
| Test suites | 100 passing (27 + 17 + 21 + 35) |
| Lint, types, build | clean |

Not verified, because it requires a confirmed account: sign-in, the per-user
dashboard, creating a project, and preferences syncing to `user_prefs`. Each
is reachable the moment action 1 is done.

### Tests

`scripts/test-projects.ts`, 35 assertions on the new-project schema: billing
model exclusivity, pasted currency strings, negative and non-numeric input,
the `numeric(8,2)` ceiling, all four statuses and one outside them, four bad
date formats, and three malformed bodies. `npm test` now runs four suites.

## Actions only Brayden can take

1. **Supabase → Authentication → Providers → Email → turn "Confirm email" OFF.**
   Everything below waits on this.
2. **Delete the test user** `servicepro.smoketest@outlook.com` under
   Authentication → Users.
3. **Sign up on the live site** with `braydencredeur@gmail.com`.
4. **Run `supabase/accounts.sql`** in the SQL Editor. The verify query reports
   `moved_projects` — expect 6 — and `orphan_*` counts, which should all be 0.

Between steps 3 and 4 the account exists but owns nothing and cannot insert,
because the per-user policies do not exist yet. That window is a few minutes
and resolves itself the moment the migration runs.
