# What to build next

**Written 2026-09-24.** Ordered by what it costs a user to not have it, not by
what is interesting to build. The PAC contract is deferred by decision, so
nothing here depends on it.

Context that sets the order: the product is **free and gathering users**.
That makes correctness and retention worth more than new surface area — a
user who leaves because a number was wrong does not come back, and at this
stage there is no revenue to offset the loss.

---

> **Items 0 and part of 2 were completed on 2026-09-24**, along with the two
> internationalisation leaks found while building the forecast. What remains
> below is unchanged. See the handoff for the current state.

## 0. ~~FreeFlow is currently wrong for RESICO freelancers~~ — DONE

**This is a correctness bug, not a feature, and it should go first.**

The withholding built on 2026-09-23 uses the *régimen de actividad empresarial
y profesional* rates: 10% ISR plus two thirds of the IVA. That is right for
that regime and **wrong for RESICO**, where a persona moral withholds **1.25%
ISR**.

RESICO has been the default simplified regime for Mexican personas físicas
since 2022 and a large share of the target user base is on it. For those
users FreeFlow currently overstates withholding by 8.75% of the subtotal and
understates what will arrive. On a 100,000 MXN year that is roughly 8,750 MXN
of income the product tells them they will not receive.

Telling somebody they earned less than they did is the same class of failure
this project has tested against everywhere else — and it is worse than the
gap it was built to close.

**What it needs**

- A `tax_regime` field on the project or, better, on the user: `general` or
  `resico`. Regime is a property of the freelancer, not of a job, so the
  account is the more honest home — with a per-project override for people who
  changed regime mid-year.
- `computeWithholding` takes the regime and selects the ISR rate. The IVA
  retention is unchanged.
- The worked example gets a RESICO twin in `test-withholding.ts`: 10,000 at
  1.25% is 125 ISR, netting 10,408.33.
- `/support` and the dashboard panel state which regime the figures assume.
  A number about someone's taxes should say what it assumed.

**Cost:** one migration, one parameter, a handful of tests. Half a day.

> Worth checking the 1.25% against a current source before shipping. The rate
> is in the LISR RESICO provisions and it has been stable, but this is exactly
> the kind of number the project's own rules say not to take on trust.

---

## 1. The feature map drifts every time something ships

> **Still true, and now worse.** The forecast, currency support, RESICO and
> payment terms have all shipped since this was written and none of them are
> in the map. This is the fourth drift. It needs the test, not another manual
> correction.


`/product` currently claims 19 built and 6 planned. The truth is closer to 22
and 4: **withholding is still marked planned although it shipped**, and CSV
export and the landing page are not in the map at all.

This is the third time the map has gone stale, which makes it a process
problem rather than three separate mistakes. The page exists to tell visitors
what is real; when it lags, it is read as current and quietly lies.

**What it needs**

- Correct the three entries, and split "Withholding handling" into the
  general case (shipped) and RESICO (not yet), so the map stops describing a
  thing that half exists as one entry.
- A test that every `route` in the feature map resolves to a real route, so a
  feature claiming a page that does not exist fails the build rather than the
  visitor.
- The convention worth adopting: **a feature is not shipped until it is in the
  map.** Same rule the project already applies to nav items.

**Cost:** an hour.

---

## 2. The projects table has no search and no filter

Fine at six projects. Painful at sixty, which is where a freelancer using this
for a year lands.

`lib/research/filter.ts` already does exactly this for research records —
pure, URL-synced, tested. Copying that shape means a search box, a status
filter, and a paid/unpaid toggle, all linkable and all testable without a
browser.

Pair it with **period filtering**. "This month's earnings" is the only
time-scoped figure in the product; a freelancer reconciling a quarter or
preparing an annual return cannot ask for one. The CSV export should take the
same range, so the file matches what is on screen.

**Cost:** a day, most of it tests.

---

## 3. A new account lands on an empty dashboard

The empty state opens the new-project form, which is correct and does not
teach anything. A first-time user has no idea that briefs can be pasted into
`/core`, that overdue work surfaces itself, or that retenciones are handled.

Options, cheapest first:

- **A dismissible first-run checklist.** Add a project, paste a brief, set a
  client's tax type. Three items, then it disappears for good. Stored in the
  preferences row that already exists.
- **"Load sample data"** on the empty state, clearly labelled and one click to
  remove. The seed projects already exist in `mock-data.ts`.
- A short product tour. Most work, least certain payoff.

**Cost:** half a day for the checklist.

---

## 4. Clients are free text

Every project stores a client name as a string, so "Nova Corp" and "Nova
Corp." are two clients, and a tax type recorded on one job has to be recorded
again on the next. There is no way to ask what a client is worth.

A `clients` table with name, tax type and RFC would fix all three, and it is
the natural home for the regime override in item 0. It also makes
per-client revenue a query rather than a feature.

Worth doing **before** the user base grows, because migrating free text into
records gets harder with every row.

**Cost:** a migration, a picker, a backfill. One to two days.

---

## 5. Nothing here has been checked on a phone

The layout is responsive by construction and the table becomes cards below
`sm`, but **no one has looked at it on an actual device.** The Week 2
interviewee's single complaint was that it was "annoying on mobile", and the
fix for that was shipped without being verified on the thing he complained
about.

**Cost:** an hour with a phone, plus whatever it finds.

---

## 6. Multiple seats

The Studio tier cannot be sold without it, and nothing is being sold, so this
has lost its urgency. It remains the largest single piece of work left:
organisations, invitations, an RLS rewrite, and two dependent features
(cross-person view, per-person profitability).

Do not start this until items 0–3 are done. It touches every table.

**Cost:** several days, and it changes the security model.

---

## 7. CFDI issuance — deferred by decision

Blocked on a commercial contract with an authorised PAC. Still the central
promise of the paid model, and still absent. The landing page says so, which
is the right interim position.

When the contract exists, the order is: issuance, then materialidad evidence,
then folio management. Nothing else in this list depends on it.

---

## Not recommended

- **Recurring projects.** The validated user sells one-time installs. Building
  a retainer workflow would serve a user nobody has spoken to.
- **An outreach or CRM module.** The interview points at it hard — it is the
  product he said he would actually buy — but it is a different product, not a
  feature of this one. That is a founding decision, not a sprint.
- **Analytics dashboards.** There is not enough data yet for a chart to say
  anything true.

---

## Suggested order

```
  0  RESICO withholding        correctness — do this first
  1  Feature map + drift test  an hour, stops the page lying
  2  Search, filter, periods   the thing that breaks as users accumulate work
  3  First-run checklist       cheapest retention win available
  5  Check it on a phone       an hour, overdue
  4  Clients as records        before the data gets harder to migrate
  6  Multiple seats            only after the above
  7  CFDI                      when the PAC contract exists
```
