# 💰 Week 3 Plan — Product Architecture + Pricing Simulator

**Status:** planning only. No code written.
**Required live pages:** `/product` **and** `/pricing` — two this week, not one.
**Objective:** turn the venture into product tiers, feature architecture, and an interactive pricing/revenue simulator.

---

## 1. The failure mode that defines this week

Each week so far has had one characteristic way to fail, and it has been different every time:

| Week | Failure | How it was caught |
|---|---|---|
| 0 | Correct code, unconfigured environment | Querying production |
| 1 | Same failure, new costume | Querying production |
| 2 | Fabricated research — plausible numbers presented as fact | Checking that every cited URL resolves |
| **3** | **A revenue model that only goes up** | **Nothing automatic. This one needs discipline.** |

A pricing simulator is a machine for producing encouraging numbers. You choose the assumptions,
so the output is a function of what you already believe. Tune the conversion rate, soften the
churn, and any product supports any valuation. The "scenario toggle" the spec requires makes it
worse, because a pessimistic case that is not actually pessimistic is the most flattering thing
you can build: it looks like you stress-tested the model.

**Design consequence, decided up front:**

- **Every assumption is a row in the assumptions table with a stated confidence**, reusing the
  Week 2 `verified / reported / estimated` system. Most will be `estimated`, and that is the
  honest finding — a revenue model is mostly guesses, and the page should say so rather than
  render the guesses as a forecast.
- **The conservative scenario must be genuinely uncomfortable**, not "base minus 20%". It should
  encode what Week 2's validation conversation actually found.
- **Prices are anchored to the competitors already verified in Week 2**, not invented. Harvest's
  free tier and Bonsai's $15–$59 are real numbers with real sources.

> Week 2's lesson was *a plausible number is not a fact*. Week 3's is **a number you chose the
> inputs for is not a forecast.**

---

## 2. What the assignment requires

### Two live pages
| Page | Purpose |
|---|---|
| `/product` | Product feature map — what exists, what is tiered, what is planned |
| `/pricing` | 3 tiers, 2 segments, revenue calculator, scenario toggle, assumptions, saved scenarios |

### Required features
Product feature map · 3 pricing tiers · 2 customer segments · revenue calculator · scenario
toggle · assumptions table · saved pricing scenarios

### Required coding tasks
Create `/product` · create `/pricing` · build calculator inputs · calculate monthly/annual
revenue · save scenarios · display saved scenarios

### Testing — note the change
**2 pricing logic tests + 3 software tests.** Pricing logic is called out as its own category for
the first time. That is a direct instruction to prove the arithmetic, not just the interface.
The Week 2 test harness (`npm run test:filters`) already runs executable assertions against real
application code, so this extends rather than reinvents.

### Macro-prompt pattern
The course specifies a required 10-part output format for the planning prompt: problem, user,
product spec, UX mockup prompt, architecture sketch, tech stack, DevOps plan, test plan,
implementation prompt, scope cuts. **The Build Discipline Packet will follow that order
explicitly**, so the packet visibly answers the required pattern.

---

## 3. ⭐ What Week 2 forces us to confront

The validation conversation is the most valuable input to this week, and it is inconvenient.

The freelancer interviewed **sells one-time, fixed-price installations**. He said plainly:

> *"I sell 1 time install shit so not a retainer model and it's always priced per job too so I
> haven't had a problem with tracking"*

**A per-seat monthly subscription does not fit that person.** He has no recurring workflow to
subscribe to. If the pricing page assumes he is the customer, the model is fiction from the first
input.

This produces the single most important design decision of the week:

> **Segment definition has to exclude him, and say so.**

That is uncomfortable and it is also the correct output of doing research. A pricing page that
quietly assumes every freelancer is a subscriber would be exactly the flattering artefact this
module invites.

He also gave the condition under which he *would* pay:

> *"if there was someone dedicated to building [it] and constantly gave updates to it I'd def
> rather use his and just do minor tweaking than build my own from scratch"*

**That is a pricing insight, not just a product one.** What he will pay for is *maintenance* —
which is precisely what a subscription is. The pitch is not "software"; it is "someone is keeping
this alive." Worth building the tier descriptions around.

---

## 4. Proposed design

### Customer segments — two, defined by billing model rather than by size

| Segment | Who | Why they fit |
|---|---|---|
| **A — Hourly / retainer freelancer (Mexico)** | Designer, developer, consultant billing by time across 3–8 concurrent clients | Has hours to reconcile, invoices repeatedly, needs CFDI every time. The fragmentation is structural |
| **B — Small studio or despacho (2–5 people)** | A studio with several freelancers, or a contador serving them | Same problem multiplied, plus a need to see across people |

**Explicitly excluded, and stated on the page:** fixed-price one-time sellers. Week 2's
interviewee is the named example. Excluding a real person by name — with their words — is
stronger evidence of honest segmentation than any persona.

### Three tiers, anchored to verified competitor pricing

Anchors from Week 2, all fetched and dated: Harvest free / $9 / $14 · Clockify $3.99–$11.99 ·
Bonsai $15–$59 · Alegra $187–$524 MXN · Facturama $110–$1,650 MXN.

| Tier | Aimed at | Anchor logic |
|---|---|---|
| **Solo** | One freelancer, few clients | Must beat Harvest *free*. Free or near-free, capped by project count |
| **Pro** | Segment A | The differentiated tier — projects **and** CFDI. Priced between a global tracker and a Mexican invoicing tool, because it replaces both |
| **Studio** | Segment B | Per-seat, with the cross-person view |

**The pricing argument writes itself from the research:** a Segment A freelancer today pays for a
tracker *and* an invoicing tool. Pro can price against the sum of those two and still be cheaper.
That is a defensible anchor rather than a guess.

### Revenue calculator

Inputs: users per segment · tier mix · price per tier · monthly churn · growth rate · annual
discount.
Outputs: MRR, ARR, blended ARPU, 12-month projection.

**The arithmetic is where the required pricing-logic tests live.** Annual ≠ monthly × 12 once a
discount applies; churn compounds rather than subtracting; a blended ARPU across segments is a
weighted mean, not an average of averages. Each of those is a real way to be wrong, and each is
testable.

### Scenario toggle — three, one of which must hurt

| Scenario | What it encodes |
|---|---|
| **Conservative** | Week 2's finding: most freelancers are fine with a spreadsheet, and the interviewee would not buy. High churn, low conversion |
| **Base** | Stated assumptions, each with a confidence level |
| **Optimistic** | Everything goes right — labelled as the least likely |

### Assumptions table — the honest core

Every input is a row: value · source · confidence · what breaks if it is wrong. Reuses the Week 2
`SourceBadge`. Most rows will be `estimated`, and the page will say so in plain language rather
than burying it.

### Data model — `pricing_scenarios`

| Column | Notes |
|---|---|
| `id` · `name` | |
| `scenario` | CHECK: conservative, base, optimistic |
| `inputs` | `jsonb` — the full input set, so a saved scenario is reproducible |
| `mrr` · `arr` | Computed and stored, so drift between saved and recomputed values is detectable |
| `assumptions_confidence` | Worst confidence level among the inputs used |
| `created_at` | |

Storing **both** the inputs and the outputs is deliberate: recomputing a saved scenario and
comparing against the stored figure is itself a test that the maths has not silently changed.

---

## 5. Architecture

```
/product  (Server Component)          /pricing  (Server Component)
   feature map, tiered                    tiers · segments · assumptions
   ↓                                      ↓
 lib/product/features.ts              PricingCalculator  ← CLIENT COMPONENT
                                          ↓ live recompute, no network
                                      lib/pricing/model.ts   ← pure, testable
                                          ↓
                                      POST /api/pricing/save → pricing_scenarios
```

**The calculator must be a Client Component** — dragging an input and waiting on a round trip is
not a simulator. Same pattern as Week 2's `CompetitorTable`.

**`lib/pricing/model.ts` is pure and has no React in it**, so the pricing-logic tests execute the
real calculation rather than a copy. That lesson came from Week 2, where the filter predicate had
to be extracted mid-week because its acceptance criteria had been asserted rather than run. This
time it is pure from the start.

**Net new dependencies: zero**, for the fourth week running.

---

## 6. Phased build

| Phase | Output | Gate |
|---|---|---|
| 1 | Build Discipline Packet in the required 10-part macro-prompt order + wireframe, **committed before any code** | Gate 1 |
| 2 | `lib/pricing/model.ts` — pure functions **and their tests, written together** | |
| 3 | `/product` feature map, deploy immediately | Gate 2 |
| 4 | `/pricing` — tiers, segments, assumptions table | |
| 5 | Calculator + scenario toggle (Client Component) | |
| 6 | `pricing_scenarios` migration, save + display | |
| 7 | 2 pricing logic tests + 3 software tests, fix, redeploy | Gate 3 |
| 8 | Evidence docs, submission packet | Gate 4 |

**Deploy at Phase 3**, as in all three previous weeks. The 5/10 cap disappears early and
everything after is upside.

**Phase 2 writes the model and its tests together.** Week 2 proved that a test written after the
fact tends to encode what the author already believes — two of its expectations were wrong while
the code was right.

---

## 7. What only Brayden can do

| Item | Notes |
|---|---|
| Demo video (2–3 min) | Best shot: drag an input and watch ARR move, then switch to Conservative and watch it collapse |
| Human Decision Note | 150–250 words |
| Screenshots | List provided at the end |
| Final PDF assembly | |

**No new accounts and no new API keys this week.** Supabase and Vercel are already configured, so
there is no environment-variable trap of the kind that cost Weeks 0 and 1.

---

## 8. Open decisions

| # | Decision | Recommendation |
|---|---|---|
| 1 | Currency | **Show both USD and MXN.** The competitors are priced in both, and a Mexico-focused product quoting only dollars would be odd |
| 2 | Does the Solo tier cost anything? | **Free, capped.** Harvest free is a verified competitor; a paid entry tier loses to it before the argument starts |
| 3 | Segment B — studio or contador? | **Studio (2–5 people).** Contador is a distinct product with a distinct buyer; picking both would blur the model |
| 4 | Should the calculator persist to Supabase or localStorage? | **Supabase** — the assignment requires saved scenarios as evidence |
| 5 | Include a CFDI-usage-based cost line? | **No.** Per-stamp PAC costs are real but unsourced; modelling them would import a guess into the cost side. Note it as a known omission |

---

## 9. Decisions — confirmed

| # | Decision | Confirmed |
|---|---|---|
| 1 | Currency | Show **both USD and MXN** |
| 2 | Solo tier price | **Free, capped by project count** — Harvest free is a verified competitor |
| 3 | **Segment B** | **Small studio, 2–5 people** |
| 4 | Scenario persistence | **Supabase** — the assignment requires saved scenarios as evidence |
| 5 | CFDI per-stamp cost line | **Omitted**, and the omission stated. PAC pricing is unsourced and would import a guess into the cost side |

**On decision 3.** A studio is Segment A multiplied — same problem, same product, more seats —
so the model extends what Week 2 already validated rather than making a new strategic claim.

The rejected option is worth recording because the reason matters. A *contador* serving many
freelancers is a larger market, but Week 2's own research classified contadores as a
**substitute**: freelancers hire one precisely so they never touch CFDI themselves. Selling to
them would mean selling to the thing identified as competition, which may well be a good business
and is not a claim a pricing page should make quietly in week three. It also implies a different
data model — many isolated clients rather than one shared team — which belongs in a later week if
it happens at all.

---

## 10. Original open question (resolved above)

**Decision 3 is the one that changes the work.** Segment B defines half the revenue model, and
"small studio" versus "contador serving freelancers" are genuinely different products with
different price points and different buyers.

The Week 2 research touched contadores as a *substitute* — outsourcing the fiscal problem
entirely — which is an argument for them being a channel rather than a customer. My
recommendation is studio, but it is a real choice and worth your call before I build the model
around it.
