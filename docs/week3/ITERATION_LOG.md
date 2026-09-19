# 🔁 Week 3 Iteration Log

What changed, and why — in the order the problems appeared.

---

## Planning

### 1. The failure mode was identified before any code

Weeks 0 and 1 failed as correct code against an unconfigured environment, catchable by querying
production. Week 2 risked fabricated research, catchable by checking that every citation
resolves. **Week 3's failure has no automatic check at all:** a pricing simulator is a machine
for producing encouraging numbers, because the author chooses the assumptions.

The required scenario toggle makes it worse rather than better. A pessimistic case that is not
genuinely pessimistic is the most flattering thing you can build — it *looks* like a stress test.

**Change:** three structural defences decided before the first line of code. Every assumption
carries a confidence level; every price anchors to a competitor already verified in Week 2; and
the conservative scenario encodes the validation conversation rather than being the base case
reduced.

### 2. ⭐ The segmentation had to exclude a real person

The Week 2 validation conversation was with a freelancer who sells one-time fixed-price work:

> *"I sell 1 time install shit so not a retainer model"*

He has no recurring workflow to subscribe to. **A per-seat monthly model does not fit him**, and a
revenue model that counted him would be fiction from its first input.

**Change:** he is excluded by name, quoted directly, with the same visual weight on the page as
the two included segments. There is deliberately **no toggle to add him back** — a flattering
number one click away is still a flattering number.

### 3. Segment B chosen as studio rather than contador

A *contador* serving many freelancers is a larger market. But Week 2's own research classified
contadores as a **substitute** — freelancers hire one precisely so they never touch CFDI
themselves.

**Change:** Segment B is a small studio, which is Segment A multiplied. Selling to contadores may
well be a good business; it is a larger strategic claim than a pricing page should make quietly
in week three, and it implies a different data model.

---

## Build

### 4. The pricing model was made pure before the UI existed

Week 2 had to extract a filter predicate mid-week after discovering its acceptance criteria had
been asserted rather than executed.

**Change:** `lib/pricing/model.ts` contains no React and no I/O from its first commit, and the
tests were written alongside it rather than after. A test written afterwards encodes what the
author already believes — Week 2 proved that when two of its expectations turned out wrong while
the code was right.

### 5. ARR defined as a run-rate, not the sum of the projection

Summing twelve months of a *growing* projection and calling it ARR is a common conflation and it
always overstates. A model growing 8% monthly would report roughly 1.6× the honest figure.

**Change:** ARR is twelve times *current* MRR. Stated in a comment, asserted in the tests, and
enforced by a `CHECK` constraint in the database.

### 6. The FX rate was fetched rather than invented

Peso prices need a conversion rate, and a plausible-looking one would have been the exact failure
this module invites.

**Change:** fetched 17.21 MXN/USD on 2026-09-19, recorded with its source in the assumptions
table, and stated on the page as fixed and dated rather than live. A live rate needs an API key
and nobody checks whether it is current anyway.

### 7. An assumption was added specifically to record an absence

Issuing a CFDI costs money per stamp through an authorized PAC. No sourced figure was available.

**Change:** rather than guessing, the assumptions table carries a row stating that PAC cost is
**not modelled** and that every revenue figure is therefore gross rather than net. An omission
stated is different from an omission hidden.

---

## Testing

### 8. The save route was changed to distrust its own client

The calculator computes MRR and ARR in the browser and posts them. Storing what arrives would put
an unverifiable number in the database.

**Change:** the API recomputes the scenario server-side from the submitted inputs and refuses any
request whose figures disagree, returning 409 with both values. Verified against a deliberately
inflated payload: an ARR of $12 million was rejected.

### 9. ⭐ The tampering test caught an error in the test itself

The first save attempt used hand-rounded figures — `2688` and `32256` — and was refused. The
model produces `2688.40` and `32260.80`. **The guard was correct; my arithmetic was not.**

**This is the third time in this project that the harness was wrong and the code was right**,
after Week 2's zsh word-splitting failure and its two incorrect filter expectations. Three
instances is enough to state as a working rule: *when a check disagrees with the code, the check
is a suspect too.*

### 10. Saved scenarios were made into regression tests

Storing only the computed output would leave a number with no provenance.

**Change:** the table stores the full input set as `jsonb` alongside the outputs, and
`SavedScenarios` recomputes every stored row when the page renders, reporting whether it still
matches. If the pricing maths ever changes, the mismatch appears on screen. Every saved scenario
is therefore a regression test that runs whenever somebody looks at the page.

---

## Outstanding

The `pricing_scenarios` migration has not been run against the live database, so the save round
trip and the recomputation display are unverified end to end. Everything up to the insert is
confirmed, and the failure names the missing table precisely.
