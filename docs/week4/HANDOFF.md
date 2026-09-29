# Week 4 Handoff — Marketing Engine + Content System

**Status: built, deployed, and verified live.** The `/marketing` page, both
routes, and the campaign generator are in production. This document is the state
of the module, what was decided, what is proven, and the short list only Brayden
can finish.

Live: <https://www.freeflow.website/marketing>

---

## What shipped this session

Four phases, each committed and pushed. Vercel deployed from `main`.

| Phase | Commit | What |
|---|---|---|
| Gate 1 | `1ae512f` | Build Discipline Packet (`docs/week4/PLAN.md`), before any code |
| 2 — Brand | `8a9a4e2` | Restored the monochrome palette, wrote `BRAND.md` |
| 3 — Content | `fb9c593` | `lib/marketing/` — persona, seed campaign, generators, validators, 22 tests |
| 4 — Build | `c78d594` | `/marketing` page, generate + save routes, `marketing_assets` table |

## Live verification (run yourself)

```
curl -s -o /dev/null -w "%{http_code}\n" https://www.freeflow.website/marketing
# → 200

curl -s -X POST https://www.freeflow.website/api/marketing/generate | head -c 200
# → {"provenance":"model", ... 10 posts, 3 scripts, 14 calendar days, 6 headlines}

curl -s -X POST -H "Content-Type: application/json" -d '{}' \
  -w "\n%{http_code}\n" https://www.freeflow.website/api/marketing/save
# → 401  (auth is checked before the body is read)
```

Confirmed on 2026-09-29: page 200, generate returns **model-generated** content
(the rotated production key is working), save returns 401 signed-out.

---

## The brand regression, found and fixed (Phase 2)

The interface was meant to be monochrome — two reviewed commits took it
white-on-black (`8545113`, `9e5ff31`). Two days later an unrelated feature
commit (`92ff738`, "Projects: edit and delete") carried a stale `globals.css`
that **silently reverted the palette to the old indigo-on-slate tokens**, and
reverted the `FreeFlow` comment header with it. So the live site was running
indigo by accident while every commit message said monochrome.

Phase 2 restored the intended tokens and made `app/globals.css` the documented
single source of truth (`docs/week4/BRAND.md`), so a feature commit cannot
quietly undo the brand again. The white-on-white button fix from the original
monochrome pass (`text-app` on filled buttons) survived the regression and was
verified in place before the white accent was restored — no new defect.

**Visual change to expect on the live site:** the whole app is now black-and-
white, with colour only on the four project-status indicators. If you preferred
the indigo, that is a one-line change in `globals.css` — but it should be a
decision recorded there, not a silent drift.

---

## Architecture (as built)

```
lib/marketing/
  types.ts      shared shapes + required counts (10 posts, 3 scripts, 14 days)
  persona.ts    the validated Week 2 interviewee — single persona source
  content.ts    SEED_CONTENT: the heuristic-fallback campaign
  generate.ts   PURE: buildCalendar, validateContentSet, contentSummary
  ab.ts         PURE: pickHeadlineWinner, headlineTests
  schema.ts     zod shape the model must return
  engine.ts     I/O: generateCampaign() → claude-opus-5, seed fallback
  saved.ts      read marketing_assets (empty list if unconfigured)
  ab-store.ts   useSyncExternalStore over localStorage for the A/B choice

app/marketing/page.tsx            server component, four bands
components/marketing/
  MarketingWorkbench.tsx          generate, copy, export, A/B tester
  ProvenanceBadge.tsx             model vs seed, on every card

app/api/marketing/generate/route.ts   always 200, provenance in the body
app/api/marketing/save/route.ts        auth first (401), re-validate, insert

supabase/marketing_assets.sql          per-user RLS, all four verbs, provenance
```

**The two disciplines carried from earlier weeks.** (1) Provenance: generated
content is labelled `model`, seed content `heuristic`, on every card — the same
rule `/core` uses. (2) Null-safety: no key → seed campaign, no database →
empty saved list, invalid model output → seed fallback. The page renders a
complete campaign in every degraded state, which is exactly what the tests
assert.

**Why the calendar is derived, not generated.** The model returns posts,
scripts and headlines; `buildCalendar` composes the 14-day schedule from them.
So a calendar slot can never reference an asset the model didn't write.

---

## Tests

`npm test` runs the full suite (all green). The marketing suite is
`npm run test:marketing` — 22 assertions:

| Plan id | Covered by |
|---|---|
| A/B 1 | choosing a winner returns it; winner belongs to the chosen test |
| A/B 2 | switching updates the winner; unknown id falls back, unknown test → null |
| SW 1 | seed campaign is complete and valid (counts, no empty fields, real refs) |
| SW 2 | empty/garbage input yields a valid 14-day skeleton, never a crash |
| SW 3 | save route requires a user — **verified live** (401 signed-out, above) |

SW 3 is an HTTP behaviour, so it is evidenced by the live curl rather than a
unit test, matching how the export-route auth was evidenced in Week 3.

---

## Acceptance criteria (from the packet)

All met except the two that are Brayden-only actions (marked ⧗).

C1 `/marketing` 200 ✓ · C2 homepage still upgraded ✓ · C3 persona rendered with
verbatim quote ✓ · C4 brand on page + in BRAND.md ✓ · C5 ten posts ✓ · C6 three
scripts ✓ · C7 fourteen calendar days ✓ · C8 provenance badge on every card ✓ ·
C9 copy button ✓ · C10 CSV export ✓ · C11 A/B winner persists ✓ · C12 saved asset
round-trips ⧗ (needs the migration run) · C13 degenerate input handled ✓ ·
C14 works with no database ✓

---

## What only Brayden can do

1. **Run the migration** so Save persists (C12). Supabase → SQL Editor → paste
   `supabase/marketing_assets.sql` → Run. Expect 0 rows and 4 policies. Until
   then the page is fully live and generates content; only the Save buttons
   return an error.
2. ~~Generate the UX mockup image~~ **Done** — `docs/week4/marketing-mockup.png`
   (source: `mockup.svg`). On-brand image of the page with the four rubric
   zones labelled. Paste it into the submission. Regenerate any time with
   `qlmanage -t -s 1600 -o docs/week4 docs/week4/mockup.svg`.
3. **Demo video** (2–3 min): open `/marketing`, click Generate live, copy a
   card, pick an A/B winner, show the 14-day calendar. This is also the only
   remaining Week 3 gap.
4. **Optional:** decide whether to keep the monochrome brand (see Phase 2 note).
   If you want indigo back, say so and it becomes a documented choice in
   `globals.css`, not a regression.

## Not built, on purpose (scope cuts)

Real publishing (Buffer/Mailchimp/X API), post-image generation, A/B analytics,
and a new visual identity — all in `PLAN.md` §5 with reasons. Net new
third-party dependencies this week: **zero** (seventh week running).

---

## Where this leaves the grade

- Live page requirement: **met** (`/marketing` 200) → the max-5/10 cap is cleared.
- Build Discipline Packet: **met** (`PLAN.md`, committed at Gate 1) → the
  max-6/10 cap is cleared.
- Remaining points hinge on the UX image and the demo video, both above.
