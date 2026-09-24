# FreeFlow — Handoff

**Live:** <https://www.freeflow.website> · **Repo:** <https://github.com/BraydenEC/servicepro>
**Owner:** Brayden Credeur · **Updated:** 2026-09-24 · **Commits:** 83 · **Tests:** 565

> The repository is still named `servicepro`. The product was renamed FreeFlow
> after Week 3 and moved to its own domain. Same project, same history. The
> Week 1–3 packets in `docs/week*/` deliberately still say ServicePro: they
> record what was handed in, and editing them would falsify evidence rather
> than update it.

---

## 1. Do this first

**One migration is written and not yet run.**

```
supabase/payment_terms.sql    adds projects.payment_terms_days
```

Supabase → SQL Editor → New query → paste the file → Run. It ends with a
verify block. Until it runs, per-project payment terms silently fail to save;
everything else works, including the forecast, which falls back to the account
default.

Every earlier migration **has** been run — verified against the live database
on 2026-09-24.

**Two owner actions outstanding:**

1. Create a Stripe Payment Link and set `NEXT_PUBLIC_DONATE_URL` in Vercel.
   Until then `/support` explains itself and shows no button, which is the
   intended degraded state. Steps in `docs/ACTION_ITEMS.md`.
2. **Rotate the Anthropic key after grading.** It was pasted into a chat
   during development and lives only in gitignored `.env.local`.

---

## 2. What this is

A project and invoice tracker for independent freelancers, built across
weekly modules for *Negocios Inteligentes y Comercio Digital* at Ibero CDMX
and extended well past the coursework.

**The product is free**, gathering users, funded by optional donations. The
pricing model on `/pricing` is what it intends to move to and is published
rather than hidden.

**The centre of gravity moved on 2026-09-24.** It was "what am I owed" — a
backward-looking tracker with a Mexican tax wedge. It is now "what is coming"
— a forward-looking forecast for freelancers anywhere, with the Mexican tax
handling as a strong feature underneath rather than the headline. Focus
markets are the US and Latin America.

| Route | Auth | What it is |
|---|---|---|
| `/` | public | Landing page signed out, dashboard signed in. The page branches on the session; the proxy does not gate it |
| `/core` | required | AI extraction of a project from a client brief |
| `/research` | public | Competitor and benchmark analysis, confidence on every claim |
| `/product` | public | Feature map: 24 built, 5 planned |
| `/pricing` | public | The model it plans to move to. Nothing is charged today |
| `/support` | public | Donations. Optional, gated on nothing |
| `/signup` `/login` `/verify-email` `/forgot-password` `/reset-password` | public | Accounts |

---

## 3. Stack

Next.js 16.3.1 (App Router, Turbopack) · React 19.2.8 · Tailwind v4 (CSS-first,
no config file) · TypeScript · Supabase Postgres with RLS · Vercel.

**Three dependencies have ever been added:** `@anthropic-ai/sdk`, `zod`,
`@supabase/ssr`. Icons, tabs, charts, bars and ordering are all hand-written.
Six weeks and counting; worth keeping.

```
NEXT_PUBLIC_SUPABASE_URL        project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   anon key — public by design, RLS does the work
ANTHROPIC_API_KEY               optional; without it /core uses a heuristic
NEXT_PUBLIC_DONATE_URL          optional; a Stripe Payment Link
```

`ANTHROPIC_API_KEY` must **never** carry a `NEXT_PUBLIC_` prefix. The
`service_role` key must never appear in this repo or in Vercel.

**Mail** goes through Brevo SMTP, domain-authenticated on `freeflow.website`.
Email confirmation is on by the owner's decision. Supabase's built-in mailer
allows two messages an hour for the whole project, which is what blocked
sign-up for most of a day before Brevo.

---

## 4. Architecture, and the rules behind it

```
app/            routes; every page force-dynamic
  (auth)/       sign-up, sign-in, verify, forgot/reset password
  api/          route handlers — every write re-validated server-side
components/     UI; server components unless they need state
lib/            pure logic and data access, testable without a browser
  forecast/     the cash-flow model
  tax/          withholding — cites the law, takes the regime
  currency/     (lib/currency.ts) eleven currencies, no conversion
  pricing/      the revenue model
  prefs/        preferences schema, storage, external store
  export/       CSV, treated as untrusted output
supabase/       migrations, each idempotent with a verify block
scripts/        nine test suites
proxy.ts        session refresh and route gating
```

Rules that have held and should keep holding:

1. **The database is an upgrade, never a requirement.** No credentials still
   builds, deploys and renders mock data. Every data path falls back.
2. **Validate on the server, always.** RLS is the second wall, not the first.
3. **Hide, never delete.** Tabs and collapsed reasoning stay in the DOM, so
   the Week 2 and 3 content checks keep passing.
4. **A nav item leads somewhere or is visibly disabled.** Since Week 0.
5. **Pure logic lives in `lib/` and is tested without a browser or database.**
6. **Thread request-scoped values, do not read them ambiently.** `now`,
   `currency` and the tax regime are all passed down, so one request renders
   one answer everywhere.
7. **A feature is not shipped until it is in the feature map.** The map drifted
   four times before this became a rule; `test:features` now enforces the part
   a test can.
8. **When a check disagrees with the code, the check is a suspect too.** Seven
   occurrences; see §8.

---

## 5. Data model

`projects` is the core table. Others: `core_outputs`, `research_records`,
`pricing_scenarios`, `user_prefs`.

Fields with non-obvious meanings:

- `invoice_total` nullable — **null means the project bills hourly** and its
  value is `hours_logged × hourly_rate`.
- `is_paid` / `paid_at` move together, enforced by a CHECK. **Only the
  mark-paid route may write them.** `toUpdateRow()` exists to stop an edit
  un-paying a project and pulling money out of the monthly earnings.
- `status` has five values; `contracted` precedes `in_progress`, because the
  validation interviewee's pipeline starts at a signed contract.
- `client_tax_type` nullable — **null is meaningful.** "Not recorded", and
  withholding treats it as no withholding rather than guessing.
- `payment_terms_days` nullable — **null means "use my account default"**.
  Terms belong to the client; clients are not yet records, so per-project is
  the honest intermediate.

**Per-user settings live in `user_prefs.prefs` (jsonb)**, not in columns:
currency, tax regime, default payment terms, density, widget layout. That
avoids a migration per setting and `parsePrefs` repairs anything malformed.

### RLS

Private tables (`projects`, `core_outputs`, `user_prefs`): own rows only via
`auth.uid()`. Public-read tables (`research_records`, `pricing_scenarios`):
anyone reads, only signed-in users write, and only as themselves.

### Getting data out

`GET /api/export/projects` returns CSV with the retenciones worked out where
they apply and **omitted entirely where they do not** — a US freelancer gets
one `Amount` column, not three columns of zeros about a Mexican tax.

It reads through `getDashboardData` so file and screen cannot disagree, and
refuses to run on a fallback render: six invented projects downloaded as
"your projects" is worse than a refusal.

Project names are user-controlled, so the CSV treats its own output as
untrusted — any cell starting `=`, `+`, `-` or `@` is neutralised, because a
spreadsheet executes those.

---

## 6. Money, and the funnel

**Free.** Every feature, for everyone. Funded by an optional donation through
a **Stripe Payment Link** — a URL in `NEXT_PUBLIC_DONATE_URL`. No secret key,
no webhook, no card handling here, no fourth dependency. The app never learns
who donated, which costs nothing while nothing is gated on it.

`/support` states what a donation does **not** buy: no features, no priority,
no roadmap influence. That section matters more than the button.

```
  /            landing — what it is, and what it is not
  /signup      email and password, no card
  /            dashboard, empty, one call to action
  /support     optional, never gated, never interrupting
```

The landing page derives its capability counts from `lib/product/features.ts`
and keeps a section on what is **not** built that leads with the absence of
CFDI issuance. Someone who signs up expecting that and finds it missing is a
worse outcome than someone who never signs up.

---

## 7. Tests

`npm test` runs nine suites, 565 assertions, no browser and no database.

| Suite | Count | Guards |
|---|---|---|
| `test:pricing` | 30 | The revenue model — **including that the submitted $32,261 and $3,958 have not moved** |
| `test:filters` | 17 | Research filtering |
| `test:prefs` | 21 | Corrupt preferences repair rather than crash |
| `test:projects` | 58 | Validation, impossible dates, edits never touching payment state |
| `test:progress` | 37 | Pipeline percentages and their ordering |
| `test:withholding` | 50 | Retenciones, both regimes, against worked examples |
| `test:csv` | 48 | Quoting, UTF-8 BOM, **formula injection**, conditional tax columns |
| `test:forecast` | 38 | Money lands in one bucket, nothing vanishes, terms and regime apply |
| `test:currency` | 48 | Regional formatting, garbage falls back |
| `test:features` | 152 | **Every feature links to a route that exists** |
| `test:project-filter` | 44 | Three axes intersect; a hostile URL never empties the table |

Several exist because a test caught something real. See §8.

---

## 8. Pending work

### Blocked on something external

| Feature | Blocker |
|---|---|
| **CFDI 4.0 issuance via a PAC** | Needs a commercial contract with an authorised PAC. Deferred by decision. |
| **Materialidad evidence** | Depends on CFDI |

**Say it plainly:** every paid tier's central promise is CFDI issuance, and it
does not exist. The landing page says so, which is the right interim position.

### Buildable now, roughly in order

| Feature | Notes |
|---|---|
| **A first-run experience** | A new account gets an empty dashboard and one call to action. Nothing teaches the product. Cheapest retention win available. |
| **Check it on a phone** | **Nobody has.** The Week 2 interviewee's one complaint was "annoying on mobile", and the fix shipped unverified on the thing he complained about. |
| **Clients as records** | Free text means "Nova Corp" and "Nova Corp." are two clients, and a tax type or payment terms must be re-entered per project. Migrate before the data grows. |
| **Period filtering** | The forecast looks forward; nothing looks back over a chosen range. The CSV should take the same range. |
| **Multiple seats** | Organisations, invitations, an RLS rewrite. Largest remaining piece; less urgent now nothing is sold. |

`docs/extras/ROADMAP.md` has the full reasoning and what **not** to build.

---

## 9. Things that went wrong, and what they taught

Each is a trap the next person could fall into.

**JavaScript rolls impossible dates over.** `new Date("2026-02-31")` is 3 March
and reports itself valid. The deadline field used that check from the day it
was written, so the form had been silently accepting impossible deadlines and
moving them by up to three days. Found by a test written for a *different*
field. Dates now round-trip their components.

**A Mexican tax assumption leaked into a universal feature.** The forecast ran
every project through `computeWithholding`, which always models a Mexican
invoice and always adds 16% IVA — inflating every non-Mexican user's income by
16%. IVA is not income anywhere; it is collected and passed on.

**`toRow()` sets `is_paid: false`.** Correct on insert, destructive on update.

**Auth after validation leaks the payload shape.** Two save routes validated
the body before checking the session, so a logged-out POST got a 400 listing
the fields it got wrong.

**A static route inside a dynamic segment is a production-only bug.**
`/api/projects/export` sat inside `/api/projects/[id]`. Development resolved
the static child and returned 401; production resolved it as an id and
returned 405. Every local check passed. Now `/api/export/projects`. After
moving a route, stale validators in `.next` report phantom type errors until
the directory is cleared.

**`setState` in an effect is usually the wrong tool.** Caught twice, for
localStorage and for reading the URL. Both were external state; both became
`useSyncExternalStore`.

**Empty is not the same as broken.** `lib/projects.ts` answered zero rows with
six fictional projects — right while the only way to get zero was a broken
database, a lie on the first screen every new account sees.

**Deriving a number protects it from drifting, not from being misused.** The
landing page correctly derived "6" from the feature map and then said
"invoicing through an authorised PAC **is** 6 of the planned capabilities",
which is nonsense. CFDI is one of the six.

**zsh does not word-split unquoted variables.** A rename loop silently did
nothing and reported success. Use `while IFS= read -r`.

**`qlmanage` pads non-square SVGs**, and cropping back from the centre removes
the top of the image. Author wireframe canvases square.

**When a check disagrees with the code, the check is a suspect too.** Seven
times now, most recently three in a row in the forecast tests: 1 Oct with
30-day terms pays on 31 Oct, still October, and 5 Oct pays on 4 Nov. The code
was right every time.

---

## 10. Coursework status

Weeks 0–3 are built and deployed. Week 3's packet is written, the decision
note drafted at 242 words, and both wireframes referenced.

**Outstanding, owner-only:** demo video, eight screenshots, pasting both
wireframe images in, and a final pass on the decision note so it sounds like
him. Week 2 needs its wireframe insert and a corrected screenshot; Week 1
needs its video and note.

⚠️ **The screenshots must be taken fresh.** The interface has changed
substantially since that list was written — monochrome redesign, top-bar
navigation, the forecast panel. Anything captured earlier will not match what
a grader sees.

`docs/ACTION_ITEMS.md` is the live checklist.

---

## 11. Where things are

| Looking for | Go to |
|---|---|
| What to do next, step by step | `docs/ACTION_ITEMS.md` |
| What to build next, and what not to | `docs/extras/ROADMAP.md` |
| What the target user actually said | `docs/extras/VALIDATION_FINDINGS.md` |
| Why the interface looks like this | `docs/extras/UX_CUSTOMIZATION_PLAN.md` |
| The accounts design | `docs/extras/ACCOUNTS_PLAN.md` |
| Domain and email setup | `docs/extras/DOMAIN_AND_EMAIL_SETUP.md` |
| Week 3 submission | `docs/week3/WEEK3_SUBMISSION_DOCUMENT.md` |
| Feature map, built vs planned | `lib/product/features.ts` |
