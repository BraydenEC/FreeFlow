# `/chat`: FreeFlow's guided help assistant (Week 5)

**Status:** approved by the owner 2026-10-29 · **Date:** 2026-10-28 · **Course:** Week 5, Public Chatbot / Guided Assistant

## Why this exists

People who already use FreeFlow open a chat when something is not working and
they need a fix or a workaround. Less often they want a feature explained, or
have a pricing or technical question. Today FreeFlow has nowhere for them to go,
and no record of what breaks for them.

`/chat` is a help desk for existing users. It guides them to an answer when one
exists, says so plainly when it does not, and turns what it cannot solve into a
ticket the owner fixes personally (by email). The unanswered questions come back
to the owner and the agent, who write new rules from them. Over time the bot gets
better because of what it failed at.

It also meets the Week 5 brief: a chat UI, 3 intake questions, response logic, a
guardrail response, a human checkpoint, chat/test storage, a rating, and 3
external user tests.

## Decisions the owner made

- **Audience:** existing, signed-in users. Signed-out visitors cannot chat (to
  reduce load), but `/chat` must still load for them: it shows a short
  explanation and a sign-in button, never an error or a blank page.
- **Purpose, four jobs:** (1) something isn't working, so fix it or find a
  workaround; (2) how do I use a feature; (3) pricing and technical questions;
  (4) save important conversations: bugs and complaints.
- **No AI at runtime.** A rule-based engine. The rules are designed in
  conversation between the owner and the coding agent, and written into the code
  by the agent. No paid API is called when someone chats.
- **Training loop:** the owner tests the bot with the agent during the build.
  When an answer is wrong, they agree the right answer, the agent updates the
  rule, and that conversation becomes a test.
- **Human checkpoint:** when the bot cannot solve it, the user can submit a
  ticket. The owner reads tickets **in the Supabase table**, fixes the problem,
  emails the user personally, and marks the ticket resolved.
- **Layout: guided chat** (mockup option A). The bot asks each intake question as
  a message. The first two are answered with tap buttons, the third is typed.
- **Guardrails:** all nine below are accepted. More will be added over time.
- **External testers:** found by the owner later. Everything else is built now.

## Goals

1. A signed-in user can get from "something is wrong" to either a correct answer
   or a filed ticket in under a minute.
2. Every answer is traceable to a named rule, shown under the answer.
3. The bot never claims something that isn't true about FreeFlow (see guardrails).
4. Every conversation leaves a summary the owner can read, and the important
   ones leave the full transcript.
5. Adding or fixing a rule is a small, tested edit to one data file.

## Non-goals (this week, recorded as scope cuts in the packet)

- An AI model writing answers.
- Chat for signed-out visitors.
- A private ticket-review page inside FreeFlow (the owner uses Supabase).
- Email notifications to the owner or user (the owner emails by hand).
- Automatic deletion of old conversations.
- Languages other than English (the product is English).

## Anti-goals: the guardrails

The bot must never:

1. Claim a feature exists that isn't built. CFDI issuance, materialidad
   evidence, multiple seats, cross-person view and per-person profitability are
   planned. It says "not built yet" and links `/product`.
2. Say an issue is fixed, or promise a date. The most it says is that it has been
   filed for the owner.
3. Pass itself off as a person. It is labelled an automated guide, and it offers
   a ticket when someone asks for a human.
4. Give tax or legal advice. It may explain how FreeFlow calculates IVA/ISR
   withholding. It must not advise which regime to choose or what someone owes.
   For that, it says to ask an accountant.
5. Invent prices. It only repeats `/pricing` and `/support`: free while it
   grows, with optional donations.
6. Ask for, accept or store passwords, card numbers or API keys. If one is
   pasted, it warns the user and redacts it before anything is saved.
7. Discuss anyone else's account or data.
8. Claim to have changed the user's account ("I deleted your project"). It
   explains how they can do it themselves.
9. Blame the user, or leave a dead end. Every answer that does not solve the
   problem ends by offering a ticket.

Off-topic messages get a one-line, polite statement of what it can help with.
"Off-topic" is decided only by an explicit list of off-topic subjects (for
example weather, general chit-chat, coding help for other software, jokes),
**never** by "contains no FreeFlow words". Anything else the rules miss is a
`no_match`, so real unanswered questions always come back for a new rule. The
ticket button stays visible under an off-topic reply like any other. *(Agent's
call.)*

## How a conversation works

1. Greeting: "Hi, I'm FreeFlow's automated guide. What do you need help with?"
   with four buttons: **Something isn't working · How do I use… · Pricing or
   technical · Feedback or complaint.**
2. "Which part of FreeFlow?" with buttons: **Dashboard · Forecast · Projects ·
   Brief extraction · Research · Pricing & plans · Marketing · Account &
   settings · Other.** For "Pricing or technical" the list is the same; for
   "Feedback or complaint" this step still runs (it labels the ticket).
3. "In a sentence, what happened?" (or "what are you trying to do?" for how-to),
   typed.
4. **Feedback or complaint** skips matching: the bot confirms, shows a preview
   of what will be sent, and files a ticket on the user's confirmation.
5. Otherwise the engine answers. Each bot answer shows the rule's id ("Answer
   from rule: forecast-zero") and a 👍 / 👎.
6. The user can type follow-ups; each one runs through the engine with the same
   category and area.
7. A **"Still stuck? Submit a ticket"** button is always visible after the first
   answer. A 👎 or a no-match answer offers it inline as well.
8. Filing a ticket shows what will be sent (intake answers + transcript,
   redacted) and the email it will be attached to (the account email), then
   confirms: "Filed. The owner reads every ticket and will email you."
9. **Filing a ticket ends that conversation.** One conversation produces at
   most one ticket. The chat offers "Start a new conversation", which creates a
   new session row, so nothing the user does later can change a filed ticket.
   *(Agent's call.)*

A one-line notice sits under the chat from the start: "Conversations are saved
so FreeFlow's owner can fix problems. Don't paste passwords or card numbers."
This keeps the privacy rule truthful under the storage policy the owner chose.
*(Agent's call.)*

## The engine (pure logic, no React, no I/O)

Lives in `lib/chat/`, written in the style of `lib/marketing/`: pure functions,
typed, tested in isolation.

**Order of evaluation for every user message:**

1. **Redact.** Replace anything that looks like a card number (13–19 digits,
   spaces or dashes allowed), an API key (e.g. `sk-…`, long random tokens), or a
   "password: …" phrase with `[removed]`. This step runs on the client before
   display and again on the server before saving.
2. **Guardrails.** If the message matched a redaction pattern, or matches a
   guardrail rule (tax-advice request, asking for a human, another person's
   data, account change request, off-topic), return that guardrail's response.
   Guardrail responses are rules too, with ids prefixed `guard-`.
3. **Match.** Score the content rules that apply to the chosen category and
   area (a rule may list several, or "any") against the normalised text:
   lower-case, accents stripped, and keyword or phrase hits weighted. The
   highest score above a threshold wins. Ties go to the more specific rule
   (fewer categories/areas).
4. **No match.** An honest fallback ("I don't have an answer for that yet")
   that offers a ticket and is recorded as `no_match`, so it comes back for a
   new rule.

**A rule** is data in one file (`lib/chat/rules.ts`): `id`, `categories`,
`areas`, `keywords`/`phrases`, `answer` (short, plain, in the brand voice),
optional `links` (internal routes), optional `followUp` question. Answers are
written from what the code actually does. Where a rule touches a planned
feature, the answer must say it isn't built.

**Starting rule set (the builder drafts these from the code, and the owner
reviews them in the first test session).** At minimum one rule per built
feature in `lib/product/features.ts`, plus known troubles:

- forecast shows zero or too little (deadline/payment terms missing)
- how payment terms change the forecast
- recording a payment, overdue alert behaviour
- creating, editing and deleting a project
- contract and payment links
- brief extraction got a field wrong or "unsure"
- relative dates ("next Friday") resolved wrong
- currencies: which eleven, how conversion is shown
- withholding (IVA/ISR) explained, and why the bank figure differs from the
  invoice
- CSV export
- saved layout preferences
- sign in, password reset
- what research and pricing pages are for
- pricing: free while it grows, donations, what the tiers on `/pricing` mean
- data privacy: who can see my data
- mobile problems (the Week 2 persona's one complaint)
- planned features asked about as if built (CFDI, seats, studio)
- deleting my account (not self-serve, so ticket)

## Storage (Supabase)

One new table, `chat_sessions`, written in the style of `marketing_assets.sql`
(a verify query at the end; run by the owner in the SQL editor). **Unlike that
file, it does not drop the table.** It uses `create table if not exists` and
idempotent policy statements, because these rows are open tickets and grading
evidence, and re-running the file must never delete them. Later schema changes
ship as separate additive migrations. *(Agent's call.)*

Per conversation, always saved (the "test summary"):

- `user_id`, `user_email` (from the session, for the owner's reply)
- `category`, `area`, `first_message` (redacted)
- `rules_fired` (ordered ids), `ratings` (per answer: rule id + up/down)
- `outcome`: `answered`, `no_match`, `guardrail`, `ticket`. The most serious
  one wins (ticket > no_match > guardrail > answered). `guardrail` means a
  guardrail rule answered at least once and nothing content-related matched.
- `created_at`, `updated_at`

Saved only when it matters (`ticket`, any 👎, `no_match` or `guardrail`):

- `transcript` (jsonb, redacted, size-bounded)

For tickets:

- `ticket_status`: `open` or `resolved` (null when not a ticket). The owner
  edits it in the dashboard.

RLS: own rows only, the same four policies as `marketing_assets`. The owner sees
all rows through the dashboard. **The user can never set `ticket_status` or
reopen a filed session.** The API sets `ticket_status = 'open'` only when it
files a ticket, refuses any write to a session that already has a ticket, and
never accepts `ticket_status` from the client. Only the owner, through the
dashboard, changes it to `resolved`. If the API alone can't guarantee this
against direct writes under RLS, a narrower UPDATE policy or a trigger enforces
it in the database. The builder chooses the mechanism; the guarantee is fixed.
*(Agent's call.)*

API: `POST /api/chat/session` creates or updates the user's session row by a
client-generated id. It follows the `marketing/save` pattern: auth checked
before reading the body (401), zod validation with bounded sizes, server-side
redaction, rate limiting via `lib/ratelimit.ts`, and generic error messages
(no database detail returned).

## Page and placement

- `app/chat/page.tsx`, with a client component in `components/chat/`.
- Brand: monochrome per `docs/week4/BRAND.md`. Status colours aren't used for
  chat chrome.
- Works on a phone (the persona's complaint): usable at 375px wide, with tap
  targets that are easy to hit.
- Linked from the top navigation as **Help** (`/chat`). *(Agent's call.)*

## Testing

**Software tests** (`scripts/test-chat.ts`, added as `test:chat` and to
`npm test`), at least 3 required, more expected:

- each sample conversation reaches the expected rule (a table of
  message → rule id, which grows with every training session)
- every guardrail fires on its trigger phrases and only there
- redaction removes card numbers, keys and passwords and leaves ordinary
  numbers (amounts, dates) alone
- an unknown question returns `no_match` with a ticket offer
- rule-set integrity: unique ids, every link is a real route, no answer names a
  planned feature without "not built"

**Owner training sessions:** live testing on the deployed page. Each wrong
answer is recorded in the iteration log with the fix and the new test case.

**3 external user tests:** later, by the owner. Each tester signs up, has one
real conversation, and rates it. Their session rows are the evidence.

## Course deliverables (same structure as Week 4)

- `docs/week5/PLAN.md`: the Build Discipline Packet, **committed before any
  code** (Gate 1), in the macro-prompt's order.
- UX mockup: the "guided chat" screen. Rendered to an image for the packet.
  *(The rubric says "image-generated". The owner may add an AI-generated one.)*
- Submission packet, prompt log, iteration log, test evidence, screenshots,
  decision note draft, video outline, following the Week 4 files and tooling.

## Constraints

- Next.js 16.3.8 with breaking changes: read `node_modules/next/dist/docs/`
  before writing code. React 19, Tailwind v4, Supabase with RLS, deployed by
  Vercel from `main`.
- Near-zero new dependencies. `zod` is already present.
- All existing tests (619) keep passing.

## Left to the builder

The scoring weights and threshold, exact component structure, the session-id
scheme, when in the flow the session row is first written (as long as every
conversation that reaches an answer is recorded), and the wording of individual
answers (reviewed with the owner in testing).
