# Week 4 Coding-Agent Prompt Log

**Agent:** Claude Code · **Requirement:** minimum 5 · **Delivered:** 13 (7 verbatim, 6 reconstructed)

> ⚠️ **Before submitting, read this.** Prompts 7–13 are quoted verbatim from the
> session transcripts (2026-10-05 to 10-07 and 2026-10-21), typos included.
> Prompts 1–6 come from the 2026-09-28 to 09-30 sessions, whose chat history is
> not on this machine (checked in both Claude Code and Codex). Their wording is
> **reconstructed from what each commit records**. If you still have those
> chats, paste your exact words in place of the reconstructions. If not, keep
> the "reconstructed" label: presenting a reconstruction as a quotation would be
> the one dishonest line in the packet.

---

## Prompt 1: Plan before building (2026-09-28)
*Reconstructed.* Read the Week 4 brief and write the Build Discipline Packet in
the course's ten-part order. Commit it before any code.

**Result:** `docs/week4/PLAN.md`, commit `1ae512f`. It noted that half of Week 4
already existed (persona, landing copy, homepage), which narrowed the new work.
It also found that the brand in the code contradicted the commit history.

## Prompt 2: Make the brand true (2026-09-28)
*Reconstructed.* Resolve the palette: restore the intended monochrome brand and
document it as the source of truth.

**Result:** commit `8a9a4e2`. Monochrome tokens restored, `BRAND.md` written:
palette, type, logo, voice and reach.

## Prompt 3: The content engine, logic and tests first (2026-09-28)
*Reconstructed.* Build the pure marketing logic (persona, seed campaign,
calendar builder, validator, A/B chooser) with no React and no I/O, and write
the tests alongside it.

**Result:** commit `fb9c593`. `lib/marketing/` plus 22 passing tests.

## Prompt 4: The page, the routes and the table (2026-09-29)
*Reconstructed.* Build `/marketing` in four bands matching the plan. Add "Generate
live" through Claude with a seed fallback, copy and CSV export, the A/B tester,
a save route that checks auth first, and the `marketing_assets` table with
per-user security.

**Result:** commit `c78d594`, deployed. `/marketing` live with HTTP 200.

## Prompt 5: The UX mockup (2026-09-29)
*Reconstructed.* Produce the UX mockup from the course's image prompt, in the
FreeFlow brand, labelling the four required zones.

**Result:** commit `13a1e16`. `marketing-mockup.png` (source `mockup.svg`).

## Prompt 6: A security audit (2026-09-30)
*Reconstructed.* Audit the app against the "Security for Vibe-Coded Apps"
checklist, then fix what it finds. The decisions given: research and pricing
data is private per user, and rate limiting uses no new dependencies.

**Result:** commits `3951fe6`, `3f8c1ee`, `b50c2b8`. A rate limit on the
generate route, generic error messages, two tables made private, and a Next.js
CVE patch.

## Prompt 7: Catch up (2026-10-05) · *verbatim*
> Catch up where the project stands, there should be a handoff document or some
> update document, look for it until you understand the next steps of
> development. My last memory was that I was working on the app security.

**Result:** found the handoff and the security plan, identified the two
migrations still to run, and fixed the test loader, which broke on the new
folder's space in its path. All 619 assertions pass again.

## Prompt 8: Verify the migrations (2026-10-06) · *verbatim*
> I ran both of the prompts into supabase, please verify that they are both
> working

**Result:** checked the live database as a signed-out visitor: every private
table returned `[]`, and the policy list matched the migrations. Both applied.

## Prompt 9: Read the brief (2026-10-07) · *verbatim*
> Read the files in … Module 4

**Result:** checked the four course PDFs against the build. All nine features
were present; what was missing was paperwork (prompt log, iteration log,
implementation note, compiled packet).

## Prompt 10: Finish the packet (2026-10-07) · *verbatim*
> Go ahead with your plan, additionally write a draft for the human decision
> note, overview/outline of the video script, just say what was changed in
> module 4 and a list/steo by step guide on all of the screenshots. When done
> create a full submission document based on the 4 files you read

**Result:** tested Save on production (201, round trip confirmed, C12 closed) and
wrote this log, the iteration log, test evidence, decision note draft, video
outline, screenshot guide and the compiled submission document.

## Prompt 11: Match the earlier weeks (2026-10-21) · *verbatim*
> Please create a submission document for module 4 if there are none already.
> Please check other submission documents and copy format

**Result:** found the existing Week 4 document and compared it section by
section with Weeks 1–3. Same structure; the differences (heading style, two
extra sections) were reported rather than changed.

## Prompt 12: Audit against the brief (2026-10-21) · *verbatim*
> Make sure the submission document completes all requirements on module 4
> documents

**Result:** re-read the assignment, rubric, overview and macro-prompts, re-ran
the suite (619 passed) and the live checks. Added a requirements checklist, the
two A/B tests by name, the homepage note, and the deployment count (10).

## Prompt 13: Draft the note and this log (2026-10-21) · *verbatim*
> please create a draft of the decision note and prompt log, upload it to module
> 4 document

**Result:** searched the transcripts for the original prompts, added the four
missing verbatim ones, and rewrote the decision note draft. Both are in the
submission document.
