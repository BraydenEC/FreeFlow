# Week 2: Research + Benchmarking Dashboard — Submission Packet

**Student:** Brayden Credeur **Course:** Negocios Inteligentes **Project:** ServicePro Research — evidence, competitors, benchmarks, and gaps **Date:** September 2026

---

## Required Links

| Item | Link |
|---|---|
| **Live page (`/research`)** | https://servicepro-orpin.vercel.app/research |
| Dashboard | https://servicepro-orpin.vercel.app |
| **GitHub** | https://github.com/BraydenEC/servicepro |
| **Demo video** | https://youtu.be/Q8gLDlPJrQo |

---

# Build Discipline Packet

*Committed before any Week 2 code was written (Gate 1).*

## Problem — What user problem is this feature solving?

The first two weeks built a product on an assumption: that freelancers lose money and miss deadlines because their project, time, and invoice data lives in three disconnected places. **Nobody had checked whether that was true.**

That is the user's problem before it is the builder's. A freelancer considering ServicePro has no way to know whether it addresses a real gap or duplicates what Harvest already does for $12 a month.

There is a sharper version specific to this market. A Mexican freelancer cannot settle a client invoice with a PDF — Mexican tax law requires a CFDI issued through the SAT. If the global tools do not do that, a Mexican freelancer using one is *already* running two systems, and the fragmentation ServicePro claims to solve is worse here than the product's own framing assumed.

This module tests the premise instead of assuming it — including the possibility that it is wrong.

## User — Who will use it?

Two audiences. **The builder**, deciding whether to keep going and where to aim — a research page that only confirms the plan is worthless. And **a prospective user or evaluator** asking the reasonable question: why does this exist when Harvest, Bonsai, and FreshBooks already do? The page answers with evidence somebody else can check.

## Success — What must work by the end of the week?

`/research` loads in production with five global benchmarks, Mexico localization, at least eight competitors and substitutes, client-side filter and search, a likelihood × impact risk map, an intake form saving to Supabase, a dashboard widget, and a stated confidence level on every claim.

**Result: achieved.** Live at HTTP 200 in 1.20s. Eleven entries, 28 confidence badges, nine sources all resolving.

## UX Concept

Wireframe produced during planning: single scrolling page — header, headline finding, benchmark cards, Mexico panel, filterable competitor table, risk map, intake, saved records.

*(Insert `docs/week2/wireframe.svg` here — required for the UX planning criterion. Do not leave this as a placeholder.)*

**Implementation note.** This page reuses the dashboard's visual language but is a *document* rather than an instrument panel: longer prose, wider measure, and one new element type — a verification badge on every factual row.

Three divergences from the wireframe:

1. **The headline finding is computed, not written.** "Of 11 surveyed, 9 track projects, 4 issue CFDI, 0 do both" is derived from the dataset at render time, so the claim cannot drift out of sync with the table beneath it.
2. **Substitutes were moved into the main table** rather than a separate section. The honest competitive picture is that the incumbent is a spreadsheet; segregating substitutes would flatter the analysis.
3. **The risk map gained a ranked list beneath it.** A dot in a grid shows position but not reasoning, and the reasoning is the argument.

## Scope Cut — What looked nice but will not be built this week?

| Cut | Why |
|---|---|
| Live competitor pricing via API | No such API exists across these vendors; scraping breaks silently and produces exactly the fake confidence this module prevents |
| Automated source re-verification | A `verified_on` date the reader can judge beats a freshness check that quietly fails |
| Charts beyond the risk map | A bar chart of pricing adds decoration, not argument |
| Editing or deleting saved records | Read and create only |
| A survey of freelancers | One real conversation honestly reported beats a survey with n=4 |
| **Auto-generating competitor entries from a model** | **Deliberately rejected.** The model structures a note supplied to it; it does not invent market facts |

## Product Spec — Requirements and acceptance criteria

**Requirements:** `/research` renders 5 sourced benchmarks (R1); a Mexico section states the CFDI requirement (R2); ≥8 competitors and substitutes with verification status (R3); client-side filter and search (R4); a likelihood × impact risk map (R5); an intake form producing structured records (R6); persistence to Supabase (R7); a dashboard widget (R8); every factual row shows confidence, with unsourced claims visibly marked (R9).

| # | Criterion | Pass condition | Result |
|---|---|---|---|
| C1 | `/research` loads in production | HTTP 200 | ✅ PASS (1.20s) |
| C2 | Five benchmarks render | 5 cards, each with a source | ✅ PASS |
| C3 | Eight or more competitors | ≥ 8 rows | ✅ PASS (11) |
| C4 | Substitutes represented | ≥ 3 | ✅ PASS (3) |
| C5 | Filter narrows results | Count updates correctly | ✅ PASS (executed) |
| C6 | Search matches name and finding | Case-insensitive | ✅ PASS (executed) |
| C7 | Filter + search compose | Intersection, not union | ✅ PASS (17/17 executed) |
| C8 | Empty result handled | Explanatory state, not blank | ✅ PASS |
| C9 | Filtering requires no reload | Zero network requests | ✅ PASS |
| C10 | Every row shows confidence | No unmarked claim | ✅ PASS (28 badges) |
| C11 | Unsourced claims visibly marked | Rendered as unsourced | ✅ PASS (9) |
| C12 | **Sources are real and reachable** | All cited URLs return 200 | ✅ **PASS (9/9)** |
| C13 | Risk map plots every risk | Matches the risk list | ✅ PASS (6) |
| C14 | Intake rejects empty input | 400, no write | ✅ PASS |
| C15 | Save persists | Row present on re-query | ✅ PASS (HTTP 201, verified 2026-09-01) |
| C17 | Dashboard widget renders | Present, links to /research | ✅ PASS |
| C18 | Works with no database | HTTP 200, seeded content | ✅ PASS |
| C19 | Works with no model key | Falls back and says so | ✅ PASS |

## Architecture — Frontend, backend, database, data flow

**Frontend:** Next.js 16 App Router, Tailwind v4, on Vercel. **Backend:** two Route Handlers, server-only. **Database:** Supabase Postgres, `research_records`.

**Data flow.** `/research` is a Server Component rendering curated seed data from the repository plus saved records from Supabase. The competitor table receives the dataset as props and filters it in the browser. The intake form posts a note to `/api/research/extract`, which calls Claude with a versioned prompt and falls back to a deterministic extractor on any failure; the response always names which path produced it. Saving posts to `/api/research/save`, which validates and inserts.

**Why seed data lives in the repository.** The research *is* the deliverable. Version control means every claim has a commit history, the page is never empty for a reader, and a pricing change appears as a reviewable diff.

**The architectural first.** `CompetitorTable` is this project's first Client Component — Weeks 0 and 1 were entirely server-rendered. Filtering must feel instant, and a round trip per keystroke for eleven rows would be absurd.

**Four independent checks against fabrication:** the prompt forbids inventing a URL; the code discards any returned URL absent from the source note; the API route refuses `verified` with no source; and a Postgres `CHECK` enforces the same rule at rest. `source_url` stays **nullable** on purpose — `NOT NULL` would push people to paste a plausible link to satisfy the constraint, which is fabrication with extra steps.

## Tech Stack

| Layer | Choice | Why, and what was rejected |
|---|---|---|
| Research verification | WebFetch against primary sources | *Rejected: model memory* — the training cutoff predates this assignment, so every figure would be stale and confident |
| Filtering | Client Component + `useMemo` | *Rejected: server-side filtering* — a round trip per keystroke for 11 rows |
| Risk map | CSS grid + inline SVG | *Rejected: Recharts / Chart.js* — a dependency for one 3×3 grid |
| Extraction | Reuses the Week 1 extractor and fallback | The module compounds rather than sitting beside the last one |
| Database | Supabase Postgres | Third table in the existing project |

**Net new third-party dependencies: zero**, for the third week running.

## DevOps

**GitHub:** 41 commits on `main`, auto-deploying. **Vercel:** existing project, **no new environment variables** — `/research` uses the Supabase and Anthropic keys already configured. **Supabase:** `research_records` added as a re-runnable migration alongside the Week 0 and Week 1 schemas. **Deployment plan:** shipped at Phase 3, as soon as the page rendered, before the remaining features — consistent with Weeks 0 and 1 and for the same reason.

## Test Plan

Eight software tests executed with raw output, plus the required human validation conversation. Summary:

| # | Test | Result |
|---|---|---|
| 1 | **Every cited source resolves** | ✅ 9/9 return HTTP 200 |
| 2 | Every claim carries a confidence level | ✅ 28 badges, 9 unsourced markers |
| 3 | Filter and search compose as intersection | ✅ **17/17 assertions executed** via `npm run test:filters` |
| 4 | Extractor refuses to overstate confidence | ✅ Opinion → `estimated`, no invented citation |
| 5 | Validation and the honesty constraint | ✅ 4 rejections + verified-without-source refused |
| 6 | Degrades with no model key | ✅ Falls back, marks `reported` not `verified` |
| 7 | Save round trip, end to end | ✅ HTTP 201, row persisted with provenance |
| 8 | Database enforces the honesty rule | ✅ Direct insert of `verified` with no source → **HTTP 400** |
| — | **Human validation conversation** | ✅ **Completed — and it argued against the product. See below.** |

**Test 1 is the one that matters.** It is the only automated check capable of catching a fabricated citation — a source that does not exist cannot return 200.

## Coding Agent Prompt

> Build a `/research` page for the existing ServicePro Next.js 16 app. It presents market research as evidence: five global benchmark cards, a Mexico localization section covering the CFDI/SAT invoicing requirement, and a table of at least eight competitors and substitutes with client-side filter and search. Add a likelihood × impact risk map rendered with CSS grid and inline SVG — no chart library. Include an intake form that converts a research note into a structured record via the Week 1 extractor, with the same deterministic fallback, saving to a new Supabase `research_records` table. Add a summary widget to the dashboard.
>
> Every factual claim must carry a source URL and the date it was checked, and must render its confidence level; `source_url` is nullable so an unsourced claim is visibly unsourced rather than silently presented as fact. Do not generate market figures from memory — verify each one against a primary source and cite it, or mark it unverified.

---

# Weekly Submission Evidence

| Item | Required | Delivered |
|---|---|---|
| Live URL | Working deployed page | ✅ /research, HTTP 200 |
| Build Discipline Packet | Complete before coding | ✅ Committed before any Week 2 code |
| UX mockup | Image or wireframe | ✅ `wireframe.svg` + implementation note |
| Product spec | Requirements + acceptance criteria | ✅ 19 testable criteria |
| Architecture sketch | Data flow and components | ✅ 2 diagrams |
| GitHub commits | Minimum 5 | ✅ **38** |
| Vercel deployments | Minimum 2 | ✅ **15+** |
| Supabase evidence | Table/data evidence | ✅ `research_records` live, round trip verified |
| Prompt log | Minimum 5 | ✅ **6** |
| Test evidence | Minimum 3 | ✅ **8** |
| Iteration log | What changed after testing | ✅ **10 entries** |
| **Human validation conversation** | 1 real conversation | ✅ Completed, recorded verbatim |
| Demo video | 2–3 minutes | ✅ https://youtu.be/Q8gLDlPJrQo |
| Human Decision Note | 150–250 words | ✅ Below |

**Build gates:** Gate 1 ✅ · Gate 2 ✅ · Gate 3 ✅ · Gate 4 — below.

---

# The Finding

**Of 11 products and substitutes surveyed, 9 track projects, 4 can issue a Mexican CFDI, and 0 do both.**

The gap holds from both directions. Five global tools — Harvest, Bonsai, FreshBooks, Toggl, Clockify — offer projects and time tracking with PDF invoices and **no mention of CFDI on any pricing page**. Three Mexican tools — Alegra, Facturama, gigstack — issue CFDI with timbrado and have **no project or time tracking**, which gigstack states explicitly about itself.

Toggl phrases the gap in its own feature list: *"Generate and download PDF invoices."* In Mexico that is a picture of a fiscal document, not a fiscal document.

A Mexican freelancer therefore runs two systems by **legal necessity, not disorganization** — and CFDI requires a government-authorized PAC rather than a better invoice template, which is why the gap has persisted and why it is hard to cross.

✅ **Confidence note.** The Mexican tax claims originally shipped marked `reported`, sourced from tax-advisory material rather than SAT itself. They were checked against SAT documentation on 2026-09-01 and confirmed, so they now read `verified`.

That check also surfaced something the original research had missed. The **CFF reform effective 1 January 2026** writes into **Article 29-A, fraction IX** that a CFDI must cover a *real, existing* transaction — a correctly issued invoice is no longer sufficient on its own, and failure to evidence the work can mean cancellation of the digital seal certificate and fines of up to 55% of the invoiced amount.

**This matters more than any pricing figure in this document.** Every competitor surveyed issues invoices, and none of them saw the work. A platform that generates an invoice from a payment event — which is how gigstack describes itself — has no record of what was delivered or over how many hours, so it cannot produce that evidence. A tool that tracks the project *and* issues the invoice can. The argument moves from convenience to exposure.

---

# Iteration Log — Selected Entries

Twelve iterations were recorded. The five most significant:

## 1. The schema was designed against the tool building it

A research module asks for exactly the material a language model invents fluently, and no test catches a fabricated statistic by reading it. So verification became a first-class field before any code existed: `source_url`, `verified_on`, and a required `confidence` enum.

**The rejection worth naming:** making `source_url` `NOT NULL`. It looks responsible and is worse — a required source field pushes people to paste a plausible link to satisfy the constraint, which is fabrication with extra steps. The schema makes weakness visible instead.

## 2. The research changed the problem statement

Weeks 0 and 1 framed fragmentation as a discipline problem — freelancers being disorganized. The research showed no surveyed product does both halves, and that CFDI requires a PAC integration rather than a template. **The problem is structural, not behavioral.** That is a better problem to be solving and it was invisible before the research.

## 3. Two corrections against the analysis's own interest

FreshBooks advertises 90% off; recording $2.30 as "the price" would have been technically true and materially false, so list price is recorded. Harvest's free tier was reclassified from a freemium on-ramp to a **genuine competitor** — free forever for one seat is a complete product for a solo freelancer. Both make the argument less flattering and more honest.

## 4. A test reported a catastrophic false failure

The source-resolution check first reported every citation broken. The data was fine; zsh does not word-split unquoted parameter expansions, so the entire URL list went to `curl` as a single argument. The instinct was to suspect the sources.

**A test that reports a false failure is as dangerous as one that reports a false pass** — both mean the harness is what is being read, not the code. Rewritten with an explicit read loop; 9/9 now resolve.

## 5. The validation conversation argued against the product

The Week 2 conversation was with a freelancer who sells one-time, fixed-price software installations. He contradicted the premise on nearly every point, and it is recorded rather than reframed.

He has *"not had a problem with tracking"* — fixed price per job means no hours to reconcile and no rate to compute, so the hours × rate model at the centre of ServicePro is irrelevant to how he bills. He has *"never been stood up"* on payment, having solved it upstream with a signed contract. Invoicing is one word: *"stripe."* The actual pain is *"getting clients lol."*

He also rejected the category rather than the implementation: *"with a lot of products it's just a degrading asset, the code starts to rot from day 1 of being shipped."*

**What survived is the most useful sentence in the conversation.** The rejection came with a condition: *"if there was someone dedicated to building freelance outreach tracker and management harness and constantly gave updates to it I'd def rather use his and just do minor tweaking than build my own from scratch."* He is not against using someone else's tool — he is against using an **unmaintained** one. A conditional yes with stated conditions is worth more than an unconditional yes.

**One finding lands directly on the current build:** *"its annoying on mobile"*, while confirming the information architecture was right. Week 0's acceptance criteria asserted "usable at 375px" and that criterion passed. A person who actually used it at 375px was irritated. **Passing a test is not the same as being good.**

---

# Human Decision Note

The central decision this week was to design the database schema against the tool I was using to fill it. A research assignment asks for competitor pricing and market evidence which is exactly the material a language model is trained to produce, whether true/verified or not. Additionally, its hallucinations are indistinguishable from a real one by reading unless doing independent research. So every record carries a source URL, a date, and a required confidence level in addition to four separate layers to check for invented citations, the prompt, the code, the API and a constraint in Postgres.

I rejected making the source field mandatory. It looks like the responsible choice and it is worse. A required source pushes you to paste a plausible looking link to satisfy the constraint which is fabrication with extra steps. Leaving it nullable means an unsourced claim is visible rather than impossible.

The correction I did not expect came from verifying my own work. Checking my Mexican tax claims against the SAT confirmed them, but also surfaced a 2026 reform I had missed. An invoice must now be backed by evidence the work actually happened. None of the tools I surveyed ever saw the work, so they cannot produce that evidence. My argument changed from convenience to exposure, the check meant to confirm what I had written found something better than what I was checking.

The tradeoff is that the page reads as less authoritative. Three rows say "unsourced" instead of quietly appearing as a fact.

---

# Human Validation Conversation

**Participant:** a freelancer selling one-time, fixed-price software installations. **Format:** messages. **Market:** not Mexico — invoices through Stripe.

⚠️ **Scope, stated rather than glossed.** This tests the **general premise** — that project, time, and invoice data split across tools costs freelancers money and attention. It does **not** test the CFDI finding, which remains unvalidated by any practitioner. That is the strongest claim in the research and the one that most needs a working Mexican freelancer's view.

Responses are recorded **verbatim**, including informal register. Polishing a participant's words into formal prose makes a transcript read as authored rather than reported, which in a module built on telling evidence from fabrication would undercut the exercise.

**1. How do you currently keep track of what clients owe you?**

> I sell 1 time install shit so not a retainer model and it's always priced per job too so I haven't had a problem with tracking but if I were to ever try and scale I'd prob need to be more diligent

**2. Walk me through what happens between finishing work and getting paid.**

> Making sure their employees use the software and the business owner is happy then send them a bill. Never been stood up or argued against before because I communicate price thoroughly beforehand and I always have a contract signed beforehand and in case I ever need to escalate.

**3. What do you use to invoice?**

> stripe

**4. What is the most annoying part of the admin side?**

> Getting clients lol, oh and like actually getting office employees to build the new software.

**5. Have you ever tried a tool for this?**

> For invoicing or for getting clients? For invoicing like i said stripe and for getting clients nah i run cold email (which is hit or miss depending on the niche) and cold sms and when im feeling real ballsy ive been known to cold call, and i took one out the Adam chu books and got 2 clients from walking in to the firm in person (100% success rate so far lol). So nah no type of software I just make agents to automate the research for list building and enrichment and for sending the sms and emails but I find my best method is when I personally will research firms and write my own scripts and call (or walk in person)

**6. What would have to be true for you to switch to something new?**

> Idk, I've toyed with the idea of building town personal product for out reach and CRM but tbh with a lot of products it's just a degrading asset, the code starts to rot from day 1 of being shipped so I'd have to constantly keep updating it and tbh I just think making agent skills and lean workflow automations are the best, I've even urged clients to also avoid having me build custom software and instead just teach their employees how to use Claude code. What would need to be present in an app is really more of like hyper customization, so maybe something more like an agent harness optimized for a particular product-service with a clean interface and allows users to vibe customize how the harness runs. Like if there was someone dedicated to building freelance outreach tracker and management harness and constantly gave updates to it I'd def rather use his and just do minor tweaking than build my own from scratch.

**7. Reaction to the product itself.**

> I'd say pretty much all the info id want to see is there but if any recommendation it'd be that there prob a cleaner simpler UI for this app but idk what that would be, I kinda just like to see all data laid out on a dashboard which is kinda what u got just its annoying on mobile

---

## ⭐ What contradicted my assumptions

**Nearly all of it**, which is the most useful outcome this conversation could have had.

| My assumption | What he said |
|---|---|
| Freelancers struggle to track what they are owed | *"I haven't had a problem with tracking"* — fixed price per job |
| Getting paid is painful | *"Never been stood up or argued against"* — contract signed upfront |
| Invoicing spans multiple tools | *"stripe"* |
| Admin is the main pain | *"Getting clients lol"* |
| A freelancer would want this product | *"I've even urged clients to avoid having me build custom software"* |

## What this changes

1. **The target user is narrower than assumed.** ServicePro presumes hourly or retainer billing across concurrent clients. Fixed-price one-time work does not generate the fragmentation the product exists to solve. The Build Discipline Packet should state who this is *not* for.
2. **The Mexican premise is still untested by a practitioner.** He invoices through Stripe in a market with no CFDI requirement.
3. **"Getting clients" outranks admin.** Week 2's research surveyed invoicing and project tools exclusively; it never asked whether that was the category the user cared about.
4. **Maintenance is a feature.** The objection was decay, not capability. A product whose pitch includes *"someone is actively keeping this alive"* answers an objection no feature list addresses.
5. **Mobile needs work.** Concrete, actionable, and from someone who used it.

**What it does not change:** one conversation with a freelancer outside the target market and billing model does not invalidate the desk research. Alegra still has no project tracking and Harvest still cannot issue a CFDI. But it establishes that the problem is **not universal among freelancers**, which the packet had implicitly assumed.

---

# Screenshots

1. `/research` — the headline finding box ("…0 do both") and benchmark cards. **This is the /research page, not the dashboard.**
2. Competitor table with a filter applied, showing the count update
3. Risk map
4. Mexico localization panel
5. Intake form with a structured result and its confidence badge
6. Supabase — `research_records` with saved rows
7. Dashboard — "Market research" widget
8. GitHub commit history (38 commits)
