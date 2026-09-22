# FreeFlow

**A project and invoice tracker for freelancers.** Built for the Week 0 Setup
Sprint of *Negocios Inteligentes*.

🔗 **Live:** <https://servicepro-orpin.vercel.app>
📁 **Repo:** <https://github.com/BraydenEC/servicepro>

---

## The problem

Independent freelancers track their work across three disconnected systems:
a spreadsheet for hours, a Word document for invoices, and scattered notes for
deadlines. Nothing reconciles. The two questions that actually matter —
*"how much am I owed?"* and *"what's due next?"* — require manual assembly every
single time.

FreeFlow answers both on one screen.

## Who it's for

Independent contractors, freelance developers, designers, and consultants who
bill hourly or by fixed fee.

## What it does

A single dashboard showing:

- **Three cash-flow metrics** — unpaid invoices, this month's earnings, active project count
- **An action-oriented project table** — client, financial value, deadline with days remaining, and a colour-coded status
- **Four project states** — In Progress, Awaiting Review, Invoice Sent, Overdue

Every figure is *derived* from the underlying data, so the summary cards can
never disagree with the table beneath them.

---

## Tech stack

| Tool | Role | Why this one |
|---|---|---|
| **Next.js 16** (App Router) | Framework + server rendering | Server Components fetch data before HTML is sent — no loading spinner, no client-side waterfall, and the database is never queried from the browser |
| **React 19** | UI | Bundled with Next 16 |
| **TypeScript** | Type safety | The status union makes an invalid project state unrepresentable rather than a runtime surprise |
| **Tailwind CSS v4** | Styling | CSS-first config: design tokens live in `@theme` in `globals.css`, so there is no separate config file to drift |
| **Supabase** (Postgres) | Database | Free tier, hosted Postgres, no backend to write or deploy. Real SQL constraints rather than app-level validation |
| **Vercel** | Hosting | Zero-config Next.js deploys, automatic on every push to `main` |
| **Claude Code** | Coding agent | Prompt log in [`docs/PROMPT_LOG.md`](docs/PROMPT_LOG.md) |

No UI component library, no icon package, no date library. Icons are inline SVG
and dates are handled by `Intl` — fewer dependencies, nothing to audit, and
nothing that breaks on a major version bump.

---

## Running locally

```bash
git clone <repo-url>
cd servicepro
npm install
npm run dev          # → http://localhost:3000
```

**It runs with no configuration.** With no database credentials present, the app
renders a realistic mock dataset rather than erroring — see
[Resilience](#resilience) below.

### Connecting a database (optional)

```bash
cp .env.example .env.local
```

Fill in both values from your Supabase project (**Project Settings → API**):

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | "Project URL" |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | "Project API keys" → `anon` / `public` |

Then run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor.
It creates the table, enables row-level security with a read-only policy, seeds
six projects, and ends with a query that verifies the expected totals.

> The `anon` key is safe in the browser: it is designed to be public, and the
> table is protected by a `SELECT`-only RLS policy. The `service_role` key
> bypasses RLS entirely and must never be used in a `NEXT_PUBLIC_` variable.

---

## Resilience

The dashboard renders correctly whether or not the database is reachable. Four
failure modes all resolve to the same place:

```
credentials missing ─┐
client init failed  ─┤
query returned error─┼──→ mock dataset ──→ identical UI
table empty         ─┘
```

This is deliberate, and it is load-bearing in two ways:

1. **`npm run build` succeeds with no environment variables set.** A client that
   throws on missing credentials would fail the *build*, not the request —
   breaking deployment before any fallback could run.
2. Each path logs a distinct message server-side, so "why is this showing mock
   data" is answerable in one glance at the logs.

---

## Project structure

```
app/          Route, layout, design tokens
components/   Sidebar, SummaryCards, ProjectsTable, StatusBadge
lib/          format (currency/dates), mock-data, projects (fetch + metrics), supabase
types/        Project model and status union
supabase/     schema.sql — table, RLS policy, seed data, verification query
docs/         Architecture, acceptance criteria, prompt log, test evidence
```

---

## Scope

**Built this sprint:** the `/` dashboard, Supabase integration with fallback,
responsive dark-mode UI.

**Deliberately excluded:** authentication, PDF invoice export, Stripe/payments,
additional routes, project CRUD forms, time-entry logging, email notifications,
and a light-mode toggle. Rationale in
[`docs/IMPLEMENTATION_NOTE.md`](docs/IMPLEMENTATION_NOTE.md).

---

## Documentation

| Document | Contents |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System diagram, data flow, data model |
| [`docs/ACCEPTANCE_CRITERIA.md`](docs/ACCEPTANCE_CRITERIA.md) | Testable pass/fail requirements |
| [`docs/IMPLEMENTATION_NOTE.md`](docs/IMPLEMENTATION_NOTE.md) | How the mockup became the build, and where it diverged |
| [`docs/CONVERSATION_LOG.md`](docs/CONVERSATION_LOG.md) | Decisions, rejections, corrections |
| [`docs/PROMPT_LOG.md`](docs/PROMPT_LOG.md) | Coding-agent prompts |
| [`docs/TEST_EVIDENCE.md`](docs/TEST_EVIDENCE.md) | Self-test results |
| [`docs/ACTION_ITEMS.md`](docs/ACTION_ITEMS.md) | Remaining manual steps |
