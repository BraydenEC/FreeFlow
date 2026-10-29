# `/chat` Help Assistant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/chat`, a guided, rule-based help assistant for signed-in FreeFlow users. It has 3 intake questions, nine guardrails, per-answer ratings, conversation summaries and owner-read tickets stored in Supabase. It also produces the Week 5 course evidence around it.

**Architecture:** A pure engine in `lib/chat/` (types, redaction, rules, matcher, session logic) has no React and no I/O, and is tested by `scripts/test-chat.ts`. A client `ChatWindow` runs the guided flow by calling the engine locally. It sends only the user's own inputs to `POST /api/chat/session`. That route re-runs the same deterministic engine server-side, so the saved transcript, rules fired and outcome are computed rather than trusted, then upserts one `chat_sessions` row under RLS.

**Tech Stack:** Next.js 16.3.8 (App Router), React 19, Tailwind v4, Supabase (RLS), zod (already installed), the existing `node --experimental-strip-types` test runner.

**Spec:** `docs/superpowers/specs/2026-10-28-chat-design.md`. Read it before any task. Its "Decisions the owner made" and "Anti-goals" sections are binding.

## Global Constraints

- Next.js 16.3.8 has breaking changes: read the relevant guide in `node_modules/next/dist/docs/` before writing route or page code (AGENTS.md).
- No new dependencies. `zod` and `@supabase/*` are already present.
- No AI or paid API at runtime: every answer comes from `lib/chat/rules.ts`.
- `/chat` must load for signed-out visitors (an explanation plus a sign-in link to `/login`) and never error.
- Chat is usable at 375px wide (the persona's complaint was "annoying on mobile").
- Brand: monochrome per `docs/week4/BRAND.md`. Status colours are not used for chat chrome.
- Bot identity copy is exactly: `Hi, I'm FreeFlow's automated guide. What do you need help with?`
- Notice copy is exactly: `Conversations are saved so FreeFlow's owner can fix problems. Don't paste passwords or card numbers.`
- Filed copy is exactly: `Filed. The owner reads every ticket and will email you.`
- Planned (not built) features are: CFDI issuance, materialidad evidence, multiple seats, cross-person project view, per-person profitability. Any answer naming one says "not built".
- Pricing facts only from `/pricing`, `/support` and `lib/support.ts`: free while it grows, optional donations.
- The migration never drops `chat_sessions` (`create table if not exists`).
- A user can never set `ticket_status`, and never write to a session that has a ticket. Only the owner, in the Supabase dashboard, sets `resolved`.
- `npm test` (currently 619 assertions, 14 suites) stays green. The new suite is added to it.
- Week 4 docs stay untouched. Week 5 docs live in `docs/week5/`.

## Review Focus

- Ordinary numbers in a message (`$12,500`, `2026-11-03`, `MXN 4,000.00`, a 10-digit phone number) must **not** be redacted. Only card-like 13–19 digit runs, keys and `password: …` phrases are. Test in Task 2.
- Spanish, accented or shouted input (`PRONÓSTICO en cero`, `FORECAST IS WRONG`) must not throw and must not be classed off-topic. It matches when English keywords are present, otherwise it is `no_match`. Test in Task 3.
- An empty, whitespace-only or 5,000-character message: the engine returns `no_match` without throwing, the UI blocks sending empty text, and the API answers 400 for text over 2,000 characters. Tests in Tasks 3 and 5.
- A real question that also contains a card number (`my card 4242 4242 4242 4242 was charged twice`): `guard-secret` wins, and the saved text shows `[removed]`. Test in Task 3.
- Writing again to a session that already has a ticket (double-click on "Submit", or a follow-up after filing) is refused (409 from the route, and the RLS update policy as the backstop) and never changes `ticket_status`. Test in Task 4 (`canWrite`) and verify in Task 5.

---

### Task 1: Week 5 Build Discipline Packet (Gate 1, before any code)

**Files:**
- Create: `docs/week5/PLAN.md`
- Create: `docs/week5/chat-mockup.png` (and its source, `docs/week5/mockup.html`)

**Interfaces:**
- Consumes: the spec, the Week 5 brief text (four PDFs in the owner's course folder `…/Negocios Inteligentes/Module 5/`; extract them with PDFKit, as was done for Week 4), and `docs/week4/PLAN.md` as the format model.
- Produces: the packet that every later doc cites, plus the commit hash that proves the plan was written before the code.

- [ ] **Step 1: Write `docs/week5/PLAN.md`**, in the same structure as `docs/week4/PLAN.md`: what already exists; then Problem, User, Success, UX concept (mockup + implementation note), Scope cut, Product spec with numbered testable acceptance criteria (one per brief feature and coding task, and one per guardrail), Architecture, Tech stack, DevOps, Test plan (3 external user tests + 3 software tests minimum), the coding-agent implementation prompt, and "Actions only Brayden can take" (run the migration, the training sessions, find 3 testers, record the video, rewrite the decision note). Take the scope cuts verbatim from the spec's Non-goals. Use FreeFlow, not ServicePro, and no em dashes in headings (Week 4 style).
- [ ] **Step 2: Build the mockup.** Make `mockup.html` from the guided-chat option A (`.superpowers/brainstorm/*/content/intake-flow.html`, card A only, at 1200px wide), labelling the four zones the course image prompt asks for: user input, AI/agent output, saved results, testing evidence. Render it to `chat-mockup.png` with a WKWebView snapshot (the Week 4 approach; headless Brave hangs on this Mac).
- [ ] **Step 3: Verify no code exists yet:** `git status --short` lists only `docs/week5/`.
- [ ] **Step 4: Commit**

```bash
git add docs/week5/PLAN.md docs/week5/chat-mockup.png docs/week5/mockup.html
git commit -m "Week 5 Gate 1: Build Discipline Packet for /chat, written before any code"
git push
```

---

### Task 2: Chat types, redaction and the test harness

**Files:**
- Create: `lib/chat/types.ts`, `lib/chat/redact.ts`, `scripts/test-chat.ts`
- Modify: `package.json` (add `test:chat`; append `&& npm run test:chat` to `test`)

**Interfaces:**
- Produces (`lib/chat/types.ts`):

```ts
export const CATEGORIES = ["broken", "how_to", "pricing_technical", "feedback"] as const;
export type Category = (typeof CATEGORIES)[number];
export const CATEGORY_LABELS: Record<Category, string>; // "Something isn't working", "How do I use…", "Pricing or technical", "Feedback or complaint"
export const AREAS = ["dashboard", "forecast", "projects", "brief", "research", "pricing", "marketing", "account", "other"] as const;
export type Area = (typeof AREAS)[number];
export const AREA_LABELS: Record<Area, string>; // "Dashboard", "Forecast", "Projects", "Brief extraction", "Research", "Pricing & plans", "Marketing", "Account & settings", "Other"
export type Link = { label: string; href: string };
export type Rule = {
  id: string;                       // kebab-case, unique
  categories: Category[] | "any";
  areas: Area[] | "any";
  keywords: string[];               // single normalised words
  phrases?: string[];               // multi-word normalised phrases, weighted higher
  answer: string;
  links?: Link[];
  followUp?: string;
  offerTicket?: boolean;            // true when the answer can't fully solve it
};
export type GuardRule = { id: `guard-${string}`; triggers: RegExp[]; answer: string; links?: Link[] };
export type ReplyKind = "rule" | "guardrail" | "no_match";
export type EngineReply = { kind: ReplyKind; ruleId: string | null; answer: string; links: Link[]; offerTicket: boolean };
export type Outcome = "answered" | "no_match" | "guardrail" | "ticket";
export type Turn = { role: "user" | "bot"; text: string; ruleId?: string | null; kind?: ReplyKind };
export type Rating = { ruleId: string; up: boolean };
export const MAX_MESSAGE_CHARS = 2000;
```

- Produces (`lib/chat/redact.ts`): `redact(text: string): { text: string; redacted: boolean }`. It replaces each match with `[removed]`.

- [ ] **Step 1: Write the failing tests in `scripts/test-chat.ts`.** Copy the `assert`/`passed`/`failed` harness and the summary footer from `scripts/test-marketing.ts`, then add:

```ts
// R1–R4: redaction
assert("card number removed", redact("card 4242 4242 4242 4242 ok").text === "card [removed] ok");
assert("dashed card removed", redact("4111-1111-1111-1111").redacted === true);
assert("api key removed", redact("my key sk-ant-abc123def456ghi789").text.includes("[removed]"));
assert("password phrase removed", !redact("password: hunter22").text.includes("hunter22"));
// Review Focus: ordinary numbers survive
for (const s of ["$12,500", "2026-11-03", "MXN 4,000.00", "call 5512345678", "project 42 of 120"])
  assert(`ordinary number kept: ${s}`, redact(s).text === s && !redact(s).redacted);
```

- [ ] **Step 2: Add the scripts to `package.json` and run** `npm run test:chat`. Expected: it fails, because `@/lib/chat/redact` does not exist.
- [ ] **Step 3: Implement `types.ts` and `redact.ts`.** Card pattern: 13–19 digits, optionally separated by single spaces or dashes. Key pattern: `sk-` or `pk_`/`sk_` prefixes, plus any unbroken `[A-Za-z0-9_-]` run of 32 or more characters. Password pattern: `password|contraseña|pwd` followed by `:` or `is` and the next token.
- [ ] **Step 4: Run** `npm run test:chat`. Expected: all R tests pass, `0 failed`.
- [ ] **Step 5: Commit**

```bash
git add lib/chat/types.ts lib/chat/redact.ts scripts/test-chat.ts package.json
git commit -m "Chat: types, redaction, and the test suite"
```

---

### Task 3: The engine and the guardrails

**Files:**
- Create: `lib/chat/guards.ts`, `lib/chat/engine.ts`
- Create: `lib/chat/rules.ts` (with exactly one placeholder content rule, `forecast-zero`, filled in properly in Task 4)
- Test: `scripts/test-chat.ts`

**Interfaces:**
- Consumes: Task 2 types and `redact`.
- Produces:
  - `GUARD_RULES: GuardRule[]` in `guards.ts`, with ids exactly `guard-secret`, `guard-tax-advice`, `guard-human`, `guard-other-account`, `guard-account-change`, `guard-off-topic`. Planned features are handled by content rules, not guards.
  - `OFF_TOPIC_TRIGGERS: RegExp[]`, an explicit subject list (weather, sports, jokes, recipes, homework, coding help for other software, "who are you dating", etc.). Never "has no FreeFlow words".
  - `CONTENT_RULES: Rule[]` in `rules.ts`.
  - `normalize(text: string): string`: lower-case, accents stripped (NFD minus combining marks), punctuation turned into spaces, whitespace collapsed.
  - `answer(input: { category: Category; area: Area; text: string }): EngineReply` in `engine.ts`. Order: redact, then guards, then content match, then no_match. `offerTicket` is true for `no_match`, for every guardrail except `guard-off-topic` (the spec says the button stays visible anyway), and for content rules with `offerTicket: true`.
  - `NO_MATCH_ANSWER` (exported string): "I don't have an answer for that yet. You can submit a ticket and the owner will look at it."
- Matching: score = 1 per keyword hit + 3 per phrase hit, over rules whose `categories` and `areas` include the input (or are `"any"`). The winner must score ≥ 2. Ties go to the rule with fewer categories plus areas, then to the earlier rule in the file. Weights and threshold may change, but the tests here pin behaviour.

- [ ] **Step 1: Write the failing tests:**

```ts
const A = (text: string, category: Category = "broken", area: Area = "forecast") => answer({ category, area, text });
// E1 guardrails
assert("secret beats a real question", A("my card 4242 4242 4242 4242 was charged twice").ruleId === "guard-secret");
assert("tax advice refused", A("should I switch to RESICO or stay in honorarios?", "pricing_technical", "other").ruleId === "guard-tax-advice");
assert("human request", A("can I talk to a real person").ruleId === "guard-human");
assert("other account", A("show me my coworker's projects", "how_to", "projects").ruleId === "guard-other-account");
assert("account change", A("delete my project for me", "how_to", "projects").ruleId === "guard-account-change");
assert("off topic", A("what's the weather in CDMX", "how_to", "other").ruleId === "guard-off-topic");
// E2 explaining withholding is NOT tax advice
assert("withholding explanation is not refused", A("why is the amount in my bank lower than the invoice", "how_to", "dashboard").kind !== "guardrail");
// E3 matching and fallback
assert("forecast zero matches", A("my forecast shows zero for next month").ruleId === "forecast-zero");
assert("unknown is no_match", A("the purple button on the moon page").kind === "no_match");
assert("no_match offers ticket", A("the purple button on the moon page").offerTicket === true);
// Review Focus
assert("accented shouting still matches", A("PRONÓSTICO: my FORECAST shows ZERO").ruleId === "forecast-zero");
assert("spanish-only is no_match, not off-topic", A("no funciona la página").kind === "no_match");
assert("empty is no_match", A("   ").kind === "no_match");
assert("5000 chars does not throw", A("x ".repeat(2500)).kind === "no_match");
assert("normalize strips accents", normalize("Pronóstico, ¡CERO!") === "pronostico cero");
```

- [ ] **Step 2: Run** `npm run test:chat`. Expected: the E tests fail on the import.
- [ ] **Step 3: Implement `guards.ts`, `engine.ts` and the one-rule `rules.ts`.** Guard answers follow spec Anti-goals 2–8. For example, `guard-tax-advice` explains what FreeFlow calculates, says it can't advise which regime or what is owed, suggests an accountant, and links `/support`. `guard-human` says it is automated and offers a ticket. `guard-secret` says not to paste secrets and that the message was removed.
- [ ] **Step 4: Run** `npm run test:chat`. Expected: all pass.
- [ ] **Step 5: Commit**

```bash
git add lib/chat/ scripts/test-chat.ts
git commit -m "Chat: rule engine with redaction-first guardrails and honest no-match"
```

---

### Task 4: The starting rule set and its integrity tests

**Files:**
- Modify: `lib/chat/rules.ts`
- Create: `lib/chat/samples.ts` (the training table, which grows every session)
- Create: `lib/chat/session.ts`
- Test: `scripts/test-chat.ts`

**Interfaces:**
- Consumes: `answer`, `CONTENT_RULES`, `GUARD_RULES`, and `FEATURE_GROUPS`/`featureSummary` from `lib/product/features.ts`.
- Produces:
  - `SAMPLES: { text: string; category: Category; area: Area; expect: string }[]` (expect = rule id or `"no_match"`).
  - In `session.ts`:
    - `replay(category: Category, area: Area, userTexts: string[]): Turn[]`, alternating user/bot turns built by `answer`, with user text redacted.
    - `outcomeFor(turns: Turn[], ticketFiled: boolean): Outcome`, with precedence ticket > no_match > guardrail > answered. `guardrail` applies only when no turn was a content `rule`.
    - `needsTranscript(outcome: Outcome, ratings: Rating[]): boolean`, true for ticket, no_match, guardrail, or any `up === false`.
    - `canWrite(existing: { ticket_status: string | null } | null): boolean`, false when a ticket exists.

- [ ] **Step 1: Write the rules.** Add one rule per built feature in `lib/product/features.ts`, plus these ids: `forecast-zero`, `payment-terms`, `record-payment`, `overdue-alert`, `project-create-edit`, `project-delete`, `contract-links`, `brief-wrong-field`, `brief-unsure`, `relative-dates`, `currencies`, `withholding-explained`, `csv-export`, `layout-prefs`, `sign-in`, `password-reset`, `research-page`, `pricing-free`, `pricing-tiers`, `donations`, `data-privacy`, `mobile`, `planned-cfdi`, `planned-studio`, `account-delete`, `marketing-page`. Every answer must be checked against the code it describes (for example `lib/forecast/`, `lib/tax/`, `lib/currency.ts`, `lib/support.ts`, `lib/pricing/tiers.ts`) before it is written. Each is at most 3 short sentences in the brand voice, and links only to real routes. `account-delete` and `planned-*` set `offerTicket: true`.
- [ ] **Step 2: Write `SAMPLES`,** at least 2 per rule, phrased the way a frustrated user would type them, plus 5 `no_match` lines.
- [ ] **Step 3: Write the failing tests:**

```ts
// I1 integrity
const ids = [...CONTENT_RULES, ...GUARD_RULES].map((r) => r.id);
assert("rule ids unique", new Set(ids).size === ids.length);
const routes = collectRoutes("app"); // walk app/**/page.tsx with fs; strip route groups like (auth); add "/chat"
for (const r of [...CONTENT_RULES, ...GUARD_RULES]) for (const l of r.links ?? [])
  assert(`${r.id} links to a real route: ${l.href}`, routes.has(l.href));
const PLANNED_TERMS = [/cfdi/i, /materialidad/i, /\bseats?\b/i, /cross-person/i, /per-person profitability/i];
assert("planned list matches features.ts", featureSummary().planned === 5);
for (const r of CONTENT_RULES) if (PLANNED_TERMS.some((t) => t.test(r.answer)))
  assert(`${r.id} says planned features are not built`, /not built/i.test(r.answer));
for (const r of CONTENT_RULES) assert(`${r.id} has keywords`, r.keywords.length + (r.phrases?.length ?? 0) > 0);
// I2 every sample reaches its rule (the training table)
for (const s of SAMPLES) {
  const got = answer(s).ruleId ?? "no_match";
  assert(`sample → ${s.expect}: "${s.text}"`, got === s.expect, `got ${got}`);
}
// S1 session logic
const t = replay("broken", "forecast", ["my forecast shows zero", "the purple moon button"]);
assert("replay alternates", t.length === 4 && t[1].role === "bot");
assert("no_match outranks answered", outcomeFor(t, false) === "no_match");
assert("ticket outranks all", outcomeFor(t, true) === "ticket");
assert("guardrail-only session", outcomeFor(replay("how_to", "other", ["can I talk to a human"]), false) === "guardrail");
assert("thumbs-down keeps transcript", needsTranscript("answered", [{ ruleId: "forecast-zero", up: false }]));
assert("clean answer keeps summary only", !needsTranscript("answered", [{ ruleId: "forecast-zero", up: true }]));
assert("filed ticket is frozen", canWrite({ ticket_status: "open" }) === false && canWrite({ ticket_status: null }) && canWrite(null));
assert("replay redacts", replay("broken", "other", ["pw: password: abc123"])[0].text.includes("[removed]"));
```

- [ ] **Step 4: Run** `npm run test:chat`. Expected: failures. Iterate on rule keywords (not on the tests or samples) until it passes. A sample that can only pass by weakening another rule gets flagged to the owner in the iteration log instead of being forced.
- [ ] **Step 5: Run the full suite:** `npm test`. Expected: 619 plus the new chat assertions, `0 failed` on every suite.
- [ ] **Step 6: Commit**

```bash
git add lib/chat/ scripts/test-chat.ts
git commit -m "Chat: starting rule set from the feature map, training samples, session logic"
```

---

### Task 5: `chat_sessions` table and `POST /api/chat/session`

**Files:**
- Create: `supabase/chat_sessions.sql`
- Create: `lib/chat/schema.ts`
- Create: `app/api/chat/session/route.ts`
- Test: `scripts/test-chat.ts` (schema bounds)

**Interfaces:**
- Consumes: `replay`, `outcomeFor`, `needsTranscript`, `canWrite`, `redact`, `getServerSupabase`/`getSessionUser` (`lib/supabase/server.ts`), and `rateLimit`/`clientKey` (`lib/ratelimit.ts`).
- Produces:
  - `SessionRequestSchema` (zod) in `schema.ts`: `{ id: uuid, category: enum(CATEGORIES), area: enum(AREAS), messages: string[] (1–40, each 1–MAX_MESSAGE_CHARS), ratings: {ruleId: string ≤ 80, up: boolean}[] (≤ 40), fileTicket: boolean }`.
  - Route responses: `200 { outcome, ticket: boolean }`, `400` (invalid JSON or schema), `401 { error: "Sign in to use help." }`, `409 { error: "This conversation already has a ticket." }`, `429`, `503`, `500 { error: "Could not save the conversation." }` (generic; log the cause server-side).

- [ ] **Step 1: Load the `supabase:supabase-postgres-best-practices` skill, then write `supabase/chat_sessions.sql`.** Use the header and verify-query style of `supabase/marketing_assets.sql`, but with `create table if not exists`, `drop policy if exists` and then `create policy`, and no `drop table`. Columns: `id uuid primary key`, `user_id uuid not null references auth.users(id) on delete cascade`, `user_email text`, `category text not null check (category in (...CATEGORIES))`, `area text not null check (...AREAS)`, `first_message text not null`, `rules_fired text[] not null default '{}'`, `ratings jsonb not null default '[]'`, `outcome text not null check (outcome in ('answered','no_match','guardrail','ticket'))`, `transcript jsonb`, `ticket_status text check (ticket_status in ('open','resolved'))`, `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()`. Add an index on `(user_id, created_at desc)` and a partial index on `(ticket_status) where ticket_status is not null`. Policies (authenticated):

```sql
-- select: own rows
using (user_id = auth.uid())
-- insert: own rows, may only open a ticket, never resolve one
with check (user_id = auth.uid() and (ticket_status is null or ticket_status = 'open'))
-- update: own rows that have no ticket yet; may only open one
using (user_id = auth.uid() and ticket_status is null)
with check (user_id = auth.uid() and (ticket_status is null or ticket_status = 'open'))
-- delete: own rows without a ticket
using (user_id = auth.uid() and ticket_status is null)
```

The verify query expects 4 policies and shows the row count.

- [ ] **Step 2: Write failing schema tests:** a payload with a 2,001-character message fails `SessionRequestSchema.safeParse`; 41 messages fails; a valid payload passes; an extra `ticket_status` key is stripped (use `.strict()` to reject it, then assert the parse fails).
- [ ] **Step 3: Run** `npm run test:chat`. Expected: the schema tests fail.
- [ ] **Step 4: Implement `schema.ts` and the route,** following `app/api/marketing/save/route.ts`: rate limit first (`clientKey(request, "chat")`, `limit: 30, windowMs: 60_000`), then 503 if there is no database, then auth (401) **before reading the body**, then JSON and schema. Then `turns = replay(category, area, messages)`, `outcome = outcomeFor(turns, fileTicket)`, keeping only ratings whose `ruleId` appears in `turns`. Read the existing row by `id` and `user_id`: if `!canWrite(existing)`, return 409. Upsert `{ id, user_id: user.id, user_email: user.email, category, area, first_message: turns[0].text, rules_fired, ratings, outcome, transcript: needsTranscript(...) ? turns : null, ticket_status: fileTicket ? "open" : null, updated_at: now }`. Never read `ticket_status` from the body.
- [ ] **Step 5: Run** `npm run test:chat && npm run lint`. Expected: pass and clean.
- [ ] **Step 6: Commit**

```bash
git add supabase/chat_sessions.sql lib/chat/schema.ts app/api/chat/session/route.ts scripts/test-chat.ts
git commit -m "Chat: chat_sessions table (never dropped, tickets frozen by RLS) and the session route"
```

- [ ] **Step 7: Owner action.** Ask Brayden to run `supabase/chat_sessions.sql` in the Supabase SQL Editor and paste the verify output (expect `policy_count = 4`). Do not continue to live verification until he has.

---

### Task 6: The `/chat` page, the guided flow and the Help link

**Files:**
- Create: `app/chat/page.tsx`, `components/chat/ChatWindow.tsx`
- Modify: `lib/nav.tsx` (add `{ label: "Help", href: "/chat", icon: <speech-bubble svg using iconProps> }` after Support)

**Interfaces:**
- Consumes: `answer`, `CATEGORY_LABELS`, `AREA_LABELS`, `redact`, `MAX_MESSAGE_CHARS`, and the route from Task 5.
- Produces: `ChatWindow({ userEmail }: { userEmail: string })`, a client component.

- [ ] **Step 1: Write `app/chat/page.tsx`** (server, `dynamic = "force-dynamic"`, metadata title `Help — FreeFlow`). Get the user via `getServerSupabase` and `getSessionUser`. Signed out: a short explanation that help is for FreeFlow users, plus a "Sign in" link to `/login` (and "Create an account" to `/signup`). Signed in: `<ChatWindow userEmail={user.email ?? ""} />`. Use the `SubNav` page shell as `app/marketing/page.tsx` does.
- [ ] **Step 2: Write `ChatWindow`.**
  - States: `category` → `area` → `describe` → `chat` → `ticket-preview` → `filed`.
  - Messages render as bubbles in the option-A style. Each bot answer shows `Answer from rule: <ruleId>` and 👍/👎. A rating is set once per answer and can be changed.
  - "Still stuck? Submit a ticket" is visible after the first answer, and also inline when `offerTicket` is true.
  - "Feedback or complaint" goes from `describe` straight to `ticket-preview`.
  - The preview shows the redacted transcript and "Will be sent from <userEmail>".
  - After a 200, show the filed copy and a "Start a new conversation" button (new `crypto.randomUUID()`, state reset).
  - Typed input is disabled while empty and shows a counter near the limit.
  - The notice line is always visible under the input.
  - POST the full session after every bot answer, every rating change, and on ticket submit. A 401 shows "Your session expired. Sign in again." with a link. A 409 or other failure shows a quiet inline error, never a crash.
- [ ] **Step 3: Add the Help nav item.**
- [ ] **Step 4: Verify the build:** `npm run lint && npm run build && npm test`. Expected: clean lint, successful build, all suites `0 failed`.
- [ ] **Step 5: Verify locally on desktop and 375px with the `run` skill or `npm run dev`.** Signed out: the page loads with the sign-in note. Signed in: complete one conversation per category, confirm the four intake buttons wrap without horizontal scroll at 375px, and confirm the guardrail and no-match paths show the ticket button.
- [ ] **Step 6: Commit and deploy**

```bash
git add app/chat components/chat lib/nav.tsx
git commit -m "Chat: /chat guided help assistant with ratings and tickets; Help in the nav"
git push
```

- [ ] **Step 7: Verify live** once Vercel shows Ready. `curl -s -o /dev/null -w "%{http_code}" https://www.freeflow.website/chat` returns `200`. A signed-out `curl -X POST https://www.freeflow.website/api/chat/session -d '{}'` returns `401`. A signed-in conversation (Chrome, the owner's session) creates a row in `chat_sessions` with the expected `outcome`. Filing a ticket and then clicking submit again leaves `ticket_status = 'open'` and shows the 409 message.

---

### Task 7: Training sessions with the owner

**Files:**
- Modify: `lib/chat/rules.ts`, `lib/chat/samples.ts`
- Create: `docs/week5/ITERATION_LOG.md`

**Interfaces:**
- Consumes: the live `/chat` and the `chat_sessions` rows (read through the Supabase dashboard in Chrome, or as the owner pastes them).
- Produces: corrected rules, a larger `SAMPLES` table, and iteration-log entries.

- [ ] **Step 1: Run a session.** The owner asks the live bot real questions. For each wrong, vague or untrue answer, agree the right answer in the chat. Record it in `ITERATION_LOG.md` as: what was asked, what the bot said, what it should say, the change made.
- [ ] **Step 2: Add each corrected question to `SAMPLES` first,** then run `npm run test:chat`. Expected: the new sample fails.
- [ ] **Step 3: Fix the rule** (keywords, a new rule, or a new guardrail trigger) until `npm test` passes.
- [ ] **Step 4: Commit and push** (`git commit -m "Chat: training session N — <summary>"`), then verify the answer live.
- [ ] **Step 5: Repeat** until the owner is satisfied. At least one session is required before the submission (the rubric's "at least one improvement made").

---

### Task 8: Week 5 submission packet (everything except the 3 external testers)

**Files:**
- Create: `docs/week5/TEST_EVIDENCE.md`, `docs/week5/PROMPT_LOG.md`, `docs/week5/DECISION_NOTE_DRAFT.md`, `docs/week5/SCREENSHOT_GUIDE.md`, `docs/week5/video/README.md`, `docs/week5/WEEK5_SUBMISSION_DOCUMENT.md` (+ `.html`), `docs/week5/screenshots/`

**Interfaces:**
- Consumes: the Week 4 equivalents as format models, `scripts/md2html.py`, and the screenshot and PDF tooling used for Week 4 (Chrome extension `save_to_disk` zooms, and the WKWebView snapshot and print renderers in the session scratchpad; recreate them if missing).
- Produces: `FreeFlow-Week5-Submission.pdf` in `…/Negocios Inteligentes/Module 5/`.

- [ ] **Step 1: Write the packet,** with the Week 4 section order: required links (live `/chat`, GitHub, a video placeholder), the requirements checklist (8 features, 6 coding tasks), the Build Discipline Packet condensed from `PLAN.md`, evidence table, commits and deployments (count them from the GitHub deployments API), test evidence (raw `npm run test:chat` output plus live checks), iteration log, prompt log (verbatim prompts from this conversation and the build sessions, dated), decision note draft (labelled draft, 150–250 words), and screenshots.
- [ ] **Step 2: Leave a clearly marked "External user tests (3)" section** with an empty table: tester (first name or role), date, what they asked, outcome, rating, `chat_sessions` row id. It gets filled in later.
- [ ] **Step 3: Capture the screenshots** listed in `SCREENSHOT_GUIDE.md`: signed-out page, the three intake steps, a rule answer with the rating, a guardrail answer, no-match with the ticket button, the ticket preview, the filed confirmation, the `chat_sessions` rows and policies in Supabase (the owner signs in), the tests, commits and deployments, and mobile.
- [ ] **Step 4: Build the HTML and PDF.** Captions stay with their images (wrap each caption and image in `break-inside: avoid`, as in the Week 4 print copy). Verify the page count and that no "PASTE" or placeholder text appears outside the external-tests section, then copy the PDF to the Module 5 folder.
- [ ] **Step 5: Commit and push** `docs/week5/`.
