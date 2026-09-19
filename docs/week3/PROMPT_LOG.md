# 🤖 Week 3 Coding Agent Prompt Log

**Agent:** Claude Code (Opus 5) · **Requirement:** minimum 5 · **Delivered:** 5

The course specifies a macro-prompt pattern for this module — a disciplined product architect who
refuses to code before the plan is clear, with a ten-part output format. The prompts below follow
that shape in practice rather than being pasted verbatim.

---

## Prompt 1 — Read everything, plan before building
> Read every document attached. Create outline for Module 3 based on documents.

Produced `PLAN.md`. The useful output was not the task list but identifying this week's
characteristic failure: unlike Weeks 0–2, a pricing simulator has **no automatic check**. You
choose the inputs, so the output is whatever you already believed.

It also surfaced that Week 2's validation conversation forces an uncomfortable decision — the
interviewee sells fixed-price one-time work and cannot be a subscriber.

## Prompt 2 — Clarify the segment choice
> I dont what you mean by the small studio or contador serving freelancers

A useful correction. I had used domain jargon without defining it. The two options were explained
concretely — a 3-person studio versus an accountant handling 40 freelancers' filings — along with
why the choice matters: Week 2 classified contadores as a *substitute*, so selling to them means
selling to the competition.

**Studio was chosen**, as the honest extension of what the research already validated.

## Prompt 3 — Gate 1 and build
> go

Build Discipline Packet written in the required ten-part order and committed before any code.
Then the pricing model and its tests together, pure and with no React, so the required
pricing-logic tests execute the real calculation.

## Prompt 4 — Continue to completion
> please continue. when finished build a handoff document for the next session

`/product` feature map, `/pricing` with tiers, segments, calculator, assumptions and persistence,
the migration, the save route with server-side recomputation, and the evidence documents.

## Prompt 5 — *(this session's remaining work)*
Documentation, submission packet, and handoff.

---

## Observation across four weeks

**Prompt 2 is the most interesting entry in this log**, and it contains no instruction at all. It
was the student saying *I don't understand what you just asked me.* The answer forced me to
replace jargon with two concrete examples, and the decision that followed was better informed for
it.

Across four weeks the highest-value prompts have consistently been the ones that interrogate
rather than instruct: *is this actually done* (Weeks 1 and 2), *make sure everything matches the
rubric* (Week 2), and *I don't know what you mean* (Week 3). None of them asked for code. All of
them changed what got built.
