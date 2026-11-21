# Week 6: Integrated Agentic Venture + Impact & Viability (Submission Packet, revised)

**Student:** Brayden Credeur · **Course:** Negocios Inteligentes y Comercio Digital, Ibero CDMX · **Project:** FreeFlow · **Date:** November 21, 2026 (revised after the AI pre-test fixes)

---

## Required Links

| Item | Link |
|---|---|
| **Live page: /demo** | https://www.freeflow.website/demo |
| **GitHub** | https://github.com/BraydenEC/FreeFlow |
| **Demo video (5 minutes)** | [[⬅️ TO BE ADDED]] |

---

# Build Discipline Packet

Written and committed before any Week 6 code (`a457cd0`, approved by the owner at Gate 1).

## 🧩 Problem: what user problem is this feature solving?

A freelancer keeps their work in their head: which invoice is late, whether the deposit
landed, when the next deadline is, and what they can expect to earn next month. FreeFlow
already answers those questions, but a visitor can't tell. The signed-out landing page is a
list of features, the top bar holds eight links and Week 6 adds more, and the evidence of
how the product was built (seven weeks of research, pricing, tests and decisions) is spread
across files only the grader reads.

The venture problem underneath: FreeFlow has to prove it works, creates value and avoids
obvious harm, and it has to show a visitor that it was built by listening to freelancers,
with intention, rather than claim it. That means one story a stranger can follow, one way
to move around the whole site, and open numbers and sources instead of testimonials.

## 👤 User: who will use it?

| User | Need |
|---|---|
| A freelancer landing on FreeFlow for the first time (designer, photographer, video editor, writer, developer) | Recognise their own late-night worries, see that each one has a real answer, try it for free, or ask to hear about the lifetime version |
| An existing FreeFlow user | Get to their dashboard and every tool from any page, quickly, on a phone |
| The course grader | Find every Module 6 requirement (see the map above) without being told where it is |
| Brayden, the owner | Measure the funnel (try-free clicks, launch-list sign-ups), hear from users, and keep his promise to keep listening and fixing |

## 🎯 Success: what must work by the end of the week?

`/demo` loads for anyone, signed in or out, with no AI key and with the database
unreachable, and a first-time visitor can follow it from 11:47 pm to morning without
instructions, on phone and desktop. Every page carries the Dock. `/dashboard` shows the
signed-in user's own records and a public "FreeFlow in public" tab of counts. `/docs` holds
the journey (agent map), the week-by-week build log, the prompt library, the testing
summary, the impact check and the V2 roadmap with votes. Try-free clicks and launch-list
sign-ups are recorded. Nothing on any new page states a price, names an unbuilt feature on
`/demo`, or invents a testimonial or count. All automated suites pass, five external users
have walked through `/demo` → sign-up → dashboard → docs, at least one bug they found is
fixed and redeployed, and the full-site regression passes.

## 🖼 UX Concept: image mockup + implementation note

The mockups were made by Claude as HTML and rendered to PNG (`swift scripts/snap.swift`),
at the owner's request, from the throwaway prototypes he validated. They are not
image-generator output. They show the target state: no Week 6 code existed when they were
drawn, so every number in them is sample data or a placeholder ("—"). Sources:
`docs/week6/mockup/*.html`.

![/demo mockup](images/mockup-demo.png)

*`/demo` as one tall
page: chapter 1 mid-sort, a chapter 2 step with the one AI step labelled, the signed story,
the "You said → we changed" proof, the game mid-round, the morning call to action, and the
footer.*

![Dock mockup](images/mockup-dock.png)

*The Dock at rest,
expanded with magnification over "Pricing", and at 375 px as a tap-open sheet.*

![/dashboard mockup](images/mockup-dashboard.png)

*`/dashboard` with
"Your work" (sample data, today's labels) and "FreeFlow in public" (placeholders only).*

![/docs mockup](images/mockup-docs.png)

*`/docs`: the journey
stepper (the agent map) on Week 5, then the week-by-week timeline with Week 5 open.*

**Implementation note.** `/demo` is one long scroll in the founder's voice, built on AIDA:
Attention (11:47 pm, sorting the worries), Interest (midnight, the guided walkthrough of
real features), story (1 am, the signed founder story), Desire (the "You said → we changed"
proof), the game as the climax, and Action (8:00 am, try it free or join the launch list).
The worries in chapter 1 are the features in chapter 2 and the upgrades in the game, so the
page is one story rather than a stack of sections. The job picker re-colours the accent and
swaps the examples throughout. Motion is CSS and small hand-written code; under reduced
motion each chapter shows its calm end state. The Dock replaces the top bar's links on every
page. `/dashboard` and `/docs` read the same static content modules as `/demo`, so the same
features, voice and numbers appear everywhere.

## ✂️ Scope Cut: what looked nice but will not be built this week?

From the spec's non-goals:

- Game leaderboard and the "free lifetime access" prize (they wait until scores can be
  protected from cheating)
- A private owner analytics view (the owner already sees emails and chats in Supabase)
- A founder photo, and the before/after photo hover
- Any change to `/pricing` content or to the pricing model beyond the two fixes above
- Any V2 roadmap item (simpler forecast, CFDI, more countries/languages/currencies, studio
  accounts, etc.)
- Paid APIs of any kind

## 🧱 Product Spec: requirements and acceptance criteria

Every criterion below is testable: by an automated suite (**auto**), by reading the source
(**source**), or by a live check at 1280 px and 375 px (**live**).

### Cross-cutting (every new page)

| # | Requirement | Acceptance criterion |
|---|---|---|
| X1 | No price | No new page or component contains a currency amount or "per month" for FreeFlow itself (**source** search). Exceptions: in-game money in the game, and figures inside a view clearly labelled as sample data |
| X2 | No invented proof | Every "You said → we changed" entry has a `source` field naming a real repo file that exists (**auto**); no testimonial, rating, logo or invented count anywhere (**source**) |
| X3 | Friends unnamed | Entries from friends read "a freelancer friend"; no friend or tester name in `lib/`, `components/` or `app/` (**source**) |
| X4 | Reduced motion | Under `prefers-reduced-motion` every animation has a calm static version and nothing depends on motion to be understood (**live**, **source**) |
| X5 | Phone width | At 375 px, 16 px gutters and no horizontal page scroll on `/demo`, `/dashboard`, `/docs` (**live**) |
| X6 | Keyboard and touch | Every interactive element (worries, invoices, upgrades, Dock toggle, steps, votes) is a real `<button>` or link, reachable by Tab and usable by tap (**source**, **live**) |
| X7 | Degrades, never fails | With Supabase unreachable, `/demo`, `/docs` and the public tab render; writes answer 503 `{ saved: false }` and the UI says it couldn't save (**auto**, **live**) |
| X8 | Brand | Colours come from `app/globals.css` tokens; job accents are added there and documented in `docs/week4/BRAND.md` (**source**) |
| X9 | Public contact | Footer, privacy note and the "make it right" promise use `braydenemeryc@gmail.com`; founder signs "Brayden", no photo (**source**) |

### The Dock (navigation)

| # | Requirement | Acceptance criterion |
|---|---|---|
| D1 | On every page | `app/layout.tsx` renders `<Dock />` once; the top bar keeps only the account and Settings corner, with no page links (**source**) |
| D2 | At rest | One round button, bottom centre, labelled "Menu" for screen readers (**live**) |
| D3 | Groups | Opens into Demo · Your work (Dashboard, Paste a brief, Help desk) · The business (Research, Product, Pricing, Marketing) · About (Docs, Support), separated by thin dividers, every link a real route (**auto** on the group data) |
| D4 | Mac feel | With a mouse, icons grow as the pointer passes (pure, tested magnification function), a label shows above the hovered icon, a dot marks the current page; no magnification on touch (**auto**, **live**) |
| D5 | Open and close | Opens on hover, click or tap; closes after a short delay when the pointer leaves, on a tap outside, or on Escape (**live**) |
| D6 | Accessible | `nav` with an accessible name; the toggle exposes `aria-expanded`; every icon has a text label (**source**) |
| D7 | Fits a phone | At 375 px the open Dock fits with no horizontal page scroll (**live**) |

### Routing

| # | Requirement | Acceptance criterion |
|---|---|---|
| R1 | `/demo` public | 200 signed out and signed in (**live**) |
| R2 | `/` signed out | Renders the same funnel component as `/demo` (one component, not a copy); `components/landing/LandingPage.tsx` is removed (**source**, **live**) |
| R3 | `/` signed in | Redirects to `/dashboard` (**live**) |
| R4 | Canonical | `/demo` and `/` both declare `<link rel="canonical">` pointing at `/demo` (**source**, **live**) |
| R5 | No stale "dashboard is /" links | Sign-in success, email verification and every internal link that meant "the dashboard" point at `/dashboard` (**source** search) |
| R6 | Existing pages | `/core`, `/research`, `/product`, `/pricing`, `/marketing`, `/support`, `/chat` and the auth pages still load (**live**) |

### `/dashboard` tabs

| # | Requirement | Acceptance criterion |
|---|---|---|
| B1 | "Your work" | Signed in: today's dashboard (overdue alert, summary cards, project table, forecast, withholding, saved layout) moved from `/`, unchanged in behaviour (**live**) |
| B2 | Signed out | The "Your work" tab invites sign-in; it shows no data (**live**) |
| B3 | "FreeFlow in public" | Visible signed in and out; shows counts for people using FreeFlow, launch list, things you asked for (shipped), bugs testers found / fixed, game rounds played, try-free clicks, and votes per roadmap item or a link to them (**live**) |
| B4 | Counts only | The counts come from one `security definer` function returning aggregates; no select policy exists on any Week 6 table; no row, email or name reaches the browser (**source**, **auto**) |
| B5 | Honest numbers | Small numbers shown as they are; "people using FreeFlow" excludes graders and the owner's `count_exclusions`; unavailable counts say so instead of showing 0 (**source**, **live**) |
| B6 | One list | "Things you asked for, shipped" is the length of the same static list `/demo` shows (**auto**) |

### `/docs` sections

| # | Requirement | Acceptance criterion |
|---|---|---|
| S1 | The journey (agent map) | One line, Start → Now, seven numbered steps (Dashboard 0, Paste a brief 1, Research 2, Pricing 3, Marketing 4, Help desk 5, One venture 6); one card at a time with "What it was for / What was built / What changed" and one line naming what powers it; Back/Next and clickable steps (**live**, **auto** on the data) |
| S2 | Week-by-week timeline | One card per week with what was built and the decision that mattered; each opens to its prompts, iterations, tests and decision (**live**) |
| S3 | Prompt library | Every coding prompt, exact text, filterable by week (**live**, **auto**: each prompt has a week and a source file) |
| S4 | Testing summary | Week 6 external tests and the regression results, filled in only from real sessions; placeholders say so until then (**source**) |
| S5 | Impact check | "Does it help?" (evidence only), the risk table (what could go wrong, who is hurt, what protects), the "make it right" ladder (no cash promise), and "Can it last?" (**live**) |
| S6 | V2 roadmap | Next / Later / Someday items from one static list, each with an upvote (see V1–V4) (**live**) |
| S7 | No friend names | No friend or tester name anywhere on the page (**source**) |

### `/demo` chapters 1–6 (one night, 11:47 pm to morning)

| # | Requirement | Acceptance criterion |
|---|---|---|
| F0 | Shell | A clock advances as you scroll: it comes from scroll progress, 11:47 pm at the top to 8:00 am at the end, so the per-chapter times in the mockup are illustrative; the mood moves from tense (red-tinged edges) through calm to morning light; "Try FreeFlow free" stays reachable throughout (sticky) (**live**) |
| F0b | Job picker | Designer, photographer, video editor, writer, developer; default designer; the choice re-colours the accent in a wave from the click point, swaps worries, project names and game projects, and persists for the visit; text contrast stays accessible (**auto** on job data, **live**) |
| F1 | Chapter 1, 11:47 pm (Attention) | "I'm a freelance [job], and it's all in my head." Worries for that job pop in, the counter and red edges rise; a worry dragged into the FreeFlow panel, or tapped, lands as a calm checked row; after three, "You can't keep up by hand. Nobody can." and "Let FreeFlow handle the rest" appear; pressing it files the rest and the headline becomes "…and now it's all in one place." (**auto** on the sorting logic, **live**) |
| F2 | Chapter 2, midnight (Interest, guided walkthrough) | Each worry resolves into a numbered step naming a built feature, with a one-line benefit and a sample view labelled as sample, grouped Money / Paperwork & tax / Organization; every step maps to a feature marked built in `lib/product/features.ts` (**auto**) |
| F3 | Chapter 3, 1 am (story) | First-person story edited from `docs/week6/FOUNDER_STORY_SOURCE.md` and approved by the owner; ends unsigned; "Brayden" writes itself in handwriting on scroll into view, hover or tap, followed by a short P.S.; no photo (**source**, **live**) |
| F4 | Chapter 4 (Desire, proof) | "You said → we changed" entries from one static list; each cites its source file; the first is the pricing advice, paraphrased and never quoted (`docs/week6/SOURCE_NOTES.md`, entry 1); friends unnamed; labelled placeholders until tester entries exist (**auto**) |
| F5 | Chapter 5 (Climax) | The game (see G1–G8) |
| F6 | Chapter 6, 8:00 am (Action) | Primary "Use FreeFlow free now" → sign-up, recorded as `try_free_click`; secondary launch-list form (see L1–L5); no price (**live**, **source**) |
| F7 | Footer | Contact and feedback `mailto:` to the public address, "If we get it wrong" → the impact section in `/docs`, and the launch-list privacy note (**live**) |

> **Changed after Gate 1.** The front page (Nov 12) and the game (Nov 18) were redesigned after the owner's review, each with its own design written before code (`docs/superpowers/specs/`). Live now: worries turn into checked rows as you scroll (replacing F1), START FREE ends the page (replacing F6), and the game is **Answer gates**, a flying memory game (replacing G1–G6; G7–G8 still hold). The donations page and per-project pricing are switched off for now.

### The game

| # | Requirement | Acceptance criterion |
|---|---|---|
| G1 | Timed | A 60-second round that starts on first interaction (**auto**) |
| G2 | Work | Clicks fill a project's progress; a finished project becomes an invoice; project names follow the picked job (**auto**) |
| G3 | Ageing | Invoices age fresh → yellow → red (overdue); collecting pays the current value; overdue invoices lose value (**auto**) |
| G4 | Upgrades are real features | Paste a brief (more work per click), Overdue alert (warning pulse, slower loss), Contract tracking (overdue invoices keep most of their value), Payment terms (invoices collect themselves on schedule); each links "This is real in FreeFlow" to the feature (**auto**) |
| G5 | Score and end | Score = money collected; end screen "You collected $X. FreeFlow does the chasing for you.", personal best from this browser only, the launch-list and "Try FreeFlow free" actions (**auto**, **live**) |
| G6 | Winnable | A scripted strategy that buys upgrades beats one that doesn't (**auto**) |
| G7 | No leaderboard, no prize | No score is sent to a server; only a `round_played` event is recorded (**source**) |
| G8 | Hidden tab, keyboard, touch | Pauses when the tab is hidden; a long gap between ticks cannot end the round or wipe invoices; playable by keyboard and touch (**auto**, **live**) |

### Launch list

| # | Requirement | Acceptance criterion |
|---|---|---|
| L1 | Consent | The form can't submit without the consent box ticked; the route rejects `consent: false` (**auto**) |
| L2 | Validation | Email is trimmed, lower-cased, valid and at most 254 characters (**auto**) |
| L3 | Repeat sign-up | The same email twice reads as success, never as an error (**auto**) |
| L4 | Privacy note | Says who holds the emails (Brayden, at the public address), what they are for (launch news only) and how to be removed (email him; every launch email has a remove-me link) (**source**) |
| L5 | Protected | Rate-limited; no public read; 503 with a calm message when the database is unreachable (**auto**) |

### Votes (V2 roadmap)

| # | Requirement | Acceptance criterion |
|---|---|---|
| V1 | One vote per item per browser | The browser remembers its vote; a second vote on the same item reads as success, not an error (**auto**) |
| V2 | Valid items only | The route rejects an item id not in the static roadmap list (**auto**) |
| V3 | Counts | Vote counts per item come from the counts function, never from rows (**source**) |
| V4 | Storage blocked | With browser storage unavailable, voting still works or fails quietly; the page never breaks (**source**) |

### `/pricing` fixes

| # | Requirement | Acceptance criterion |
|---|---|---|
| P1 | Framing line | One line on `/pricing`: the tiers are a possible long-term model; the plan for launch is a one-time purchase for full access (**live**) |
| P2 | CFDI marked planned | Where `lib/pricing/tiers.ts` lists CFDI as a tier feature, it reads "planned" (**auto**) |
| P3 | Nothing else changes | The analysis and segment prose are unchanged (**source** diff) |

## 🏗 Architecture: frontend, backend, database, data flow

```
Static content modules (typed TypeScript, in the repo, one source each)
  lib/funnel/*   jobs + accents, worries, walkthrough steps, story, copy
  lib/venture/*  "You said → we changed" changes, roadmap, journey, timeline,
                 prompts, testing (bugs found/fixed)
  lib/game/engine.ts   pure game logic (tick, age, collect, upgrades, score)
        │ read by
        ▼
Pages (Next.js App Router)
  /demo  (also / signed out)  ── DemoFunnel: chapters 1–6, game, sticky CTA
  /dashboard                  ── "Your work" (existing dashboard) + PublicNumbers
  /docs                       ── JourneyStepper, WeekTimeline, PromptLibrary,
                                 TestingSummary, ImpactCheck, Roadmap
  every page                  ── <Dock /> in app/layout.tsx
        │ anonymous writes (rate-limited, zod-validated)
        ▼
  POST /api/funnel         { event, job?, visitId }    → funnel_events
  POST /api/launch-list    { email, consent, source }  → launch_list
  POST /api/roadmap/vote   { itemId, voterKey }        → roadmap_votes
        │ insert-only RLS, no select policy on any of them
        ▼
Supabase (Postgres)
  funnel_events · launch_list · roadmap_votes · count_exclusions (owner-filled)
  venture_counts()  security definer → JSON of totals only
        │ read via supabase.rpc("venture_counts")
        ▼
  "FreeFlow in public" tab (/dashboard)  and  vote counts (/docs roadmap)

Signed-in records (unchanged): /dashboard "Your work" → existing projects table (RLS per account)
Routing: proxy.ts (Next.js 16) · / signed in → /dashboard · / signed out → funnel
No database or AI key → /demo still works fully; writes answer 503 { saved: false }
```

## 🧰 Tech Stack: tools, libraries, services, and why

| Tool | Why |
|---|---|
| Next.js 16.3 App Router, React 19 | The existing app; `proxy.ts` handles route protection |
| Tailwind v4 with `app/globals.css` tokens | Existing brand system; job accents added there once |
| `next/font/google` (Geist, Caveat) | Geist is the brand face; Caveat draws the "Brayden" signature. Free, self-hosted at build |
| Supabase (Postgres, RLS, `@supabase/ssr`) | Existing auth and database; three insert-only tables and one aggregate function |
| zod 4 | Already installed; validates every write route |
| `lib/ratelimit.ts` | Existing sliding-window limiter, no dependency |
| CSS and small hand-written TypeScript for motion | No animation library: smaller, and easy to give a reduced-motion version |
| Node strip-types test runner (`scripts/test-*.ts`) | The project's existing test setup; new suites for venture content, funnel content and the game |
| Vercel + GitHub | Existing deploys; free tier |

No paid API is required. Paste a brief keeps its existing Claude call with a labelled
fallback; nothing new uses AI at runtime.

## ⚙️ DevOps: GitHub, Vercel, Supabase, env variables, deployment plan

Work on branch `week6`. GitHub `main` deploys to Vercel production
(https://www.freeflow.website); each push to the branch gets a preview. Environment
variables are unchanged: no new keys. The migration `supabase/week6_venture.sql` is run by
the owner in the Supabase SQL Editor; it is idempotent, never drops a table and ends with a
verify block. Until it is run, the write routes answer 503 and the public counts show as
unavailable, which is the designed degraded state. Each push is gated on exit codes:
`npm test`, `npm run lint`, `npm run build`, then `npx tsc --noEmit`. At least 5 commits and
2 Vercel deployments: the first after the full-site regression, the second after fixing a
bug the external testers found.

## 🧪 Test Plan: how will you verify it works?

- **Automated (`npm test`, `npm run test:chat`):** venture content integrity (every change
  cites an existing file, roadmap ids unique, journey has seven steps, prompts have weeks);
  funnel content per job (every walkthrough step is a built feature, five jobs, accents from
  the brand); game engine (timer, ageing, collection, each upgrade's effect, scoring,
  winnability, long-tick clamp); schemas (email normalisation, consent, unknown item, unknown
  event); route source checks (rate limit before parsing, 503 with no client, `23505` as
  success, never `.select(`); UI source checks (real buttons, storage wrapped in
  try/catch, canonical link, no price strings, no friend names).
- **Live checks:** every page signed out, signed in, and at 375 px, including the Dock on
  each; `/demo` with the database unreachable; `/` signed in and out; a real launch-list
  sign-up and a repeat; a vote and a repeat; the public tab with no personal data.
- **Full-site regression:** all automated suites plus the live checks above, recorded in
  `docs/week6/TEST_EVIDENCE.md`.
- **5 external users** (recruited by the owner): each walks `/demo` → sign-up → dashboard →
  docs. Only what really happened is recorded, in `docs/week6/EXTERNAL_TESTS.md`, with no
  names. At least one bug they find is fixed, tested and redeployed, and logged in
  `docs/week6/ITERATION_LOG.md`.

## 🤖 Coding Agent Prompt: exact prompt to Claude Code

> Implement `docs/superpowers/plans/2026-11-09-week6-integrated-venture.md` task by task
> against the spec `docs/superpowers/specs/2026-11-09-week6-integrated-venture-design.md`,
> and build only the agreed scope in `docs/week6/PLAN.md`. Before writing route, layout,
> metadata or font code, read the relevant guide in `node_modules/next/dist/docs/`: this is
> Next.js 16 and route protection lives in `proxy.ts`. Test first for every pure module
> (content, funnel, game, schemas) and keep `npm test`, `npm run lint`, `npm run build` and
> `npx tsc --noEmit` green. Match the feel of the validated prototypes in
> `.superpowers/brainstorm/*/content/` and use `app/globals.css` as the only source of
> colour. Never state a price on a new page, never name an unbuilt feature on `/demo`, never
> invent a testimonial, count, rating, logo or "You said → we changed" entry, and keep
> friends and testers unnamed. Every animation needs a calm reduced-motion version, every
> interaction must work by keyboard and touch at 375 px, and `/demo` must work with no AI
> key and no database. Add no paid service and no runtime dependency without a one-line
> reason. Never handle the Supabase secret key: the owner runs `supabase/week6_venture.sql`.
> The course coding tasks map onto the plan as: integrate all pages (Tasks 6 and 9: the
> Dock and `/` routing), create /dashboard (Task 7), create /demo (Tasks 9–12), create agent
> map (Task 8, the journey stepper), create testing summary (Tasks 8 and 15), create
> version 2 roadmap (Tasks 2, 5 and 8).

---

# Weekly Submission Packet: Evidence

| Item | Required | Delivered |
|---|---|---|
| 🌐 Live URL | Working deployed page | ✅ https://www.freeflow.website/demo (HTTP 200) |
| 🧩 Build Discipline Packet | Complete before coding | ✅ Above, committed before any Week 6 code (`a457cd0`) |
| 🖼 UX Image / Mockup | Image or wireframe | ✅ Four mockups + implementation note (above) |
| 🧱 Product Spec | Requirements + acceptance criteria | ✅ Above |
| 🏗 Architecture Sketch | Data flow and components | ✅ Above |
| 🧑‍💻 GitHub Commits | Minimum 5 | ✅ **70** for Week 6 (below) |
| 🚀 Vercel Deployments | Minimum 2 | ✅ 8 production deploys (below) |
| 🗄 Supabase Evidence | Table/data evidence | ✅ Migration verify output and live counts (below) |
| 🤖 Prompt Log | Minimum 5 coding prompts | ✅ **55** (below) |
| 🧪 Test Evidence | 5 external users + full-site regression | ✅ Regression (Nov 21) and an AI-automated pre-test, marked as AI, with its 35 findings worked through (below). [[⬅️ 5 external users: TO BE ADDED]] |
| 🔁 Iteration Log | What changed after testing | ✅ Review fixes and the AI pre-test fixes (below). [[⬅️ fix from the external users: TO BE ADDED]] |
| 🎥 Demo Video | 5 minutes | [[⬅️ TO BE ADDED]] |
| 🧠 Human Decision Note | 150–250 words | ✅ 246 words (below) |

## Week 6 commits

| Commit | Date | What |
|---|---|---|
| `0019133` | Nov 9 | Week 6: approved design for the integrated venture (demo funnel, Dock, dashboard, docs) |
| `497e7ab` | Nov 9 | Week 6: implementation plan |
| `a457cd0` | Nov 10 | Week 6 Gate 1: build discipline packet, source notes and mockups |
| `cb494a9` | Nov 10 | Week 6 Gate 1: pricing source from the real chat, PLAN fixes, 1x mockups |
| `99fac36` | Nov 10 | Week 5: replace tester first names with Tester 1-3 |
| `4179870` | Nov 10 | Week 6: venture content modules (changes, roadmap, journey, timeline, prompts) |
| `c93335f` | Nov 10 | Week 6: per-job funnel content, walkthrough map and job accent tokens |
| `c92c9e9` | Nov 10 | Week 6: pure game engine with tests |
| `54a3406` | Nov 10 | Week 6: venture tables, aggregate counts function and anonymous write routes |
| `ffb515b` | Nov 10 | Week 6: Mac-style Dock replaces the top bar's page links |
| `cca4905` | Nov 10 | Week 6: /dashboard with your work and FreeFlow in public |
| `52d4461` | Nov 10 | Week 6: /docs with journey, timeline, prompts, testing, impact and roadmap |
| `514566c` | Nov 10 | Week 6: /demo shell with job picker, story clock and mood; / serves the same funnel |
| `d08df00` | Nov 10 | Week 6: chapter 1, sort the night's worries |
| `2630dd7` | Nov 10 | Week 6: chapters 2-4, walkthrough, signed founder story, you said we changed |
| `4d7a8fe` | Nov 10 | Week 6: chapter 5 game, chapter 6 morning, launch list and footer |
| `9244b50` | Nov 10 | Week 6: /pricing says the tiers are long-term and CFDI is planned |
| `eee0ea6` | Nov 10 | Week 6: lint fix in funnel tests (prefer-const) |
| `5e88951` | Nov 10 | Week 6: final review fixes (Dock misclick, drag flicker, phone scroll, help desk, SQL checks) |
| `91cb087` | Nov 10 | Week 6: fixes re-graded from the review's minors (stale drag click, phone clipping, double round count) |
| `9cdc45d` | Nov 10 | Week 6: prompt log (28 prompts, quoted from the session transcripts) |
| `876cac4` | Nov 10 | Week 6: test evidence for regression, migration and deploy #1 |
| `50fb593` | Nov 10 | Week 6: test evidence names the right commit |
| `b202d84` | Nov 10 | Week 6: founder story says FreeFlow was built by choice, not for a class |
| `3dc3b02` | Nov 10 | Week 6: founder story wording approved by the owner |
| `9ce4805` | Nov 10 | Week 6: signed-in and 375 px live checks pass |
| `bf08960` | Nov 11 | Week 6: submission packet draft (only what the rubric and dropbox sheet ask for) |
| `acc9bad` | Nov 12 | Week 6: /demo redesign decisions so far (working notes from the brainstorm) |
| `61233a1` | Nov 12 | Week 6: /demo front page design (draft for approval) |
| `3101739` | Nov 12 | Week 6: /demo front page design: neutral game fallback, visit memory, colour wave |
| `c919693` | Nov 12 | Week 6: /demo front page plan; design approved |
| `d25e426` | Nov 12 | Week 6: /demo choices: neutral start, Brayden's own, accents and copy |
| `560f366` | Nov 12 | Week 6: /demo worry field layout and counter; retire the old sort state |
| `3e0ab27` | Nov 12 | Week 6: /demo hero worry field, job word picker, contour lines |
| `6ee5bf2` | Nov 12 | Week 6: /demo flows pin, serif story with drawn line, START FREE band, square top link |
| `e538d86` | Nov 12 | Week 6: /demo wired: hero, flows, story, band; contours and smooth scroll; red glow retired |
| `45c1bf2` | Nov 12 | Week 6: /demo flows. fills (not drains); sorted rows settle into line; local checks recorded |
| `c4227ad` | Nov 12 | Week 6: /demo review fixes: colour wave visible, touch drag works, picker fits a phone, Sort it for me scrolls to the rows |
| `fcd5cfa` | Nov 18 | Week 6: /demo game design: Answer gates (fly and remember), little freelancer, four obstacle styles |
| `e8401e7` | Nov 18 | Week 6: /demo game plan (Answer gates) |
| `32dcc8c` | Nov 18 | Week 6: game engine: flying, columns, hearts and score (Answer gates) |
| `342df4c` | Nov 18 | Week 6: game engine: jobs, changes and answer gates |
| `47ed144` | Nov 18 | Week 6: game art: little freelancer and four obstacle styles |
| `19079f8` | Nov 18 | Week 6: /demo chapter 5 is Answer gates |
| `8a974ef` | Nov 18 | Week 6: Answer gates fits the window height; overlays match the game square |
| `bf53758` | Nov 18 | Week 6: Answer gates local checks recorded |
| `c9b8ea1` | Nov 18 | Week 6: Answer gates review fixes: fits its card on phones, no accidental starts while scrolling, red only for overdue |
| `284a9d3` | Nov 18 | Week 6: Answer gates polish: missed gates show the answer, messages shown in full, end screen focus and screen-reader labels |
| `6690205` | Nov 18 | Week 6: Answer gates deploy and live checks recorded |
| `c07f942` | Nov 18 | Week 6: /demo hero: scrolling turns each messy note into its checked row smoothly, one after another |
| `3a620e6` | Nov 18 | Week 6: /docs build log and prompt library cover the redesign and the game; impact check no longer claims testers early; prompt log to 47 |
| `76d84cc` | Nov 18 | Week 6: packet up to date: redesign and game noted as changed after Gate 1, 51 commits, 6 deploys, 47 prompts, Nov 18 regression, iteration log |
| `c780fa4` | Nov 18 | Week 6: donations switched off for now: /support answers 404, gone from the Dock, dashboard, pricing and help desk; code kept behind DONATIONS_ENABLED |
| `366d8ac` | Nov 18 | Week 6: per-project pricing hidden from /pricing (tab, Project tier, segment, help desk); code kept behind PER_PROJECT_PRICING_ENABLED |
| `4342324` | Nov 18 | Week 6: no curse words on the site: the interviewee quote on /pricing reads "install [jobs]"; a test scans the site for them |
| `efe5d13` | Nov 18 | Week 6: human decision note added to the packet (owner's own words, 246 words) |
| `6d3902b` | Nov 18 | Week 6: packet holds only what Module 6 asks for |
| `ff29f5c` | Nov 19 | Week 6: user-testing handoff: the AI personas' findings by problem, with 18 screenshots (emails blurred) |
| `689a820` | Nov 19 | Week 6: user-testing handoff: method section trimmed to accounts, sessions and what was recorded |
| `a7a68a8` | Nov 19 | Week 6: user-testing handoff labelled as not the assignment's external user tests |
| `13fb5ed` | Nov 19 | Week 6: packet records the AI-automated pre-test, marked as AI and kept apart from the 5 external users |
| `38e4714` | Nov 19 | Week 6: AI pre-test table gets column headings |
| `81d8783` | Nov 19 | Week 6: review fixes: switches hide donations and per-project pricing everywhere |
| `76f4730` | Nov 21 | Week 6: H4 Mark paid can be undone (Mark unpaid) and dated (Paid on in Edit) |
| `6b2c87e` | Nov 21 | Week 6: AI pre-test fixes batch 1: labelled Dock, budgets read from briefs, form shows every error |
| `40667ac` | Nov 21 | Week 6: AI pre-test fixes batch 2: pricing says what it costs, invoices late after terms |
| `c48154d` | Nov 21 | Week 6: AI pre-test fixes batch 3: sign-up checks and plain errors, spam-first confirm page, privacy and terms |
| `c601d5a` | Nov 21 | Week 6: AI pre-test fixes batch 4: open help desk, visible sort button, phone fixes |
| `3557631` | Nov 21 | Week 6: AI pre-test fixes batch 5: forecast vs CSV explained, status casing, demo says what FreeFlow doesn't do |
| (this revision) | Nov 21 | Week 6: revised submission packet and Module 6 overview of changes and iterations |

## Vercel deployments

| # | Commit | Date | What went live |
|---|---|---|---|
| 1 | `9cdc45d` | Nov 10 | The integrated venture: `/demo`, the Dock, `/dashboard`, `/docs`, `/pricing` fixes |
| 2 | `3dc3b02` | Nov 10 | Founder story wording approved by the owner; test evidence |
| 3 | `c4227ad` | Nov 12 | The redesigned `/demo` front page: worry field, flows., serif story, START FREE band |
| 4 | `284a9d3` | Nov 18 | Answer gates, the new game, with its review fixes |
| 5 | `6690205` | Nov 18 | Test evidence for the game's deploy and live checks |
| 6 | `c07f942` | Nov 18 | The hero's notes turn into checked rows smoothly with the scroll |
| 7 | `81d8783` | Nov 21 | Donations and per-project pricing switched off, no curse words; checked live: `/support` 404, no Per-project on `/pricing` |
| 8 | `3428f6d` | Nov 21 | The AI pre-test fixes (H1–L10); checked live: 16 public pages 200 (new `/privacy`, `/terms`, `/robots.txt`, `/sitemap.xml`), unknown URLs get the branded 404, `/core` redirects to sign-in with `?next=`, `/pricing` leads with the cost line, the signed-out dashboard opens on the pitch |
| 9 | [[⬅️ TO BE ADDED]] | | Fix from the external tests |

## Supabase evidence

`supabase/week6_venture.sql` adds `funnel_events`, `launch_list`, `roadmap_votes` and `count_exclusions`, insert-only for the public API roles, plus `venture_counts()`, which returns aggregate counts only. Verify output after running it in the SQL Editor:

| rls_on | insert_policies | other_policies | anon_select_grants | counts |
|---|---|---|---|---|
| 4 | 3 | 0 | 0 | `{"users":2,"launchList":0,"tryFreeClicks":0,"roundsPlayed":0,"votes":{}}` |

Live writes on production: a roadmap vote saved, the same vote again read as "already voted", an unknown item was refused (400), a "Try free" click saved, and both counts rose on the live `/dashboard` and `/docs`.

---

# Prompt Log

All quoted from the session transcripts, typos kept; dates as the transcripts record them (UTC).

| # | Date | Prompt | Result |
|---|---|---|---|
| 1 | Nov 9 | "read all documents in this folder ('…/Module 6') then create a full outline using /brainstorm skill before beginning the build" | All four Module 6 PDFs read; brainstorming began before any code |
| 2 | Nov 9 | "That the webaite genuinely believes in listening to its users and cares about user efficiency and features that help customers. That the website had a lot of thought and intentionality" | The venture's message: built by listening. It became "You said, we changed" and the public roadmap |
| 3 | Nov 9 | "The payment design for the website came from a user and a friend of mine. It suggested that the models starts off being free, getting users on and over time once a actual customer base is built then I can add a one time subscription model because it makes it a lot easier than a repeat purchase" | Free now, one-time purchase later. Recorded with the friend's own chat in `SOURCE_NOTES.md` |
| 4 | Nov 9 | "yes that is potentially how I would price the webaite, if not I would just stick with the one time purchase, because its a tools based app it makes more sense from a pricing model in my opinion to be a one time purchase for full acccess" | No price on any new page; `/pricing` keeps its tiers, framed as a possible long-term model |
| 5 | Nov 9 | "Please outline only what I need for ONLY module 6, nothing from preious models, what does module 6 ask for?" | The requirement map in `PLAN.md` |
| 6 | Nov 9 | "I want you to follow marketing research for a page funnel, this is what I want /demo to be, I want it to be a landing page and a marketing funnel guided at grabbing users attention and using the complete marketing funnel to get them to use the product and buy it once I make it paid. use this handoff for reference, add any iterations if needed." *(pasted funnel brief)* | `/demo` became the landing page and an AIDA funnel |
| 7 | Nov 9 | "Would you recommend if the demo pages just merge into one? I would rather it build into one landing page instead having two seperate one I think it makes more sense, what do you think?" | One funnel: `/` signed out shows the same component as `/demo`; the old landing page was retired |
| 8 | Nov 9 | "If someone who is suigned in, they should be able to see the demo page if they click on it, because it doesnt necissarily mean that they have purchased or used the product yet" | `/demo` is public and works signed in |
| 9 | Nov 9 | "I was thinking that it was interactive, … I would like the page to be flowy, dynamic and creative, something that isnt "ordinary" something that is showy but still minimal, please ask questions until 100% sure" | Interactive story direction; reference sites reviewed next |
| 10 | Nov 9 | "mouse or finger, I dont know exactly what I want the game to be yet, I was initially thinking something sort of like cookie clicker but instead of cookies its related to freelance" | The 60-second freelance clicker: work, invoice, collect, upgrade |
| 11 | Nov 9 | "I dont know what to go for, I like the Playfolly idea because it plays more along the customized for the user idea but I also like the chaos to flow, showing a real example of the issue that users have thats also interactive" | Both: the "I'm a freelance…" job picker and the worry-sorting night |
| 12 | Nov 9 | "I would like to try a different iteration of both parts, they look okay but I feel as though something is missing, It does not feel interactive or emotive enough" | Hero v2: stress builds, you sort it, relief |
| 13 | Nov 9 | "… fixing the top features bar, I think it is too crowded and would like something like an animated toolbar feature, when you hover or click it, it expands with all of the different feature pages, like the toolbar on a laptop" | The Dock |
| 14 | Nov 9 | "… I want it to build up to the finally instead of being thrown into one section of the page. I want everything to mesh, to flow and tell a story" | One night, 11:47 pm to 8:00 am, in six chapters with the game as the climax |
| 15 | Nov 9 | "What the different sections / modules were for, what was built or done, what changed. I want someone to understand the journey that the website took" | The `/docs` journey stepper (the agent map) |
| 16 | Nov 9 | "The mockup feels like a lot and feels overwhelming, too much going on visuall for the user to be able to spot a certain begin and end out" → "perfect" | One line, Start to Now, one card at a time |
| 17 | Nov 9 | "The outcome I would worry about the most is how it effected the user and its client, what the real damage was and how I can better and fix it, but also compensate the user. …" | The impact check's harm table and "make it right" ladder |
| 18 | Nov 9 | "Im not sure yet, ca you do research on what small startups like this have done in order to compensate or fix an issue regarding its user issue? …" | Ladder ends at free lifetime access; no cash promise |
| 19 | Nov 9 | "Something I would add or change would be an easier to use forecaster or income predictor, …" + "More legal sections that are for more users than just in mexico city, usa europe etc.more languages and currency list." | The V2 roadmap |
| 20 | Nov 9 | "I can get 5 testers dont worry about that" | External testing left to the owner; nothing invented |
| 21 | Nov 10 | "There should be no leaderboard yet but for now just the game, the leaderboard can be figured out later once we figure out how to proof the cheating." | No leaderboard, no score sent anywhere; leaderboard is a "Later" roadmap item |
| 22 | Nov 10 | "I dont want my photo to be up there now but my name yes, … can you help me brainstorm a cool hover effect?" → "I like C a lot, it feels personal and true to me" | The story is signed "Brayden" in handwriting that writes itself; no photo |
| 23 | Nov 10 | "I want the friend to stay unnamed. create a mockup yourself please. This is most of the founder story …" | Founder story saved verbatim; mockups made by Claude as HTML rendered to PNG |
| 24 | Nov 10 | "I did videography and video editing, something that for me was very time consuming …" | The story opens with it; video editor became a job in the picker |
| 25 | Nov 10 | "Use subagent driven, before continuing use /handoff" | Plan executed task by task; Gate 1 packet built and reviewed first |
| 26 | Nov 10 | "He had told me to do the facebook strat, I can paste the conversation here. … I would rather keep the repo light to reduce load times etc... Do what you think is best" | The friend's real chat transcribed into `SOURCE_NOTES.md`; mockups shrunk to 1x |
| 27 | Nov 10 | "continue to work, use native for now as its quicker and we can do a full sweep for the end to ensure stability and speed" | Tasks 2–13 built test-first inline; a fresh whole-branch review at the end found 4 important issues, all fixed |
| 28 | Nov 10 | "continue" | Testing and submission documents prepared while the deploy waits on the owner's steps |
| 29 | Nov 12 | "draft ONLY what it asks for, nothing more nothing less. … Additionally one change I would like to make, the front screen doesnt feel as unique and creative as I want, it feels like a generic page generated in the same typical claude format, … Please look specifically at the lando norris one, I think that would be something I would like to make my own in my own creative way." | Packet trimmed to the rubric; the `/demo` front page redesign began from playable mockups |
| 30 | Nov 12 | "I like Option B the most because its the most unique and used with this background and with this design at the end" | The worry-field hero with contour lines chosen |
| 31 | Nov 12 | "… also the Use freeflow now button is very Claude code typical style, please make something that blends better into the page, more unique more clean / sharp" | Square top link and the START FREE band |
| 32 | Nov 12 | "I like version 2 the most, … I prefer the end page of version 3 the most, it stands out, hard to miss and is attention grabbing. Also the secondary color choice options, I want an option just for me, to be catered to me, I want it to be a greyish color. …" | Version 2 page with version 3's ending; "Brayden's own" grey choice |
| 33 | Nov 12 | "… I am worried that all of the additions are too much for the funnel, too many things going on at the top while having to choose your own color. What do you think, based on marketing research is it too much" | Extras hidden until they matter; the job word itself became the picker |
| 34 | Nov 12 | "I think the top clustered invoice messages is a little too much and should maybe be lower, placed below the hook, also please fix the hook format for videographer, the comma should be on the same line" | Worries drift under the headline; the hook keeps its comma on one line |
| 35 | Nov 12 | "I would like to keep the same slash design in the original mockup, however I would like it to go below the text and not through it, … one more thing I would like to start with a grey or more neutral color and not a specific type of job." | Slash line under the story; the page starts neutral ("I'm a freelancer") |
| 36 | Nov 12 | "Build the front page for now, based on what is already approved and the game can follow as its own update once we brainstorm and work it out more" → "push now and we can iterate if I want to make any changes" | Front page built, reviewed and deployed; the game left for its own update |
| 37 | Nov 16 | "I want 3 playable prototypes, also help me brainstorm after building them an idea for a unique game that could increase user engagement and likelyness of conversion into downloading the app" | Three playable game prototypes: Remember?, Keep it flowing, Yes/no/invoice |
| 38 | Nov 16 | "I mean converting as in getting people to sign up and to use the website, … The whole point is to make the whole funnel flow and make sense to the user in a way that all of the information is clear, easy to understand, the mission of the website and a last little game to hint to the user that I care about user experience and also build reputation and trusy" | The game's purpose written down: memorable, a sign of care, and a path to signing up |
| 39 | Nov 16 | "… I dont want to add more work for the user, … I dont necissarily want to add more steps to allow someone to feel bored but want the website funnel to read as one clear story … I want to keep the memory game, but I want two new versions of games … even a side scroller like flappy bird but instead it has little invoices as obstacles and the thing flying through is your character." | No setup before playing; two one-button prototypes: Fly the week, Stack the week |
| 40 | Nov 16 | "I like fly and I like the remember game, … I think maybe we can combine the two to make it about memory but also in a way also still that same flappy bird ish style, create this idea along with two more mockup ideas for a game" | Three ways to combine flying and memory: Answer gates, Fly then recall, Your head vs FreeFlow |
| 41 | Nov 16 | "Side question: Does it say anywhere in freeflow that the predictions or information shown should also be self tested or verified on your own. …" | Audit of the site's "check it yourself" wording; per-feature caveats exist, no general line |
| 42 | Nov 16 | "I would keeo game 1 for now. I want to develop little characters and actual designs for it though. Please help me brainstorm mockups for the flying figure aka your character amd barriers" | Four characters and four obstacle styles mocked up together |
| 43 | Nov 16 | "would it make sense to have an option to pick your own template for the obstacles but to keep the little man on the laptop as the main character" → "available from the start" | The little freelancer on a laptop, with four obstacle styles all available |
| 44 | Nov 18 | "Nothing for now. Again if anything needs to be changed or iterated it can be done later I like this current version and want to commit" | Answer gates design written, reviewed and planned, then built test-first |
| 45 | Nov 18 | "Fix smaller issues. when done merge into main and deploy" | The review's minor findings fixed test-first; Answer gates deployed |
| 46 | Nov 18 | "One fix for the live demo page, when scrolling I want the messy invoices to smoothly become checked, right now the animation does not fit the flow of the page" | The hero's notes now turn into checked rows with the scroll, one after another |
| 47 | Nov 18 | "Now cross check Module 6 requirements with what has been pushed so far. What is missing?" | Requirement check; packet, prompt log and `/docs` brought up to date |
| 48 | Nov 18 | "finish everything you can on your own. When finished help brainstorm human decision note" | Packet brought up to date; the decision note drafted from the owner's own words |
| 49 | Nov 18 | "One more thing, Removee the donations page for now, it was not asked for the final assignment and will add confusion. Keep the code but and everything, when project is done we can bring it back" | Donations switched off behind `DONATIONS_ENABLED`; `/support` answers 404 |
| 50 | Nov 18 | "Remove the per project pricing from the pricing section as well" | Per-project pricing hidden behind `PER_PROJECT_PRICING_ENABLED` |
| 51 | Nov 18 | "remove any curse words on the website" | The interview quote reworded; a test scans the site |
| 52 | Nov 18 | "drop it. When complete revise the submission document and make sure it ONLY includes what is asked for in the documents procided for module 6." | Packet trimmed to the Module 6 documents |
| 53 | Nov 19 | "You are going to run an automated user-testing study on my website using 5 separate, isolated browser sessions representing 5 distinct test users. …" | The AI-automated pre-test: five AI personas, 35 findings |
| 54 | Nov 19 | "Record it truthfully and mark it as AI automated in the submission document" | The pre-test recorded as AI, apart from the 5 external users |
| 55 | Nov 21 | "Fix all of testers problems / found errors and bugs when done create a new submission document and a overview of the changes and iterations done for module 6" | All 35 findings worked through test-first in six commits; this revised packet and `MODULE6_CHANGES_OVERVIEW.md` |

---

# Test Evidence

## AI-automated pre-test (not the 5 external users)

**This test was run by AI, not by people.** On Nov 18–19, Claude Code drove five AI test personas through the live site, each in its own isolated headless Chromium browser (Playwright 1.65). It does not count toward the five external users below, who are still to be recorded. The prompt that started it: *"You are going to run an automated user-testing study on my website using 5 separate, isolated browser sessions representing 5 distinct test users."*

| Item | Detail |
|---|---|
| Personas | Impatient first-timer, non-technical casual user, power user, skeptical critic (all desktop, 1440×900) and mobile user (emulated iPhone 13, 390×844, touch) |
| Sessions | Each persona explored first signed out with no script, then signed in. The five accounts were the owner's own `+test` addresses, confirmed by hand in Supabase because the confirmation emails went to Spam |
| Recorded | Console errors, failed requests, HTTP errors and responses slower than 3 seconds, plus screenshots |
| Limits | At most 3 calls per AI feature (13 brief extractions and 8 help desk messages in total); no payments or account deletions. The live site was running older code than this branch (`week6` had 7 commits not yet deployed) |
| Result | 35 issues: 10 high, 15 medium, 10 low. Full write-up with screenshots: `docs/user-testing/USER_TESTING_HANDOFF.md` |

Highest-impact findings:

| ID | Finding | Personas |
|---|---|---|
| H1 | The live site still showed donations, the Per-project pricing tab and the curse word, all already fixed on `week6` but not yet deployed | All 5 |
| H2 | Every confirmation email landed in Gmail Spam, so sign-up looked like a dead end | All 5 |
| H3 | The floating "+" covers content on every page, and its menu is icons only | All 5 |
| H4 | "Mark paid" can't be undone and always records today's date; Edit still says "Invoice sent" | All 5 |
| H5 | Brief extraction drops a fixed budget ("budget 800 usd") and its currency, so the new project fails to save until the amount is typed | All 5 |
| H7 | An empty "Add project" submit shows one error at a time, off-screen | All 5 |

What worked: fast pages (public pages 0.2–0.75 s), no duplicate submits on double-clicks, odd input saved safely as text, the Mexican withholding arithmetic, and the CSV export.

These findings are AI judgements, treated as leads for the external users to confirm, not as measured user behaviour. All 35 were worked through on Nov 21. What changed for each is in Iteration Log step 4, and in full in `docs/week6/MODULE6_CHANGES_OVERVIEW.md`.

## 5 external users

| Tester | Date | What they did | What they said | What changed because of it |
|---|---|---|---|---|
| Tester 1 | [[⬅️]] | [[⬅️]] | [[⬅️]] | [[⬅️]] |
| Tester 2 | [[⬅️]] | [[⬅️]] | [[⬅️]] | [[⬅️]] |
| Tester 3 | [[⬅️]] | [[⬅️]] | [[⬅️]] | [[⬅️]] |
| Tester 4 | [[⬅️]] | [[⬅️]] | [[⬅️]] | [[⬅️]] |
| Tester 5 | [[⬅️]] | [[⬅️]] | [[⬅️]] | [[⬅️]] |

## Full-site regression test

Latest run: Nov 21, after the AI pre-test fixes (`3557631`), on a local production build. The live rows are from deploy 7 (Nov 21); the signed-in rows are from the Nov 10 run on the owner's account.

| Check | Result |
|---|---|
| `npm test` | 22 suites, 2,054 passed, 0 failed |
| `npm run lint`, `npx tsc --noEmit`, `rm -rf .next && npm run build` | all exit 0 |
| Live after deploy 7 | `/support` answers 404; `/pricing` has no Per-project |
| Signed out, local production build | `/dashboard` opens on the pitch with "Create a free account"; the Dock shows its names and two groups; `/pricing` leads with what FreeFlow costs; the help desk answers "How do I undo Mark paid?" correctly and keeps the conversation after a reload; "Sort it for me" is visible on `/demo`; `/demo` made no requests in 10 idle seconds |
| Phone width (390 px frame) | the Dock opens as a labelled grid; document width 388, nothing wider than the screen |
| Signed in (Nov 10) | `/` and `/login` go to `/dashboard`; "Your work" shows the records from Supabase; no sideways scrolling on any of 11 pages |
| Live writes (Nov 10) | vote, duplicate vote, refused vote, "Try free" click, counts rise |
| Live after deploy 8 (Nov 21) | 16 public pages 200; `/support` and unknown URLs 404 (branded page); `/core` → `/login?next=/core`; `/pricing`, `/dashboard` and `/chat` show the new copy signed out |
| Still to run | the signed-in flows (Mark unpaid, Paid on, Add to my projects) on the owner's account |

---

# Iteration Log: What Changed After Testing

## 1. A fresh code review of the whole site before release

Four problems a visitor would hit, each fixed with a test that failed first:

- Hovering opened the Dock and moved its button, so a click aimed at the button opened a page instead. Page icons now wait a moment before taking a click.
- A dragged worry stuttered because its shake animation fought the drag. Dragging now stops the shake.
- On phones, the worry panel blocked scrolling the page. Only the worries block it now.
- Three help-desk answers still described the old top bar and said FreeFlow sends no other email. They now match the site.

Three smaller findings were re-graded by their effect and fixed too: the first tap after a drag was ignored, a game round could be counted twice in the public numbers, and long worries were cut off on phones.

## 2. The owner's own review

- The founder story said it was built "for a class". It now says it was built by choice.
- The front screen "feels like a generic page". It was redesigned from playable mockups (Nov 12): the visitor's worries drift under the headline, the page starts neutral, and START FREE ends it.
- The game needed to fit the story's ending. Three rounds of playable prototypes led to Answer gates (Nov 18): fly and remember, with no setup before playing.
- The scroll sort "does not fit the flow of the page". The notes now turn into checked rows with the scroll, one after another (Nov 18).

## 3. Reviews of the redesign and the game

Each change got a fresh whole-branch code review; every important finding was fixed with a test that failed first:

- Front page (Nov 12): the colour wave was hidden behind the page, a finger drag was taken by the browser, the job picker was cut off on a phone, and "Sort it for me" didn't bring the rows into view.
- Answer gates (Nov 18): the game spilled past its border on phones, a finger scrolling past could start a run (and inflate the public "rounds played" count), and red was used for things that aren't overdue. Five smaller findings were fixed too, including missed gates now showing the answer and screen readers hearing the answer options.

## 4. From the AI-automated pre-test (not the external users)

The five AI personas' 35 findings (Test Evidence above) were each fixed with a test that failed first, in six commits on Nov 21 (`76f4730` to `3557631`). The ones every persona hit:

- **Mark paid can be undone and dated (H4).** A paid row offers "Mark unpaid", Edit has "Paid on", and Mark paid uses your own date, not the server's.
- **Briefs keep their budget (H5).** "budget 800 usd", "$1,800 flat" and "8,500 MXN" are read as a fixed total with their currency, "persona moral" and "SA de CV" as a company client, and one "Add to my projects" button replaces two.
- **The form shows every problem at once (H7).** In plain words, beside the button, with the cursor on the first; the deadline no longer defaults to today.
- **The menu has names (H3).** The Dock moved to the corner, shows every label in two groups, opens as a grid on phones, and the top bar names the tools on desktop.
- **Sign-up no longer looks like a dead end (H2).** The confirm page leads with "Check your Spam folder" and an Open Gmail button. The email settings themselves are the owner's step.

The rest:
- `/pricing` says what FreeFlow costs first (H9).
- An invoice is late after its payment terms, as the forecast assumes (M1).
- The help desk takes a typed question straight away, works signed out and survives a reload (M2).
- Privacy and Terms pages, a footer and a branded 404 (M5).
- Phone fixes (M7).
- Sign-in checks and plain errors (M14).

Each finding and its status is in `docs/week6/MODULE6_CHANGES_OVERVIEW.md`. Live since deploy 8 (`3428f6d`, Nov 21).

## 5. From the external tests

[[⬅️ TO BE ADDED: the bug a tester found, the failing test, the fix, the redeploy]]

---

# Human Decision Note

One of the biggest decisions I had to make for the module was how much work I put into the look and design of the front demo page. I gave several examples and inspirations from pages that I liked and how I could make it my own. I also needed a clear story from start to finish: what the website is, why it exists and how it works. I wanted it to be personalized to me and my users, keeping the same theme as the website, including color schemes that I liked and letting users pick their own color. The hard part was figuring out how to tell my story in such a short page without losing the user, so picking the best words and the best way to tell the story was a big part as well. I also replaced the cluttered top bar with a simpler dock. The game at the bottom of the demo page was important to me. I wanted to include something fun and interactive, having learned its importance in a previous class. I brainstormed and ended with a Flappy Bird style game that has you memorize invoices and answer questions along the way. I decided not to include a leaderboard yet, acknowledging the possibility to cheat and wanting more time to find a good solution. Lastly, I wanted the demo to stay available to signed-in users, because having an account does not mean they have converted into a sale yet.
