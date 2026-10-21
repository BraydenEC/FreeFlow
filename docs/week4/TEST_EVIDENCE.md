# Week 4 Test Evidence: Marketing Engine + Content System

**Required:** 2 A/B tests + 3 software tests. **Delivered:** 22 automated
assertions in the marketing suite, plus 6 checks against production.
**Last run:** 2026-10-07.

---

## The required five, mapped

| Plan id | Type | What it proves | Evidence | Result |
|---|---|---|---|---|
| **A/B 1** | A/B | The value-prop test records a chosen winner, and the winner belongs to that test | `npm run test:marketing` | ✅ PASS |
| **A/B 2** | A/B | The audience test switches winner correctly; an unknown id falls back to the first variant, and an unknown test returns null instead of a headline from the wrong test | `npm run test:marketing` | ✅ PASS |
| **SW 1** | Software | The campaign is complete and valid: 10 posts, 3 scripts, 14 calendar days, no empty fields, every calendar slot points at a real asset | `npm run test:marketing` | ✅ PASS |
| **SW 2** | Software | Degenerate input (empty, garbage, or a broken model response) yields a valid 14-day skeleton or is rejected with errors, never a crash | `npm run test:marketing` | ✅ PASS |
| **SW 3** | Software | The save route requires a signed-in user, and checks it *before* reading the body | Live `curl` against production | ✅ PASS (HTTP 401) |

SW 3 is HTTP behaviour, so it is evidenced against the live site rather than by
a unit test, the same way the export route's auth was evidenced in Week 3.

---

## Automated suite: raw output

```
$ npm run test:marketing

  PASS  seed content passes validation with no errors
  PASS  seed has at least 10 posts
  PASS  seed has at least 3 scripts
  PASS  calendar is exactly 14 days
  PASS  every calendar slot references a real asset
  PASS  no post has an empty field
  PASS  every script has hook, body and CTA
  PASS  seed content is labelled heuristic
  PASS  summary reports the content valid
  PASS  summary post count matches
  PASS  empty input still yields a 14-day calendar
  PASS  empty-input calendar days are 1..14 with no gaps
  PASS  a broken model set is rejected with errors
  PASS  broken set flags too few posts, missing scripts, empty fields and bad calendar
  PASS  a value-prop A/B pair exists
  PASS  choosing hl-a2 returns hl-a2 as winner
  PASS  winner belongs to the chosen test
  PASS  a second (audience) A/B pair exists
  PASS  initial audience winner is hl-b1
  PASS  switching updates the winner to hl-b2
  PASS  an unknown winner id falls back to the first variant, never null
  PASS  an unknown test returns null rather than a wrong-pair headline
────────────────────────────────────────────────────────────────
  22 passed, 0 failed
```

The tests import the same `lib/marketing/` functions the page renders. There is
no copy of the logic inside the test file.

**Whole project:** `npm test` runs 14 suites, **619 assertions, 0 failed**. That
includes `test:features`, which fails the build if a feature on the map links to
a route that does not exist (it covers `/marketing`), and `test:ratelimit`
(17 assertions) for the limiter added to the generate route in the security
pass.

---

## Production checks (2026-10-07)

| # | Check | Command | Result |
|---|---|---|---|
| P1 | `/marketing` loads (C1) | `curl -o /dev/null -w "%{http_code}" https://www.freeflow.website/marketing` | ✅ **200** |
| P2 | Homepage is the upgraded landing page signed out (C2) | `curl -s https://www.freeflow.website/` | ✅ 200, headline "Know what is coming, not just what you are owed." |
| P3 | Live generation works, labelled by provenance (C5–C8) | `curl -X POST https://www.freeflow.website/api/marketing/generate` | ✅ 200 in 38 s: `provenance: model`, 10 posts, 3 scripts, 14 calendar days, 6 headlines |
| P4 | Save refuses a signed-out user (SW 3) | `curl -X POST -d '{}' …/api/marketing/save` | ✅ **401** `Sign in to save.` |
| P5 | Auth is checked before validation | Same, with an invalid payload `{"kind":"nonsense"}` | ✅ **401**, not 400. The response does not reveal the expected payload shape |
| P6 | **Saved asset round-trips (C12)** | Signed in on `/marketing` → **Save** on the first post → full page reload | ✅ `POST /api/marketing/save` → **201**; after reload the post appears under "Saved to your account" |

P6 closes the one criterion the Week 4 handoff left open. It needed the
`marketing_assets` migration, which has since been run. A signed-out query of
the table with the public key returns `[]`: rows exist but are invisible to
anyone who does not own them.

---

## Acceptance criteria: final status

| # | Criterion | Result |
|---|---|---|
| C1 | `/marketing` loads in production | ✅ HTTP 200 |
| C2 | Homepage still upgraded | ✅ Landing page signed out |
| C3 | Persona rendered | ✅ Named, quoted verbatim |
| C4 | Brand system present | ✅ On the page and in `BRAND.md` |
| C5 | 10 social posts render | ✅ |
| C6 | 3 video scripts render | ✅ Each with hook, body and CTA |
| C7 | 14-day calendar renders | ✅ 14 slots, every one pointing at a real asset |
| C8 | Generated content is labelled | ✅ "AI-generated" or "seed copy" badge on every card |
| C9 | Copy button works | ✅ |
| C10 | Export works | ✅ `freeflow-marketing.csv`, formula-injection safe |
| C11 | A/B test records a winner | ✅ Persists across reloads; "Save winner" stores it to the account |
| C12 | Saved asset round-trips | ✅ Verified 2026-10-07 (P6) |
| C13 | Degenerate input handled | ✅ SW 2 |
| C14 | Works with no database | ✅ Page renders seed content; saved list is empty, not an error |

**14 of 14 met.**
