# Week 5 Iteration Log: /chat

What changed after testing, in order. Each row of `lib/chat/samples.ts` is a
question that must reach a named rule, and a fix starts as a failing row.

## Iteration 1: coverage pass (2026-11-04)

**Why:** the owner asked for rules across every section, so that most questions
get answered and only the rest become tickets.

**How it was tested:** real questions were added as samples first and watched
fail. Then rounds of questions held out from the rule-writing were run against
the engine, to measure the rules on phrasing they hadn't seen.

| Measure | Before | After |
|---|---|---|
| Content rules | 27 | 152 |
| Sample questions | 60 | 374 |
| Chat test assertions | 197 | 730 |

**Wrong answers this found in the live bot, now corrected:**

| Question | What the bot said | What is true | Change |
|---|---|---|---|
| "brief extraction got the client wrong" | Correct the fields before you save | Fields on the Core result can't be edited | Re-extract with clearer text, or add the project by hand |
| "I forgot my password" | Use the reset link, linked in the answer | `proxy.ts` sends signed-in users away from `/forgot-password`, and only signed-in users can open `/chat` | Sign out first; link removed |
| Pasting a secret (guard-secret) | Same reset link | Same redirect | Says to sign out first; link removed |
| "the date it picked is wrong" | Correct it before saving | Same: not editable | Write the date out and extract again |
| "how do I delete a project" | "Open the project" | The button is Edit on the row, then Delete project, then Yes, delete | Real button names |
| "where do I set my tax regime" | Refused as tax advice | It asks where a field is | Guard narrowed; choosing a regime is still refused |

**Independent fact-check:** a separate reviewer then read all 152 answers against
the code and confirmed 24 problems. Almost every fix got a failing test first. The
most damaging were pricing phrases catching questions about the user's own money
("how much have I been paid" got "FreeFlow is free"), and a claim that the CSV
always has tax columns. Others included links that signed-in users can't open,
an overstatement of what the dashboard shows as money reaching the bank, and a
claim that only the user can see their saved data, when the owner can too.

**How the engine changed:**

- A question in the wrong section can still reach its rule, if the evidence is
  strong (`OUT_OF_SCOPE_MIN`).
- Distinctive words such as "churn" can answer alone, but only inside the
  section the user chose (`strong`).
- A whole message of "hi" or "thanks" gets a reply, and never fires inside a
  longer sentence (`exact`).
- Troubleshooting and per-section overviews only answer when nothing specific
  did (`generic`), and they always offer a ticket.
- Common questions in Spanish are understood. Answers stay in English.

**Measured coverage:** on a last set of 50 questions never used to write or tune
the rules, 26 got an answer and 24 got the honest no-answer with a ticket. About
5 of the 26 missed the point. Two of those were fixed; the rest wait for real
questions. Rules only recognise wording someone has anticipated, so this is the
known cost of choosing rules over a model.

**Deliberately unchanged:** questions with no rule still get an honest "I don't
have an answer for that yet" and a ticket. Off-topic and legal questions such
as "my client threatened a lawsuit" stay unanswered.

## Iteration 2 onward: training sessions with the owner

*Not run yet. Each session adds: what was asked, what the bot said, what it
should say, the change made.*
