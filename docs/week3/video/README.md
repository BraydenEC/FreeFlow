# Week 3 Video Prep: what was built

Reference for recording the Week 3 demo video (2–3 min). The script is in
[`SCRIPT.md`](SCRIPT.md).

**Module:** Product Architecture + Pricing Simulator
**Objective:** turn the venture into product tiers, a feature architecture, and
an interactive pricing / revenue simulator.
**Built:** 2026-09-19 to 2026-09-21 · **Packet finalised:** 2026-09-23

---

## Pages to show

| Page | Live URL |
|---|---|
| Feature map | <https://www.freeflow.website/product> |
| Pricing simulator | <https://www.freeflow.website/pricing> |

`/pricing` has five tabs: **Simulator · Tiers & segments · Per-project ·
Assumptions · Saved**.

---

## Requirement → what was built

| Required | What exists | Where to point in the video |
|---|---|---|
| **Two live pages** | `/product` and `/pricing` | Both URLs |
| **Product feature map** | Every capability, its tier, and whether it is built. Built items link to the route where they run; planned items are kept separate | `/product`, scroll the map |
| **3 pricing tiers** | **Solo** free · **Pro** $14/mo · **Studio** $12/seat/mo | *Tiers & segments* tab |
| **2 customer segments** | **A:** hourly / retainer freelancer in Mexico · **B:** small studio (2–5 people) | *Tiers & segments* tab |
| (beyond the brief) | **One segment excluded on purpose:** fixed-price, one-time sellers, with the Week 2 interviewee quoted as the example | *Tiers & segments* tab |
| **Revenue calculator** | Live MRR / ARR as inputs change, no page reload (client-side) | *Simulator* tab |
| **Scenario toggle** | **Conservative · Base · Optimistic** | *Simulator* tab |
| **Assumptions table** | Every input with its source and a confidence badge (verified / reported / estimated) | *Assumptions* tab |
| **Saved scenarios** | Saved to Supabase (`pricing_scenarios`). The server **recalculates** the figures and refuses a mismatch (HTTP 409) rather than trusting the browser | *Saved* tab |
| **2 pricing-logic tests + 3 software tests** | `npm run test:pricing`: 30 assertions, all passing | Mention, or show the terminal |

---

## The numbers to say out loud

| Figure | Value |
|---|---|
| Base case ARR | **$32,261** |
| Conservative case ARR | **$3,958**, about **12% of base, and declining** |
| Solo tier | Free (because Harvest is free; a paid entry tier would lose to it) |
| Pro tier | $14 / month |
| Studio tier | $12 / seat / month |

The two ARR figures are locked by tests, so they will match what is on screen.

---

## The decisions worth mentioning

1. **The conservative case is real, not "base minus 20%".** It encodes the
   Week 2 interview: most freelancers are fine with a spreadsheet, and the
   person interviewed said he would not buy.
2. **Prices are anchored to verified competitors** from Week 2 (Harvest,
   Clockify, Bonsai, Alegra, Facturama), not invented.
3. **The interviewee was excluded from the segments, by name.** He sells
   one-time installs, so a subscription does not fit him. The page says so.
4. **The save route distrusts its own client.** It recomputes MRR and ARR from
   the saved inputs; a hand-rounded or tampered figure is rejected.
5. **The pricing model is pure code** (`lib/pricing/model.ts`, no React), so the
   tests run the real calculation, not a copy.
6. **Zero new dependencies**, the fourth week running at the time.

> The week's lesson, from the plan: *a number you chose the inputs for is not a
> forecast.*

---

## Added after Week 3 (optional to mention)

- **Per-project tab:** a $9 **Project** tier that serves the segment Week 3
  excluded, without moving Week 3's numbers.
- The site has since been renamed **FreeFlow** (it was ServicePro), redesigned
  in monochrome, and given accounts, a cash-flow forecast and CSV export.
- The feature map now shows **27 built, 5 planned**; it was 12 built, 6 planned
  when Week 3 was submitted.

---

## ⚠️ Fix before recording

`/product` has a hardcoded sentence, "The unbuilt six are … CFDI issuance,
materialidad evidence, **withholding** …". Withholding has since shipped and the
live count above it says 5 planned, so the page contradicts itself on screen.
Fix and deploy before recording.

---

## Recording checklist

- [ ] `/product` sentence fixed and deployed
- [ ] Signed in, so the *Saved* tab shows saved scenarios
- [ ] Browser console closed
- [ ] Start on `/product`, finish on `/pricing` → *Saved*
- [ ] Pause a second after clicking **Conservative** (the plan's "best shot")
- [ ] 2–3 minutes total
