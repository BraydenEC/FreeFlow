# Week 3 Video Script (about 2:30)

Talking points, not a teleprompter. Say them in your own words. *Italics* are
what to do on screen. Facts and figures are in [`README.md`](README.md).

---

### 0:00–0:20 · Intro
*On <https://www.freeflow.website/product>*

> "Week 3 was about turning FreeFlow into an actual product: what it does, what
> it costs, and whether the business works. I built two pages: a product
> feature map and a pricing simulator."

### 0:20–0:45 · Feature map
*Scroll the feature map.*

> "This is every capability FreeFlow has, which tier it belongs to, and whether
> it actually exists. Built features link to where they run. Planned ones are
> kept separate, because mixing plans with shipped code makes a product look
> bigger than it is."

### 0:45–1:10 · Tiers and segments
*Go to `/pricing` → **Tiers & segments** tab.*

> "Three tiers. Solo is free, because Harvest is free and a paid entry tier
> loses to it. Pro and Studio are priced against competitors I verified in
> Week 2. I target two segments: hourly freelancers in Mexico, and small
> studios. And I excluded one on purpose: the freelancer I interviewed sells
> one-time installs, so a subscription doesn't fit him. The page says so, in
> his words."

### 1:10–1:50 · Simulator (the key moment)
*Open the **Simulator** tab. Change an input and let ARR move.*

> "This is the revenue calculator. On the base case the model reaches about
> $32,000 a year. But a simulator lets you pick inputs that make anything look
> good, so the conservative case uses what my interview actually found."

*Click **Conservative**. Pause a second.*

> "It drops to about $4,000, around 12% of base, and it's falling. That's the
> honest result."

### 1:50–2:10 · Assumptions
*Open the **Assumptions** tab.*

> "Every number behind it is listed here with its source and a confidence
> level. Most are marked 'estimated', because a revenue model is mostly guesses
> and the page should say so."

### 2:10–2:35 · Saving and tests
*Open the **Saved** tab.*

> "Scenarios save to the database. The server recalculates the numbers instead
> of trusting what the browser sends, and rejects a mismatch. The pricing math
> has 30 automated tests, including ones that lock these headline numbers so
> they can't quietly change."

### 2:35–2:50 · Optional close

> "Since then FreeFlow has grown: accounts, a cash-flow forecast, and a
> per-project tier for the segment I excluded here."
