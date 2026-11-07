# Week 5 Test Evidence: /chat

**Required:** 3 external user tests + 3 software tests.
**Software tests:** done, 838 assertions in the chat suite. **External user tests:**
not run yet (`EXTERNAL_TESTS.md`). **Last run:** 2026-11-06, on commit `368e105`.

## The required software tests, mapped

| Plan id | What it proves | Evidence | Result |
|---|---|---|---|
| **SW 1** | Redaction removes cards, keys and passwords, and keeps ordinary amounts, dates, phone numbers and project ids | `npm run test:chat` | ✅ PASS |
| **SW 2** | Each guardrail fires on its triggers and doesn't take over real product questions | `npm run test:chat` | ✅ PASS |
| **SW 3** | 433 written questions each reach their expected rule; an unknown question gets an honest no-answer and a ticket offer | `npm run test:chat` | ✅ PASS |
| **SW 4** | Outcome and storage are computed correctly, a filed ticket is frozen, and a later answer doesn't erase a guardrail transcript | `npm run test:chat` | ✅ PASS |
| **SW 5** | Save payloads are bounded and can't carry `ticket_status`; every link in an answer goes to a real route | `npm run test:chat` | ✅ PASS |

The tests import the same `lib/chat/` code the page runs. There is no copy of the
logic in the test file.

**Whole project:** `npm test` exits 0: 17 suites, **1,572 assertions, 0 failed**. On
the same commit, `npm run lint`, `next build` and `tsc --noEmit` also exit 0.

## Automated suite: sample of the raw output

```
$ npm run test:chat

  PASS  card number removed
  PASS  dashed card removed
  PASS  api key removed
  PASS  password phrase removed
  PASS  ordinary number kept: $12,500
  PASS  ordinary number kept: 2026-11-03
  PASS  not a secret: Invoice 1001 1002 1003 1004
  PASS  not a secret: The password is required
  PASS  tax advice refused
  PASS  human request
  PASS  other account
  PASS  account change
  PASS  off topic
  PASS  no_match offers ticket
  PASS  card beside other digits removed: 4242 4242 4242 4242 123
  PASS  a complaint is not a secret: my password is broken
  PASS  not off-topic: How do I add a WordPress project?
  PASS  still refused as tax advice: how much tax do i owe
  PASS  a later answer doesn't erase the transcript of a guardrail hit
  PASS  filed ticket is frozen
────────────────────────────────────────────────────────────────
  838 passed, 0 failed
```

*Selected lines from the 838. Run the command for the full list.*

## Production checks (2026-11-06, on `368e105`)

| # | Check | How | Result |
|---|---|---|---|
| P1 | `/chat` loads signed out | `curl` | ✅ 200, sign-in prompt |
| P2 | Save refused signed out | `curl -X POST …/api/chat/session` | ✅ 401 `Sign in to use help.` |
| P3 | Auth is checked before validation | Same, with an invalid payload | ✅ 401, not 400, so the payload shape isn't revealed |
| P4 | Three intake questions in order | `grader3` demo account | ✅ Screenshots 2–3 |
| P5 | Answer shows its rule and can be rated | "my forecast shows zero for next month" | ✅ `forecast-zero`; 👍 saved in `ratings` |
| P6 | Guardrail | "should i be on resico or regimen general" | ✅ `guard-tax-advice`, points to an accountant |
| P7 | Fake password redacted | "my password is fakepass123" | ✅ Displayed as `[removed]`, `guard-secret` |
| P8 | Honest no-answer | "my client threatened a lawsuit" | ✅ "No rule matched", with the ticket offered |
| P9 | Ticket filed | Submit ticket | ✅ Exact "Filed" copy; row has `outcome: ticket`, `ticket_status: open` |
| P10 | **A filed ticket is frozen** | POST to the same conversation id | ✅ 409 `This conversation already has a ticket.` |
| P11 | Card with CVV redacted, after the fix | "card 4242 4242 4242 4242 123 was charged twice" (a public test number) | ✅ Stored as `card [removed] 123 was charged twice` |
| P12 | Secrets not stored | Read the rows and transcripts shown in the table editor | ✅ Neither the fake password nor the test card appears |
| P13 | Guardrail transcript kept, after the fix | Same conversation as P11, followed by an answered question | ✅ `outcome: answered` with the transcript still present |
| P14 | No sideways scroll on a phone | `/chat` in a same-origin 375px iframe, before and after intake | ✅ `scrollWidth` 375 of 375 |

An iframe checks the layout, not a real phone. Test conversations were written by
Claude on the `grader3` demo account, with the owner's approval.

## Other testing, which is not external testing

- **Persona tests** (`PERSONA_TESTS.md`): 25 questions from three freelancers written
  by Claude, run through the real engine. 12 good, 2 weak, 2 wrong, 9 no answer on the
  first run. All the wrong, weak and no-answer rows were then fixed.
- **Live walkthrough** (`ITERATION_LOG.md`, Iteration 4): three scenarios run by Claude
  on the demo accounts, which found the app bugs fixed in that iteration.
- **Coverage measure** (`ITERATION_LOG.md`, Iteration 1): of 50 questions never used to
  write the rules, 26 got an answer, and about 5 of those missed the point.

## Acceptance criteria: final status

| # | Criterion | Result |
|---|---|---|
| A1 | `/chat` page | ✅ 200 signed out and signed in |
| A2 | Chat UI usable at 375px with no sideways scroll | ✅ P14 |
| A3 | 3 intake questions in order | ✅ P4 |
| A4 | Answers name their rule; unknown questions get an honest no-answer | ✅ P5, P8, SW 3 |
| A5 | Each guardrail fires | ✅ SW 2, P6, P7 |
| A6 | Human checkpoint | ✅ P9 |
| A7 | Storage: a summary always, the transcript when it matters | ✅ P9, P13 |
| A8 | Rating saved with the rule id | ✅ P5 |
| A9 | A filed ticket can't be changed | ✅ P10, plus RLS on the table |
| A10 | Secrets replaced with `[removed]` | ✅ SW 1, P7, P11, P12 |
| A11 | Summary row records category, area, rules, ratings, outcome | ✅ Screenshot 9 |
| A12 | 3 external user tests | ⏳ **Not run yet** |

**11 of 12 met.** A12 is waiting on real testers.
