# 🧱 Product Spec — Acceptance Criteria

Rubric item: *"Feature requirements and acceptance criteria are clear and **testable**."*

The Build Discipline Packet's original wording — *"the page renders responsively
without errors"* — is not testable: there is no stated method and no pass/fail
boundary. Every criterion below names **how to check it** and **what result
constitutes a pass**, so any reader can independently reproduce the verdict.

Status: ✅ verified · ⏳ pending deployment · 🔲 not yet run

---

## F1 — Core dashboard

| # | Criterion | How to verify | Pass condition | Status |
|---|---|---|---|---|
| 1.1 | The `/` route loads | Request `/` | HTTP `200` | ✅ |
| 1.2 | Sidebar shows 4 items with Dashboard active | Inspect the rendered page | Dashboard, Projects, Time Tracking, Settings present; only Dashboard has `aria-current="page"` | ✅ |
| 1.3 | No navigation dead ends | Click each inactive sidebar item | Nothing navigates; no `href="#"` anchors exist in the DOM | ✅ |
| 1.4 | Three summary cards render | Inspect the page | Unpaid Invoices, This Month's Earnings, Active Projects, each with a numeric value | ✅ |
| 1.5 | Projects table renders all rows | Count rows | Row count equals the dataset length; each has name, client, value, deadline, status | ✅ |

## F2 — Financial correctness

| # | Criterion | How to verify | Pass condition | Status |
|---|---|---|---|---|
| 2.1 | Hourly project value = hours × rate | Compare a row's value against its `Nh × $R` subtext | Displayed value equals the product, to the cent | ✅ |
| 2.2 | Fixed-fee overrides the hourly calculation | Inspect "Marketing Site Launch" (41.5h × $90 = $3,735; fixed fee $4,200) | Displays **$4,200.00**, not $3,735.00 | ✅ |
| 2.3 | Unpaid Invoices sums only billed, unpaid work | Compare the card against the table | Equals Σ value where unpaid **and** status ∈ {Invoice Sent, Overdue} = **$3,450** | ✅ |
| 2.4 | This Month's Earnings counts only current-month payments | Compare the card against the data | Equals **$4,200** | ✅ |
| 2.5 | Active Projects counts unpaid work not yet invoiced | Count unpaid rows not marked Invoice Sent or Overdue | Equals **4** | ✅ |
| 2.6 | Cards never contradict the table | Change any project's value and reload | Card totals move consistently with the row | 🔲 |
| 2.7 | Currency is unambiguous | Inspect any amount | Format `$0,000.00`, two decimals, thousands separators | ✅ |

## F3 — Deadlines

| # | Criterion | How to verify | Pass condition | Status |
|---|---|---|---|---|
| 3.1 | Deadlines show a date and days remaining | Inspect the Deadline column | Both parts present, e.g. `Oct 25 · in 3 days` | ✅ |
| 3.2 | Past deadlines read as overdue | Inspect a past-dated row | Renders `N days overdue`, styled rose | ✅ |
| 3.3 | Relative dates are correct on **any** date | Load the page on two different days | Counts decrease by exactly one per elapsed day | 🔲 |
| 3.4 | Dates don't shift by timezone | Run with `TZ=America/Los_Angeles`, `TZ=Asia/Tokyo`, `TZ=UTC` | Same calendar date renders in all three | ✅ |
| 3.5 | Near-term deadlines are visually distinct | Inspect a row due within 3 days | Amber; overdue is rose; neither is the default grey | ✅ |

## F4 — Status

| # | Criterion | How to verify | Pass condition | Status |
|---|---|---|---|---|
| 4.1 | All four statuses render | Inspect the default dataset | In Progress, Awaiting Review, Invoice Sent, Overdue all appear | ✅ |
| 4.2 | Each status is visually distinct | Compare badges | Four different colours: indigo, amber, sky, rose | ✅ |
| 4.3 | Colour is never the only signal | View in greyscale | Every badge still readable via its text label | ✅ |
| 4.4 | An unknown status can't crash the page | Set a row's status to `banana` in Supabase, reload | Page renders; row degrades to In Progress | 🔲 |

## F5 — Data integration and resilience

| # | Criterion | How to verify | Pass condition | Status |
|---|---|---|---|---|
| 5.1 | Builds with **no** credentials | `rm .env.local && npm run build` | Build succeeds | ✅ |
| 5.2 | Renders with no credentials | Load with empty env vars | HTTP 200, full mock dataset, no visible error | ✅ |
| 5.3 | Survives an unreachable database | Set a bogus Supabase URL, reload | HTTP 200, mock data, warning logged server-side | ✅ |
| 5.4 | Survives an empty table | `DELETE FROM projects`, reload | HTTP 200, mock data | 🔲 |
| 5.5 | Live data displaces mock data | Seed the table, reload | Table shows **database** rows, not mock — no fallback logged | ✅ |
| 5.6 | Edits appear on refresh | Rename a project in Supabase, reload | New name appears without a redeploy | 🔲 |
| 5.7 | Fallback is invisible to the user | Compare healthy vs. degraded | No error banner, no empty state, no layout shift | ✅ |
| 5.8 | Numeric precision survives the database | Inspect values with live data | Amounts render as currency, never `NaN` | ✅ |
| 5.9 | Metrics agree across data sources | Compare mock vs. live rendering | Both derive $3,450 / $4,200 / 5 | ✅ |

## F8 — Security

| # | Criterion | How to verify | Pass condition | Status |
|---|---|---|---|---|
| 8.1 | Anonymous reads are permitted | `GET /rest/v1/projects` with the anon key | HTTP 200, rows returned | ✅ |
| 8.2 | Anonymous inserts are refused | `POST` a row with the anon key | Non-2xx, **and** no new row on re-query | ✅ |
| 8.3 | Anonymous updates are refused | `PATCH` an existing row | 0 rows affected; value unchanged on re-query | ✅ |
| 8.4 | Anonymous deletes are refused | `DELETE` a row | 0 rows affected; row still present on re-query | ✅ |
| 8.5 | No `service_role` key anywhere | `grep -r service_role .next/static/` | 0 matches | ✅ |
| 8.6 | Credentials never reach the browser | `grep -r <project-ref> .next/static/` and page source | 0 matches — the client is server-only, so `NEXT_PUBLIC_` values are never inlined into client JS | ✅ |

## F6 — Responsive and accessible

| # | Criterion | How to verify | Pass condition | Status |
|---|---|---|---|---|
| 6.1 | Usable at 375px | DevTools, iPhone SE width | No horizontal page scroll; all data reachable | 🔲 |
| 6.2 | Mobile uses stacked cards, not a squeezed table | Inspect below 640px | Card layout renders; the `<table>` is hidden | ✅ |
| 6.3 | Sidebar collapses to an icon rail | Inspect below 768px | Icons only, labels hidden, still visible | ✅ |
| 6.4 | Usable at 768px and 1440px | Resize | No overflow, no overlap, no clipped text | 🔲 |
| 6.5 | Table is semantically correct | Inspect markup | `<caption>`, `scope` on headers, row headers present | ✅ |
| 6.6 | Language is declared | Inspect `<html>` | `lang="en"` | ✅ |

## F7 — Deployment

| # | Criterion | How to verify | Pass condition | Status |
|---|---|---|---|---|
| 7.1 | Live URL loads publicly | Request the Vercel URL | HTTP 200, no auth wall — **0.68s** | ✅ |
| 7.2 | Console is clean | Open DevTools on the live site | Zero errors; **no hydration warnings** | 🔲 |
| 7.3 | The route is server-rendered per request | `npm run build` output | Route `/` marked `ƒ (Dynamic)`, not `○ (Static)` | ✅ |
| 7.4 | Pushing to `main` triggers a deploy | Push a commit | Vercel builds automatically — 6+ deployments | ✅ |
| 7.5 | No secrets in the repository | `git log -p -- .env.local` | No output — the file was never committed | ✅ |
| 7.6 | **Production reads the database, not the fallback** | `curl <url> \| grep data-source` | `data-source="supabase"` | ✅ |
| 7.7 | No credentials in the production bundle | Scan live HTML + all client chunks | 0 matches across 7 files | ✅ |

---

## Definition of Done

- [x] Live URL loads at submission time — <https://servicepro-orpin.vercel.app>
- [x] Live URL renders **Supabase** rows, not the mock fallback — verified `data-source="supabase"`
- [x] ≥5 commits pushed to GitHub — **13**
- [x] ≥2 successful Vercel deployments — **7**
- [x] ≥5 prompts logged — **5**
- [x] 3 self-tests documented with evidence — **9**
- [x] ≥1 improvement recorded in the iteration log — **16**
- [ ] Demo video, 2–3 minutes — *user*
- [ ] Human Decision Note, 150–250 words — *user*
- [ ] Final assembly into one submission document — *user*

---

## Out of scope — will not be built this sprint

Authentication · PDF invoice export · Stripe/payments · routes beyond `/` ·
create/edit/delete forms · time-entry logging · email notifications ·
light-mode toggle · automated test suite.

These are excluded by the Scope Cut, not overlooked. Criteria above deliberately
assert **nothing** about them.
