# FreeFlow — Security Action Plan

**Purpose.** An action plan derived from the "Security for Vibe-Coded Apps"
audit doc, mapped onto FreeFlow's actual codebase. This is a **plan**, not the
executed audit — it records what a fast code-side reconnaissance already found,
what still needs live (database-side) verification, and a prioritized order to
fix things. When you say go, the full section-by-section audit + fixes run from
here.

Reconnaissance date: 2026-09-30 (code only; the live Supabase project was not
inspected yet).

---

## STATUS UPDATE — 2026-09-30 (decisions made, fixes shipped)

Both open decisions were made:
1. `research_records` / `pricing_scenarios` → **private per user** (this data is
   personal and users should not be able to read each other's).
2. Rate limiting → **zero-dependency in-memory limiter** (fits the no-new-deps
   principle), plus **require auth on `/api/core/extract`** since its page is
   already private. Upstash remains the documented upgrade path.

All four code-side findings are now **fixed, committed, and pushed**:

| Finding | Status |
|---|---|
| F1 — public-read tables | ✅ Migration written (`supabase/private_research_pricing.sql`) — **run it in Supabase to apply** |
| F2 — no rate limiting | ✅ `lib/ratelimit.ts` + applied to all three paid routes; `/api/core/extract` now also 401s when signed out (17 tests) |
| F3 — outdated deps / CVEs | ✅ Next → 16.3.8, sharp + dev tooling patched; `npm audit` = **0 vulnerabilities** |
| F4 — raw error leaks | ✅ All save/update/delete routes log server-side, return a generic message |

**One action left for you:** run `supabase/private_research_pricing.sql` in the
Supabase SQL editor (same as the marketing migration). Until then, those two
tables stay world-readable in the live DB even though the fix is in the repo.

The "needs live verification" items below (RLS enabled on every live table,
service_role isolation, SECURITY DEFINER functions) still stand — they can only
be checked in the dashboard.

---

## Architecture snapshot (what we're auditing)

- **Framework:** Next.js 16 (App Router, route handlers, `proxy.ts` middleware).
- **DB / auth:** Supabase Postgres + `@supabase/ssr`, cookie sessions, RLS.
- **Model:** Anthropic SDK, server-side only, heuristic fallback.
- **Payments:** Stripe *payment link* (a public URL) — no secret key, no webhook.
- **Deps:** 7 runtime (`@anthropic-ai/sdk`, `@supabase/ssr`,
  `@supabase/supabase-js`, `next`, `react`, `react-dom`, `zod`). Minimal surface.
- **Entry points:** pages (`/`, `/core`, `/research`, `/pricing`, `/marketing`,
  `/product`, `/support`, auth pages); API routes under `/api/*`; the `proxy.ts`
  middleware; no cron jobs, no webhooks, no file uploads.

---

## Preliminary posture: 🟡 ACCEPTABLE (with two things to fix before it's 🟢)

The app already does most of the hard things right — this is well above the
vibe-coded baseline the doc describes. The rating is held back by two real,
fixable gaps (public-read on two tables; no rate limiting on paid-API routes)
and one hygiene item (an outdated Next.js with patched CVEs). None is an *active*
data-exposure of personal data today, but the first two are the kind that bite
as usage grows.

---

## Confirmed findings (from the code — high confidence)

### F1 — Public read on `research_records` and `pricing_scenarios` · MEDIUM
`supabase/accounts.sql:109` and `:116` keep `"Public read access" ... to anon
using (true)` on these two tables. Anyone holding the (public) anon key can
`SELECT *` every row across all users. The `accounts.sql` migration deliberately
hardened `projects`, `core_outputs`, `user_prefs`, and `marketing_assets` to
`user_id = auth.uid()` but left these two open.
- **Decision needed:** is this data meant to be public (shared benchmarks) or
  per-user? If per-user, fix to `auth.uid()` like the others.
- **Fix effort:** ~10 min (one migration mirroring the per-user policy shape).
- CWE-284 (Improper Access Control) / the RLS class the doc calls out.

### F2 — No rate limiting on paid-API routes · MEDIUM (cost-DoS)
`/api/core/extract`, `/api/research/extract`, and `/api/marketing/generate` call
Anthropic and are **unauthenticated by design** (public tools). No rate limit →
someone can loop the endpoint and run up the Anthropic bill. No rate-limit
library is installed.
- **Tension:** this collides with the project's zero-new-deps principle
  (`@upstash/ratelimit` would be dep #8). Options, cheapest first:
  1. **Require a session** on the generate/extract routes (turns anonymous abuse
     into per-account abuse; zero deps). 
  2. **In-memory limiter** (per-instance, resets on deploy — weak but nonzero).
  3. **Add `@upstash/ratelimit` + Upstash Redis** (the doc's recommendation;
     robust, but a new dep + a new service).
- **Fix effort:** option 1 ~15 min; option 3 ~45 min + account setup.
- CWE-770 (Allocation of Resources Without Limits).

### F3 — Outdated Next.js with patched CVEs · HIGH (hygiene) 
`npm audit`: 4 vulns (3 high, 1 critical) — Next.js RCE advisories fixed in
16.3.8, plus `sharp < 0.35.4` (libheif). Current is below 16.3.8.
- **Reality check:** most of the Next advisories are Windows-host / AVIF image
  optimization / `next/og` specific; FreeFlow deploys on Vercel (Linux) and uses
  none of `next/og`. Real-world exploitability here is low — but it's a known-CVE
  framework version, which is exactly checklist item 5.4, and the fix is a patch
  bump.
- **Fix effort:** ~15 min (`npm audit fix`, bump Next to 16.3.8, re-run
  build + full test suite; AGENTS.md warns this Next line has breaking changes,
  so verify the build, don't assume).
- CWE-1035 (Using Components with Known Vulnerabilities).

### F4 — DB error messages returned to client · LOW
Save routes return `Could not save: ${error.message}` (raw Postgres error) with
a 500 (e.g. `app/api/marketing/save/route.ts`, `core/save`). Minor internal-detail
leak (checklist 4.5). Fix: log server-side, return a generic message.
- **Fix effort:** ~10 min across the save routes.

---

## Already done right (do NOT break these)

- **Secrets:** only `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY` and
  `NEXT_PUBLIC_DONATE_URL` are public-prefixed — all public by design.
  `ANTHROPIC_API_KEY` is server-only (`lib/*/extract.ts`, `engine.ts`). ✓ (1.3)
- **No secrets in git:** `.gitignore` covers `.env*`; only `.env.example`
  (names only) is tracked. ✓ (1.2)
- **Lockfile committed** (`package-lock.json`). ✓ (5.3)
- **No hallucinated / unused deps** — 7 well-known packages, all imported. ✓ (5.2, 5.5)
- **Validated auth:** `getSessionUser` uses `supabase.auth.getUser()` (validates
  the JWT), not `getSession()`. ✓ (3.3)
- **Middleware exists** (`proxy.ts`) and redirects unauthenticated visitors off
  private routes to `/signup`. ✓ (3.1)
- **Server-side validation:** save routes parse the body with zod *after* an
  auth check, and derive identity from `user.id`, never the body. ✓ (4.1, 4.2)
- **No XSS sinks:** no `dangerouslySetInnerHTML` / `innerHTML` anywhere. ✓ (4.3)
- **Per-user RLS** on `projects`, `core_outputs`, `user_prefs`,
  `marketing_assets` — all four verbs scoped to `auth.uid()` with `WITH CHECK`. ✓ (2.3, 2.4)
- **No webhooks / no file uploads / no Supabase Storage** → whole classes of
  risk (4.6, 8.x, 2.6) are N/A.

---

## Needs live verification (can't be confirmed from code alone)

These require looking at the Supabase dashboard / running SQL, so they're marked
to-check, not passed:

- **2.1 RLS actually enabled on every live table** — the migration files say so,
  but a table created ad-hoc in the SQL editor could have been missed. Verify in
  Supabase → Database → Tables (RLS column) or `pg_tables`/`pg_policies`.
- **2.5 service_role key isolation** — confirm `SUPABASE_SERVICE_ROLE_KEY` is not
  set anywhere client-side and not used in any route (recon found no usage — good
  sign — but confirm it isn't lurking in Vercel env or a script).
- **2.8 SECURITY DEFINER functions** — the `confirm_user.sql` migration may
  create a function; check it isn't over-privileged.
- **3.2 default-deny vs allowlist** in `proxy.ts` — read the matcher + logic to
  confirm a *new* private route is protected by default rather than by omission.
- **1.6 startup validation** — env helpers currently return `null` and degrade
  gracefully by design; decide whether that's the intended posture for prod.

---

## Prioritized remediation plan

| # | Finding | Severity | Effort | Notes |
|---|---|---|---|---|
| 1 | F1 — public-read tables | MEDIUM | ~10 min | Needs your call: public or per-user? |
| 2 | F3 — bump Next + `sharp` | HIGH (hygiene) | ~15 min | Patch bump; re-run build + tests |
| 3 | F2 — rate limit paid routes | MEDIUM | 15–45 min | Pick option 1/2/3 (dep tension) |
| 4 | F4 — generic error messages | LOW | ~10 min | Quick win |
| 5 | Live DB verification pass | — | ~20 min | Dashboard + `pg_policies` query |

**Quick wins (< 10 min each):** F4, and F1 if the answer is "per-user."

---

## Checklist coverage map (current best guess)

```
§1 Secrets     1.1 ✅  1.2 ✅  1.3 ✅  1.4 ⚠(verify console leaks)  1.5 ⚠  1.6 ⚠
§2 Database    2.1 ⚠(live)  2.2 ✅  2.3 ✅  2.4 ✅  2.5 ⚠(live)  2.6 ⬚  2.7 ⚠  2.8 ⚠(live)
§3 Auth        3.1 ✅  3.2 ⚠  3.3 ✅  3.4 ⚠  3.5 ✅(ssr cookies)  3.6 ⚠  3.7 ⬚  3.8 ⚠
§4 Validation  4.1 ✅  4.2 ✅  4.3 ✅  4.4 ⚠  4.5 ❌(F4)  4.6 ⬚
§5 Deps        5.1 ❌(F3)  5.2 ✅  5.3 ✅  5.4 ❌(F3)  5.5 ✅
§6 Rate limit  6.1 ❌(F2)  6.2 ⚠(Supabase built-in)  6.3 ⬚
§7 CORS        7.1 ⚠  7.2 ⬚
§8 Uploads     8.1 ⬚  8.2 ⬚  8.3 ⬚   (no uploads)
```
`✅ pass  ❌ fail  ⚠ verify/partial  ⬚ N/A` — the `⚠` items resolve once the
full audit runs (code re-read + live DB check).

---

## Recommended next step

Two decisions unblock everything:
1. **Are `research_records` / `pricing_scenarios` meant to be publicly readable?**
   (If not, F1 becomes a 10-minute migration.)
2. **Which rate-limit approach** for F2 — require-auth (zero deps), in-memory, or
   Upstash?

Once you answer those, the fixes run in the priority order above, each committed
and verified (build + tests) the same way every prior change has been.
