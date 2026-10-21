# Week 4 Iteration Log: what changed after planning and testing

Eight entries, in the order they happened. Each one changed the code, the plan,
or how a result was checked.

---

## 1. Writing the plan found a brand that wasn't true (2026-09-28)

**Found:** while writing the Build Discipline Packet, before any code. Two
reviewed commits had taken the interface monochrome. An unrelated later commit
("Projects: edit and delete") carried a stale `globals.css` that silently put
back the old indigo-on-slate colours. The live site was indigo while every commit
message said monochrome.

**Changed:** restored the monochrome tokens, and wrote `BRAND.md` naming
`app/globals.css` as the single source of truth, so a feature commit cannot
quietly undo the brand again. A marketing page that points at a brand system
needs that system to be true first.

## 2. The calendar is derived, not generated

**Decision:** the model writes posts, scripts and headlines; the 14-day calendar
is assembled from them in code (`buildCalendar`). A generated calendar could
schedule a post that does not exist.

**Enforced:** `validateContentSet` rejects any calendar slot that points at a
missing asset, and a test proves it.

## 3. Model output is checked, not trusted

**Decision:** the generate route asks Claude for a structured campaign, then runs
the same validator over it. Too few posts, an empty field, or a dangling
calendar reference is rejected, and the page falls back to the seed campaign,
labelled "seed copy". The page shows a complete campaign in every failure mode.

## 4. The mockup diverged from the plan

**Plan said:** the UX image would be made by Brayden with an image generator,
from the course prompt.

**What happened:** the mockup was drawn as an SVG in the product's real brand and
exported to PNG (`marketing-mockup.png`). A generic AI-styled image would not
have matched the monochrome system the week had just restored. It still covers
the four zones the course prompt asks for: input, AI output, saved results and
testing evidence.

## 5. The live page diverged from the mockup

The mockup puts the 14-day calendar beside the saved results and shows a
software-test checklist on the page. The build gives the calendar its own band,
because 14 slots were cramped beside a list. The software-test checklist stays
in the test evidence rather than on a public page, since it means nothing to a
visitor. The two A/B tests remain on the page as working tools.

## 6. A security pass on what Week 4 added (2026-09-30)

An audit against a security checklist for AI-built apps found four issues. Two
touched Week 4 directly:

- **`/api/marketing/generate` is public and calls a paid API**, so anyone could
  loop it and run up the bill. Fixed with a zero-dependency rate limiter
  (`lib/ratelimit.ts`, 17 tests).
- **The save route returned raw database errors** to the browser. It now logs
  the real cause on the server and returns a generic message.

The same pass made two older tables private per user, and patched known CVEs by
upgrading Next.js to 16.3.8. Built, tested, committed and redeployed.

## 7. The migration was applied and the round trip verified (2026-10-07)

The Week 4 handoff left C12 ("saved asset round-trips") open, waiting on the
`marketing_assets` migration. It has been run. Verified signed in on production:
Save returned **201**, and the post appeared under "Saved to your account" after
a reload. Verified signed out: the table returns nothing to the public key.

## 8. Twice, the check was wrong and the code was right

**The test harness.** Running the suite from a new folder whose path contains a
space ("App Dev"), the marketing tests failed to load. The test loader read
file paths without decoding `%20`. The fix was two lines in
`scripts/alias-loader.mjs`; the application code was fine.

**The Save check.** The first reload after saving still showed "Nothing saved
yet". The "reload" had only added `#band-saved` to the same URL, which scrolls
the page without fetching it again. A real reload showed the saved post.

This project's standing rule, now on its ninth instance: **when a check
disagrees with the code, the check is a suspect too.**
