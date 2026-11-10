# Week 6 Integrated Venture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn FreeFlow into one integrated venture site: a story-driven `/demo` funnel with a game, a Mac-style Dock, `/dashboard` with a public numbers tab, and `/docs` with the journey, timeline, prompt library, impact check and V2 roadmap. The Module 6 packet comes first.

**Architecture:** All story, feature, roadmap and journey content lives in typed static modules (`lib/funnel/*`, `lib/venture/*`) that every page reads, so `/demo`, `/dashboard` and `/docs` cannot drift apart. Interactive logic (game, worry sorting, clock, mood, Dock magnification) is pure TypeScript with plain-node tests. React components only render state. Three new Supabase tables take anonymous, rate-limited writes. One `security definer` function returns aggregate counts only.

**Tech Stack:** Next.js 16.3 (App Router, `proxy.ts`), React 19, Tailwind 4, Supabase (`@supabase/ssr`), zod 4, `next/font/google` (Geist, Caveat), plain-node test scripts (`node --experimental-strip-types` with `scripts/alias-loader.mjs`).

**Spec:** `docs/superpowers/specs/2026-11-09-week6-integrated-venture-design.md` (approved 2026-11-09). Executors read both. The throwaway prototypes the owner validated are in `.superpowers/brainstorm/*/content/`: `hero-v2.html`, `game-spike.html`, `dock-spike.html`, `agent-map-v2.html`, `story-hover.html` (option C), `dashboard-options.html` (option C), `docs-options.html` (option A). Match their feel.

## Global Constraints

- Next.js 16 has breaking changes: read the relevant guide in `node_modules/next/dist/docs/` before writing route, layout, metadata or font code.
- Free tools only. No new paid service. No new runtime dependency without a one-line reason in the commit message. Prefer CSS and small hand-written code over animation libraries.
- Never state a price on any new page. Never name an unbuilt feature on `/demo`.
- Never invent testimonials, counts, ratings, logos, tester quotes or "You said → we changed" entries. Each entry cites a real repo file.
- Friends stay unnamed ("a freelancer friend"). Tester names never enter the repo.
- No personal data on public surfaces: no emails, names or chat text.
- Public contact: `braydenemeryc@gmail.com`. Founder signs as "Brayden". No photo.
- Brand: `app/globals.css` is the single source of truth (black canvas, white ink, `#262626` hairlines, Geist).
- Every animation has a calm static version under `prefers-reduced-motion`. Every interaction works by keyboard and touch. 375 px wide with 16 px gutters and no horizontal scroll.
- `/demo` works fully with no `ANTHROPIC_API_KEY` and with Supabase unreachable.
- The builder never handles the Supabase secret key. The owner runs migrations in the SQL Editor.
- Gate pushes on exit codes: `npm test`, `npm run lint`, `npm run build`, then `npx tsc --noEmit`. `rm -rf .next` fixes iCloud " 2" duplicate files.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Supabase unreachable or unconfigured.** `/demo`, `/docs` and the public tab still render. Write routes answer 503 with `{ saved: false }` and the UI says it couldn't save, without breaking the page. (Task 5 route checks; Task 7 `PublicNumbers` null state.)
2. **Repeat submissions.** The same email twice, or a second vote on one item, reads as success, never as an error. (Task 5: unique constraints plus `23505` → 200 `{ saved: true, already: true }`.)
3. **Tab hidden mid-game.** Coming back after minutes must not end the round or wipe every invoice. (Task 4: `tick` clamps `dtMs` to `BALANCE.maxTickMs`; Task 12 pauses on `visibilitychange`.)
4. **Keyboard-only and touch-only visitors.** Worries, invoices, upgrades and the Dock toggle are real `<button>`s. The Dock opens on click or tap and closes on Escape. (Tasks 6, 10 and 12 source checks.)
5. **Browser storage blocked** (private mode, previews). Personal best, vote memory, voter key and visit id fail silently; the page still works. (Task 9 `track`, Task 8 roadmap and Task 12 game: storage access wrapped in try/catch, with source checks.)

---

## Phase A: Gate 1 (packet before any product code)

### Task 1: Build Discipline Packet, source notes and Claude-made mockup

**Files:**
- Create: `docs/week6/PLAN.md` (the packet)
- Create: `docs/week6/FOUNDER_STORY_SOURCE.md`, `docs/week6/SOURCE_NOTES.md`, `docs/week6/IMAGE_PROMPT.md`
- Create: `docs/week6/mockup/demo.html`, `docs/week6/mockup/dock.html`, `docs/week6/mockup/dashboard.html`, `docs/week6/mockup/docs.html`
- Create: `docs/week6/images/mockup-demo.png`, `mockup-dock.png`, `mockup-dashboard.png`, `mockup-docs.png`
- Create (if no snapshot tool exists): `scripts/snap.swift`. A WKWebView loads a file URL at a given width and writes a full-page PNG via `takeSnapshot`, in the style of `scripts/html2pdf.swift`.

- [ ] **Step 1: Write `FOUNDER_STORY_SOURCE.md`.** Record the owner's founder-story text verbatim as he supplied it on 2026-11-09 (it is in the spec's chapter 3 summary; ask him to paste it again if the verbatim text is not in your context), plus his added detail: videographer and video editor; the work took most of his attention, so he struggled to remember deadlines and what he'd earn. Header: "Owner's own words, supplied 2026-11-09. Page copy is edited from this and approved by him."
- [ ] **Step 2: Write `SOURCE_NOTES.md`.** Two dated entries, both unnamed:
  - (1) Pricing advice: start free, build a base, charge once. Source: `docs/week2/VALIDATION_CONVERSATION.md` (same person, owner confirmed 2026-11-09).
  - (2) Another freelancer friend, owner-reported 2026-11-09: they would use it if it is genuinely updated consistently with new features and fixes.
- [ ] **Step 3: Write `PLAN.md`** in the macro-prompt order, matching `docs/week5/PLAN.md`'s format:
  1. Problem
  2. User
  3. Product spec with **testable acceptance criteria per feature**: Dock, routing, `/dashboard` tabs, `/docs` sections, `/demo` chapters 1–6, game, launch list, votes, `/pricing` fixes
  4. UX mockup (embed the four PNGs; label them "Mockup made by Claude (HTML rendered to PNG), not an image generator")
  5. Architecture sketch (data flow: static content modules → pages; pages → `/api/funnel`, `/api/launch-list`, `/api/roadmap/vote` → Supabase; `venture_counts()` → public tab and roadmap)
  6. Tech stack
  7. DevOps (GitHub `main` → Vercel; env vars unchanged; migration `supabase/week6_venture.sql` run by the owner)
  8. Test plan
  9. The exact coding-agent prompt
  10. Scope cuts (from the spec's Non-goals)

  Open with the decisions-up-front box and the requirement map, both copied from the spec.
- [ ] **Step 4: Write `IMAGE_PROMPT.md`** containing the macro-prompt's UX image prompt verbatim, for reference.
- [ ] **Step 5: Build the four mockup pages.** They are static and designed, built from the validated prototypes, with real copy where it exists. `demo.html` shows chapter 1 mid-sort, a chapter 2 step, the signed story, the game and the morning CTA as one tall page. `dock.html` shows the Dock collapsed and expanded. `dashboard.html` shows both tabs. `docs.html` shows the journey stepper plus the timeline.
- [ ] **Step 6: Render the PNGs.** Run `swift scripts/snap.swift docs/week6/mockup/demo.html docs/week6/images/mockup-demo.png 1280`, and the same for the other three. Expected: four non-empty PNGs. Open each with Read to confirm it rendered correctly.
- [ ] **Step 7: Commit.**

```bash
git add docs/week6 scripts/snap.swift
git commit -m "Week 6 Gate 1: build discipline packet, source notes and mockups"
```

- [ ] **Step 8: OWNER CHECKPOINT.** Show the owner the packet and mockups. Do not start Task 2 until he approves them.

---

## Phase B: Content and logic (pure, tested)

### Task 2: Venture content modules

**Files:**
- Create: `lib/venture/changes.ts`, `lib/venture/roadmap.ts`, `lib/venture/journey.ts`, `lib/venture/testing.ts`, `lib/venture/timeline.ts`, `lib/venture/prompts.ts`
- Create: `scripts/test-venture.ts`
- Modify: `package.json` (add a `test:venture` script, and append `&& npm run test:venture` to `test`)

**Interfaces:**
- Produces:
  - `type Change = { id: string; said: string; changed: string; source: string; date: string }`; `CHANGES: Change[]`
  - `type RoadmapBucket = "next" | "later" | "someday"`; `type RoadmapItem = { id: string; title: string; detail: string; bucket: RoadmapBucket }`; `ROADMAP: RoadmapItem[]`; `ROADMAP_IDS: readonly string[]`
  - `type JourneyStep = { n: number; week: string; name: string; purpose: string; built: string; changed: string; poweredBy: string }`; `JOURNEY: JourneyStep[]`
  - `type BugRecord = { id: string; found: string; fixed: boolean }`; `BUGS: BugRecord[]` (empty until Task 15); `TESTER_REQUESTS: string[]` (empty until Task 15)
  - `type WeekEntry = { week: number; title: string; built: string; decision: string; iterations: string[]; tests: string }`; `TIMELINE: WeekEntry[]`
  - `type PromptEntry = { week: number; title: string; text: string }`; `PROMPTS: PromptEntry[]`
  - `PRICE_PATTERN: RegExp` (in `lib/venture/changes.ts`), equal to `/\$\s?\d|\bMXN\b|\/mo\b|per month/i`

- [ ] **Step 1: Write the failing tests** in `scripts/test-venture.ts`, using the same `assert(name, condition, detail)` harness as `scripts/test-ratelimit.ts`:

```ts
import { existsSync } from "node:fs";
import { CHANGES, PRICE_PATTERN } from "@/lib/venture/changes";
import { ROADMAP, ROADMAP_IDS } from "@/lib/venture/roadmap";
import { JOURNEY } from "@/lib/venture/journey";
import { TIMELINE } from "@/lib/venture/timeline";
import { PROMPTS } from "@/lib/venture/prompts";

assert("every change cites a file that exists", CHANGES.every((c) => existsSync(c.source)));
assert("first change is the pricing advice from the Week 2 interview",
  CHANGES[0].source === "docs/week2/VALIDATION_CONVERSATION.md");
assert("journey has seven steps in build order",
  JOURNEY.map((s) => s.name).join("|") ===
  "Dashboard|Paste a brief|Research|Pricing|Marketing|Help desk|One venture");
assert("roadmap ids are unique", new Set(ROADMAP_IDS).size === ROADMAP.length);
assert("roadmap next bucket starts with the simpler forecast",
  ROADMAP.filter((r) => r.bucket === "next")[0].id === "simpler-forecast");
assert("leaderboard is a later item", ROADMAP.find((r) => r.id === "leaderboard")?.bucket === "later");
assert("timeline covers weeks 0 to 6", TIMELINE.map((w) => w.week).join() === "0,1,2,3,4,5,6");
assert("at least one prompt per week 1-5", [1, 2, 3, 4, 5].every((w) => PROMPTS.some((p) => p.week === w)));
const allText = JSON.stringify({ CHANGES, ROADMAP, JOURNEY, TIMELINE });
assert("no prices in venture content", !PRICE_PATTERN.test(allText));
```

- [ ] **Step 2: Run** `npm run test:venture`. Expected: it fails because the modules can't be resolved.
- [ ] **Step 3: Write the content.**
  - `ROADMAP` holds exactly the spec's V2 list. Ids:
    - next: `simpler-forecast`, `one-time-launch`, `tester-requests`
    - later: `more-countries`, `more-languages`, `more-currencies`, `cfdi`, `leaderboard`
    - someday: `proof-of-work`, `studio-accounts`
  - `JOURNEY` follows the spec's `/docs` section 1, with card text drawn from each week's packet and `ITERATION_LOG.md`.
  - `CHANGES` comes from `docs/week*/ITERATION_LOG.md`, the Week 2 interview and `docs/week6/SOURCE_NOTES.md`.
  - `TIMELINE` and `PROMPTS` come from `docs/week*/PROMPT_LOG.md` and `ITERATION_LOG.md`, rewritten for a reader. No friend or tester names.
- [ ] **Step 4: Run** `npm run test:venture`. Expected: all PASS.
- [ ] **Step 5: Commit.** `git add lib/venture scripts/test-venture.ts package.json && git commit -m "Week 6: venture content modules (changes, roadmap, journey, timeline, prompts)"`

### Task 3: Funnel content per job, and brand accents

**Files:**
- Create: `lib/funnel/jobs.ts`, `lib/funnel/walkthrough.ts`, `lib/funnel/copy.ts`
- Create: `scripts/test-funnel.ts`; add `test:funnel` to `package.json` and append it to `test`
- Modify: `app/globals.css` (add job accent tokens), `docs/week4/BRAND.md` (document them)

**Interfaces:**
- Consumes: `FEATURE_GROUPS` (or whatever `lib/product/features.ts` exports; read it) for the built-feature names. `PRICE_PATTERN` from Task 2.
- Produces:
  - `type JobId = "designer" | "photographer" | "video-editor" | "writer" | "developer"`
  - `type Worry = { id: string; chaos: string; sub?: string; tone: "red" | "yellow" | "plain"; filedAs: string; status: string }`
  - `JOBS: Record<JobId, { label: string; accentVar: string; worries: Worry[]; gameProjects: string[] }>`; `DEFAULT_JOB: JobId = "designer"`; `JOB_ORDER: JobId[]`
  - `type WalkthroughStep = { area: "money" | "paperwork" | "organization"; worry: string; featureName: string; benefit: string; href: string }`; `WALKTHROUGH: WalkthroughStep[]`
  - `COPY`: the headline strings below plus `RETIRED_LANDING_HEADLINES: string[]`, moved from `components/landing/LandingPage.tsx`

- [ ] **Step 1: Write the failing tests:**

```ts
import { readFileSync } from "node:fs";
assert("five jobs incl. video editor", JOB_ORDER.join() === "designer,photographer,video-editor,writer,developer");
assert("default job is designer", DEFAULT_JOB === "designer");
assert("each job has at least 8 worries and 6 game projects",
  JOB_ORDER.every((j) => JOBS[j].worries.length >= 8 && JOBS[j].gameProjects.length >= 6));
const css = readFileSync("app/globals.css", "utf8");
assert("every accent token is defined in globals.css", JOB_ORDER.every((j) => css.includes(JOBS[j].accentVar + ":")));
assert("walkthrough only names built features", WALKTHROUGH.every((s) => BUILT_NAMES.has(s.featureName)));
assert("walkthrough covers all three areas", new Set(WALKTHROUGH.map((s) => s.area)).size === 3);
assert("no prices in funnel content", !PRICE_PATTERN.test(JSON.stringify({ JOBS, WALKTHROUGH, COPY })));
```

  (`BUILT_NAMES` is built in the test from `lib/product/features.ts` entries with `status === "built"`.)
- [ ] **Step 2: Run** `npm run test:funnel`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Accent tokens in `globals.css`:
    - `--color-job-designer: #60a5fa`
    - `--color-job-photographer: #34d399`
    - `--color-job-video-editor: #a78bfa`
    - `--color-job-writer: #fcd34d`
    - `--color-job-developer: #f472b6`

    No job uses red, because red means overdue.
  - Worries per job start from `hero-v2.html`. Write the video-editor set from the founder's trade (e.g. "export failed at 98%", "client: 'can we see a v3?'", "when does the wedding edit pay?").
  - `WALKTHROUGH` holds the spec's chapter 2 list, each step mapped to the exact built feature name in `features.ts`.
  - `COPY`:
    - `nightHeadline(job)` returns `` `I'm a freelance ${label}, and it's all in my head.` ``
    - `calmHeadline` is `"…and now it's all in one place."`
    - `cantKeepUp` is `"You can't keep up by hand. Nobody can."`
    - `restButton` is `"Let FreeFlow handle the rest"`
    - `tryFree` is `"Try FreeFlow free"`
    - `useFree` is `"Use FreeFlow free now"`
    - `launchListCta` is `"Get notified when the lifetime version launches"`
- [ ] **Step 4: Run** `npm run test:funnel`. Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -m "Week 6: per-job funnel content, walkthrough map and job accent tokens"`

### Task 4: Game engine

**Files:**
- Create: `lib/game/engine.ts`, `scripts/test-game.ts`; add `test:game` to `package.json` and append it to `test`

**Interfaces:**
- Produces:
  - `type UpgradeId = "brief" | "alert" | "contract" | "terms"`
  - `type Invoice = { id: number; full: number; value: number; ageMs: number }`
  - `type GameState = { started: boolean; over: boolean; remainingMs: number; progress: number; projectIndex: number; invoices: Invoice[]; collected: number; cash: number; lost: number; owned: Record<UpgradeId, boolean>; nextId: number }`
  - `BALANCE`, starting from the spike's values (tuning is allowed; the tests pin rules, not numbers):
    - `roundMs: 60_000`
    - `workPerClick: 10`
    - `briefMultiplier: 2`
    - `invoiceMin: 250`, `invoiceMax: 700`
    - `yellowAtMs: 4_000`, `overdueAtMs: 7_000`
    - `decayPerSec: 0.08`, `alertDecayPerSec: 0.04`
    - `floor: 0.15`, `contractFloor: 0.7`
    - `termsCollectAtMs: 5_000`
    - `maxTickMs: 250`
    - `costs: { brief: 500, alert: 800, contract: 1100, terms: 1600 }`
  - `newGame(): GameState`
  - `work(s: GameState, rng: () => number): GameState`
  - `collect(s: GameState, id: number): GameState`
  - `buy(s: GameState, u: UpgradeId): GameState`
  - `tick(s: GameState, dtMs: number): GameState`
  - `invoiceStage(inv: Invoice): "fresh" | "yellow" | "overdue"`

  All functions are pure: they return a new state and never mutate.

- [ ] **Step 1: Write the failing tests** (`rng = () => 0.5` → invoice of 475):

```ts
const g0 = newGame();
assert("timer does not run before first action", tick(g0, 1000).remainingMs === BALANCE.roundMs);
let g = work(g0, rng);
assert("first action starts the round", g.started);
for (let i = 0; i < 9; i++) g = work(g, rng);
assert("ten clicks finish a project into one invoice", g.invoices.length === 1 && g.progress === 0);
const id = g.invoices[0].id;
const c = collect(g, id);
assert("collecting adds to score and cash", c.collected === 475 && c.cash === 475);
assert("buying needs cash", buy(c, "terms").owned.terms === false);
const b = buy({ ...c, cash: 600 }, "brief");
assert("buying spends cash, not score", b.cash === 100 && b.collected === c.collected);
assert("brief doubles work per click", work(b, rng).progress === 20);
assert("stages follow age", invoiceStage({ ...g.invoices[0], ageMs: 4500 }) === "yellow"
  && invoiceStage({ ...g.invoices[0], ageMs: 7500 }) === "overdue");
assert("tick clamps a huge gap", tick(g, 600_000).remainingMs === g.remainingMs - BALANCE.maxTickMs);

// One fresh 475 invoice in a started round; advance in 250 ms ticks.
const one = (owned = {}) => ({ ...g, invoices: [{ id: 1, full: 475, value: 475, ageMs: 0 }],
  owned: { ...g.owned, ...owned } });
const run = (s, ticks) => { for (let i = 0; i < ticks; i++) s = tick(s, 250); return s; };
const close = (a, b) => Math.abs(a - b) < 0.01;
assert("overdue decays to the floor, never below", close(run(one(), 108).invoices[0].value, 475 * BALANCE.floor));
assert("lost counts what decayed", close(run(one(), 108).lost, 475 - 475 * BALANCE.floor));
assert("contract keeps a 70% floor", close(run(one({ contract: true }), 108).invoices[0].value, 475 * BALANCE.contractFloor));
assert("2 s overdue: normal decay", close(run(one(), 36).invoices[0].value, 475 - 475 * BALANCE.decayPerSec * 2));
assert("2 s overdue: alert halves decay", close(run(one({ alert: true }), 36).invoices[0].value, 475 - 475 * BALANCE.alertDecayPerSec * 2));
const auto = run(one({ terms: true }), 20);
assert("terms auto-collects at 5 s, before overdue", auto.invoices.length === 0 && auto.collected === g.collected + 475);
const end = run(g, 240);
assert("round ends at zero", end.over && end.remainingMs === 0);
assert("input after the end changes nothing", work(end, rng).progress === end.progress && collect(end, 1) === end);
```
- [ ] **Step 2: Run** `npm run test:game`. Expected: FAIL.
- [ ] **Step 3: Implement** `lib/game/engine.ts` as specified.
  - Invoice value is `invoiceMin + rng() * (invoiceMax - invoiceMin)`, rounded.
  - Each tick decays only the time an invoice spends past `overdueAtMs`: `max(0, ageAfter - max(ageBefore, overdueAtMs))`. Decay is `full × rate × seconds`, down to the floor.
  - Once `over`, every function returns the same state object unchanged.
- [ ] **Step 4: Run** `npm run test:game`. Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -m "Week 6: pure game engine with tests"`

### Task 5: Supabase tables, counts function and write routes

**Files:**
- Create: `supabase/week6_venture.sql`
- Create: `lib/venture/schemas.ts`, `lib/venture/counts.ts`
- Create: `app/api/funnel/route.ts`, `app/api/launch-list/route.ts`, `app/api/roadmap/vote/route.ts`
- Modify: `scripts/test-venture.ts` (schema tests), `scripts/test-ui-source.ts` (route checks)

**Interfaces:**
- Consumes: `ROADMAP_IDS` (Task 2), `JobId` (Task 3), `rateLimit` and `clientKey` (`lib/ratelimit.ts`), `getServerSupabase` (`lib/supabase/server.ts`)
- Produces:
  - `FunnelEventSchema`: `{ event: "try_free_click" | "round_played" | "story_complete" | "night_sorted"; job?: JobId; visitId: uuid }`
  - `LaunchListSchema`: `{ email: string` (trimmed, lower-cased, a valid email, at most 254 characters); `consent: true; source: "morning" | "game_end" | "footer" }`
  - `VoteSchema`: `{ itemId:` one of `ROADMAP_IDS; voterKey: uuid }`
  - `type VentureCounts = { users: number; launchList: number; tryFreeClicks: number; roundsPlayed: number; votes: Record<string, number> }`
  - `getVentureCounts(supabase: SupabaseClient | null): Promise<VentureCounts | null>`, which returns `null` when there's no client or the RPC fails
  - Routes answer `{ saved: boolean; already?: boolean }`

- [ ] **Step 1: Write the failing schema tests** in `test-venture.ts`:
  - The launch-list schema accepts `"  A@B.co "` and returns `"a@b.co"`.
  - It rejects `consent: false`, a 300-character email and `"not-an-email"`.
  - The vote schema rejects an `itemId` not in `ROADMAP_IDS`.
  - The funnel schema rejects an unknown event.
- [ ] **Step 2: Write the failing source checks** in `test-ui-source.ts`, for each of the three routes:
  - `rateLimit(` appears before `request.json()`
  - it contains `if (!supabase)` returning status `503`
  - it handles `"23505"` as success
  - it never calls `.select(`
- [ ] **Step 3: Run** `npm run test:venture && npm run test:ui-source`. Expected: FAIL.
- [ ] **Step 4: Write `supabase/week6_venture.sql`** in the style of `supabase/chat_sessions.sql`: idempotent, never drops tables, and ends with a verify block.
  - **`funnel_events`:** `id bigint generated always as identity`, `event text check (in the four values)`, `job text check (null or the five ids)`, `visit_id uuid not null`, `created_at timestamptz default now()`.
  - **`launch_list`:** `email text not null check (char_length(email) <= 254)`, plus a unique index on `lower(email)`, `consent boolean not null check (consent)`, `consent_version text not null`, `source text`, `created_at`.
  - **`roadmap_votes`:** `item_id text`, `voter_key uuid`, `created_at`, with `primary key (item_id, voter_key)`.
  - **`count_exclusions`:** `email text primary key`. The owner fills it in the Table Editor with his own and test accounts. Never put those emails in the repo.
  - **RLS:** on for all tables. Insert-only policies `to anon, authenticated` on the first three. No select policies anywhere.
  - **`venture_counts()`:** `language sql security definer set search_path = public`. It returns `json` with:
    - `users`: `auth.users` rows whose email does not match `^grader[0-9]+@freeflow\.website$` and is not in `count_exclusions`
    - `launchList`
    - `tryFreeClicks`
    - `roundsPlayed`
    - `votes`: an object of item id → count

    Run `grant execute ... to anon, authenticated` and `revoke all ... from public` first.
- [ ] **Step 5: Implement the schemas, `getVentureCounts`** (`supabase.rpc("venture_counts")`) **and the three routes,** following `app/api/chat/session/route.ts`'s order: rate limit → client check → JSON parse → validate → insert. Limits: funnel 60 per minute, launch list 5 per minute, votes 20 per minute. Store `consent_version: "2026-11-09"`.
- [ ] **Step 6: Run** `npm run test:venture && npm run test:ui-source`. Expected: PASS.
- [ ] **Step 7: Commit.** `git commit -m "Week 6: venture tables, aggregate counts function and anonymous write routes"`
- [ ] **Step 8: OWNER STEP.** Ask the owner to run `supabase/week6_venture.sql` in the SQL Editor, paste the verify-block output, and add his own and test account emails to `count_exclusions`. Until then the routes return 503 and the counts show as unavailable, which is the designed degraded state.

---

## Phase C: Navigation, dashboard and docs

### Task 6: The Dock

**Files:**
- Create: `components/nav/Dock.tsx` (client), `lib/nav/magnify.ts`
- Modify: `lib/nav.tsx` (replace `PRIMARY_NAV` with `DOCK_GROUPS`; re-key `SUB_NAV["/"]` to `"/dashboard"`)
- Modify: `components/TopBar.tsx` (keep only the account and Settings corner, top right, with no page links)
- Modify: `app/layout.tsx` (render `<Dock />`; add bottom padding so content clears the Dock)
- Test: `scripts/test-ui-source.ts`, plus a new `scripts/test-nav.ts` (add `test:nav` to `package.json` and append it to `test`)

**Interfaces:**
- Produces:
  - `type DockItem = { label: string; href: string; icon: DockIcon }`
  - `type DockGroup = { id: "demo" | "work" | "business" | "about"; label: string; items: DockItem[] }`
  - `DOCK_GROUPS`:
    - demo: Demo `/demo`
    - work: Dashboard `/dashboard`, Paste a brief `/core`, Help desk `/chat`
    - business: Research `/research`, Product `/product`, Pricing `/pricing`, Marketing `/marketing`
    - about: Docs `/docs`, Support `/support`
  - `iconSize(distancePx: number, base = 48, max = 78, radius = 150): number`

- [ ] **Step 1: Write the failing tests.**
  - `test-nav.ts`:
    - `iconSize(0) === 78`
    - `iconSize(150) === 48`
    - `iconSize(400) === 48`
    - `iconSize(50) > iconSize(100)`
    - `DOCK_GROUPS` flattened gives exactly the 10 hrefs above, in order
  - `test-ui-source.ts`:
    - `Dock.tsx` contains `aria-expanded`, `"Escape"` and `prefers-reduced-motion` (or `matchMedia("(prefers-reduced-motion`)
    - `Dock.tsx` renders `<nav` with an `aria-label`
    - `TopBar.tsx` no longer imports `PRIMARY_NAV`
- [ ] **Step 2: Run** `npm run test:nav && npm run test:ui-source`. Expected: FAIL.
- [ ] **Step 3: Implement.** Behavior follows `dock-spike.html`:
  - collapsed to one round button, bottom-centre, `fixed`
  - expands on mouse `pointerenter` or on click/tap
  - collapses 350 ms after `pointerleave`, on outside `pointerdown` and on Escape
  - magnification only for `pointerType === "mouse"` without reduced motion
  - a tooltip label shows on hover and focus
  - a current-page dot via `usePathname()`

  At 375 px the expanded Dock scrolls horizontally *inside itself* (`overflow-x:auto`, `max-width: calc(100vw - 24px)`), never the page.
- [ ] **Step 4: Run** the tests. Expected: PASS. Then run `npm run dev` and check the Dock on `/`, `/research` and `/login`, at 1280 px and at 375 px.
- [ ] **Step 5: Commit.** `git commit -m "Week 6: Mac-style Dock replaces the top bar's page links"`

### Task 7: `/dashboard` with "Your work" and "FreeFlow in public"

**Files:**
- Create: `app/dashboard/page.tsx`, `components/venture/PublicNumbers.tsx`
- Modify: `app/page.tsx` (signed-in visitors are sent to `redirect("/dashboard")`; signed-out visitors still see `LandingPage` until Task 9)
- Modify, sending dashboard links to `/dashboard`:
  - `app/auth/confirm/route.ts:58`
  - `components/auth/AuthForm.tsx:94`
  - `proxy.ts:79` (the auth-route redirect)
  - `app/core/page.tsx:64`
  - `components/core/BriefToProject.tsx:30`
  - `components/dashboard/OverdueAlert.tsx:47`
  - `components/auth/ResetPasswordForm.tsx:98`

  Read each one first: change it only where `/` meant "the dashboard".
- Test: `scripts/test-ui-source.ts`

**Interfaces:**
- Consumes: `getVentureCounts` (Task 5); `CHANGES` and `BUGS` (Task 2); the existing `Tabs` component (`components/prefs/Tabs`, used by `app/pricing/page.tsx`)

- [ ] **Step 1: Write the failing source checks:**
  - `app/page.tsx` contains `redirect("/dashboard")`
  - `app/dashboard/page.tsx` uses `Tabs` with the ids `"work"` and `"public"`
  - `proxy.ts` redirects signed-in users on auth routes to `/dashboard`
  - `app/auth/confirm/route.ts` uses `"/dashboard"`
  - `PublicNumbers.tsx` never mentions `email`
- [ ] **Step 2: Run** `npm run test:ui-source`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Move the signed-in dashboard body from `app/page.tsx` into `app/dashboard/page.tsx` unchanged, keeping `export const dynamic = "force-dynamic"`.
  - Default tab: `work` when signed in, `public` when signed out. A signed-out "Your work" tab shows a sign-in invite linking to `/login` and `/signup`.
  - `PublicNumbers` shows:
    - people using FreeFlow
    - on the launch list
    - things you asked for, shipped (`CHANGES.length`)
    - bugs testers found / fixed (`BUGS.length` / count fixed, or "testing starts this week" when empty)
    - game rounds played
    - "Try free" clicks
    - a link to the roadmap votes on `/docs#roadmap`

    Heading line: "Early days, and here's every number." When counts are `null`, show "Live numbers are unavailable right now" instead of zeros.
- [ ] **Step 4: Run** `npm test`. Expected: PASS. Then run `npm run dev`:
  - signed in, `/` → `/dashboard`, and the dashboard is unchanged
  - signed out, `/dashboard` shows the public tab
- [ ] **Step 5: Commit.** `git commit -m "Week 6: /dashboard with your work and FreeFlow in public"`

### Task 8: `/docs`

**Files:**
- Create: `app/docs/page.tsx`
- Create: `components/venture/JourneyStepper.tsx` (client), `components/venture/WeekTimeline.tsx`, `components/venture/PromptLibrary.tsx` (client), `components/venture/TestingSummary.tsx`, `components/venture/ImpactCheck.tsx`, `components/venture/Roadmap.tsx` (client)
- Test: `scripts/test-ui-source.ts`

**Interfaces:**
- Consumes: `JOURNEY`, `TIMELINE`, `PROMPTS`, `BUGS`, `TESTER_REQUESTS`, `ROADMAP` (Task 2); `getVentureCounts` (Task 5); `POST /api/roadmap/vote` (Task 5)

- [ ] **Step 1: Write the failing source checks:**
  - `app/docs/page.tsx` renders the sections in this order: Journey, Timeline, Prompt library, Testing, Impact (`id="impact"`), Roadmap (`id="roadmap"`)
  - `ImpactCheck.tsx` contains `"braydenemeryc@gmail.com"` and `"free lifetime access"`, and does not contain the word `refund`
  - `Roadmap.tsx` wraps `localStorage` access in `try`
- [ ] **Step 2: Run** `npm run test:ui-source`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - **Journey:** exactly `agent-map-v2.html`. One line with Start on the left and Now on the right, seven numbered dots, a blue progress fill, one card at a time ("What it was for / What was built / What changed", plus the `poweredBy` line), Back/Next buttons, and clickable dots. Arrow keys move between steps.
  - **Timeline:** one card per week, expandable with `<details>`.
  - **Prompt library:** filter chips by week.
  - **Testing summary:** reads `BUGS` and `TESTER_REQUESTS`, plus the regression line, which is filled in at Task 14.
  - **Impact check:** the spec's four parts verbatim: help evidence, the harm table, the "make it right" ladder, and "can it last".
  - **Roadmap:** the three buckets. An upvote button per item: the voter key is a uuid in `localStorage` (`ff_voter`), voted items go in `ff_votes`, and the counts come from `getVentureCounts`, passed as props.
- [ ] **Step 4: Run** `npm test`. Expected: PASS. Then run `npm run dev` and click through `/docs` at 1280 px and at 375 px.
- [ ] **Step 5: Commit.** `git commit -m "Week 6: /docs with journey, timeline, prompts, testing, impact and roadmap"`

---

## Phase D: The `/demo` story funnel

### Task 9: Funnel shell, clock, mood, tracking and routing

**Files:**
- Create: `app/demo/page.tsx`, `components/funnel/DemoFunnel.tsx`, `components/funnel/JobContext.tsx` (client), `components/funnel/StickyCta.tsx` (client)
- Create: `lib/funnel/clock.ts`, `lib/funnel/mood.ts`, `lib/funnel/track.ts`
- Modify: `app/page.tsx` (signed out renders `<DemoFunnel />`); delete `components/landing/LandingPage.tsx` (its headlines already live in `COPY.RETIRED_LANDING_HEADLINES`)
- Test: `scripts/test-funnel.ts`, `scripts/test-ui-source.ts`

**Interfaces:**
- Consumes: `JOBS`, `DEFAULT_JOB`, `COPY` (Task 3); `POST /api/funnel` (Task 5)
- Produces:
  - `clockFor(progress: number): string`: `0` → `"11:47 pm"`, `1` → `"8:00 am"`, monotonic and clamped
  - `moodFor(progress: number): { stress: number; morning: number }`: `stress` peaks during chapter 1 (`progress < 0.2`) then falls to 0; `morning` is 0 until `0.85`, then rises to 1
  - `track(event, job?): void`: fire-and-forget, never throws
  - `useJob(): { job: JobId; setJob(j: JobId, origin?: { x: number; y: number }): void }`

- [ ] **Step 1: Write the failing tests:**
  - the `clockFor` endpoints, clamping (`clockFor(-1)`, `clockFor(2)`) and monotonic order across 0, 0.25, 0.5 and 1
  - `moodFor(0.1).stress > moodFor(0.5).stress`, `moodFor(0.5).morning === 0`, `moodFor(1).morning === 1`
  - source checks:
    - `app/demo/page.tsx` sets `alternates: { canonical: "/demo" }`
    - `app/page.tsx` signed-out path renders `DemoFunnel`, and the landing file is gone
    - `track.ts` wraps `sessionStorage` in `try`
- [ ] **Step 2: Run** `npm run test:funnel && npm run test:ui-source`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - The shell renders chapter placeholders (filled in by Tasks 10–12), the job picker (five round swatches, as in `hero-v2.html`, with a colour wave from the click point that is skipped under reduced motion), and the sticky "Try FreeFlow free" button → `/signup`, which calls `track("try_free_click", job)`.
  - The scroll progress drives the `--stress` and `--morning` CSS variables and the clock.
  - `/demo` is public: no proxy gating, works signed in.
- [ ] **Step 4: Run** the tests. Expected: PASS. Then run `npm run dev` and check `/demo` signed in and signed out, and `/` signed out.
- [ ] **Step 5: Commit.** `git commit -m "Week 6: /demo shell with job picker, story clock and mood; / serves the same funnel"`

### Task 10: Chapter 1, the night (worry sorting)

**Files:**
- Create: `lib/funnel/sorting.ts`, `components/funnel/ChapterNight.tsx` (client)
- Test: `scripts/test-funnel.ts`, `scripts/test-ui-source.ts`

**Interfaces:**
- Consumes: `JOBS`, `COPY`, `useJob`, `track`
- Produces:
  - `type SortState = { live: Worry[]; filed: Worry[]; queue: Worry[]; calm: boolean }`
  - `startSort(job: JobId): SortState`
  - `spawn(s: SortState): SortState` (no-op when `calm`, or when `live.length >= MAX_LIVE` (9))
  - `fileWorry(s: SortState, id: string): SortState`
  - `handleRest(s: SortState): SortState` (moves every live worry to filed and sets `calm`)
  - `canOfferRest(s): boolean` (true once `filed.length >= 3` and not calm)
  - `stressLevel(s): number` (`min(live.length / 9, 1)`, and 0 when calm)

- [ ] **Step 1: Write the failing tests:**
  - spawn caps at 9
  - filing moves exactly one worry
  - rest is offered at 3
  - `handleRest` empties `live` and sets stress to 0
  - spawn after calm is a no-op
  - the queue refills from the job's worries when it runs out
  - source checks: each worry renders as a `<button`; the component reads reduced motion
- [ ] **Step 2: Run** `npm run test:funnel`. Expected: FAIL.
- [ ] **Step 3: Implement.** Behavior follows `hero-v2.html`:
  - spawn every 1.7 s while the chapter is in view
  - drag into the FreeFlow panel, or click/tap/Enter, files the worry with a fly animation
  - notes shake near the pointer
  - copy: `COPY.nightHeadline`, `cantKeepUp`, `restButton`, `calmHeadline`, and "Quiet. Everything has a place." Use the strongest of `COPY.RETIRED_LANDING_HEADLINES` (e.g. "You find out you were not paid by remembering.") as the line under the headline.
  - on rest, call `track("night_sorted", job)`
  - reduced motion: no drift, shake or fly; worries file instantly
- [ ] **Step 4: Run** the tests. Expected: PASS. Run `npm run dev` and play chapter 1 with mouse, with keyboard only, and in 375 px touch emulation.
- [ ] **Step 5: Commit.** `git commit -m "Week 6: chapter 1, sort the night's worries"`

### Task 11: Chapters 2–4, walkthrough, story with signature, and proof

**Files:**
- Create: `components/funnel/ChapterWalkthrough.tsx`, `components/funnel/ChapterStory.tsx` (client, for the signature reveal), `components/funnel/Signature.tsx`, `components/funnel/ChapterProof.tsx`, `lib/funnel/story.ts`
- Test: `scripts/test-funnel.ts`, `scripts/test-ui-source.ts`

**Interfaces:**
- Consumes: `WALKTHROUGH`, `JOBS` (Task 3); `CHANGES` (Task 2); `useJob`, `track`
- Produces: `STORY: { paragraphs: string[]; mission: string; promise: string; ps: string }`

- [ ] **Step 1: Write the failing tests:**
  - `STORY.paragraphs.join(" ")` mentions video editing and contains no `PRICE_PATTERN` match
  - `STORY.mission` contains `"ease"`
  - source checks:
    - `Signature.tsx` loads `Caveat` via `next/font/google`, renders `Brayden` and handles reduced motion (shown already signed)
    - `ChapterProof.tsx` maps `CHANGES` and contains no hard-coded quotes
- [ ] **Step 2: Run** `npm run test:funnel && npm run test:ui-source`. Expected: FAIL.
- [ ] **Step 3: Draft `STORY`** from `docs/week6/FOUNDER_STORY_SOURCE.md`: first person, friendly, lightly edited, keeping his meaning. Open with the videographer detail. Mission: "Bring ease to freelancers."
- [ ] **Step 4: OWNER CHECKPOINT.** Show the owner the drafted story copy and apply his edits before continuing.
- [ ] **Step 5: Implement the components.**
  - **Walkthrough:** numbered steps grouped Money / Paperwork & tax / Organization. Each step shows its worry, then the feature name, a benefit line and a small sample view labelled "Sample", plus a "see it" link.
  - **Story:** the paragraphs, then the signature that writes itself on hover, tap or when scrolled into view (a clip-path reveal over 1.4 s, as in `story-hover.html` option C), then the P.S. Call `track("story_complete", job)` once it's in view.
  - **Proof:** a "You said → we changed" list, with the first item being the pricing advice, attributed to "a freelancer friend".
- [ ] **Step 6: Run** the tests. Expected: PASS. Check visually in the dev server.
- [ ] **Step 7: Commit.** `git commit -m "Week 6: chapters 2-4, walkthrough, signed founder story, you said we changed"`

### Task 12: Chapter 5 game, chapter 6 morning, and the footer

**Files:**
- Create: `components/funnel/Game.tsx` (client), `components/funnel/ChapterMorning.tsx`, `components/funnel/LaunchListForm.tsx` (client), `components/funnel/FunnelFooter.tsx`
- Test: `scripts/test-ui-source.ts`

**Interfaces:**
- Consumes: the engine (Task 4); `JOBS[job].gameProjects`; `POST /api/launch-list` (Task 5); `track`; `COPY`

- [ ] **Step 1: Write the failing source checks:**
  - `Game.tsx` listens for `visibilitychange`, wraps `localStorage` in `try`, renders upgrades and invoices as `<button`, and calls `track("round_played"`
  - `LaunchListForm.tsx` requires a consent checkbox and posts to `/api/launch-list`
  - `FunnelFooter.tsx` contains `mailto:braydenemeryc@gmail.com`, `/docs#impact` and the privacy note text below
- [ ] **Step 2: Run** `npm run test:ui-source`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - **Game:** follows `game-spike.html`, driven by `requestAnimationFrame` → `tick(s, dt)`, and paused while the tab is hidden. Each upgrade card carries "This is real in FreeFlow" and a link to its feature. End screen: "You collected {score}. FreeFlow does the chasing for you.", the personal best (`localStorage` key `ff_game_best`), the launch-list form (`source: "game_end"`) and "Try FreeFlow free". No leaderboard, and no score sent to the server.
  - **Morning:** the clock reads 8:00 am; primary "Use FreeFlow free now" → `/signup` (calls `track("try_free_click")`); secondary launch-list form (`source: "morning"`). No price.
  - **Consent label (exact):** "Email me when the lifetime version launches. Nothing else."
  - **Privacy note (exact):** "Your email is used only to tell you when the lifetime version of FreeFlow launches. It is kept by Brayden (braydenemeryc@gmail.com). To be removed, email that address. Every launch email also has a remove-me link."
  - **Footer:** contact and "Send feedback" (both `mailto:`), "If we get it wrong" → `/docs#impact`, and the privacy note.
  - **On a 503 from the form:** "Couldn't save right now. Please try again later." On `already`: "You're already on the list."
- [ ] **Step 4: Run** `npm test`. Expected: PASS. Play a full round in the dev server, then hide the tab for 30 s and confirm the round resumes intact.
- [ ] **Step 5: Commit.** `git commit -m "Week 6: chapter 5 game, chapter 6 morning, launch list and footer"`

### Task 13: `/pricing` framing fixes

**Files:**
- Modify: `app/pricing/page.tsx` (add one line inside the existing "None of this is being charged today" aside)
- Modify: `lib/pricing/tiers.ts:60` and `:98` (CFDI feature lines)
- Test: `scripts/test-ui-source.ts`, and check that `scripts/test-pricing.ts` still passes

- [ ] **Step 1: Write the failing source checks:**
  - the pricing page contains "These tiers are a possible long-term model. The plan for launch is a one-time purchase for full access."
  - every tier feature string in `tiers.ts` that names CFDI issuance ends with `"(planned)"`
- [ ] **Step 2: Run** `npm run test:ui-source`. Expected: FAIL.
- [ ] **Step 3: Implement** both edits. Nothing else on the page changes.
- [ ] **Step 4: Run** `npm test`. Expected: PASS, including `test:pricing`.
- [ ] **Step 5: Commit.** `git commit -m "Week 6: /pricing says the tiers are long-term and CFDI is planned"`

---

## Phase E: Verify, test with people, deliver

### Task 14: Full-site regression and first deploy

**Files:**
- Create: `docs/week6/TEST_EVIDENCE.md`

- [ ] **Step 1: Run** `rm -rf .next && npm test && npm run test:chat && npm run lint && npm run build && npx tsc --noEmit`. Expected: every command exits 0. Record the suite and pass counts.
- [ ] **Step 2: Push** `main` (deploy #1), wait for the Vercel deployment to go Ready, and record its URL.
- [ ] **Step 3: Live check** every page signed out, signed in (a grader account the owner signs into) and at 375 px: `/demo`, `/`, `/dashboard` (both tabs), `/docs` (every section, plus one vote), `/core`, `/research`, `/product`, `/pricing`, `/marketing`, `/support`, `/chat` and the auth pages. Check the Dock on each, and that no page scrolls horizontally. Submit one real launch-list sign-up and one try-free click, then confirm both counts rise on the public tab. Record each check as pass or fail in `TEST_EVIDENCE.md`, with screenshots in `docs/week6/screenshots/`.
- [ ] **Step 4: Fix** any failure test-first, re-run Step 1, and commit `git commit -m "Week 6: regression evidence"`.

### Task 15: Five external testers, one fix, second deploy

**Files:**
- Create: `docs/week6/EXTERNAL_TESTS.md`, `docs/week6/ITERATION_LOG.md`
- Modify: `lib/venture/testing.ts` (`BUGS`, `TESTER_REQUESTS`) and the `tester-requests` item detail in `lib/venture/roadmap.ts`

- [ ] **Step 1: Write `EXTERNAL_TESTS.md`** as a script: the tasks are `/demo` → play → sign up → dashboard → docs. For each tester, record what they said and saw, using "Tester 1–5" with no names.
- [ ] **Step 2: OWNER STEP.** The owner runs the five sessions and gives you the real notes. Record only what happened.
- [ ] **Step 3:** Put the real bugs in `BUGS` and the real requests in `TESTER_REQUESTS`. Then fix at least one bug test-first: write a failing test, run it and see it fail, fix it, run it and see it pass. Log it in `ITERATION_LOG.md`.
- [ ] **Step 4:** Run the Task 14 Step 1 commands. Expected: all exit 0. Push (deploy #2) and confirm it's Ready.
- [ ] **Step 5: Commit.** `git commit -m "Week 6: external tests, tester-driven fix, iteration log"`

### Task 16: Submission packet

**Files:**
- Create: `docs/week6/PROMPT_LOG.md` (at least 5 coding prompts, exact text), `docs/week6/DECISION_NOTE_MATERIAL.md`, `docs/week6/SCREENSHOT_GUIDE.md`, `docs/week6/video/README.md` (a 5-minute walkthrough script)
- Create: `docs/week6/WEEK6_SUBMISSION_DOCUMENT.md`, plus `scripts/build-week6-packet.py` (adapted from `scripts/build-week5-packet.py`; it writes the HTML and PDF the same way)

- [ ] **Step 1:** Write the logs and the video script. The video covers the night → morning story, the game, the Dock, `/dashboard`'s public tab and `/docs`, and is timed to about 5:00.
- [ ] **Step 2:** Write `DECISION_NOTE_MATERIAL.md`: the facts and decisions the owner can draw on. **The decision note itself is the owner's own words, 150–250 words.** Don't write it for him.
- [ ] **Step 3:** Assemble the submission document in the Week 5 format: live URL, GitHub link, video link, the packet, mockups, spec, architecture, commits (at least 5), deploys (at least 2), Supabase evidence, prompt log, test evidence, iteration log and the decision note placeholder. Run `python3 scripts/build-week6-packet.py`. Expected: HTML and PDF written to the Module 6 folder.
- [ ] **Step 4: Commit.** `git commit -m "Week 6: submission packet"`, then push.
