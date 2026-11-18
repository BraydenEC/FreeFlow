# /demo Game: Answer Gates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 60-second clicker in `/demo` chapter 5 with "Answer gates": a one-button flying game where you remember jobs that pop up and answer questions by flying through the right opening.

**Architecture:** A pure, seeded engine in `lib/game/engine.ts`, in fixed world units, decides everything: physics, columns, jobs, questions, hearts and score. It is tested in plain node. `components/funnel/Game.tsx` only drives the clock, reads input, draws the state onto a canvas scaled to fit, and renders the HTML parts: HUD, message strip, start and end screens. Drawing lives in `components/funnel/game/` (the character, and one drawer per obstacle style). Browser storage lives in `lib/game/prefs.ts`.

**Tech Stack:** Next.js 16.3.8, React 19, TypeScript, Tailwind v4, Canvas 2D. No new dependencies. Tests are plain-node scripts (`npm run test:game`, `npm run test:ui-source`).

**Spec:** `docs/superpowers/specs/2026-11-18-demo-game-answer-gates-design.md`. The reference prototype is `docs/week6/mockup/game-prototype.html` (tab 1) and the reference art is `docs/week6/mockup/game-art.html` (character D, four barriers).

## Global Constraints

- Read `node_modules/next/dist/docs/` before writing Next code (`AGENTS.md`). No new dependencies.
- The engine is pure: every exported function returns a new state and never mutates its input. Once `phase === "over"`, `step` and `flap` return the same object unchanged.
- Fixed world: `WORLD = { w: 480, h: 480 }`. The canvas scales this uniformly to the container width (at most 720 CSS px), so phone and desktop play the same game.
- Red (`#ef4444`) is used only for overdue pieces and lost hearts. Message types are told apart by label and icon, not colour alone:
  - New job: label "New job", white border.
  - Change: label "↻ Change", neutral border.
  - Question: label "? Fly through the answer", border in the `--job` accent.
- Coins are white with a dark "$".
- No price anywhere. In-game amounts are game money. No `fetch` in the game. The score never leaves the browser.
- Every `localStorage` access is wrapped in `try {`, within 3 lines above it (the `storageGuarded` helper in `scripts/test-ui-source.ts` checks this).
- Client names are invented: `CLIENTS = ["Café Lumbre", "Kiko Shoes", "Norte Studio", "Ana & Luis", "Río Films", "Casa Verde", "Luna Yoga", "Voz Media", "Teatro Sur", "Bloom"]`.
- Closing line, exact: "Flying is the fun part. Remembering is the hard part. FreeFlow keeps every deadline and amount in one place, so you don't have to."
- Commit after every task on branch `week6`. End commit messages with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **A new job or change arriving while a question is on screen** must not replace the question. It waits until the gate is passed (pinned in Task 2).
2. **A gate whose question asks about a job the player never saw.** Questions only ask about jobs whose message has been shown (Task 2).
3. **A long frame or a hidden tab.** `step` clamps each frame to 50 ms, so returning after minutes can't skip columns or end the run (Task 1).
4. **Holding Space while a page button has focus, or after the run ends.** Keys act only on the focused canvas, and Space never scrolls the page while the canvas is focused (Task 4, source assert).
5. **Changing the job mid-run, or after it.** The run keeps its projects, `round_played` is counted once (`countedRound`), and only the colour follows the new choice (Task 4, source assert).

---

### Task 1: Engine — flying, columns, hearts, score

**Files:**
- Rewrite: `lib/game/engine.ts`
- Rewrite: `scripts/test-game.ts`, keeping the existing `assert`, pass/fail footer and header-comment style.

**Interfaces:**
- Produces:
  - `WORLD`, `TUNING`, `STYLE_IDS`, `type StyleId`, `type GameState`, `type Column`, `type Gap`, `type Coin`.
  - `newGame(opts: { seed: number; projects: readonly string[]; ramp?: boolean }): GameState`
  - `flap(s: GameState): GameState`
  - `step(s: GameState, dtMs: number): GameState`
  - `score(s: GameState): number`
  - `whereText(days: number): string`
- `TUNING` values (exact):

  | Setting | Value |
  |---|---|
  | `gravity` | 1450 |
  | `flapVy` | -410 |
  | `speedStart` | 150 |
  | `speedMax` | 205 |
  | `speedRamp` | 1.4 (per second) |
  | `colW` | 62 |
  | `gapStart` | 168 |
  | `gapMin` | 132 |
  | `gapShrink` | 1.2 (per column) |
  | `gateGap` | 108 |
  | `spacing` | 285 |
  | `gateSpacing` | 360 |
  | `spacingPadS` | 0.2 |
  | `hitSlack` | 6 |
  | `playerX` | 125 |
  | `hearts` | 3 |
  | `invulnMs` | 1200 |
  | `maxTickMs` | 50 |
  | `margin` | 70 (gap centre kept this far from top and bottom) |
  | `coinChance` | 0.55 |
  | `coinValues` | [100, 150, 200, 250, 300, 350] |
  | `overdueChance` | 0.3 (normal columns drawn as overdue; cosmetic only) |

- `STYLE_IDS = ["invoices", "calendar", "spikes", "inbox"] as const`.
- `GameState` fields that later tasks read:
  - Run state: `phase: "ready" | "playing" | "over"`, `tMs`, `y`, `vy`, `speed`.
  - World: `cols: Column[]`, `coins: Coin[]`.
  - Score: `days`, `hearts`, `invulnMs`, `right`, `asked`, `collected`.
  - Randomness: `rng: number` (mulberry32 state).
  - Run settings: `ramp: boolean`, `projects: readonly string[]`.
- `Column = { id: number; x: number; kind: "normal" | "gate"; gaps: Gap[]; overdue: boolean; passed: boolean }`. Task 2 adds `question?`.
- `Gap = { top: number; h: number; label?: string }`.
- `Coin = { id: number; x: number; y: number; value: number; taken: boolean }`.

- [ ] **Step 1: Write the failing tests** (seed 1, `projects = JOBS.designer.gameProjects`):

```ts
const g0 = newGame({ seed: 1, projects: P });
assert("nothing moves before the first flap", step(g0, 500) === g0);
const g1 = flap(g0);
assert("first flap starts the run and kicks upward", g1.phase === "playing" && g1.vy === TUNING.flapVy);
assert("flap never mutates its input", g0.phase === "ready");
assert("a long frame is clamped", step(g1, 60_000).tMs === TUNING.maxTickMs);
assert("the ceiling clamps", (() => { let s = g1; for (let i = 0; i < 40; i++) s = step(flap(s), 16); return s.y >= 0; })());
// fly blind: falling to the floor costs a heart and bounces back up
let s = g1; for (let i = 0; i < 200 && s.hearts === 3; i++) s = step(s, 16);
assert("hitting the floor costs one heart", s.hearts === 2 && s.vy < 0);
assert("a hit gives invulnerability", s.invulnMs > 0);
// until all hearts are gone
for (let i = 0; i < 5000 && s.phase === "playing"; i++) s = step(s, 16);
assert("zero hearts ends the run", s.phase === "over" && s.hearts === 0);
assert("nothing changes once over", step(s, 16) === s && flap(s) === s);
assert("same seed, same course", JSON.stringify(run(1)) === JSON.stringify(run(1)));
assert("score is days + 3 per right answer", score({ ...s, days: 7, right: 2 }) === 13);
assert("speed ramps to the cap", runFor(1, 120_000).speed === TUNING.speedMax);
assert("without ramp the speed stays put", runFor(1, 30_000, { ramp: false }).speed === TUNING.speedStart);
assert("whereText", whereText(0) === "Monday morning" && whereText(7) === "Wednesday of week 2");
```

  Here `run(seed)` and `runFor(seed, ms, opts)` are helpers in the test. They play with a simple autopilot (flap when `y` is below the next gap's centre plus 12), so the run lasts and passes columns. `run` returns `{ days, cols: s.cols.map(c => [c.kind, Math.round(c.gaps[0].top)]) }` after 20 s.

  Also add these assertions using the autopilot:
  - "an autopilot passes columns and counts days" (`days >= 5` after 20 s)
  - "normal gaps shrink but never below gapMin"
  - "every column's gap centre stays at least `margin` from the edges"
  - "coins are taken by touching them and add to `collected`"
  - "a column hit during invulnerability costs nothing"

- [ ] **Step 2: Run the tests to verify they fail**

  Run: `npm run test:game`. Expected: FAIL (missing exports).

- [ ] **Step 3: Implement the engine in `lib/game/engine.ts`**
  - Port the physics, spawning and collision from the prototype's `createFly` (`docs/week6/mockup/game-prototype.html`), in world units and with `TUNING`.
  - Randomness comes only from a mulberry32 state carried in `s.rng`, with a pure `rand(s): [number, GameState]`.
  - The spawn interval is `(gateSpacing if the last or next column is a gate, else spacing) / speed + spacingPadS` seconds.
  - Collision: the player box is `playerX ± 12` horizontally and `y ± hitSlack` vertically, checked against the column's walls.
  - Hitting the floor at `y > WORLD.h - 10` costs a heart and sets `vy = flapVy`.
  - A column passed adds one to `days`.
  - Keep the module header comment style of the old engine.
  - In `"ready"`, `step` returns its input unchanged. The initial `spawnInMs` is 400.
  - Normal columns are overdue with probability `overdueChance`.

- [ ] **Step 4: Run the tests to verify they pass**

  Run: `npm run test:game`. Expected: all PASS.

- [ ] **Step 5: Commit**

  `git add lib/game/engine.ts scripts/test-game.ts && git commit -m "Week 6: game engine: flying, columns, hearts and score (Answer gates)"`

  The old `Game.tsx` no longer compiles at this point. Task 4 replaces it, so run `npx tsc --noEmit` only after Task 4.

### Task 2: Engine — jobs, changes, questions and gates

**Files:**
- Modify: `lib/game/engine.ts`
- Modify: `scripts/test-game.ts`

**Interfaces:**
- Consumes: everything from Task 1.
- Produces:
  - `CLIENTS` (as in Global Constraints) and `AMOUNTS = [300, 450, 650, 800, 950, 1200]`.
  - `DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"]` and `DAY_FULL` (the five full day names).
  - `GATE_PATTERN` (exactly the prototype's 15 entries) and `stepKind(i: number): "normal" | "intro" | "change" | "gate"`, which cycles from index 6 after the first pass.
  - `type Job = { id: number; project: string; client: string; due: number; amount: number; moved: boolean; askedAt: number; changedAt: number }`.
  - `type Question = { text: string; correct: string; options: string[]; jobId: number; kind: "due" | "amount" }`. `Column` gains `question?: Question`.
  - `type Message = { kind: "job" | "change" | "question"; label: string; text: string }`.
  - `type Feedback = { kind: "right" | "wrong" | "hit" | "delivered"; text: string; untilMs: number }`.
  - `GameState` gains:
    - `jobs: Job[]` (in play, at most 4).
    - `pending: ("intro" | "change")[]` (events waiting to be shown).
    - `message: Message | null` and `messageUntilMs: number | null` (`null` means "until the gate is passed").
    - `feedback: Feedback | null`.
- Copy, exact (built in the engine):
  - **New job:** label `"New job"`, text `` `${project} for ${client} · $${amount} · due ${DAYS[due]}` ``.
  - **Change:** label `"↻ Change"`, text `` `${client}: "Can we move the ${project.toLowerCase()} to ${DAY_FULL[due]}? Thanks!!"` ``.
  - **Question:** label `"? Fly through the answer"`.
    - Due-day text: `` `When is the ${project.toLowerCase()} for ${client} due?` ``
    - Amount text: `` `How much is ${client} paying for the ${project.toLowerCase()}?` ``
  - **Feedback:**
    - Right: `` `Right: ${correct}` ``
    - Wrong: `` `Wrong. It was ${correct}` ``
    - Hit: `"Hit an invoice stack"` (or `"Missed the openings"` at a gate)
    - Delivered: `` `Delivered · ${project} for ${client}` ``
  - Message durations: 3600 ms for a new job or change.

- [ ] **Step 1: Write the failing tests**

```ts
assert("pattern starts with two new jobs before the first gate", GATE_PATTERN.slice(0, 6).filter(k => k === "intro").length === 2 && stepKind(5) === "gate");
assert("pattern cycles from index 6", stepKind(15) === GATE_PATTERN[6] && stepKind(24) === GATE_PATTERN[6]);
assert("a new job is announced with its amount and due day", /^.+ for .+ · \$\d+ · due (Mon|Tue|Wed|Thu|Fri)$/.test(firstJobMsg.text));
assert("job names come from the visitor's projects", P.includes(firstJob.project));
assert("never more than 4 jobs in play", maxJobsSeen <= 4);
assert("a fifth job delivers the oldest", deliveredFeedbackSeen && !s.jobs.some(j => j.id === oldestId));
assert("amounts are unique among jobs in play", everyFrameAmountsUnique);
assert("a question never replaces another question; new jobs wait until the gate is passed", noMessageReplacedWhileQuestion);
assert("questions only ask about jobs that were announced", everyQuestionJobWasAnnounced);
assert("a moved job is asked about next, and by its due day", firstQuestionAfterChange.kind === "due" && firstQuestionAfterChange.jobId === movedJobId);
assert("questions have 3 different options including the answer", allQuestionsHave3UniqueWithCorrect);
assert("flying through the right opening scores", rightAnswerRun.right === 1 && rightAnswerRun.hearts === 3);
assert("a wrong opening costs a heart and shows the answer", wrongRun.hearts === 2 && wrongRun.feedback?.text === `Wrong. It was ${q.correct}`);
assert("every gate passed counts as asked", s.asked === gatesPassed);
assert("a gate with no announced jobs becomes a normal column", noJobsGateIsNormal);
```

  The helpers drive `step` and `flap`. They use an autopilot that aims for the opening whose `label === question.correct` (or a wrong one for `wrongRun`), and record observations over a 60 s run with seed 1 and seed 7.

- [ ] **Step 2: Run the tests to verify they fail**

  Run: `npm run test:game`. Expected: FAIL.

- [ ] **Step 3: Implement this in `lib/game/engine.ts`**
  - **Spawning.** `stepKind(i)` decides each spawned column.
    - `"intro"` and `"change"` push to `pending` and spawn a normal column.
    - `"gate"` spawns a gate whose `question` comes from `makeQuestion` (below), with three openings of `gateGap` height evenly walled, labelled with the options. If no job is announced yet, the gate becomes a normal column.
  - **Showing messages.** Each `step` shows the next `pending` event when there is no question message and the current message has expired.
    - Showing an `"intro"` creates the job. If that makes 5, it first delivers the oldest and sets the delivered feedback.
    - Showing a `"change"` moves a not-yet-moved job's `due` to a different day and sets `moved` and `changedAt`.
  - **Choosing the question** (`makeQuestion`):
    - Prefer a job with `moved && askedAt < changedAt`, else the least recently asked.
    - Ask the due day if the job moved, else with 60% chance.
    - Pick two distractors from `DAYS` or `AMOUNTS`, then shuffle with `rng`.
  - **Passing a gate.** The chosen opening is the one containing `y`.
    - Right: `right++`.
    - Wrong: a heart is lost even during invulnerability, then invulnerability starts.
    - No opening (hit a wall): no extra heart.
    - Always `asked++`, then clear the question message.

- [ ] **Step 4: Run the tests to verify they pass**

  Run: `npm run test:game`. Expected: all PASS.

- [ ] **Step 5: Commit**

  `git commit -am "Week 6: game engine: jobs, changes and answer gates"`

### Task 3: Prefs, character and the four obstacle styles

**Files:**
- Create: `lib/game/prefs.ts`
- Create: `components/funnel/game/draw.ts`: `drawCharacter`, `drawCoin`, `drawContours`, `drawGateLabel`, `drawGateFrame`.
- Create: `components/funnel/game/styles.ts`: `STYLE_DRAWERS`, `STYLE_LABELS`.
- Modify: `scripts/test-game.ts`

**Interfaces:**
- Consumes: `StyleId`, `STYLE_IDS`, `Column`, `WORLD` from Task 1.
- Produces:
  - `readBest(): number`, `saveBest(n: number): void`, `readStyle(): StyleId`, `saveStyle(id: StyleId): void`.
    - Keys: `"ff_gates_best"` and `"ff_game_style"`. The default style is `"invoices"`. An unknown stored value reads as the default.
  - `STYLE_LABELS: Record<StyleId, string>` = `{ invoices: "Invoice stacks", calendar: "Calendar pillars", spikes: "Bill spikes", inbox: "Notification towers" }`.
  - `type WallDrawer = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, edge: "top" | "bottom" | "both", overdue: boolean) => void`.
  - `STYLE_DRAWERS: Record<StyleId, WallDrawer>`.
  - `drawCharacter(ctx, x, y, vy, accent: string, tMs: number, opts: { still: boolean; dim: boolean }): void`.
  - `drawGateFrame(ctx, x: number, w: number, h: number, accent: string): void`. This is the dashed accent outline around a gate column, so it reads as a question.

- [ ] **Step 1: Write the failing tests** (added to `scripts/test-game.ts`):

```ts
assert("every style has a drawer and a label", STYLE_IDS.every(id => typeof STYLE_DRAWERS[id] === "function" && STYLE_LABELS[id].length > 0));
assert("style defaults to invoice stacks without storage", readStyle() === "invoices");
assert("best is 0 without storage", readBest() === 0);
assert("saving without storage doesn't throw", (() => { try { saveBest(5); saveStyle("spikes"); return true; } catch { return false; } })());
```

- [ ] **Step 2: Run the tests to verify they fail**

  Run: `npm run test:game`. Expected: FAIL.

- [ ] **Step 3: Implement the prefs and the drawers**
  - `prefs.ts`: wrap every `window.localStorage` use in `try {}`, so node and blocked storage return the defaults.
  - **Drawers:** port the four `piece` functions and character D from `docs/week6/mockup/game-art.html` (SVG strings) to Canvas 2D paths.
    - The edge facing the gap carries the detail: paper, calendar page, spike tip or unread badge.
    - Overdue marks use `#ef4444` and nothing else does.
    - Invoice amounts on paper come from a deterministic function of `x` and `y`.
    - `drawers` and `styles` must not touch `window` or `document` at import time, so node can import them.
  - **Character:**
    - `opts.still` stops the scarf movement.
    - `opts.dim` draws at alpha 0.45 instead of blinking.
    - Tilt is `clamp(vy / 600, -0.5, 1.1)`.

- [ ] **Step 4: Run the tests to verify they pass**

  Run: `npm run test:game`. Expected: all PASS.

- [ ] **Step 5: Commit**

  `git add lib/game/prefs.ts components/funnel/game scripts/test-game.ts && git commit -m "Week 6: game art: little freelancer and four obstacle styles"`

### Task 4: `Game.tsx` — the chapter, wired up

**Files:**
- Rewrite: `components/funnel/Game.tsx` (exported default `Game`, still rendered by `DemoFunnel.tsx:112` with `id="game"`).
- Modify: `scripts/test-ui-source.ts:233-238` and `:304-305`, the chapter 5 asserts.

**Interfaces:**
- Consumes:
  - `newGame`, `flap`, `step`, `score`, `whereText`, `WORLD`, `TUNING`, `STYLE_IDS`, `DAYS` (Tasks 1-2).
  - `STYLE_DRAWERS`, `STYLE_LABELS`, `drawCharacter`, `drawCoin`, `drawContours`, `drawGateLabel`, `drawGateFrame`, and the prefs (Task 3).
  - `useJob()` → `{ job, trackJob, choice }` (`components/funnel/JobContext.tsx`), `JOBS[job].gameProjects`, `track`, `COPY.tryFree`, `LaunchListForm`.

- [ ] **Step 1: Write the failing source asserts**, replacing the old chapter 5 block:

```ts
const game = readOr("components/funnel/Game.tsx");
const prefs = readOr("lib/game/prefs.ts");
assert("the game pauses when the tab is hidden", game.includes("visibilitychange"));
assert("best score and style survive blocked storage", storageGuarded(prefs, "localStorage") && !game.includes("localStorage"));
assert("a finished run is tracked once", game.includes('track("round_played"') && game.includes("countedRound"));
assert("the game sends no score to the server", !/fetch\(/.test(game));
assert("the game draws on a labelled canvas", /<canvas[\s\S]{0,300}aria-label=/.test(game));
assert("new jobs and questions are announced to screen readers", /aria-live="polite"/.test(game));
assert("keys act on the focused canvas only, and Space doesn't scroll", /onKeyDown=\{/.test(game) && game.includes("preventDefault") && !/document\.addEventListener\("keydown"/.test(game));
assert("reduced motion stops the ramp and decoration", game.includes("prefers-reduced-motion") && /ramp:\s*!/.test(game));
assert("the style switch offers all four styles", game.includes("STYLE_IDS.map("));
assert("the closing line doesn't claim FreeFlow learns changes itself", game.includes("FreeFlow keeps every deadline and amount in one place, so you don't have to."));
assert("Start free is tracked", game.includes('track("try_free_click"'));
assert("the launch list stays at the end of the game", game.includes('<LaunchListForm source="game_end"'));
```

  Also keep `"events never send a neutral pick as a job"` (line 262), which needs `trackJob` in `Game.tsx`. Delete the M2 assert at 304-305, now covered above.

- [ ] **Step 2: Run the asserts to verify they fail**

  Run: `npm run test:ui-source`. Expected: FAIL on the new asserts.

- [ ] **Step 3: Rewrite `components/funnel/Game.tsx` (`"use client"`)**
  - **Section header:** keep the chapter 5 framing ("Chapter 5", "Now you try."). Intro text, exact: "Fly your week. New jobs pop up as you go, and gates ask about them: answer by flying through the right opening. Tap, click or press space to climb."
  - **State:**
    - The engine state lives in a `useRef`, and a small `hud` React state updates only when its values change: day, hearts, right, collected, message, feedback, phase.
    - A `requestAnimationFrame` loop calls `step` with the frame's dt, and stops while the tab is hidden (`visibilitychange`).
  - **Canvas:**
    - Square, scaled from `WORLD` to `min(containerWidth, 720)` CSS px using the device pixel ratio.
    - Resize on window resize.
    - `tabIndex={0}`, `aria-label="Answer gates game. Press space or tap to climb."`
    - `onPointerDown` flaps. `onKeyDown` flaps on Space or ArrowUp, with `preventDefault`.
    - Focus the canvas with `{ preventScroll: true }` when a run starts.
  - **Accent:** read `getComputedStyle(canvas).getPropertyValue("--job")` when `choice` changes.
  - **Message strip (above the canvas):** label and text, `aria-live="polite"`, fixed min-height so the layout doesn't jump. Borders follow Global Constraints.
  - **HUD (HTML over the canvas):**
    - Day (`Week ${floor(days/5)+1} · ${DAYS[days%5]}`).
    - Hearts, with `aria-label` "N hearts left".
    - `✓ right` and `$collected`.
  - **Feedback** line under the canvas.
  - **Start screen (overlay):**
    - A Start button, which also starts on the first flap.
    - The style switch: `STYLE_IDS.map(` to real `<button aria-pressed>` with `STYLE_LABELS`, saved with `saveStyle`.
    - "Your best: N" when there is one.
  - **End screen**, shown 600 ms after `phase === "over"`:
    - `Score ${score} · best ${best}`.
    - `${right} of ${asked} from memory`.
    - `Flew to ${whereText(days)} · $${collected} collected`.
    - The closing line.
    - A Start free `<Link href="/signup">` tracked with `track("try_free_click", trackJob)`, a Play again button, the style switch, and `<LaunchListForm source="game_end" />`.
  - **Tracking and best:** track `round_played` once per run (`countedRound` ref, reset on Play again) and `saveBest` when it's beaten.
  - **New runs:** `newGame({ seed: Date.now() | 0, projects: JOBS[job].gameProjects, ramp: !reducedMotion })`. The projects are fixed at run start, so changing the job mid-run only recolours.
  - **Reduced motion:** `matchMedia("(prefers-reduced-motion: reduce)")` sets `reducedMotion`, which freezes the contour drift, sets `drawCharacter` `still: true`, and uses `dim` instead of blinking.

- [ ] **Step 4: Run the checks to verify they pass**

  Run: `npm run test:ui-source && npm test && npm run lint && npx tsc --noEmit`. Expected: all suites pass, lint exits 0, tsc exits 0. If iCloud " 2" duplicates appear, run `rm -rf .next`, then `npm run build` before `tsc`.

- [ ] **Step 5: Commit**

  `git add components/funnel/Game.tsx scripts/test-ui-source.ts && git commit -m "Week 6: /demo chapter 5 is Answer gates"`

### Task 5: Check it in the browser, record evidence

**Files:**
- Modify: `docs/week6/TEST_EVIDENCE.md` (new section 7)

- [ ] **Step 1: Run the full gate**

  Run: `rm -rf .next && npm test && npm run lint && npm run build && npx tsc --noEmit`. Expected: every suite passes, then exit 0, 0, 0.

- [ ] **Step 2: Check it in Chrome on `npm run dev`**

  Check `/demo#game`, signed out:
  - At desktop width and in a 375 px same-origin iframe, there is no sideways scroll.
  - Play a run by keyboard (Tab to the canvas, then Space), and a run by click.
  - Switch all four styles. The choice survives a reload.
  - Pick writer and photographer: the hoodie recolours, and the change and question messages stay distinguishable by label.
  - Space doesn't scroll the page while the canvas is focused.
  - No console errors.
  - `round_played` fires once per run (watch the network for `/api/funnel`).

- [ ] **Step 3: Record the results** as `## 7. Answer gates game, local checks (2026-11-18)` in `docs/week6/TEST_EVIDENCE.md`: the commands with their counts, and each browser check with its result. Then commit:

  `git commit -am "Week 6: Answer gates local checks recorded"`

- [ ] **Step 4: Full-branch review, then deploy only after the owner's go-ahead**
  - One fresh reviewer, on the most capable model, reviews `c4227ad..HEAD`. Fix important findings test-first.
  - Deploy: `git checkout main && git merge --ff-only week6 && git push origin main && git push origin week6 && git checkout week6`.
  - Then check `https://www.freeflow.website/demo#game` live.
