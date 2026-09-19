# 🧪 Week 3 Test Evidence

**Required:** 2 pricing logic tests + 3 software tests.
**Delivered:** 27 executed pricing assertions across 6 groups, plus 4 live production tests.

**Live:** https://servicepro-orpin.vercel.app/product · https://servicepro-orpin.vercel.app/pricing

```bash
npm run test:pricing    # 27 assertions
npm run test:filters    # 17 assertions, carried from Week 2
```

All assertions execute `lib/pricing/model.ts` — the same module the calculator imports, not a
reimplementation. Week 2 established why that distinction matters.

---

## Required pricing logic test 1 — annual billing applies the discount ✅ PASS

**Why.** The flattering error is multiplying a discounted monthly price by twelve, or applying
the discount twice. Both misstate ARR, and forgetting it entirely overstates revenue by the size
of the discount.

```
PASS  $14/mo at 20% off = $134.40/yr          →  134.4
PASS  no discount is plain ×12                 →  168
PASS  a free tier stays free                   →  0
PASS  100% discount is zero                    →  0
PASS  discounted annual is strictly less than monthly × 12
PASS  all-annual MRR reflects the discount     →  11.2
PASS  all-monthly MRR is list price            →  14
PASS  half annual is the midpoint              →  12.6
```

The fifth assertion is stated as an inequality rather than an equality on purpose: if the discount
is ever dropped from the calculation, that test fails loudly rather than a figure quietly
drifting upward.

An all-annual customer contributes **$11.20** to MRR, not $14. Recording list price as MRR would
overstate recurring revenue by 25% at a 20% discount.

---

## Required pricing logic test 2 — churn compounds rather than subtracting ✅ PASS

**Why.** This is the single largest lever in the model and the easiest to get wrong.

```
PASS  100 accounts, 5% monthly, 12 months ≈ 54   →  54.036
PASS  zero churn retains everyone                 →  100
PASS  month zero is the starting base             →  100
PASS  compounded retention differs from naive subtraction
PASS  high churn stays positive rather than going negative
PASS  20% monthly churn leaves ~7 of 100          →  6.872
PASS  5% churn with 5% growth is slightly below flat  →  97.041
PASS  growth above churn grows the base
```

The arithmetic:

| Method | 100 accounts, 5% monthly, 12 months |
|---|---|
| Compounded — `100 × 0.95¹²` | **54** ✅ |
| Subtracted — `100 − (100 × 0.05 × 12)` | 40 ✗ |

At 5% the subtracted figure happens to be *lower*, which makes the error look conservative. It is
still wrong, and at 20% monthly churn subtraction produces **−140 accounts** — a negative
population — while compounding correctly leaves about 7. The test asserts the result stays
positive precisely because the wrong method does not.

`projectAccounts` also compounds churn and growth against each other each month rather than
netting them once at the end.

---

## Software test 3 — degenerate inputs never produce NaN or negative revenue ✅ PASS

Four hostile input sets run through the full model: all zeros, all negatives, absurdly large
values with rates above 1, and all `NaN`.

```
PASS  no NaN and no negative revenue across 4 degenerate inputs
```

Every output — MRR, ARR, ARPU, and all twelve projection months — checked finite and
non-negative. Rates clamp to 0–1 and counts floor at zero, because the inputs come from sliders a
user can drag anywhere.

---

## Software test 4 — the conservative scenario is genuinely worse ✅ PASS

**Why this is a test rather than a design note.** A pessimistic case that is the base reduced by
twenty percent is decoration: it looks like a stress test and proves nothing. So the requirement
is asserted.

```
PASS  conservative ARR < base ARR
PASS  base ARR < optimistic ARR
PASS  conservative is at most half of base ARR
PASS  conservative accounts decline over 12 months
```

**Result:**

| Scenario | ARR | Month 1 → 12 accounts |
|---|---|---|
| Conservative | **$3,958** | **111 → 49** |
| Base | $32,261 | 410 → 544 |
| Optimistic | $112,367 | 1,004 → 3,341 |

Conservative lands at **12% of base and declining**. It encodes what the Week 2 validation
conversation found — freelancers stay on spreadsheets, the interviewee said he would not buy, and
his own hardest problem was acquisition rather than tracking.

---

## Software test 5 — the model is deterministic and reproducible ✅ PASS

```
PASS  same inputs give identical MRR
PASS  same inputs give identical ARR
PASS  ARR is exactly 12 × MRR
PASS  projection has 12 months
```

This underwrites the saved-scenario design: storing inputs alongside outputs is only meaningful if
recomputation is deterministic.

---

## Production test 6 — both required pages load ✅ PASS

```
/            200
/core        200
/research    200
/product     200
/pricing     200
```

`/pricing` renders all five required sections, and the headline figures are computed at render
time rather than written into the prose — the live page reports conservative at **12%** of base,
matching the test suite exactly.

---

## Production test 7 — ⭐ the save route refuses figures it cannot reproduce ✅ PASS

**Why.** The client computes MRR and ARR and then sends them. Storing what arrives would put an
unverifiable number in the database, and this module is specifically about numbers that flatter.

**Method** — POST a scenario with deliberately inflated figures:

```bash
curl -X POST .../api/pricing/save \
  -d '{"inputs":{...base case...},"mrr":999999,"arr":11999988}'
```

**Result: HTTP 409**

```json
{"error":"Submitted figures do not match a server-side recomputation
          of the inputs. Nothing was saved.",
 "expected":{"mrr":2688.4,"arr":32260.8},
 "received":{"mrr":999999,"arr":11999988}}
```

An ARR inflated to $12 million was refused, with both figures named. The server recomputes from
the submitted inputs using the same model and stores its own result, never the client's.

### The test also caught a mistake in the test

The first attempt used hand-rounded figures — `2688` and `32256` — and was **also** refused,
because the model produces `2688.40` and `32260.80`. The guard was working; my arithmetic was
not. Re-running with values taken from the model passed the check and proceeded to the database.

**This is the third time in this project that the harness was wrong and the code was right**,
after the zsh word-splitting failure and the two incorrect filter expectations in Week 2. The
pattern is now established enough to state as a rule: when a check disagrees with the code, the
check is a suspect too.

---

## Production test 8 — save degrades honestly without the table ⏳ PARTIAL

With correct figures, the request passes recomputation and reaches the database:

```
HTTP 500
{"error":"Could not save: Could not find the table 'public.pricing_scenarios'
          in the schema cache"}
```

Correct behaviour — the error names the exact missing object rather than failing vaguely. **The
migration has not yet been run**, so the end-to-end round trip is unverified. Everything up to
the insert is confirmed.

---

## Outstanding

| Item | Status |
|---|---|
| `pricing_scenarios` migration | 🔴 Not run — blocks the save round trip |
| Saved-scenario recomputation display | Built, untested against real rows |
| Demo video · Decision Note · screenshots | User |
