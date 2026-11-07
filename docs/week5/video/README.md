# Week 5 Video: script and setup

**Length:** 2–3 minutes · **Rubric:** "Demo proves the feature works live" (0.5 pts) ·
**Live page:** <https://www.freeflow.website/chat>

## Before you record

- [ ] Run `npm run demo:accounts -- --reset` in your own terminal, then sign in as
      `grader1@freeflow.website` using the new password from `demo-accounts.local.md`.
      Keep that file off screen.
- [ ] Open a private window on `/chat` for the signed-out shot.
- [ ] Open Supabase → Table Editor → `chat_sessions`, scrolled right so `user_email` is
      off screen. Your own email is in that column.
- [ ] Open a terminal in the project folder with `npm run test:chat` typed.
- [ ] Use a made-up password in the demo. Never type a real one.

## Script (about 2:40)

Say it in your own words. Each step is what's on screen, then what to say.

**0:00–0:15 · Private window on `/chat`**
"For Week 5 I built `/chat`, a help desk inside FreeFlow. The page loads for anyone, but
you have to sign in to use it. I chose that to limit the load, so graders get their own
demo accounts."

**0:15–0:40 · Signed in. Tap Something isn't working, then Forecast**
"It starts with three intake questions. The first two are buttons, because people will
use this on a phone. The third one is typed."

Type: `my forecast shows zero for next month`

**0:40–1:05 · The answer. Point at the rule name, tap 👍**
"There's no AI here. It answers from 155 rules I wrote and checked against the app. You
can see which rule answered, so nothing is hidden, and I can rate it."

**1:05–1:35 · Guardrails.** Type `should i be on resico or regimen general`, then
`my password is fakepass123`

"It has guardrails. It won't give tax advice, so it sends you to an accountant. And if you
paste a password, it removes it before it's shown or saved, and tells you not to share one."

**1:35–2:00 · Human checkpoint.** Type `my client threatened a lawsuit`, then Submit ticket

"When it doesn't know, it says so rather than guessing. Then I'm the human checkpoint: the
ticket comes to me with the conversation, and I fix the problem or email the person."

**2:00–2:20 · Supabase, refresh the table**
"Here's that conversation saved: the rules that fired, the rating, the outcome, and the
ticket. The password isn't in it. Each user can only reach their own rows, and they can't
change a ticket once it's filed."

**2:20–2:40 · Terminal, run `npm run test:chat`**
"838 checks pass. Testing also changed the app. Checking answers against the code found 24
wrong ones and real bugs, and the final review found a card number that could get through.
All of those are fixed. The tradeoff is coverage: rules only know the wording someone
expected, and everything else becomes a ticket."

## If something goes wrong

The `/chat` answers run in the browser, so they appear instantly. If the Supabase table
looks out of date, refresh it. Test rows on `grader1` can be left in place.
