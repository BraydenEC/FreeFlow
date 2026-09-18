# 🗣 Human Validation Conversation

**Required by the Week 2 assignment: 1 real human validation conversation.**

Responses are recorded **verbatim**, including informal register and profanity. They are not
cleaned up, and that is deliberate: the phrasing is the evidence. Polishing a participant's words
into formal prose makes a transcript read like something the author wrote rather than something
they were told — which, in a module built around distinguishing evidence from fabrication, would
undercut the entire exercise.

---

## Participant

**Person:** *(initials and what they do — fill in)*
**Date:** *(fill in)*
**Format:** messages
**Market:** **Not Mexico.** Sells one-time software installations, invoices through Stripe.

⚠️ **Scope note.** This conversation tests the **general premise** — that project, time, and
invoice data split across tools costs freelancers money and attention. It does **not** test the
CFDI finding, which remains unvalidated by any practitioner. That gap is stated rather than
glossed.

---

## What they actually said

**1. How do you currently keep track of what clients owe you?**

> "I sell 1 time install shit so not a retainer model and it's always priced per job too so I
> haven't had a problem with tracking but if I were to ever try and scale I'd prob need to be more
> diligent"

**2. Walk me through what happens between finishing work and getting paid.**

> "Making sure their employees use the software and the business owner is happy then send them a
> bill. Never been stood up or argued against before because I communicate price thoroughly
> beforehand and I always have a contract signed beforehand and in case I ever need to escalate."

**3. What do you use to invoice? How long does it take you?**

> "stripe"

**4. What is the most annoying part of the admin side?**

> "Getting clients lol, oh and like actually getting office employees to build the new software."

**5. Have you ever tried a tool for this? What happened?**

> "For invoicing or for getting clients? For invoicing like i said stripe and for getting clients
> nah i run cold email (which is hit or miss depending on the niche) and cold sms and when im
> feeling real ballsy ive been known to cold call, and i took one out the Adam chu books and got 2
> clients from walking in to the firm in person (100% success rate so far lol). So nah no type of
> software I just make agents to automate the research for list building and enrichment and for
> sending the sms and emails but I find my best method is when I personally will research firms
> and write my own scripts and call (or walk in person)"

**6. What would have to be true for you to switch to something new?**

> "Idk, I've toyed with the idea of building town personal product for out reach and CRM but tbh
> with a lot of products it's just a degrading asset, the code starts to rot from day 1 of being
> shipped so I'd have to constantly keep updating it and tbh I just think making agent skills and
> lean workflow automations are the best, I've even urged clients to also avoid having me build
> custom software and instead just teach their employees how to use Claude code. What would need
> to be present in an app is really more of like hyper customization, so maybe something more like
> an agent harness optimized for a particular product-service with a clean interface and allows
> users to vibe customize how the harness runs. Like if there was someone dedicated to building
> freelance outreach tracker and management harness and constantly gave updates to it I'd def
> rather use his and just do minor tweaking than build my own from scratch."

**7. Reaction to the product itself.**

> "I'd say pretty much all the info id want to see is there but if any recommendation it'd be that
> there prob a cleaner simpler UI for this app but idk what that would be, I kinda just like to
> see all data laid out on a dashboard which is kinda what u got just its annoying on mobile"

---

## ⭐ What contradicted my assumptions

**Nearly all of it.** This is the most useful possible outcome, and it is worth stating plainly
rather than softening.

### 1. He does not have the problem the product solves

The premise behind Weeks 0–2 is that freelancers lose money because project, time, and invoice
data is fragmented. He answered that he has *"not had a problem with tracking"* — because he
sells one-time installations at a fixed price per job. **No retainer means no hours to
reconcile, and no hourly rate means nothing to compute.** The entire hours × rate model at the
centre of ServicePro is irrelevant to how he bills.

### 2. Getting paid is not painful either

*"Never been stood up or argued against."* He solved it upstream with pricing conversations and a
signed contract, not with software. The Week 0 dashboard's "Unpaid Invoices" metric answers a
question he does not have.

### 3. Invoicing takes one word

*"stripe."* Not a workflow, not a tool chain, not a friction point.

### 4. The real pain is somewhere else entirely

*"Getting clients lol."* Client acquisition, and secondarily change management at the client site
— *"actually getting office employees to build the new software."* Both are upstream of anything
ServicePro touches.

### 5. He rejects the product category, not just the product

*"With a lot of products it's just a degrading asset, the code starts to rot from day 1 of being
shipped."* He has actively advised his own clients **against** commissioning custom software. This
is a more fundamental objection than "I would not use this" — it is "software like this decays,
and I have watched it decay."

---

## 🟢 What survived, and it is the most useful sentence in the conversation

The rejection came with a condition attached:

> "if there was someone dedicated to building freelance outreach tracker and management harness
> and constantly gave updates to it I'd def rather use his and just do minor tweaking than build
> my own from scratch"

He is not against using someone else's tool. He is against using an **unmaintained** one. The
named conditions are:

1. **Someone is dedicated to maintaining it** — the rot problem solved by a person, not a feature
2. **It is customisable by the user** — *"allows users to vibe customize how the harness runs"*
3. **It is narrow** — optimised for a particular product-service, not general purpose

A conditional yes with stated conditions is far more informative than an unconditional yes. This
is the closest thing to a product direction the conversation produced, and it did not come from
agreeing with me.

---

## 🔴 One finding that hits the current build directly

> "its annoying on mobile"

He also said *"pretty much all the info id want to see is there"* and *"I kinda just like to see
all data laid out on a dashboard which is kinda what u got"* — so the information architecture
landed. The mobile experience did not.

This contradicts a claim made in the Week 0 implementation note, where the stacked-card mobile
layout was described as a deliberate improvement over a scrolling table. It may still be better
than a squeezed table and still be annoying. **An acceptance criterion that says "usable at
375px" was satisfied; a user who actually used it at 375px was irritated.** Passing a test is not
the same as being good.

---

## What this changes

**The honest summary: n=1, and that one contradicted the premise.**

1. **The target user is narrower than assumed.** ServicePro's model presumes hourly or retainer
   billing across multiple concurrent clients. Fixed-price, one-time work does not generate the
   fragmentation the product exists to solve. The Build Discipline Packet should say who this is
   *not* for.

2. **The Mexican premise is still untested.** He invoices through Stripe in a market with no CFDI
   requirement. The strongest finding in the research — that Mexican freelancers run two systems
   by legal necessity — was not examined by this conversation, and it is the claim that most needs
   a practitioner's view.

3. **"Getting clients" outranks admin.** For at least one working freelancer, acquisition is the
   pain and invoicing is solved. Worth noting that Week 2's research surveyed invoicing and
   project tools exclusively; it never asked whether that was the category the user cared about.

4. **Maintenance is a feature.** The objection to custom software was decay, not capability. A
   product whose pitch includes *"someone is actively keeping this alive"* answers an objection
   that no feature list addresses.

5. **Mobile needs work.** Concrete, actionable, and from someone who used the thing.

**What it does not change:** one conversation with a freelancer outside the target market and
outside the target billing model does not invalidate the desk research. Alegra still has no
project tracking and Harvest still cannot issue a CFDI. But it does establish that the problem is
not universal among freelancers, which the packet had implicitly assumed.

---

## How this feeds the submission

The single most defensible thing to say in the Human Decision Note is that **the validation
conversation argued against the product and was recorded anyway.** A conversation that agrees with
everything is weak evidence of research; this one demonstrates questions capable of returning an
unwelcome answer, and an unwelcome answer that was written down rather than reframed.
