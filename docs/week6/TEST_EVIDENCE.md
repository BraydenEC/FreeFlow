# Week 6 Test Evidence

## 1. Full-site regression, before deploy #1 (2026-11-10)

Run on branch `week6` after the final review's fixes (commit `91cb087`):

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

## 5. Live checks signed in (owner's own account, 2026-11-10)

| Check | Result |
|---|---|
| `/` signed in | redirects to `/dashboard` |
| `/login` signed in | redirects to `/dashboard` |
| `/dashboard` | "Your work" selected by default; all six widgets render from Supabase (`data-source="supabase"`); sidebar Overview / Projects / Core / Research; "FreeFlow in public" tab present |
| `/demo` signed in | loads (not gated) |
| Every page at 375 px (`/demo`, `/dashboard` both tabs, `/docs`, `/core`, `/research`, `/product`, `/pricing`, `/marketing`, `/support`, `/chat`) | document width 375, no element wider than the screen outside a scroll area; the Dock present on each |

No screenshots were kept from the owner's account: it holds real client data.

## 6. New /demo front page, local checks (2026-11-12, `npm run dev`, Chrome)

| Check | Result |
|---|---|
| `npm test` / lint / build / `tsc --noEmit` | 21 suites, 1796 passed, 0 failed / 0 / 0 / 0 |
| /demo first screen | neutral "I'M A *freelancer*", worries drift under the headline, no console errors |
| Job word | opens "What do you do?" with six swatches; video editor re-colours the page and swaps the worries |
| Sort by scroll | 9 ✓ rows with each worry's status; "on your mind" ends at 0 |
| NOW IT ALL flows. | pins; "flows." fills with the accent colour |
| Story, band | slash line draws under the story, "— Brayden", P.S.; START FREE band, launch list under it |
| 375 px (/demo in a 375 px frame) | document width 373 = viewport, no sideways scroll; 9 rows fit with status lines |
| Keyboard | Enter opens the picker, Escape closes it and returns focus; "Sort it for me" shows on focus and sorts to 0 |
| Signed-out `/` | renders the same page |
| Game | still plays with the picked job's projects |
| Reduced motion | covered by source checks only (not emulated in the browser) |

## 7. Still to check

- One real launch-list sign-up from the page (by the owner, with his own address).
- Submission screenshots, taken on a grader account rather than the owner's.
