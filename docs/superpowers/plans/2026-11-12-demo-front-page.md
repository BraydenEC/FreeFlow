# /demo Front Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace /demo's first chapter, picker, story styling and morning button with the approved
front page (worry field hero, contour background, neutral start + six-swatch job word, pinned
"NOW IT ALL flows.", slash-line story, START FREE band), keeping walkthrough, proof, game, launch
list and footer unchanged.

**Architecture:** Pure logic (choices, field layout, counter) in `lib/funnel/*.ts`, tested by the
plain-node `npm run test:funnel`; client components in `components/funnel/`; source-level checks
in `scripts/test-ui-source.ts`. GSAP ScrollTrigger + Lenis are created once in `DemoFunnel` and
skipped under reduced motion.

**Tech Stack:** Next.js 16.3 (App Router), React 19.2, Tailwind 4, `gsap@3.15.0`, `lenis@1.3.27`
(exact pins; both ≥2 weeks old), `next/font/google` Instrument Serif.

**Spec:** `docs/superpowers/specs/2026-11-12-demo-front-page-design.md` (approved 2026-11-12; story
keeps the full approved text). Visual reference: `.superpowers/brainstorm/16102-1794513876/content/front-page-design.html`.

## Global Constraints

- No price anywhere (`PRICE_PATTERN` test covers funnel content).
- Funnel events only carry `designer|photographer|video-editor|writer|developer` or no job.
- Works with no database, no AI key; tracking stays fire-and-forget.
- Reduced motion: no drift, no Lenis, sorted list shown, contours calm and still, story line drawn, "flows." filled.
- No new rounded buttons in new parts; 375 px wide: no horizontal page scroll (use `overflow-x: clip`, never `hidden`).
- Session storage reads/writes wrapped in try/catch.

## Review Focus

1. Touch drag on the field must not block page scroll (canvas `pointer-events: none`, listen on window).
2. Switching job mid-sort resets the field and counter; the job word never wraps away from its comma.
3. Keyboard: job word opens/closes (Enter, Escape returns focus), swatches named, "Sort it for me" reachable and sorts fully.
4. Counter ends at exactly 0 when the sort space is fully scrolled (`counterFor(0.98) === 0`).
5. Canvas/rAF stop when the field has faded or the tab is hidden, and everything is torn down on unmount (/ → /dashboard navigation).

---

### Task 1: Choices, neutral worries, accents

**Files:** Create `lib/funnel/choice.ts`; modify `lib/funnel/jobs.ts`, `app/globals.css`, `lib/funnel/copy.ts`; test `scripts/test-funnel.ts`.

**Interfaces — Produces:**
- `type Choice = "freelancer" | JobId | "brayden"`; `CHOICE_ORDER: Exclude<Choice,"freelancer">[]` = five jobs then `"brayden"`; `DEFAULT_CHOICE: Choice = "freelancer"`.
- `isChoice(v: unknown): v is Choice`
- `jobForChoice(c): JobId | null` (freelancer→null, brayden→"video-editor")
- `contentJob(c): JobId` (freelancer→`DEFAULT_JOB`)
- `choiceWord(c): string` ("freelancer" | job label; brayden→"video editor")
- `choicePrefix(c): string` ("I'm a " for freelancer, "I'm a freelance " otherwise)
- `choiceName(c): string` swatch name ("Brayden's own" for brayden, else job label)
- `choiceAccentVar(c): string` (`--color-job-neutral`, `--color-job-brayden`, or the job's)
- `worriesFor(c): Worry[]` (freelancer→`NEUTRAL_WORRIES`, brayden→video editor's)
- jobs.ts: `NEUTRAL_WORRIES: Worry[]` = designer deposit, iva, invoice-9, contract, new-client; video-editor december, export-98; designer revisions; writer articles (by reference).
- globals.css: `--color-job-neutral: #c9c6bf; --color-job-brayden: #a3a3a3;`
- copy.ts: drop `nightHeadline`, `calmHeadline`, `cantKeepUp`, `restButton`, `useFree`; add `startFree: "Start free"`, `startFreeTail: "now →"`, `freeWhileItGrows: "Free while it grows."`.

- [ ] Step 1: Replace the "night headline" copy test and add tests: `choicePrefix("freelancer")+choiceWord("freelancer") === "I'm a freelancer"`; `choicePrefix("designer")+choiceWord("designer") === "I'm a freelance designer"`; `choiceWord("brayden") === "video editor"`; `jobForChoice("freelancer") === null`; `jobForChoice("brayden") === "video-editor"`; `contentJob("freelancer") === "designer"`; `CHOICE_ORDER.length === 6 && CHOICE_ORDER.at(-1) === "brayden"`; `worriesFor("freelancer").length === 9` with unique ids; every choice's accent var is defined in globals.css; `isChoice("nope") === false`; NEUTRAL_WORRIES in the no-price text.
- [ ] Step 2: `npm run test:funnel` → fails (module missing).
- [ ] Step 3: Implement.
- [ ] Step 4: `npm run test:funnel` → passes (ChapterNight still compiles? it imports removed COPY keys — Task 3 deletes it; run `npx tsc --noEmit` only after Task 3).
- [ ] Step 5: Commit.

### Task 2: Field layout and counter

**Files:** Create `lib/funnel/field.ts`; modify `lib/funnel/mood.ts` doc only if needed; test `scripts/test-funnel.ts`; delete `lib/funnel/sorting.ts` and its tests.

**Interfaces — Produces:**
- `FIELD_CARDS = 18`, `COL_WIDTH = 360`
- `sortedColumns(width: number): 1|2|3` = clamp(floor((width − 48) / 360), 1, 3)
- `rowHeight(cols): number` (42 when 1 column — status on its own line — else 34)
- `sortedTarget(k: number, width: number): { x: number; y: number }` (x = max(20, width/2 − cols·180) + (k % cols)·360; y = 110 + floor(k / cols)·rowHeight)
- `counterFor(order: number): number` = 0 when order ≥ 0.98, else round(18·(1 − clamp01(order)))
- `fieldBand(controlsBottom: number, viewportH: number): [top, bottom]` = top = max(controlsBottom+40, 0.42·h); bottom = max(top+120, h−50)
- Contour chaos reuses `moodFor(progress).stress`; sun reuses `.morning`.

- [ ] Step 1: Tests: `sortedColumns(375)===1`, `sortedColumns(1024)===2`, `sortedColumns(1440)===3`; at 375 px every one of 9 targets has `y + 16 <= 667 - 60` (fits a phone); targets for k=0..8 at 1440 are distinct; `counterFor(0)===18`, `counterFor(0.5)===9`, `counterFor(0.98)===0`, `counterFor(2)===0`, `counterFor(-1)===18`; `fieldBand(300, 800)` → `[340, 750]`.
- [ ] Step 2: run → fail. Step 3: implement; delete `sorting.ts` and the "Chapter 1: sorting" test block + import. Step 4: run → pass. Step 5: commit.

### Task 3: Context, job word, hero field, contours

**Files:** Modify `components/funnel/JobContext.tsx`; create `components/funnel/JobWord.tsx`, `components/funnel/HeroField.tsx`, `components/funnel/Contours.tsx`, `components/funnel/fonts.ts`; delete `ChapterNight.tsx`, `JobPicker.tsx`; test `scripts/test-ui-source.ts`.

**Interfaces:**
- `useJob(): { choice: Choice; setChoice(c: Choice, origin?: {x,y}): void; job: JobId /* contentJob */; trackJob: JobId | undefined }`. Session key stays `ff_job`, now holding a Choice; default `"freelancer"`; root style `--job: var(choiceAccentVar(choice))`; colour wave kept.
- `fonts.ts`: `export const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal","italic"], variable: "--font-display-serif" })`.
- `JobWord`: `<button aria-haspopup aria-expanded aria-controls>` showing `choiceWord`, caret; panel `role="group" aria-label="What do you do?"` with six `<button aria-label>` swatches from `CHOICE_ORDER` (name label on hover/focus); closes on Escape (focus back to word), outside pointerdown, pick. Square edges.
- `HeroField`: hero section (eyebrow "FreeFlow · one night", h1 with prefix + `<span className="whitespace-nowrap">`{JobWord},`</span>`, "and it's all", "in my *head.*"), hint "Move through the mess. Then scroll.", off-screen-until-focus "Sort it for me" button, a 130vh sort space, fixed `<canvas aria-hidden className="pointer-events-none">`, fixed meter "on your mind" + `counterFor(order)` shown once scrolled/sorting; sr-only `<ul>` of `worriesFor(choice)` (chaos, then status). Order from a ScrollTrigger on the sort space (scrub) or a GSAP tween from the button. On choice change: reseed 18 cards (`k = i % 9`, only `i < 9` drawn once sorted, duplicates fade with order), reset order. Fires `track("night_sorted", trackJob)` once when order reaches 1. rAF paused when canvas fully faded or `document.hidden`. Reduced motion: no canvas; render the 9 rows as a static list (✓ chaos · status) under the headline.
- `Contours`: fixed SVG, 15 paths, chaos = `moodFor(progress).stress`; animated drift only without reduced motion; draws once static otherwise.

- [ ] Step 1: ui-source tests (replace ChapterNight/JobPicker blocks and I2/I3/M1/M11 checks): `HeroField` reads `prefers-reduced-motion`, includes `track("night_sorted"`, `aria-hidden` canvas with `pointer-events-none`, `Sort it for me`, `sr-only`, `visibilitychange`; `JobWord` has `aria-expanded`, `"Escape"`, `<button`; `ChapterNight.tsx`, `JobPicker.tsx` no longer exist; JobContext still guards sessionStorage and reads reduced motion.
- [ ] Step 2: run `npm run test:ui-source` → fail. Step 3: implement; install `npm i gsap@3.15.0 lenis@1.3.27 --save-exact`. Step 4: tests pass; `npx tsc --noEmit` clean except DemoFunnel wiring (Task 5). Step 5: commit.

### Task 4: Flows pin, story restyle, end band, top link

**Files:** Create `components/funnel/FlowsPin.tsx`, `components/funnel/EndBand.tsx`; modify `ChapterStory.tsx`, `StickyCta.tsx`, `Game.tsx` (track with `trackJob`); delete `ChapterMorning.tsx`, `Signature.tsx`; test `scripts/test-ui-source.ts`.

- `FlowsPin`: 220vh section, sticky 100vh centre; "Now it all" (heavy uppercase) scrubs scale 1.25→1, letter-spacing .02em→−.045em, opacity .2→1; "flows." serif italic with the ink gradient `background-position` 100%→0%. Reduced motion: final state.
- `ChapterStory`: STORY paragraphs + mission/promise (white) in serif clamp(22px,2.6vw,36px); slash path (prototype `d`) below text, behind, opacity .55, stroke `var(--job)` width 6, dash-drawn by ScrollTrigger (top 40% → center 30%), drawn under reduced motion; "— Brayden"; P.S. mailto. Keeps `track("story_complete"` once.
- `EndBand`: eyebrow "8:00 am · good morning", `COPY.freeWhileItGrows`; full-width `<Link href="/signup">` between hairlines: `COPY.startFree` heavy + `COPY.startFreeTail` serif; fill rises on hover/focus-visible, text to black; `track("try_free_click", trackJob)`. Then `<LaunchListForm source="morning" />` in the max-w-5xl column.
- `StickyCta`: uppercase, tracking .16em, 11px, 1px border, no radius, transparent.

- [ ] Step 1: ui-source tests: EndBand tracks `try_free_click`, has no price, links `/signup`, renders `LaunchListForm`; story still tracks `story_complete`, reads `prefers-reduced-motion`; FlowsPin reads `prefers-reduced-motion`; StickyCta has no `rounded`; `Signature.tsx`, `ChapterMorning.tsx` gone (remove their old assertions).
- [ ] Step 2: fail. Step 3: implement. Step 4: pass. Step 5: commit.

### Task 5: Wire DemoFunnel, smooth scroll, full checks

**Files:** Modify `components/funnel/DemoFunnel.tsx`, `app/globals.css` (Lenis base CSS: `html.lenis, html.lenis body {height:auto}` etc.).

- Order: sticky clock bar → `<Contours/>` + sun → `HeroField` → `FlowsPin` → max-w-5xl column [`ChapterWalkthrough`] → `ChapterStory` → column [`ChapterProof`, `Game`] → `EndBand` (with launch list) → column [`FunnelFooter`]. Red stress vignette removed. Clock bar background becomes a fade, keeps `StickyCta`. Root applies `serif.variable`, `overflow-x-clip`.
- Lenis (lerp .085) + `ScrollTrigger.update` on scroll, driven by gsap ticker; skipped under reduced motion; destroyed and all ScrollTriggers killed on unmount.

- [ ] Step 1: ui-source: DemoFunnel renders `<HeroField`, `<FlowsPin`, `<EndBand`, not `ChapterNight`; Lenis guarded by `prefers-reduced-motion`; cleanup calls `destroy()`.
- [ ] Step 2: fail → implement → pass.
- [ ] Step 3: `npm test`, `npm run lint`, `npm run build`, `npx tsc --noEmit` all 0 (rm -rf .next first if iCloud " 2" duplicates appear).
- [ ] Step 4: Chrome on `npm run dev`: /demo desktop and 375 px (no sideways scroll), all six choices, keyboard path, reduced motion (emulated), signed-out `/`, game still plays, launch list renders. Record evidence in `docs/week6/TEST_EVIDENCE.md`.
- [ ] Step 5: Commit; whole-branch review; deploy (`git checkout main && git merge --ff-only week6 && git push origin main`, push `week6`); check the live /demo.
