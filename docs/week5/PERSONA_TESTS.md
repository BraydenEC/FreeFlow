# Week 5 persona tests: /chat

Three freelancer personas written by Claude, each with different work and needs.
Their questions were run through the real rule engine (`lib/chat/engine.ts`) on
2026-11-04, so every answer below is what the bot really returns. Nothing was
saved to `chat_sessions`. The verdicts are Claude's judgment.

**Result on 2026-11-04: 25 questions. 12 good, 2 weak, 2 wrong, 9 no answer
(ticket offered).** The 2 wrong answers were fixed on 2026-11-06, and the 2 weak
and 9 no-answer rows on 2026-11-07. Those rows still show what the bot said on
2026-11-04. Each question is now a test row, so see `lib/chat/samples.ts` for what
it reaches today.

These are not the assignment's external user tests. Those are in
`EXTERNAL_TESTS.md`.

## Persona A: graphic designer, Mexico City

Fixed-fee logos and branding for companies. On RESICO. Uses a phone and thinks in Spanish.

| Asked | Bot's rule | Verdict |
|---|---|---|
| como agrego un proyecto nuevo | none, ticket | **No answer.** Should reach `project-create-edit` |
| me pagaron menos de lo que facture, por que | `record-payment` | **Wrong** on 2026-11-04. Fixed 2026-11-06: now `withholding-explained` |
| where do i put that im in resico | `tax-regime` | Good |
| my client is a company, where do i say that | `tax-client-type` | Good |
| should i be on resico or regimen general | `guard-tax-advice` | Good: refused and pointed to an accountant |
| can i make my cfdi here | `planned-cfdi` | Good: says it isn't built |
| the menu on my phone is cut off i cant find settings | `mobile` | **Weak.** `mobile-nav` has the real answer: swipe the bar |
| client pays 50% up front and 50% at the end how do i put that | none, ticket | **No answer.** Should reach `partial-payments` |

## Persona B: freelance web developer, Colombia

Bills by the hour, with US and local clients. Technical. Relies on briefs and the CSV.

| Asked | Bot's rule | Verdict |
|---|---|---|
| how does core work | `brief-how` | Good |
| client said 40 usd an hour but the brief says rate not found | `brief-unsure` | Good |
| i saved the brief where is my project | `brief-saved-where` | Good |
| can i bill one client in usd and another in cop | none, ticket | **No answer.** Should reach `currency-multiple` |
| how do i update my hours each week | none, ticket | **No answer.** Should reach `time-tracking` |
| do you have an api or webhook i can hit | `integrations` | Good |
| how do i export to csv for my accountant | `export-contents` | **Weak.** Describes the file but not how to export it |
| is my clients data encrypted | none, ticket | **No answer.** No rule covers encryption |

## Persona C: wedding photographer, United States

Package prices with deposits. Not technical, and a bit frustrated.

| Asked | Bot's rule | Verdict |
|---|---|---|
| how do i send my client an invoice | `invoice-create` | Good |
| brides pay a deposit when they book then the rest before the wedding | `partial-payments` | Good |
| can it remind me when someone hasnt paid | `reminders` | Good |
| it says i have 0 unpaid but 3 people owe me money | none, ticket | **No answer.** Should reach `dashboard-numbers`: status must be Invoice sent |
| what will i make in june | none, ticket | **No answer.** Should reach `forecast-explained` |
| i put the wrong date on a wedding | `relative-dates` | **Wrong** on 2026-11-04. Fixed 2026-11-06, refined 2026-11-07: now `project-date-fix` |
| am i going to get charged for this later | none, ticket | **No answer.** Should reach `pricing-future` |
| this is too complicated | none, ticket | **No answer.** Should reach `getting-started` or a new rule |
| can i talk to a real person | `guard-human` | Good |

## What this shows

- Plain, specific questions work best. Long sentences about a person's own situation miss most often.
- Two answers were confidently wrong: Spanish "paid less than I invoiced", and "wrong date on a wedding". Both are now fixed.
- `invoice-create` tells a US photographer about CFDI, which doesn't apply to them.
- These rephrased questions passing doesn't mean new wording will: rules only recognise wording someone anticipated.
