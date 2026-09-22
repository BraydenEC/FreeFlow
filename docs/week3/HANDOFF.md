# 🤝 Handoff — end of Week 3, ready for Week 4

**Last updated:** 2026-09-19
**Project root:** `/Users/braydencredeur/Antigravity/Website/Dev/servicepro`
**Live:** `/` · `/core` · `/research` · `/product` · `/pricing` — all HTTP 200

---

## TL;DR

**All Week 3 engineering is complete and deployed.** Both required pages live, all seven required
features built, 27 pricing assertions passing, and the save route verified in production.

**One thing outstanding, not doable by an agent:** demo video, Human Decision Note,
screenshots, PDF assembly.

**The migration was run on 2026-09-21 and the save round trip is verified end to end** — two
scenarios persisted, both recompute identically from their stored inputs, and the database
constraint rejected a direct mismatched insert.

```bash
cd /Users/braydencredeur/Antigravity/Website/Dev/servicepro
npm run dev            # → http://localhost:3000/pricing
npm run test:pricing   # 27 assertions
npm run test:filters   # 17 assertions, from Week 2
```

---

## What Week 3 built

| Required feature | Where |
|---|---|
| Product feature map | `lib/product/features.ts` — 18 features, 12 built, 6 planned |
| 3 pricing tiers | `lib/pricing/tiers.ts`, anchored to Week 2 research |
| 2 customer segments | `SegmentPanel.tsx` — plus one explicitly excluded |
| Revenue calculator | `PricingCalculator.tsx` — Client Component |
| Scenario toggle | Three presets, conservative encodes the validation conversation |
| Assumptions table | `AssumptionsTable.tsx`, reusing the Week 2 `SourceBadge` |
| Saved scenarios | `pricing_scenarios` + recomputation on render |

**The headline:** conservative = **$3,958 ARR, 12% of base and declining**, versus base at
$32,261. That is the model working as designed rather than a problem.

---

## Principles now established across four weeks

Each earned by a specific failure. Do not relax them.

| Principle | Where it came from |
|---|---|
| **A deploy is not a configuration** | Weeks 0 and 1 both served the wrong code path while looking perfect |
| **Every code path names itself** | `data-source`, `extractor`, `confidence` |
| **A plausible number is not a fact** | Week 2. Cite it, date it, or mark it unverified |
| **A number you chose the inputs for is not a forecast** | Week 3. State the assumptions and make the pessimistic case hurt |
| **Instruction is not enforcement** | The prompt forbids inventing URLs; the code discards them anyway |
| **Do not trust your own client** | The save route recomputes rather than storing what arrives |
| **When a check disagrees with the code, the check is a suspect** | Three instances now: zsh splitting, two filter expectations, hand-rounded save figures |
| **Ship early** | Four weeks, four early deploys, no last-hour scrambles |
| **Audit prompts beat build prompts** | Every serious defect was found by asking "is this actually done" |
| **Zero new dependencies unless earned** | Four weeks, one package total |

---

## Architecture as it stands

```
app/
  page.tsx            Dashboard — metrics, projects, research widget, core preview
  core/page.tsx       Week 1 — brief → structured project
  research/page.tsx   Week 2 — evidence, competitors, risk map
  product/page.tsx    Week 3 — feature map
  pricing/page.tsx    Week 3 — tiers, segments, simulator, assumptions
  api/{core,research,pricing}/...
lib/
  supabase.ts         Null-safe client — returns null, never throws
  core/ research/     Weeks 1 and 2 modules
  product/features.ts Week 3 feature map
  pricing/
    model.ts          PURE — no React, no I/O. Five consumers, one implementation
    tiers.ts scenarios.ts saved.ts
components/
  research/CompetitorTable.tsx   Client Component (Week 2)
  pricing/PricingCalculator.tsx  Client Component (Week 3)
scripts/
  test-pricing.ts test-filters.ts alias-loader.mjs md2html.py
supabase/
  schema.sql core_outputs.sql research_records.sql pricing_scenarios.sql
```

**Four tables, five pages, one design language.** Each week reuses the previous week's patterns —
the null-safe client from Week 0, the extractor-with-fallback from Week 1, the confidence badge
from Week 2 — rather than inventing new ones.

---

## ⚠️ Known state and gotchas

- **`pricing_scenarios` is live** with two saved rows. Both recompute identically on render.
- **The save route returns 409, not 400, on a figure mismatch.** That is correct — it means the
  request was well-formed but its arithmetic disagreed with the server's.
- **Exact figures matter when testing the save route by hand.** The model produces $2,688.40, not
  $2,688. Hand-rounding will be refused, and that is the guard working.
- **`qlmanage` is the only SVG renderer on this machine** and always crops to a square. Wireframe
  SVGs are authored on a square canvas with the artwork centred so nothing is lost.
- **zsh does not word-split unquoted expansions.** Use `while IFS= read -r` in shell loops.
- **The editor is a second writer.** A stale buffer silently reverted a submission document during
  Week 2. Stage explicit paths rather than `git add -A` when a file is open elsewhere.

---

## For Week 4

1. **Gate 1 first.** Write and commit the Build Discipline Packet before any code. It has found
   real contradictions four weeks running.
2. **Deploy at roughly one third.** As soon as the required page renders anything.
3. **Reuse, do not reinvent.** `getSupabaseClient()` is null-safe, `SourceBadge` generalises to
   any uncertainty, the extractor pattern generalises to any structured output, and
   `scripts/alias-loader.mjs` lets plain `node` run tests against real application code.
4. **Ask what this week's characteristic failure is** before building. It has been different every
   week, and naming it in advance has shaped the design each time.

---

## Outstanding for Brayden

| Item | Week |
|---|---|
| Demo video · Decision Note · screenshots · PDF | 3 |
| Week 2 submission — wireframe and screenshot 1 corrections | 2 |

Export the Week 3 packet with:

```bash
python3 scripts/md2html.py docs/week3/WEEK3_SUBMISSION_DOCUMENT.md \
  ~/Desktop/ServicePro-Week3-Submission.html "Week 3 Submission"
```

Wireframe PNG is already on the Desktop as `ServicePro-Week3-Wireframe.png`.
