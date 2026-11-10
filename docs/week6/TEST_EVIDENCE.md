# Week 6 Test Evidence

## 1. Full-site regression, before deploy #1 (2026-11-10)

Run on branch `week6` after the final review's fixes (commit `0c6a3f2` and later):

| Command | Result |
|---|---|
| `rm -rf .next && npm test` | 21 suites, 1,761 passed, 0 failed |
| `npm run lint` | exit 0 |
| `npm run build` | exit 0 (`/demo` static; `/dashboard`, `/docs` dynamic) |
| `npx tsc --noEmit` | exit 0 |

A fresh whole-branch code review ran before release: 0 critical, 4 important (all
fixed, each with a test that failed first), 12 minor. Three minors were re-graded
by their effect on visitors and fixed; the rest are logged for later.

## 2. Database migration (2026-11-10)

`supabase/week6_venture.sql`, run in the Supabase SQL Editor. Verify block:

| rls_on | insert_policies | other_policies | anon_select_grants | counts |
|---|---|---|---|---|
| 4 | 3 | 0 | 0 | `{"users":2,"launchList":0,"tryFreeClicks":0,"roundsPlayed":0,"votes":{}}` |

## 3. Deploy #1 (2026-11-10)

`main` fast-forwarded `497e7ab..9cdc45d` and pushed; Vercel served the new pages about
40 seconds later.

## 4. Live checks on https://www.freeflow.website (signed out)

| Check | Result |
|---|---|
| `/`, `/demo`, `/dashboard`, `/docs`, `/research`, `/product`, `/pricing`, `/marketing`, `/support`, `/chat`, `/login`, `/signup` | 200 |
| `/core` signed out | 307 to sign-up (gated, as before) |
| `/demo` and `/` canonical | both `https://www.freeflow.website/demo` |
| `/dashboard` public tab | live counts render (users, launch list, rounds, clicks), "Things you asked for, shipped: 4" |
| Roadmap vote via `/api/roadmap/vote` | `{"saved":true}`; same voter again `{"saved":true,"already":true}`; unknown item 400 |
| Try-free click via `/api/funnel` | `{"saved":true}` |
| Counts rise | `/dashboard` "Try free" clicks 0 → 1; `/docs` "A simpler forecast" 0 → 1 vote |

## 5. Still to check

- Signed in, with a grader account: `/` goes to `/dashboard`, "Your work" unchanged, both tabs.
- Every page at 375 px in a real browser, with screenshots in `docs/week6/screenshots/`.
- One real launch-list sign-up from the page (by the owner, with his own address).
- The Dock on each page.
