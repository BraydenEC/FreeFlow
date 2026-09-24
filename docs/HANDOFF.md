# FreeFlow — Handoff

**Live:** <https://www.freeflow.website> · **Repo:** <https://github.com/BraydenEC/servicepro>
**Owner:** Brayden Credeur · **Last updated:** 2026-09-24 · **Commits:** 74 · **Tests:** 241

> The repository is still named `servicepro`. The product was renamed FreeFlow
> after Week 3 and moved to its own domain. Same project, same history. The
> Week 1–3 submission packets in `docs/week*/` deliberately still say
> ServicePro: they are the record of what was handed in, and editing them
> would falsify evidence rather than update it.

---

## 1. Do this first

Two migrations are written and **not yet run**. Until they are, the newest
fields silently fail to save.

| # | File | Adds |
|---|---|---|
| 1 | `supabase/project_fields.sql` | Contract date, contract link, payment link, and the `contracted` status |
| 2 | `supabase/client_tax_type.sql` | Whether a client is a persona física or persona moral |

Supabase → SQL Editor → New query → paste the whole file → Run. Each ends with
a verify block that prints what it changed. Both are safe to re-run.

Everything else is live and working.

---

## 2. What this is

A freelance project and invoice tracker aimed at independent contractors in
Mexico. Built across weekly modules for *Negocios Inteligentes y Comercio
Digital* at Ibero CDMX, then extended past the coursework.

Five pages, all server-rendered:

| Route | Auth | What it is |
|---|---|---|
| `/` | **public** | Landing page when signed out, dashboard when signed in. The page branches on the session; the proxy no longer gates it |
| `/core` | required | AI extraction of a project from a client brief |
| `/research` | public | Competitor and benchmark analysis with confidence on every claim |
| `/product` | public | Feature map: 19 built, 6 planned |
| `/pricing` | public | The pricing model the product **plans** to move to. Nothing is charged today |
| `/support` | public | Donation funnel — optional, buys nothing |

`/research`, `/pricing` and `/product` stay public on purpose: a grader
reaches them by link without needing an account.

---

## 3. Stack

Next.js 16.3.1 (App Router, Turbopack) · React 19.2.8 · Tailwind v4 (CSS-first,
no config file) · TypeScript · Supabase Postgres with RLS · Vercel.

**Three dependencies have ever been added:** `@anthropic-ai/sdk`, `zod`,
`@supabase/ssr`. Everything else — icons, tabs, drag ordering, charts — is
hand-written. That constraint has held for six weeks and is worth keeping.

### Environment

```
NEXT_PUBLIC_SUPABASE_URL        the project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   the anon key — public by design, RLS does the work
ANTHROPIC_API_KEY               optional; without it /core uses a heuristic extractor
NEXT_PUBLIC_DONATE_URL          optional; a Stripe Payment Link. Absent = no donate button
```

`ANTHROPIC_API_KEY` must **never** carry a `NEXT_PUBLIC_` prefix. The
`service_role` key must never appear anywhere in this repo or in Vercel.

> **Security note carried forward:** the Anthropic key was pasted into a chat
> during development and lives only in gitignored `.env.local`. **Rotate it
> after grading.**

### Mail

Supabase sends through Brevo SMTP (`smtp-relay.brevo.com:587`). Domain
authentication is verified on `freeflow.website`. Email confirmation is **on**,
by the owner's decision. Before Brevo, Supabase's built-in mailer allowed two
messages an hour for the whole project, which is what blocked sign-up for most
of a day.

---

## 4. Architecture, and the rules behind it

```
app/            routes; every page force-dynamic
  (auth)/       sign-up, sign-in, verify-email, forgot/reset password
  api/          route handlers — every write re-validated server-side
components/     UI; server components unless they need state
lib/            pure logic and data access, all independently testable
  pricing/      the revenue model — pure functions, no I/O
  tax/          withholding arithmetic — pure, cites the law
  prefs/        preferences schema, storage, external store
supabase/       migrations, each idempotent with a verify block
scripts/        the test suites
proxy.ts        session refresh and route gating
```

Rules that have held and should keep holding:

1. **The database is an upgrade, never a requirement.** With no credentials the
   app still builds, deploys, and renders mock data. Every data path falls back
   rather than throwing.
2. **Validate on the server, always.** RLS is the second wall, not the first.
   Every API route re-parses with zod.
3. **Hide, never delete.** Tabs and collapsed reasoning stay in the DOM, so the
   content checks in the Week 2 and 3 evidence keep passing.
4. **A nav item leads somewhere or is visibly disabled.** Held since Week 0.
5. **Pure logic lives in `lib/` and is tested without a browser or a database.**
6. **When a check disagrees with the code, the check is a suspect too.** Four
   occurrences so far; see §8.

---

## 5. Data model

`projects` is the core table. Others: `core_outputs`, `research_records`,
`pricing_scenarios`, `user_prefs`.

Fields worth knowing:

- `invoice_total` nullable — **null means the project bills hourly** and its
  value is `hours_logged × hourly_rate`. One nullable column supports both
  billing models without a second table.
- `is_paid` / `paid_at` move together, enforced by a CHECK. **Only the
  mark-paid route may write them.** `toUpdateRow()` in
  `lib/projects/schema.ts` exists specifically to stop an edit from
  un-paying a project and pulling money back out of the monthly earnings.
- `status` has five values; `contracted` comes before `in_progress`, because
  the validation interviewee's pipeline starts at a signed contract.
- `client_tax_type` nullable — **null is meaningful.** It means "not
  recorded", and withholding treats it as no withholding rather than guessing.

### Getting data out

`GET /api/export/projects` returns every project as CSV, with the retenciones
already worked out — subtotal, IVA, both withholdings, and the net. That file
is the one a freelancer hands a contador.

It reads through `getDashboardData`, the same function the dashboard renders
from, so the file and the screen cannot disagree. One guard matters: that
function falls back to mock data when the database is unreachable, and six
invented projects downloaded as "your projects" is worse than a refusal, so
the export checks `source` and refuses to turn a fallback render into a file.

Project names are user-controlled, so the CSV treats its own output as
untrusted: any cell beginning with `=`, `+`, `-` or `@` is neutralised before
quoting, because a spreadsheet executes those. Eight payloads are tested.

### RLS

Private tables (`projects`, `core_outputs`, `user_prefs`): own rows only, via
`auth.uid()`. Public-read tables (`research_records`, `pricing_scenarios`):
anyone reads, only signed-in users write, and only as themselves.

---

## 6. Tests

`npm test` runs eight suites, 241 assertions, no browser and no database:

| Suite | Count | Guards |
|---|---|---|
| `test:pricing` | 30 | The revenue model — **including that the submitted $32,261 and $3,958 have not moved** |
| `test:filters` | 17 | Research filtering |
| `test:prefs` | 21 | Corrupt preferences repair to defaults rather than crashing |
| `test:projects` | 58 | Project validation, impossible dates, edits never touching payment state |
| `test:progress` | 37 | Pipeline percentages and their ordering |
| `test:withholding` | 27 | Retenciones arithmetic against the canonical worked example |
| `test:support` | 22 | The donate link is https and real, or absent — never a dead or unsafe link |
| `test:csv` | 29 | CSV quoting, UTF-8 BOM, and **formula injection** — project names are user-controlled |

Three of these exist because a test caught something real, not because
coverage was wanted. See §8.

---

## 6a. The funnel

A cold visitor now lands on a page that explains the product before asking for
anything. That was not true until 2026-09-24: the root redirected straight to
a sign-up form whose entire explanation was one sentence, which is the largest
possible leak in a funnel whose goal is to gather users.

```
  /            landing page — what it is, what it is not
  /signup      email and password, no card
  /            dashboard, empty, with one call to action
  /support     optional, never gated, never interrupting
```

The landing page derives its capability counts from `lib/product/features.ts`
rather than stating them, and keeps a section on what is **not** built that
leads with the absence of CFDI issuance. A visitor who signs up expecting that
and finds it missing is a worse outcome than one who never signs up.

## 6b. Money

**FreeFlow is free.** Every feature, for everyone. The pricing model on
`/pricing` is what the product intends to move to later and is published
rather than hidden, because a product that plans to charge and will not say
what or when is asking people to find out the hard way.

Funding in the meantime is an optional donation, via a **Stripe Payment
Link** — a URL created in the Stripe dashboard, held in
`NEXT_PUBLIC_DONATE_URL`. No secret key, no webhook, no card handling in this
codebase, and no fourth dependency. The trade is that the app never learns who
donated, which is fine while nothing is gated on it.

`/support` says out loud what a donation does **not** buy: no features, no
priority, no roadmap influence. That section matters more than the button. A
donation that quietly bought influence would be a subscription wearing a
different word.

---

## 7. Pending work

### Blocked on something external

| Feature | Blocker |
|---|---|
| **CFDI 4.0 issuance via a PAC** | Needs a commercial contract with an authorised PAC — real money, real paperwork |
| **Materialidad evidence** | Depends on CFDI |

**Say this plainly:** every paid tier's central promise is CFDI issuance, and
CFDI issuance does not exist. No amount of further app work closes that gap.

### Buildable now

| Feature | Notes |
|---|---|
| **Multiple seats** | Needs an organisations model, invitations, and an RLS rewrite. The largest remaining piece. Less urgent now that nothing is charged. |
| **Project search and filtering** | The table has neither. Fine at six projects, painful at sixty. `lib/research/filter.ts` is the pattern to copy. |
| **Onboarding** | A new account lands on an empty dashboard with one call to action. It works, but nothing teaches the product. |
| Cross-person project view | Depends on seats |
| Per-person profitability | Depends on seats |
| Withholding on the earnings card | The panel covers unpaid work; the monthly earnings figure is still gross. Changing it would move a number the Week 2 evidence asserts, so it needs a deliberate decision. |

### Open product question

The Week 2 interviewee — the target user — says he has no tracking problem,
and describes in detail a product he *would* buy: a maintained outreach and
CRM harness for freelancers. `docs/extras/VALIDATION_FINDINGS.md` records this
honestly. **Answering it with one more conversation is cheaper than answering
it with another module of building.**

---

## 8. Things that went wrong, and what they taught

Kept because each one is a trap the next person could fall into.

**JavaScript rolls impossible dates over.** `new Date("2026-02-31")` is 3 March
and reports itself valid. The deadline field used that check from the day it
was written, so the form had been silently accepting impossible deadlines and
moving them by up to three days. Dates are now validated by round-tripping
their components. Found by a test written for a *different* field.

**`toRow()` sets `is_paid: false`.** Correct on insert, destructive on update.
Reusing it for edits would have quietly un-paid every edited project.

**Auth after validation leaks the payload shape.** Two save routes validated
the body before checking the session, so a logged-out POST got a 400
enumerating the fields it got wrong. Auth is now the first statement in every
write handler.

**`setState` in an effect is usually the wrong tool.** Lint caught it twice —
once for localStorage, once for reading the URL. Both were external state, and
both became `useSyncExternalStore`.

**Empty is not the same as broken.** `lib/projects.ts` answered zero rows with
six fictional projects. Right while the only way to get zero was a broken
database; a lie on the first screen every new account sees.

**zsh does not word-split unquoted variables.** A rename loop silently did
nothing and reported success. Use `while IFS= read -r`.

**A static route inside a dynamic segment is a production-only bug.**
`/api/projects/export` sat inside `/api/projects/[id]`. Development resolved
the static child and returned 401; production resolved it as an id and
returned 405 from the `[id]` handler. Every local check passed and only users
would have seen it. Caught by testing the deployed URL rather than trusting
the local result. It now lives at `/api/export/projects`, where nothing can
claim it. Related: after moving a route, stale validators in `.next` report
phantom type errors until the directory is cleared.

**A derived number still needs reading.** The landing page said "invoicing
through an authorised PAC is 6 of the planned capabilities". The 6 was
correctly derived from the feature map; the sentence was nonsense, because
CFDI is one of the six. Deriving a value protects it from drifting, not from
being used in a sentence that does not parse.

**`qlmanage` pads non-square SVGs**, and cropping back from the centre removes
the top of the image. Author wireframe canvases square.

**When a check disagrees with the code, the check is a suspect too.** Four
times now: a hand-rounded tampering test refused by a correct guard, two wrong
filter expectations, and the zsh loop above.

---

## 9. Coursework status

Weeks 0–3 are built and deployed. Week 3's packet is written, with the
decision note drafted and both wireframes referenced.

**Outstanding, owner-only:** demo video, eight screenshots, pasting both
wireframe images in, and a final pass on the decision note so it sounds like
him. Week 2 still needs its wireframe insert and a corrected screenshot; Week 1
still needs its video and note.

`docs/ACTION_ITEMS.md` is the live checklist.

---

## 10. Where things are

| Looking for | Go to |
|---|---|
| What to do next, step by step | `docs/ACTION_ITEMS.md` |
| Why the interface looks like this | `docs/extras/UX_CUSTOMIZATION_PLAN.md` |
| What the target user actually said | `docs/extras/VALIDATION_FINDINGS.md` |
| The accounts design | `docs/extras/ACCOUNTS_PLAN.md` |
| Domain and email setup | `docs/extras/DOMAIN_AND_EMAIL_SETUP.md` |
| Week 3 submission | `docs/week3/WEEK3_SUBMISSION_DOCUMENT.md` |
| Feature map, built vs planned | `lib/product/features.ts` |
