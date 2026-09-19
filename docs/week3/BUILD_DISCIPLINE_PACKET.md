# 🧠 Build Discipline Packet — Week 3: Product Architecture + Pricing Simulator

**Gate 1 artifact. Written and committed before any Week 3 code was produced.**
**Live pages:** `/product` and `/pricing`

> Ordered to follow the course macro-prompt output format: problem, user, product spec, UX mockup
> prompt, architecture sketch, tech stack, DevOps plan, test plan, implementation prompt, scope
> cuts. The assignment's own section list is fully covered within that order.

---

## 1. 🧩 Problem definition — What user problem is this feature solving?

Three weeks in, ServicePro can track a project, extract one from a client brief, and show that no
competitor does both halves of the job in Mexico. **It has never had a price.**

That is not a cosmetic gap. A freelancer evaluating this tool is comparing it against Harvest's
genuinely free tier and against the Alegra-plus-tracker combination they may already pay for. Until
the product states what it costs and who it is for, it is asking someone to adopt an unpriced
tool against a free competitor — and the honest answer to *"why would I switch"* is unavailable to
both the user and the builder.

There is a second problem underneath, and it belongs to the builder. **A venture with no revenue
model is a hobby.** Week 2 established the market gap is real. It did not establish that anyone
would pay to close it, and the only way to find out on paper is to build the arithmetic and let it
produce an uncomfortable answer.

## 2. 👤 User definition — Who will use it?

**`/pricing` serves a prospective customer** deciding whether this is worth money, and **the
builder** deciding whether the business is viable at plausible numbers.

Two paying segments are modelled:

| Segment | Who | Why they fit |
|---|---|---|
| **A — Hourly / retainer freelancer (Mexico)** | Designer, developer, or consultant billing by time across roughly 3–8 concurrent clients | Has hours to reconcile, invoices repeatedly, needs a CFDI every time. The fragmentation is structural rather than a discipline failure |
| **B — Small studio (2–5 people)** | Two to five freelancers working under one name | The same problem multiplied, plus a need to see across people and know which work is actually profitable |

### ⭐ Who is explicitly excluded, and why

**Freelancers who sell one-time, fixed-price work are not the customer.** This is not a guess. The
Week 2 validation conversation was with exactly that person, and he said:

> *"I sell 1 time install shit so not a retainer model and it's always priced per job too so I
> haven't had a problem with tracking"*

He has no recurring workflow to subscribe to, no hours to reconcile, and no repeat invoicing
rhythm. **A per-seat monthly subscription does not fit him, and the pricing model says so on the
page.** Excluding a real interviewed person by name is a stronger statement of segmentation than
any invented persona, and a revenue model that quietly counted him would be fiction from its first
input.

He did name the condition under which he would pay, and it shapes the tier copy:

> *"if there was someone dedicated to building [it] and constantly gave updates to it I'd def
> rather use his and just do minor tweaking than build my own from scratch"*

What he would buy is **maintenance** — which is what a subscription actually is. The tiers are
described as ongoing upkeep rather than as a feature list.

## 3. 🎯 Success — What must work by the end of the week?

`/product` and `/pricing` both load in production, and:

1. `/product` shows a **feature map** — what exists today, which tier each capability sits in, and what is planned
2. `/pricing` shows **three tiers** priced against competitors verified in Week 2
3. **Two segments** are defined, with the excluded segment stated
4. A **revenue calculator** recomputes live as inputs change, with no page reload
5. A **scenario toggle** switches between conservative, base, and optimistic
6. An **assumptions table** states every input's source and confidence
7. Scenarios **save to Supabase** and display

## 4. 🧱 Product spec — Requirements and acceptance criteria

### Requirements

- **R1** — `/product` renders a feature map with tier assignment per capability.
- **R2** — `/pricing` renders three tiers with price, audience, and what each includes.
- **R3** — Two customer segments are defined; the excluded segment is stated explicitly.
- **R4** — A calculator accepts users per segment, tier mix, churn, growth, and annual discount.
- **R5** — It computes MRR, ARR, blended ARPU, and a 12-month projection.
- **R6** — A scenario toggle switches all inputs between three presets.
- **R7** — Every assumption appears in a table with source and confidence level.
- **R8** — Scenarios persist to `pricing_scenarios` and are listed on the page.
- **R9** — Prices display in both USD and MXN.

### Acceptance criteria — each testable, with an explicit pass condition

| # | Criterion | Method | Pass condition |
|---|---|---|---|
| C1 | `/product` loads in production | Request the live URL | HTTP 200 |
| C2 | `/pricing` loads in production | Request the live URL | HTTP 200 |
| C3 | Feature map assigns every feature to a tier | Inspect | No feature without a tier |
| C4 | Three tiers render | Count | Exactly 3, each with price and audience |
| C5 | Two segments defined | Inspect | Both present; exclusion stated |
| C6 | **Annual is not monthly × 12** | Compute with a 20% discount | Annual = monthly × 12 × 0.8, to the cent |
| C7 | **Churn compounds, not subtracts** | 100 users, 5% churn, 12 months | ≈ 54, not 40 |
| C8 | Blended ARPU is weighted | Two segments, different sizes | Weighted mean, not mean of means |
| C9 | Calculator updates without reload | Watch the network tab | Zero requests on input change |
| C10 | Zero and negative inputs handled | Enter 0 and −5 | No NaN, no crash, no negative revenue |
| C11 | Scenario toggle changes every input | Switch presets | All inputs update together |
| C12 | **Conservative is genuinely worse** | Compare ARR across scenarios | Conservative < base by a margin reflecting real churn |
| C13 | Every assumption shows confidence | Inspect the table | No unmarked row |
| C14 | Saved scenario persists | Save, re-query | Row present with inputs and outputs |
| C15 | Saved scenario is reproducible | Recompute stored inputs | Result equals stored MRR/ARR |
| C16 | Both currencies shown | Inspect | USD and MXN on every price |
| C17 | Works with no database | Unset credentials | HTTP 200, page renders, save degrades honestly |

## 5. 🖼 UX mockup prompt & concept

Wireframe: `wireframe.svg`, produced during planning.

**UX image generation prompt** (per the course macro-prompt):

> Create a clean, modern UX mockup for a student-built web app page: Product Architecture +
> Pricing Simulator. Show a three-tier pricing row, a live revenue calculator with sliders and
> numeric inputs on the left and computed MRR/ARR on the right, a scenario toggle with three
> options, and an assumptions table beneath. Use a dark, restrained startup-product aesthetic with
> one accent colour. No animation, no illustration.

**Implementation note (planned).** `/pricing` is an *instrument*, unlike `/research` which was a
document. Numbers change as you drag, so the layout keeps inputs and outputs visible together
rather than stacking them — a calculator where you cannot see the result while adjusting the input
is not a simulator. Divergences from the wireframe will be recorded after the build.

## 6. 🏗 Architecture sketch — Frontend, backend, database, data flow

```
/product (Server Component)        /pricing (Server Component)
  feature map from                   tiers · segments · assumptions
  lib/product/features.ts            ↓
                                   PricingCalculator  ← CLIENT COMPONENT
                                     ↓ live recompute, zero network
                                   lib/pricing/model.ts  ← PURE, no React
                                     ↓
                                   POST /api/pricing/save → Supabase pricing_scenarios
                                     ↓
                                   SavedScenarios (Server Component)
```

**`lib/pricing/model.ts` contains no React and no I/O.** That is the central architectural
decision this week: the pricing-logic tests must execute the real calculation, not a copy of it.
Week 2 had to extract a filter predicate mid-week for exactly this reason, after discovering its
acceptance criteria had been asserted rather than run. This time the boundary exists from the
first commit.

**The calculator is a Client Component** because dragging an input and waiting for a server round
trip is not a simulator. Same pattern as Week 2's `CompetitorTable`.

### Data model — `pricing_scenarios`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | |
| `scenario` | text | CHECK: conservative, base, optimistic |
| `inputs` | jsonb | The complete input set, so a scenario is reproducible |
| `mrr` · `arr` | numeric | Computed at save time |
| `worst_confidence` | text | CHECK: verified, reported, estimated — the weakest assumption used |
| `created_at` | timestamptz | |

**Storing inputs *and* outputs is deliberate.** Recomputing a saved scenario and comparing it
against the stored figure detects silent changes to the maths — the model cannot drift without a
test noticing.

`worst_confidence` carries the Week 2 discipline forward: a projection is only as strong as its
weakest assumption, and the row records that rather than presenting a single confident number.

## 7. 🧰 Tech stack

| Layer | Choice | Why, and what was rejected |
|---|---|---|
| Pricing maths | **Pure TypeScript module, no dependencies** | Testable without a DOM or a framework. *Rejected: calculating inside the component* — untestable except through the UI, which is what went wrong in Week 2 |
| Calculator UI | **Client Component + `useMemo`** | Instant recompute. *Rejected: server actions per keystroke* |
| Charts | **None — numbers and a simple CSS bar** | *Rejected: Recharts* — a dependency to draw twelve bars. Fourth week at zero new packages |
| Price anchoring | **Competitor figures verified in Week 2** | Real, dated, sourced. *Rejected: inventing plausible prices* — the exact failure this module invites |
| Currency | **`Intl.NumberFormat`, locale pinned** | Same discipline as Week 0's money formatting |
| Database | **Supabase Postgres** | Fourth table in the existing project |
| Frontend / Hosting | **Next.js 16 + Tailwind v4 on Vercel** | Unchanged |

**Net new third-party dependencies: zero**, for the fourth week running.

## 8. ⚙️ DevOps plan

- **GitHub:** same repository and branch, auto-deploying on every push.
- **Vercel:** existing project. **No new environment variables** — `/product` and `/pricing` use
  the Supabase credentials already configured. The environment-variable trap that cost Weeks 0 and
  1 does not exist this week, which is worth stating rather than assuming.
- **Supabase:** `pricing_scenarios` added as a re-runnable migration alongside the three existing schemas.
- **Deployment plan:** ship `/product` at Phase 3, as soon as it renders anything, before the
  calculator is built. Three weeks running, the early deploy has removed the 5/10 cap before the
  hard work started.

## 9. 🧪 Test plan

**Required: 2 pricing logic tests + 3 software tests.** Planned:

| # | Type | Test | Expected |
|---|---|---|---|
| 1 | **Pricing logic** | Annual billing applies the discount | `annual = monthly × 12 × (1 − discount)`, exact to the cent |
| 2 | **Pricing logic** | Churn compounds over twelve months | 100 users at 5% monthly → ≈54 retained, not 40 |
| 3 | Pricing logic | Blended ARPU is a weighted mean | Weighted by segment size, not an average of averages |
| 4 | Software | Zero, negative, and absurd inputs | No NaN, no crash, no negative revenue |
| 5 | Software | Saved scenario round trip | Persists and reloads with inputs intact |
| 6 | Software | Saved scenario recomputes identically | Stored ARR equals recomputed ARR |
| 7 | Software | Both pages load in production | HTTP 200 |

**Tests 1 and 2 are the ones that matter**, because they are the two ways a revenue model is
usually wrong in the flattering direction. Multiplying a discounted monthly price by twelve
overstates annual revenue. Subtracting churn instead of compounding it overstates retention badly
— 40 users versus 54 is a 35% error, and it errs upward.

**Test 6 exists because the model will change.** Storing inputs alongside outputs means a saved
scenario is a regression test: if the maths shifts, recomputation disagrees with the stored figure
and the test fails.

**Written alongside the model, not after it.** Week 2 demonstrated that tests written afterwards
encode what the author already believes — two of its expectations were wrong while the code was
right.

## 10. 🤖 Coding agent implementation prompt

> Build `/product` and `/pricing` for the existing ServicePro Next.js 16 app.
>
> `/product` renders a feature map: every capability built in Weeks 0–2, each assigned to a
> pricing tier, plus a clearly separated "planned" column.
>
> `/pricing` renders three tiers — Solo (free, capped), Pro, and Studio — priced by anchoring to
> the competitor figures already verified in `lib/research/data.ts`, shown in both USD and MXN. It
> defines two customer segments and states explicitly which segment is excluded and why, quoting
> the Week 2 validation conversation.
>
> Add a revenue calculator as a Client Component with inputs for users per segment, tier mix,
> monthly churn, growth rate, and annual discount, computing MRR, ARR, blended ARPU, and a
> 12-month projection that updates with no network request. Add a scenario toggle for
> conservative, base, and optimistic, where the conservative preset encodes the validation
> conversation's finding rather than being the base case reduced.
>
> **All arithmetic lives in `lib/pricing/model.ts` as pure functions with no React and no I/O**, so
> the required pricing-logic tests execute the real calculation rather than a copy. Annual billing
> must apply the discount before multiplying by twelve, and churn must compound rather than
> subtract.
>
> Add an assumptions table where every input carries a source and a confidence level, reusing the
> Week 2 `SourceBadge`. Save scenarios to a new Supabase `pricing_scenarios` table storing both
> inputs and computed outputs, and list saved scenarios on the page. Reuse the existing null-safe
> Supabase client so both pages build and render with no credentials configured.

## 11. ✂️ Scope cuts — What looked nice but will not be built this week?

| Cut | Why |
|---|---|
| Stripe or any real checkout | The assignment asks for a pricing *simulator*. A payment integration is a different product and a paid dependency |
| Per-stamp PAC cost modelling | Real, but unsourced. Modelling it would import a guess into the cost side, which is precisely this module's failure mode. **Recorded as a known omission on the page** |
| Cohort or LTV/CAC analysis | Requires acquisition data that does not exist. A CAC figure would be invented |
| Charts beyond a simple bar | A line chart of a projection built on estimated assumptions dresses a guess as an analysis |
| Editing or deleting saved scenarios | Read and create only, consistent with Weeks 1 and 2 |
| Currency conversion at live FX rates | Needs an API and a key. A fixed, dated rate stated on the page is more honest than a live number nobody checks |
| A contador segment | Week 2 classified contadores as a *substitute*, not a customer. Selling to them is a real strategy and a larger claim than a pricing page should make quietly in week three |
| Modelling the excluded segment "just to see" | The point of excluding them is that they are not customers. Including them optionally would put a flattering number one click away |
