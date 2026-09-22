# Validation interview — full findings

**Source:** the Week 2 validation conversation, seven questions, transcribed
verbatim 2026-09-22. Until now only two sentences of this had been recorded,
both about the UI. The rest is more important than the part that was kept.

**Who this interviewee is:** a working freelancer who installs software for
small firms. One-time projects, priced per job, contract signed up front,
billed on completion through Stripe. Finds clients by cold email, cold SMS,
cold calling, and occasionally walking into offices unannounced.

---

## What he said, and what it means

### 1. Billing — per job, never hourly, never retainer

> "I sell 1 time install shit so not a retainer model and it's always priced
> per job too so I haven't had a problem with tracking but if I were to ever
> try and scale I'd prob need to be more diligent"

Two things. The product's hourly model — `hours_logged × hourly_rate` — is not
how this user prices anything. And the tracking problem the product was built
to solve **is not a problem he currently has.** It becomes one only at scale,
which he is not at.

**Done:** the New Project form now defaults to fixed fee and lists it first.
Hourly stays, because the excluded-segment analysis assumes it exists, but it
is no longer what the form opens on.

### 2. The workflow, and the artifact that is missing

> "Making sure their employees use the software and the business owner is happy
> then send them a bill. Never been stood up or argued against before because I
> communicate price thoroughly beforehand and I always have a contract signed
> beforehand and in case I ever need to escalate."

His pipeline is: **contract signed → install → verify employees actually use it
→ confirm owner is happy → invoice.**

The product models four states: in progress, awaiting review, invoice sent,
overdue. Two mismatches:

- **The pipeline starts too late.** Work begins at "in progress"; his begins at
  a signed contract. That signature is the thing that has kept him from ever
  being stood up, and the product has nowhere to record it.
- **"Awaiting review" is doing two jobs.** For him it means *adoption
  verified and owner satisfied* — two checks, not one.

**Not done.** Both need a database migration; see Proposed below.

### 3. Payments — Stripe

> "stripe"

Invoices go out and come back through Stripe. The product records `is_paid` and
`paid_at` with no way to set either from the interface, and no link to the
Stripe invoice the money actually moved through.

**Not done.** Marking a project paid is the single most common action for an
invoice tracker and there is no button for it. This is a hole, not a feature
request.

### 4. His actual problems are not the ones this product solves

> "Getting clients lol, oh and like actually getting office employees to build
> the new software."

Client acquisition and end-user adoption. Neither is invoice tracking. Read
against answer 1 — *"I haven't had a problem with tracking"* — the honest
conclusion is that **this product addresses a problem this user does not have.**

That is a finding, not a failure. It is the kind of thing validation exists to
surface, and burying it would make the interview decorative.

### 5. Outreach is manual and deliberately so

> "nah i run cold email … and cold sms and when im feeling real ballsy ive been
> known to cold call, and i took one out the Adam chu books and got 2 clients
> from walking in to the firm in person (100% success rate so far lol) … I just
> make agents to automate the research for list building and enrichment … but I
> find my best method is when I personally will research firms and write my own
> scripts and call (or walk in person)"

He automates *research*, not *contact*. The highest-converting channel is the
least automated one. Any product that offered to automate his outreach would be
optimising the part he has deliberately kept human.

He uses **no CRM.** That is the software-shaped hole in his week.

### 6. What he would actually pay for — and why

> "with a lot of products it's just a degrading asset, the code starts to rot
> from day 1 of being shipped so I'd have to constantly keep updating it … What
> would need to be present in an app is really more of like hyper customization,
> so maybe something more like an agent harness optimized for a particular
> product-service with a clean interface and allows users to vibe customize how
> the harness runs. Like if there was someone dedicated to building freelance
> outreach tracker and management harness and constantly gave updates to it I'd
> def rather use his and just do minor tweaking than build my own from scratch."

The most valuable answer in the interview, and it contains a pricing argument
the product's own pricing page had not made.

- **He is not buying features. He is buying maintenance.** His stated reason for
  not building his own is that code rots. What a vendor sells is *being the
  person who keeps it from rotting.*
- **That argues for a subscription**, and it is a better argument than the ones
  currently on `/pricing`, which reason from competitor prices and willingness
  to pay. "You are renting someone to fight entropy for you" is a reason the
  price recurs, not just a number.
- **A tension worth naming:** he sells one-time installs while saying he would
  rather rent something maintained. He is a subscription customer and a
  one-time vendor at once. Worth asking him about directly.
- **"Hyper customization" already shaped the product.** The preferences system,
  density, widget layout and work mode were all built from this sentence.

### 7. The UI — denser than he wants only on a phone

> "pretty much all the info id want to see is there but if any recommendation
> it'd be that there prob a cleaner simpler UI for this app but idk what that
> would be, I kinda just like to see all data laid out on a dashboard which is
> kinda what u got just its annoying on mobile"

The sentence that was acted on was "cleaner simpler UI". The sentence that was
nearly missed is **"I kinda just like to see all data laid out on a dashboard
which is kinda what u got"** — he approves of the density. The complaint is
scoped to mobile.

This matters, because simplifying the desktop dashboard would be *undoing*
something he likes in response to feedback that never asked for it.

**Done:** the phone layout was the fix, not the dashboard. The 64px icon rail is
gone, navigation moved into the top bar as a scroller, and the projects table
becomes cards below `sm`. Density on desktop is unchanged and stays a user
preference.

---

## Decisions taken from this transcript

| # | Decision | Status |
|---|---|---|
| 1 | Fixed fee becomes the default billing model | Done |
| 7 | Fix mobile; do not simplify the desktop dashboard | Done |
| 6 | Customization is a core feature, not a nicety | Done (Week 3 extra) |
| 6 | Maintenance is the thing being sold — add it to the pricing argument | Open |
| 2 | Record the signed contract | Proposed |
| 3 | Mark a project paid from the interface | Proposed |
| 4 | The product does not solve this user's stated problem | Recorded, unresolved |

## Proposed, not built

Each needs a database migration, so none was done unprompted.

1. **Mark as paid** — a control that sets `is_paid` and `paid_at`. No migration
   needed; the columns exist. This is the biggest functional hole in the app.
2. **Contract signed date, and a link to the contract** — two columns on
   `projects`. Directly from answer 2; it is the artifact that de-risks his
   escalation path.
3. **Stripe invoice URL** — one column. Gives "send them a bill" somewhere to
   live and connects a row to the payment that settled it.
4. **A pipeline stage before work starts** — a fifth status. More invasive: a
   CHECK constraint change, plus the progress percentages and their 29 tests.

## The question this raises for the product

The interviewee is the target user, and he says the problem is solved for him
already. He also describes, unprompted and in detail, a product he *would* buy:
a maintained outreach and CRM harness for freelancers.

The honest options are to accept that the current product serves a freelancer
who is worse at tracking than this one, to find out whether that freelancer
exists, or to follow the interview to where it points. Answering that with one
more conversation is cheaper than answering it with another module of building.
