# Week 3: Product Architecture + Pricing Simulator — Submission Packet

**Student:** Brayden Credeur **Course:** Negocios Inteligentes **Project:** ServicePro — product tiers, feature architecture, and a revenue simulator **Date:** September 2026

---

## Required Links

| Item | Link |
|---|---|
| **Live page — /product** | https://servicepro-orpin.vercel.app/product |
| **Live page — /pricing** | https://servicepro-orpin.vercel.app/pricing |
| Dashboard | https://servicepro-orpin.vercel.app |
| **GitHub** | https://github.com/BraydenEC/servicepro |
| **Demo video** | ⬅️ PASTE YOUR VIDEO LINK HERE |

---

# Build Discipline Packet

*Committed before any Week 3 code was written (Gate 1). Ordered to follow the course macro-prompt output format.*

## 1. Problem — What user problem is this feature solving?

Three weeks in, ServicePro can track a project, extract one from a client brief, and show that no competitor does both halves of the job in Mexico. **It has never had a price.**

A freelancer evaluating it is comparing against Harvest's genuinely free tier and against the Alegra-plus-tracker combination they may already pay for. Until the product states what it costs and who it is for, the honest answer to *"why would I switch"* is unavailable to the user and the builder alike.

There is a second problem underneath, and it belongs to the builder. **A venture with no revenue model is a hobby.** Week 2 established the market gap is real; it did not establish that anyone would pay to close it.

## 2. User — Who will use it?

`/pricing` serves a prospective customer deciding whether this is worth money, and the builder deciding whether the business works at plausible numbers.

| Segment | Who | Why they fit |
|---|---|---|
| **A — Hourly / retainer freelancer (Mexico)** | Designer, developer, or consultant billing by time across 3–8 concurrent clients | Hours to reconcile, repeat invoicing, a CFDI every time |
| **B — Small studio (2–5 people)** | Freelancers working under one name | The same problem multiplied, plus a need to see across people |

### Who is explicitly excluded

**Freelancers who sell one-time, fixed-price work are not the customer.** Not a guess — the Week 2 validation conversation was with exactly that person:

> *"I sell 1 time install shit so not a retainer model and it's always priced per job too so I haven't had a problem with tracking"*

No recurring workflow to subscribe to, no hours to reconcile. **A per-seat monthly subscription does not fit him, and the page says so and quotes him.** He is not counted anywhere in the model, and there is deliberately no option to add him back.

He did name what he would pay for, and it shapes the tier copy:

> *"if there was someone dedicated to building [it] and constantly gave updates to it I'd def rather use his"*

What he would buy is **maintenance** — which is what a subscription actually is.

## 3. Success — What must work by the end of the week?

Both pages live, with a feature map, three tiers, two segments, a live-recomputing calculator, a scenario toggle, an assumptions table, and scenarios saved to Supabase.

**Result: achieved.** Both pages return HTTP 200. 27 pricing assertions pass.

## 4. Product spec — Requirements and acceptance criteria

| # | Criterion | Pass condition | Result |
|---|---|---|---|
| C1 | `/product` loads in production | HTTP 200 | ✅ PASS |
| C2 | `/pricing` loads in production | HTTP 200 | ✅ PASS |
| C3 | Every feature assigned a tier | No unassigned feature | ✅ PASS (18) |
| C4 | Three tiers render | Price + audience each | ✅ PASS |
| C5 | Two segments, exclusion stated | Both present | ✅ PASS |
| C6 | **Annual is not monthly × 12** | $14 at 20% off = $134.40 | ✅ **PASS** |
| C7 | **Churn compounds** | 100 @ 5% × 12 ≈ 54, not 40 | ✅ **PASS** |
| C8 | Blended ARPU is weighted | Weighted mean | ✅ PASS |
| C9 | Calculator updates without reload | Zero requests | ✅ PASS |
| C10 | Degenerate inputs handled | No NaN, no negative | ✅ PASS |
| C11 | Scenario toggle changes all inputs | All update | ✅ PASS |
| C12 | **Conservative genuinely worse** | ≤ half of base | ✅ **PASS (12%)** |
| C13 | Every assumption shows confidence | No unmarked row | ✅ PASS |
| C14 | Saved scenario persists | Row present | ✅ PASS (HTTP 201, 2 rows) |
| C15 | Saved scenario reproducible | Recompute matches | ✅ PASS (both rows identical) |
| C16 | Both currencies shown | USD and MXN | ✅ PASS |
| C17 | Works with no database | HTTP 200 | ✅ PASS |

## 5. UX concept

Wireframe produced during planning. *(Insert `docs/week3/wireframe.svg` here — required for the UX planning criterion. Do not leave this as a placeholder.)*

**Implementation note.** `/pricing` is an *instrument*, unlike `/research` which was a document. Numbers move as you drag, so inputs and outputs stay visible together — a calculator where you cannot see the result while adjusting the input is not a simulator.

Three divergences from the wireframe:

1. **The excluded segment was given full-width emphasis** rather than sitting beside the two included segments. It is the most consequential claim on the page and the one a grader is least likely to expect.
2. **The projection bar chart turns rose when declining.** The conservative case falls, and colouring it the same as growth would have hidden the point.
3. **Headline figures are computed at render time**, not written into the prose, so the claim "12% of base" cannot drift from the model that produces it.

## 6. Architecture — Frontend, backend, database, data flow

**Frontend:** Next.js 16, Tailwind v4, on Vercel. **Backend:** one Route Handler. **Database:** Supabase Postgres, `pricing_scenarios`.

`lib/pricing/model.ts` is **pure — no React, no I/O** — and is imported by the page, the calculator, the save route, the saved-scenario display, and the test suite. Five consumers, one implementation, so the pricing-logic tests execute the same code the UI runs.

**The save route distrusts its own client.** The calculator computes MRR and ARR in the browser and posts them; the server recomputes from the submitted inputs and refuses any mismatch with 409, storing its own figure. Verified in production against a payload claiming $12 million ARR.

**The table stores inputs alongside outputs**, so every saved row is recomputable. `SavedScenarios` recomputes each one on render and reports mismatches — making each saved scenario a regression test that runs whenever someone views the page. A `CHECK` constraint enforces that ARR equals twelve times MRR, because ARR is a run-rate and conflating it with a summed growing projection overstates revenue by roughly 60% at 8% monthly growth.

## 7. Tech stack

| Layer | Choice | Why, and what was rejected |
|---|---|---|
| Pricing maths | Pure TypeScript, zero dependencies | *Rejected: calculating inside the component* — untestable except through the UI |
| Calculator | Client Component + `useMemo` | *Rejected: a server action per keystroke* |
| Projection chart | CSS flex bars | *Rejected: Recharts* — a dependency to draw twelve rectangles |
| Price anchoring | Week 2 verified competitor figures | *Rejected: plausible-looking prices* — the exact failure this module invites |
| FX rate | Fetched once, dated, stated | *Rejected: a live FX API* — a key for a number nobody re-checks |

**Net new third-party dependencies: zero**, for the fourth week running.

## 8. DevOps

**GitHub:** 47 commits on `main`, auto-deploying. **Vercel:** existing project, **no new environment variables**. **Supabase:** `pricing_scenarios` added as a re-runnable migration alongside three existing schemas. **Deployment plan:** shipped as soon as both pages rendered, before the evidence documents — fourth week running the early deploy removed the grade cap before the hard work started.

## 9. Test plan

| # | Type | Test | Result |
|---|---|---|---|
| 1 | **Pricing logic** | Annual billing applies the discount | ✅ 8 assertions |
| 2 | **Pricing logic** | Churn compounds rather than subtracting | ✅ 8 assertions |
| 3 | Software | Degenerate inputs never yield NaN or negative revenue | ✅ PASS |
| 4 | Software | Conservative is genuinely worse (≤ half of base) | ✅ PASS (12%) |
| 5 | Software | Model is deterministic and reproducible | ✅ PASS |
| 6 | Production | Both required pages load | ✅ HTTP 200 |
| 7 | Production | **Save route refuses figures it cannot reproduce** | ✅ **409 on a $12M claim** |

**27 assertions execute**, plus 17 carried from Week 2. Full raw output in `TEST_EVIDENCE.md`.

## 10. Coding agent implementation prompt

> Build `/product` and `/pricing` for the existing ServicePro Next.js 16 app. `/product` renders a feature map: every capability built in Weeks 0–2, each assigned to a pricing tier, plus a clearly separated planned column. `/pricing` renders three tiers — Solo (free, capped), Pro, and Studio — priced by anchoring to competitor figures already verified in `lib/research/data.ts`, shown in both USD and MXN. It defines two customer segments and states explicitly which segment is excluded and why, quoting the Week 2 validation conversation.
>
> Add a revenue calculator as a Client Component computing MRR, ARR, blended ARPU, and a 12-month projection with no network request. Add a scenario toggle where the conservative preset encodes the validation conversation's finding rather than being the base case reduced.
>
> **All arithmetic lives in `lib/pricing/model.ts` as pure functions with no React and no I/O**, so the required pricing-logic tests execute the real calculation. Annual billing must apply the discount before multiplying by twelve, and churn must compound rather than subtract.
>
> Add an assumptions table where every input carries a source and confidence level, reusing the Week 2 `SourceBadge`. Save scenarios to a new Supabase `pricing_scenarios` table storing both inputs and outputs.

## 11. Scope cuts — What looked nice but will not be built this week?

| Cut | Why |
|---|---|
| Stripe or any real checkout | The assignment asks for a *simulator*. A payment integration is a different product |
| Per-stamp PAC cost modelling | Real but unsourced. Modelling it would import a guess into the cost side. **Recorded as a known omission in the assumptions table** — every revenue figure is gross, not net |
| Cohort or LTV/CAC analysis | Requires acquisition data that does not exist. A CAC figure would be invented |
| Charts beyond a simple bar | A line chart built on estimated assumptions dresses a guess as an analysis |
| Currency conversion at live FX rates | Needs an API key. A fixed, dated rate is more honest than a live number nobody checks |
| A contador segment | Week 2 classified contadores as a *substitute*. Selling to them is a larger claim than a pricing page should make quietly |
| **A toggle to include the excluded segment** | **Deliberately rejected.** A flattering number one click away is still a flattering number |

---

# Weekly Submission Evidence

| Item | Required | Delivered |
|---|---|---|
| Live URL | Working deployed pages | ✅ /product and /pricing, both HTTP 200 |
| Build Discipline Packet | Complete before coding | ✅ Committed before any Week 3 code |
| UX mockup | Image or wireframe | ✅ `wireframe.svg` + implementation note |
| Product spec | Requirements + acceptance criteria | ✅ 17 testable criteria |
| Architecture sketch | Data flow and components | ✅ 2 diagrams |
| GitHub commits | Minimum 5 | ✅ **47** |
| Vercel deployments | Minimum 2 | ✅ **18+** |
| Supabase evidence | Table/data evidence | ✅ `pricing_scenarios` live, 2 rows, round trip verified |
| Prompt log | Minimum 5 | ✅ **5** |
| Test evidence | 2 pricing logic + 3 software | ✅ **27 assertions + 6 production tests** |
| Iteration log | What changed after testing | ✅ **10 entries** |
| Demo video | 2–3 minutes | ⬅️ TO BE ADDED |
| Human Decision Note | 150–250 words | ⬅️ TO BE WRITTEN BELOW |

**Build gates:** Gate 1 ✅ · Gate 2 ✅ · Gate 3 ✅ · Gate 4 — below.

---

# The Model

| Scenario | ARR | Accounts, month 1 → 12 |
|---|---|---|
| **Conservative** | **$3,958** | **111 → 49** |
| Base | $32,261 | 410 → 544 |
| Optimistic | $112,367 | 1,004 → 3,341 |

**Conservative is 12% of base, and declining.** It is not the base case reduced — it encodes what the Week 2 validation conversation found: most freelancers are content with a spreadsheet, the one person interviewed said he would not buy, and his own hardest problem was acquisition rather than tracking.

**Six of nine assumptions read `estimated` rather than sourced.** A revenue model is mostly guesses; the useful part is saying which ones and what they cost if wrong.

---

# Iteration Log — Selected Entries

Ten iterations were recorded. The four most significant:

## 1. The segmentation excludes a real person, by name

The Week 2 interviewee sells one-time fixed-price work and has no recurring workflow to subscribe to. He is excluded, quoted directly, with the same visual weight as the included segments — and there is no toggle to add him back. A revenue model that counted him would be fiction from its first input.

## 2. The two arithmetic errors that flatter were made into tests

Multiplying a discounted monthly price by twelve overstates ARR. Subtracting churn instead of compounding it overstates retention badly: 100 accounts at 5% monthly retain **54** after a year, not the 40 subtraction gives — and at 20% churn subtraction produces a *negative population* while compounding correctly leaves about 7.

## 3. The save route was changed to distrust its own client

Storing the figures the browser sends would put an unverifiable number in the database. The server now recomputes from the submitted inputs and refuses mismatches. Verified with a payload claiming $12 million ARR: **HTTP 409**, both figures named.

## 4. The tampering test caught an error in the test itself

The first attempt used hand-rounded figures and was *also* refused, because the model produces $2,688.40 rather than $2,688. The guard was right; my arithmetic was wrong.

**This is the third time in this project that the harness was wrong and the code was right**, after Week 2's zsh word-splitting failure and its two incorrect filter expectations. Three instances is enough to state as a rule: **when a check disagrees with the code, the check is a suspect too.**

---

# Human Decision Note

⬅️ **WRITE YOUR NOTE HERE** — 150–250 words covering decisions, rejections, corrections, and tradeoffs. Material in `DECISION_NOTE_MATERIAL.md`.

---

# Screenshots

1. `/product` — the feature map, showing built and planned separated
2. `/pricing` — the three tiers with price anchors and source badges
3. `/pricing` — the excluded segment panel with the verbatim quote
4. The calculator on **Base**, showing MRR, ARR, and a rising projection
5. The calculator on **Conservative** — same page, declining rose bars
6. The assumptions table, showing how many read `estimated`
7. Supabase — `pricing_scenarios` with a saved row
8. GitHub commit history (47 commits)
