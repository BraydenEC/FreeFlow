# 🧠 Week 3 — Human Decision Note material

**Requirement:** 150–250 words on decisions, rejections, corrections, and tradeoffs.
**Write it yourself.** This is source material, not a draft to paste.

---

## ⭐ The strongest angle: building a tool designed to resist you

A pricing simulator is a machine for producing encouraging numbers. You pick the assumptions, so
the output is whatever you already believed. The scenario toggle the assignment requires makes it
worse rather than better — a pessimistic case that is not genuinely pessimistic looks like a
stress test while proving nothing.

**The decision:** three structural defences, chosen before any code.

1. Every assumption is a table row with a confidence level. **Six of nine read `estimated`.**
2. Every price anchors to a competitor figure fetched and dated in Week 2, not invented.
3. The conservative scenario encodes the validation conversation rather than being the base case
   reduced — it lands at **12% of base, and declining**.

## The rejection worth naming

**The excluded segment has no toggle.** The obvious convenience is a checkbox to include
fixed-price sellers "just to see" — and that would put a flattering number one click away from a
page built specifically to resist flattering numbers. There is no switch.

Also rejected: the *contador* segment, which is a larger market. Week 2's own research classified
contadores as a **substitute**, so selling to them means selling to the competition. That may be a
good business; it is a bigger claim than a pricing page should make quietly.

## The correction

**The save route distrusts its own client.** The calculator computes MRR in the browser and posts
it; storing what arrives would put an unverifiable number in the database. The server recomputes
from the inputs and refuses any mismatch — verified by submitting an ARR of $12 million, which
came back 409.

**And the tampering test caught an error in the test itself.** The first attempt used
hand-rounded figures and was also refused, because the model produces $2,688.40 rather than
$2,688. The guard was right; my arithmetic was wrong. That is now the **third time** in this
project that the harness was wrong and the code was right.

## The tradeoff

**The numbers are small and the page says so.** Base case is roughly $32,000 ARR. A model tuned
to look impressive was available and would have been entirely undetectable. What was traded away
is the impressiveness; what was bought is a number somebody could argue with.

---

## Writing tips

- The strongest sentence available: *"I built the page to resist the person building it."*
- Name the missing toggle — it is a decision that shows restraint rather than capability.
- The tradeoff has two sides: **arguable, but unimpressive.** Say both.
- 150–250 words is two solid paragraphs.
