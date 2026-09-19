# 🏗 Week 3 Architecture — Product & Pricing

> Mermaid renders natively on GitHub. Screenshot from the GitHub view for the submission PDF.

---

## System components

```mermaid
graph TD
    U["👤 Reader / builder"]

    subgraph V["▲ Vercel"]
        PROD["app/product/page.tsx<br/>Server Component"]
        PRICE["app/pricing/page.tsx<br/>Server Component"]
        FEAT["lib/product/features.ts<br/>18 features · 12 built · 6 planned"]
        TIERS["lib/pricing/tiers.ts<br/>tiers · segments · assumptions<br/>anchored to Week 2 research"]
        MODEL["lib/pricing/model.ts<br/>PURE · no React · no I/O"]
        CALC["PricingCalculator<br/>CLIENT COMPONENT"]
        API["/api/pricing/save<br/>recomputes before storing"]
    end

    subgraph S["🗄 Supabase"]
        T["pricing_scenarios<br/>inputs jsonb + outputs<br/>CHECK: arr = 12 × mrr"]
    end

    U -->|"GET /product"| PROD --> FEAT
    U -->|"GET /pricing"| PRICE
    PRICE --> TIERS
    PRICE --> MODEL
    PRICE -->|"getSavedScenarios()"| T
    PRICE -->|"props"| CALC
    CALC -->|"useMemo, zero network"| MODEL
    CALC -->|"POST inputs + figures"| API
    API -->|"recompute, compare"| MODEL
    API -->|"store ITS OWN result"| T

    style V fill:#0f172a,stroke:#6366f1,color:#f1f5f9
    style S fill:#0f172a,stroke:#3ecf8e,color:#f1f5f9
    style MODEL fill:#1e3a8a,stroke:#60a5fa,color:#fff
    style CALC fill:#312e81,stroke:#818cf8,color:#fff
```

**`lib/pricing/model.ts` is the centre of this design.** It is imported by the page, the
calculator, the save route, the saved-scenario display, and the test suite — five consumers, one
implementation. The required pricing-logic tests therefore execute the same code the UI runs
rather than a copy, which is the lesson Week 2 taught the hard way.

---

## Why the save route distrusts its own client

```mermaid
flowchart TD
    A["Calculator computes MRR/ARR<br/>in the browser"] --> B["POST inputs + figures"]
    B --> V{"Schema valid?"}
    V -->|"No"| R1["400 — rejected"]
    V -->|"Yes"| RC["Recompute from the<br/>submitted INPUTS<br/>using the same model"]
    RC --> M{"Do the figures match<br/>within 2 cents?"}
    M -->|"No"| R2["409 — refused,<br/>both values named"]
    M -->|"Yes"| DB{"Postgres CHECK<br/>arr = 12 × mrr"}
    DB -->|"violated"| R3["rejected at rest"]
    DB -->|"ok"| ROW["Row stored with the<br/>SERVER's figure, not the client's"]

    style R1 fill:#7f1d1d,stroke:#fb7185,color:#fff
    style R2 fill:#7f1d1d,stroke:#fb7185,color:#fff
    style R3 fill:#7f1d1d,stroke:#fb7185,color:#fff
    style ROW fill:#065f46,stroke:#34d399,color:#fff
```

The client's arithmetic is **checked, not trusted**. Verified in production: an ARR inflated to
$12 million was refused with 409 and both figures reported.

And because the table stores the **inputs** alongside the outputs, every saved row is
recomputable. `SavedScenarios` does exactly that on render and reports any mismatch — so a change
to the pricing maths becomes visible rather than silent.

---

## Data model — `pricing_scenarios`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | |
| `scenario` | text | CHECK: conservative, base, optimistic |
| `inputs` | **jsonb** | The complete input set — makes the row reproducible |
| `mrr` · `arr` | numeric(12,2) | Both ≥ 0. Written from the **server's** recomputation |
| `created_at` | timestamptz | |

```sql
constraint arr_is_twelve_times_mrr
  check (abs(arr - (mrr * 12)) < 0.02)
```

ARR is a **run-rate**, not the sum of a growing projection. Conflating the two overstates revenue
by roughly 60% at 8% monthly growth, so the relationship is enforced in the database rather than
trusted to the application.

---

## Tech stack — Week 3 additions

| Layer | Choice | Why, and what was rejected |
|---|---|---|
| Pricing maths | **Pure TypeScript, zero dependencies** | Testable without a DOM. *Rejected: calculating inside the component* — untestable except through the UI, which is what went wrong in Week 2 |
| Calculator | **Client Component + `useMemo`** | Instant recompute. *Rejected: a server action per keystroke* |
| Projection chart | **CSS flex bars** | *Rejected: Recharts* — a dependency to draw twelve rectangles |
| Price anchoring | **Week 2 verified competitor figures** | *Rejected: plausible-looking prices* — the exact failure this module invites |
| FX rate | **Fetched once, dated, stated** | *Rejected: a live FX API* — a key and a dependency for a number nobody re-checks |
| Persistence | **Supabase, inputs + outputs** | Makes every saved row a regression test |

**Net new third-party dependencies: zero**, for the fourth week running.
