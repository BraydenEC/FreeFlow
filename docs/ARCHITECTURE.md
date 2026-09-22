# 🏗 Architecture — FreeFlow

Rubric item: *"Architecture sketch and stack table explain how the feature works."*

> The diagrams below are Mermaid and render automatically on GitHub. For the
> submission PDF, screenshot them from the GitHub view of this file.

---

## System components

```mermaid
graph TD
    U["👤 Freelancer<br/>(browser)"]

    subgraph V["▲ Vercel — Edge / Node runtime"]
        P["app/page.tsx<br/>Server Component<br/>force-dynamic"]
        L["lib/projects.ts<br/>fetch + fallback + metrics"]
        C["components/<br/>Sidebar · SummaryCards<br/>ProjectsTable · StatusBadge"]
        M["lib/mock-data.ts<br/>fallback dataset"]
    end

    subgraph S["🗄 Supabase — Postgres"]
        T["projects table<br/>RLS: SELECT-only for anon"]
    end

    U -->|"HTTPS request for /"| P
    P -->|"await getDashboardData(now)"| L
    L -->|"SELECT via @supabase/supabase-js"| T
    T -.->|"rows, or error / empty"| L
    L -.->|"on any failure"| M
    L -->|"projects + derived metrics"| P
    P -->|"renders"| C
    C -->|"fully-formed HTML"| U

    style V fill:#0f172a,stroke:#6366f1,color:#f1f5f9
    style S fill:#0f172a,stroke:#3ecf8e,color:#f1f5f9
    style M fill:#1e293b,stroke:#fb7185,color:#f1f5f9
```

**The key property:** the browser never talks to Supabase. Data is fetched
server-side during the render, so the user receives complete HTML — no loading
spinner, no request waterfall, and no database round trip from the client.

---

## Data flow, including every failure path

```mermaid
flowchart TD
    A["Request for /"] --> B["now = new Date()<br/>captured ONCE"]
    B --> C{"Credentials<br/>present?"}

    C -->|"No"| MOCK["📦 getMockProjects(now)"]
    C -->|"Yes"| D{"Client<br/>initialized?"}
    D -->|"No"| MOCK
    D -->|"Yes"| E["SELECT * FROM projects"]

    E --> F{"Query<br/>succeeded?"}
    F -->|"Error"| MOCK
    F -->|"Yes"| G{"Rows<br/>returned?"}
    G -->|"Empty"| MOCK
    G -->|"Yes"| MAP["mapRow()<br/>snake_case → camelCase<br/>numeric strings → numbers"]

    MAP --> H["deriveMetrics(projects, now)"]
    MOCK --> H
    H --> I["SummaryCards + ProjectsTable"]

    style MOCK fill:#7f1d1d,stroke:#fb7185,color:#fff
    style MAP fill:#1e3a8a,stroke:#60a5fa,color:#fff
    style H fill:#312e81,stroke:#818cf8,color:#fff
```

Four distinct failures converge on one fallback, so the page has exactly one
degraded state to reason about — and it looks identical to the healthy one.

---

## Tech stack

| Layer | Choice | Role | Why this, and what was rejected |
|---|---|---|---|
| Framework | **Next.js 16** (App Router) | Routing + server rendering | Server Components let the fetch happen before HTML is sent. *Rejected: client-side `useEffect` fetching* — it exposes the database call to the browser and forces a loading state. |
| UI | **React 19** | Component model | Bundled with Next 16. |
| Language | **TypeScript** | Type safety | The `ProjectStatus` union makes an invalid state unrepresentable at compile time rather than a runtime crash in the badge lookup. |
| Styling | **Tailwind CSS v4** | Design system | CSS-first: tokens live in `@theme`, so there is no config file to drift from the styles. *Rejected: a component library* — heavier than this UI needs and harder to match to the mockup. |
| Database | **Supabase** (Postgres) | Persistence | Free, hosted, no backend to write. Real `CHECK` constraints enforce data validity at the source. *Rejected: a JSON file* — no persistence story and no database evidence for the assignment. |
| Client | **@supabase/supabase-js** | Query layer | Official SDK; PostgREST under the hood. |
| Hosting | **Vercel** | Deployment | Zero-config for Next.js; auto-deploys every push to `main`, which also produces the deployment evidence. |
| Icons | **Inline SVG** | Iconography | *Rejected: an icon package* — a dependency and a network request for eight glyphs. Inline SVG inherits `currentColor`, so state changes are free. |
| Dates/money | **`Intl` built-ins** | Formatting | *Rejected: date-fns / moment* — the standard library covers this, with no bundle cost. |

**Dependency count: one.** Everything else is the framework or the platform.

---

## Data model

Single table. The relational split into `projects` + `time_entries` was
deliberately deferred — this sprint needs a *value per project*, not a
per-session time log, and one nullable column expresses both billing models.

### `projects`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `name` | `text` NOT NULL | |
| `client` | `text` NOT NULL | |
| `status` | `text` NOT NULL | `CHECK` in the four UI states — a typo can't create a project the interface has no badge for |
| `deadline` | `date` NOT NULL | Calendar date, not a timestamp: a deadline is a day, not an instant |
| `hours_logged` | `numeric(6,2)` | |
| `hourly_rate` | `numeric(8,2)` | |
| `invoice_total` | `numeric(10,2)` NULL | Fixed fee. `NULL` ⇒ bills hourly |
| `is_paid` | `boolean` | |
| `paid_at` | `date` NULL | |
| `created_at` | `timestamptz` | |

**Constraint:** `is_paid` and `paid_at` must agree — a project cannot be paid
without a payment date. Without it, revenue could silently vanish from the
earnings metric.

**Security:** RLS enabled with exactly one `SELECT` policy for `anon`. Both
alternatives fail quietly: RLS disabled makes the table publicly *writable*;
RLS enabled with no policy returns an empty array, and the app falls back to
mock data while appearing to work perfectly.

### Derived values — never stored

| Value | Rule |
|---|---|
| Project value | `invoice_total ?? hours_logged × hourly_rate` |
| Unpaid Invoices | Σ value where not paid **and** status ∈ {`invoice_sent`, `overdue`} |
| This Month's Earnings | Σ value where paid **and** `paid_at` in the current month |
| Active Projects | count where status ≠ `invoice_sent` |

Computed rather than stored so the summary cards and the table are guaranteed to
agree — they read from the same array.

---

## Deployment pipeline

```mermaid
graph LR
    A["💻 Local<br/>git commit"] --> B["🐙 GitHub<br/>main"]
    B -->|"webhook"| C["▲ Vercel<br/>build"]
    C --> D["🌐 Live URL"]
    E["🔑 Env vars<br/>in Vercel"] -.-> C
    D -->|"per-request fetch"| F["🗄 Supabase"]

    style D fill:#065f46,stroke:#34d399,color:#fff
```

Environment variables are set in the Vercel dashboard, never committed.
`.env.example` documents the required names with no values.
