# /demo game: Answer gates — design

Approved by the owner 2026-11-18. Replaces the 60-second clicker in `/demo` chapter 5
(`components/funnel/Game.tsx`, `lib/game/engine.ts`).

Reference prototypes (throwaway, playable in a browser):

- `docs/week6/mockup/game-prototype.html`: tab 1 "Answer gates" is the approved game.
  Tabs 2 and 3 were rejected.
- `docs/week6/mockup/game-art.html`: character D ("Little freelancer") and the four
  barrier styles.

## Why

The game is the last step of the `/demo` story: problem → mission → how FreeFlow works →
proof it listens → the game → START FREE. It has three jobs:

1. **Memorable:** fun enough that people replay it and remember it.
2. **Trust:** a polished, honest little game hints that the product gets the same care.
3. **Conversion:** it makes the founder story felt, not explained. Keeping freelance work
   in your head is genuinely hard ("it was hard to always remember when my deadlines
   were, and what to expect to earn after", `lib/funnel/story.ts`). Then it hands off to
   Start free.

The owner chose it as a blend of two prototypes they liked: "Remember?" (shows how
hectic real work is) and "Fly the week" (just fun, and a score worth comparing).

## Goals

- One button, playable within a second of arriving: tap, click, Space or ↑.
- Flying and remembering at the same time feels hectic, and that is the point.
- A score that is easy to compare and worth beating.
- The ending connects the feeling to FreeFlow and offers Start free and Play again.

## Non-goals (not now, maybe later)

- A public leaderboard. The roadmap says no leaderboard "until scores can be trusted"
  (`lib/venture/roadmap.ts`, item `leaderboard`). A personal best only.
- Unlockable styles, sound, and the "Your head vs FreeFlow" replay (prototype tab 3).
  The owner said these can come later.

## Anti-goals (a failure even if it works)

- Any step before the first flap: no form, no sign-up, no choosing before playing.
- A price, or wording that implies FreeFlow does something it doesn't. For example,
  FreeFlow does not learn that a client moved a date; the user records it.
- Red for anything except overdue (site-wide rule, `docs/week4/BRAND.md`).
- A score sent to the server, or presented as anything but this browser's own.
- Naming real people. The client names in the game are invented.

## How it plays (decided)

- **Flying:** the character falls under gravity, and each press gives an upward kick.
  The ceiling clamps. Columns of obstacles scroll in from the right with one gap each,
  and every column passed is one working day ("Week 1 · Mon" … Fri, then Week 2).
- **Hearts:** 3. Hitting an obstacle, hitting the floor (bounce back up) or flying
  through a wrong answer costs one heart, followed by about 1.2 s of invulnerability
  (the character blinks). Zero hearts ends the run.
- **Jobs pop up while flying:** "New job · Logo for Café Lumbre · $450 · due Thu".
  - Job names come from the visitor's job (`JOBS[job].gameProjects`,
    `lib/funnel/jobs.ts`), so neutral and "Brayden's own" follow the existing mapping
    in `lib/funnel/choice.ts`.
  - Clients come from a fixed list of invented names.
  - Amounts come from a small fixed set, unique among the jobs in play.
  - Due days are Mon–Fri.
- **Changes:** sometimes a client message moves a known job's due day, shown in amber:
  "Can we move the logo to Wednesday? Thanks!!" The next question asks about that
  job's new date.
- **Answer gates:** every few columns, a gate with three labelled openings arrives. The
  question shows above the game ("Fly through the answer · When is the logo for Café
  Lumbre due?"), and you answer by flying through the right opening. Questions ask the
  due day (always for a moved job) or the amount, with three shuffled options.
- **Order:** about 2 new jobs before the first gate, then a repeating mix of new jobs,
  changes and gates (prototype `GATE_PATTERN`).
- **Payments:** coins in some gaps add to "$ collected", which appears in the HUD and
  the result. It is in-game money, not a price.
- **Score** = days flown + 3 × right answers. The personal best is kept in this
  browser's storage.
- **Feel:** the prototype's tuned numbers are the starting point. Gravity 1450 px/s²,
  flap −410 px/s, speed 150 → 205 px/s, column width 62, normal gap shrinking from 168
  to 132, gate openings 108 tall. Spacing between columns is wider before and after a
  gate, and the hitbox has about 6 px vertical forgiveness. Tuning within that feel is
  up to the builder.

## Screens (decided)

- **Start:** title, one line of how to play, a Start button, the "Style" switch and the
  personal best when there is one. Space or a tap also starts.
- **Playing:**
  - HUD: day, hearts, ✓ right answers and $ collected.
  - The message strip (new job, change, question) sits above the play area, never on
    top of a gate.
- **End:**
  - "N of M from memory".
  - Where the week ended ("Wednesday of week 2").
  - $ collected, score and best.
  - Closing line, my call (see below): "Flying is the fun part. Remembering is the hard
    part. FreeFlow keeps every deadline and amount in one place, so you don't have to."
  - **Start free** (`/signup`, tracked as `try_free_click` like today), **Play again**,
    the "Style" switch, and the existing launch-list form (`LaunchListForm
    source="game_end"`).

## Look (decided)

- **Character:** the little freelancer riding an open laptop, from `game-art.html`,
  option D. Faceless and neutral, with hoodie and scarf in the page's current accent
  (the `--job` colour, so neutral grey, the five jobs, or "Brayden's own").
- **Obstacle styles:** four, all available from the start: invoice stacks (default),
  calendar pillars, bill spikes and notification towers.
  - Each style has normal pieces, overdue pieces (red marks only) and answer-gate
    walls. The gate is outlined in the accent colour so it reads as a question.
  - Styles are cosmetic only: identical openings, hitboxes and speed, so scores stay
    comparable.
  - The "Style" switch sits on the start and end screens, and the choice is remembered
    in this browser.
- Background: faint contour lines, as elsewhere on `/demo`.

## Constraints

- Next.js 16 in this repo; read `node_modules/next/dist/docs/` before writing code
  (`AGENTS.md`). No new dependencies: draw with canvas or SVG by hand.
- Rules live in a pure engine (every function returns new state), testable in plain
  node like the current `lib/game/engine.ts` and `scripts/test-game.ts`. The component
  only draws, reads input and drives the clock. The engine takes a seed or random
  function, so tests are deterministic.
- Keep what the current game already guarantees. `scripts/test-ui-source.ts` asserts
  these, so update the assertions with the code:
  - Pause while the tab is hidden, and clamp long frames.
  - `track("round_played", trackJob)` exactly once per run (`countedRound`).
  - No `fetch` from the game, and no score leaves the browser.
  - Every storage read and write is wrapped, so blocked storage only loses the best and
    the style.
- Works at 375 px wide with touch. Space and ↑ only act while the game area has focus
  or a run is live, and never scroll the page by accident.
- Accessibility:
  - The play area has a text label.
  - The message strip is a polite live region, so new jobs, changes and questions are
    announced.
  - Buttons are real buttons.

## My calls (owner may override)

- Invoice stacks are the default style.
- The closing line is reworded from the prototype so it doesn't claim FreeFlow knows
  about changes on its own.
- **Reduced motion:** the game itself has to move, so with reduced motion on, decorative
  motion stops (contour drift, scarf, blinking becomes a steady dim) and the speed
  doesn't ramp up.
- The intro copy stays in the page's existing chapter 5 framing ("Now you try."), with
  new explanatory text.
- **Message types are told apart by label and icon, not only colour.** The job accents
  collide with status colours: writer = amber, designer = blue.
  - New job: white border, "New job" label.
  - Change: "↻ Change" label, with a white or neutral border instead of amber.
  - Question: accent border, "? Fly through the answer" label.
  - Coins are white with a dark "$", so they never match a job accent.
- **The playfield is a fixed world, scaled to fit.** The engine works in one fixed
  logical size, and the component scales it uniformly to the available width. Phones
  and desktops play the same game and scores stay comparable. The builder picks the
  logical size, and it must stay readable at 375 px.
- **At most 4 jobs are in play.** When a fifth arrives, the oldest is delivered and
  leaves ("Delivered · logo for Café Lumbre"). Questions only ask about jobs in play.
  This keeps the load close to "Remember?" (four jobs), keeps amounts unique and stops
  names repeating.
- **Overdue pieces stay cosmetic.** They are stacks of overdue invoices in the world,
  labelled "OVERDUE", with no link to the jobs in play. It's honest as drawn, and the
  engine stays simple.

## Left to the builder

- Canvas or SVG, file structure and component split.
- Exact art within the mockups, and balance tuning within the described feel.
- The exact copy for the start screen and the in-game messages, following the tone
  above. Never state a price (`PRICE_PATTERN` in `lib/venture/changes.ts`).
