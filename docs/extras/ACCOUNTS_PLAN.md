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
