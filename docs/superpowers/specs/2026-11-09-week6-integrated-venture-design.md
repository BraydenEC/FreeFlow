# Week 6: FreeFlow as one integrated venture (design)

Date: 2026-11-09 · Status: **approved by the owner 2026-11-09** · Course: Negocios Inteligentes y Comercio Digital, Module 6 ("Integrated Agentic Venture + Impact & Viability")

Source documents: the four PDFs in the owner's `Module 6` course folder (overview, rubric, dropbox assignment, macro-prompts). Course materials are never committed.

## Why this exists

Module 6 asks for the final venture site: integrate every earlier module, and prove it works, creates value and avoids obvious harm. The required live page is `/demo`.

The owner's intent goes further than ticking boxes. A grader or a freelancer who lands on FreeFlow should come away believing two things:

1. **FreeFlow listens to its users** and cares about their time and about building features that actually help them.
2. **Nothing on the site is accidental.** Every part shows thought and intention.

Everything below serves that. When a decision is not covered here, choose the option that makes "built by listening, with intention" more visibly true.

## Decisions the owner made

- `/demo` is **FreeFlow's one landing page and marketing funnel**, built on AIDA (from class) and on the owner's funnel brief. It is not a feature tour bolted onto the app.
- There is **one** landing page. The existing signed-out landing page at `/` (`components/landing/LandingPage.tsx`) is retired; its best pain-point headlines are reused. Signed-out visitors to `/` see the same funnel as `/demo`.
- **Signed-in visitors can still open `/demo`.** Being signed in does not mean someone has used or bought FreeFlow. Signed-in visitors to `/` go to their dashboard.
- The page must be **interactive, flowing, emotive, creative, "not ordinary"; showy but minimal.** References the owner loves: landonorris.com (hover reveals), playfolly.com (a colour choice re-colours the whole site), osmo.supply and thenode.gg (motion that flows).
- The page tells **one continuous story** that builds to a finale, rather than a stack of separate sections.
- A **freelance-themed clicker-style mini game** (original, timed) is the finale. **No leaderboard and no prize yet**: those wait until scores can be protected from cheating.
- **Pricing story:** FreeFlow is free now. The owner's own conviction is a **one-time purchase for full (lifetime) access**, because it is a tool. That came from a friend and user (the **Week 2 interviewee**, `docs/week2/VALIDATION_CONVERSATION.md`: he sells one-time installations and said a subscription does not fit him) who advised starting free, building a user base, then charging once instead of a recurring bill. The monthly tiers on `/pricing` are only a *possible* long-term model. **Never state a price on any new page.**
- **`/pricing` keeps its content** (it answers an earlier module's brief), with two fixes the owner approved so the site does not contradict itself:
  1. A one-line framing banner, e.g. "These tiers are a possible long-term model. The plan for launch is a one-time purchase for full access."
  2. CFDI issuance, which is not built, must not read as included in a tier. Mark it "planned" wherever `lib/pricing/tiers.ts` lists it as a tier feature (around lines 60 and 98). Leave the analysis and segment prose as written.
- **Contact:** the owner's professional email, **braydenemeryc@gmail.com**, is the public contact and feedback address (footer, privacy note, "make it right" promise). The public identity is "Brayden" plus this address.
- **Founder:** first-person story, signed with the owner's first name, **Brayden**. **No photo.** The owner prefers to stay somewhat anonymous.
- **Navigation:** replace the crowded top bar with a **Mac-style Dock**.
- `/dashboard`: the freelancer's own records **plus** a public **"FreeFlow in public"** tab (counts only).
- `/docs`: a **journey stepper** (one line, start → now) at the top, then a **week-by-week timeline**, then the prompt library.
- **Impact check** includes an owner accountability promise with a **"make it right" ladder** (below).
- **V2 roadmap** as specified below, with **visitor upvoting**.
- The owner will recruit the **5 external testers** themselves.
- Area naming: "Money", "Paperwork & tax" (not "legal": FreeFlow does not give legal advice or issue legal invoices yet), "Organization".

## Goals

- Every Module 6 requirement is met and visibly findable (see the requirement map).
- `/demo` loads at submission time for anyone, signed in or out, with no AI key and with the database unreachable.
- A first-time visitor can follow the story start to finish without instructions, on phone and desktop.
- The funnel's two actions are measurable: "Try FreeFlow free" clicks and launch-list sign-ups.
- The site reads as one product: the same features, voice and data reappear across `/demo`, `/dashboard` and `/docs` without contradicting each other.

## Non-goals (scope cuts, recorded in the packet)

- Game leaderboard and the "free lifetime access" prize.
- A private owner analytics view (the owner already sees emails and chats in Supabase).
- A founder photo, and the before/after photo hover.
- Any change to `/pricing` content or to the pricing model beyond the two fixes above.
- Any V2 roadmap item (simpler forecast, CFDI, more countries/languages/currencies, studio accounts, etc.).
- Paid APIs of any kind.

## Anti-goals (would be a failure even if it works)

- **Inventing anything:** testimonials, user counts, ratings, logos, tester quotes, "You said → we changed" entries. Use clearly labelled placeholders until real ones exist. Each proof entry must trace to a real source file in the repo.
- Stating or implying a price.
- Naming a feature on `/demo` that is not built. Planned features appear only on the V2 roadmap.
- Naming the owner's friends anywhere. A friend's words may be quoted only with that friend's permission. Until then, attribute as "a freelancer friend".
- Showing personal data publicly: no emails, names or chat text on any public surface.
- Motion that blocks reading or is inaccessible: everything must work with `prefers-reduced-motion`, with keyboard, and with touch.
- Recreating a specific existing game or website. Take the references as inspiration for *feel*, not as things to copy.

## Requirement map (Module 6 → where it is met)

| Module 6 requires | Met by |
|---|---|
| Required live page `/demo` | `/demo` funnel; loads signed in or out |
| Full navigation | The Dock, on every page |
| `/dashboard` shows records | `/dashboard`: "Your work" (Supabase project rows) + "FreeFlow in public" (live counts from Supabase) |
| `/docs` has prompt library / build logs | `/docs`: journey stepper, week timeline (iterations, tests, decisions), prompt library |
| `/demo` guided walkthrough | Chapter 2 of `/demo`: worries resolved one by one into real features |
| Agent map | Journey stepper: each step names what powers it (Claude with fallback / rules / you approve) |
| 5 total external users | Owner-recruited testers; results in `/docs` testing summary and the packet |
| Practical impact check | `/docs` impact section |
| Version 2 roadmap | `/docs` roadmap with upvotes |
| Testing summary | `/docs` testing section |
| Full-site regression test | Test plan below |
| Integrate all pages | Dock + `/` routing + shared data across `/demo`, `/dashboard`, `/docs` |

## Site structure and routing

- `/demo`: public funnel. Canonical URL for the funnel (set `<link rel="canonical">` so `/` does not count as duplicate content).
- `/` signed out: renders the same funnel component as `/demo` (one component, not a copy).
- `/` signed in: goes to `/dashboard`.
- `/dashboard`: new home of today's signed-in dashboard, plus the public tab. "Your work" requires sign-in. "FreeFlow in public" is visible signed out.
- `/docs`: public.
- Existing pages (`/core`, `/research`, `/product`, `/pricing`, `/marketing`, `/support`, `/chat`, auth pages) keep working. Any internal link or redirect that points at `/` as "the dashboard" (sign-in success, email verification, etc.) must point at `/dashboard`.

## Navigation: the Dock

Validated with the owner as a throwaway prototype (`.superpowers/brainstorm/…/dock-spike.html`).

- **At rest:** one small round button floating bottom-centre, on every page. The current top bar's page links go away.
- **Hover (mouse) or tap (touch):** expands into all pages, grouped, separated by thin dividers:
  1. Demo
  2. Your work: Dashboard, Paste a brief (`/core`), Help desk (`/chat`)
  3. The business: Research, Product, Pricing, Marketing
  4. About: Docs, Support
- **Mac Dock feel:** icons grow as the pointer passes over them, a label appears above the hovered icon, and a dot marks the current page. No magnification on touch.
- Collapses when the pointer leaves (short delay) or on tap outside. Fully keyboard operable, with proper `nav` semantics and labels.
- It must fit at 375 px width with no horizontal page scroll (wrapping, scrolling inside the dock, or a sheet are all acceptable).
- *My call:* sign in / sign out / account stays as a small control in the top-right corner, outside the Dock, so the Dock holds only pages.

## `/demo`: the story funnel

Validated pieces: hero v2 (`hero-v2.html`), game (`game-spike.html`), signature (`story-hover.html`, option C). The owner said the overall story "works for now"; changes can come later.

### Shape

One long scrolling page that tells **one night, from 11:47 pm to morning.** A clock advances as you scroll. The page's mood moves from tense (red-tinged edges) through calm to morning light at the end. A "Try FreeFlow free" button stays reachable throughout (sticky). The sections are chapters of one story, not separate boxes: the worries from chapter 1 *are* the features in chapter 2, which *are* the game upgrades in chapter 5.

### The "I'm a freelance…" picker (Playfolly idea)

At the top, the visitor picks their kind of work. Initial set: designer, photographer, **video editor**, writer, developer. *(My call: video editor added because it is the founder's own trade.)* The choice:

- re-colours the page's accent, with a colour wave spreading from the click point;
- swaps examples throughout the page to that job's world: worries, project names, game projects.

The default is designer. The choice persists for the visit. Accent colours must stay within the brand system (`app/globals.css`; the status colours are the natural candidates) and keep text contrast accessible.

### Chapters

1. **11:47 pm: "it's all in my head." (Attention)** Headline in the founder voice: "I'm a freelance [job], and it's all in my head." Worries for that job pop in over time: "did the deposit land?", "invoice #9 overdue · 12 days", "IVA ???". A counter climbs, the screen edges glow red, and notes shake nervously near the cursor. The visitor drags a worry into a "FreeFlow" panel, or taps it, and it lands as a calm checked row ("Invoice #9 · Overdue · alert on"). After three, the page says "You can't keep up by hand. Nobody can." and offers "Let FreeFlow handle the rest". Everything flies in, the red fades, and the headline becomes "…and now it's all in one place." Reuse the strongest headlines from the retired landing page here, e.g. "You find out you were not paid by remembering."
2. **Midnight: every worry has a place. (Interest, and the guided walkthrough)** As you scroll, worries resolve one at a time into the real feature that answers them, each a numbered step with a one-line benefit and a live sample-data view or screenshot (labelled as sample). Only built features. Starting set, grouped by area:
   - **Money:** "did they pay??" → overdue alert; "can I take December off?" → six-month forecast (scheduled vs likely); payment terms; record a payment; eleven currencies.
   - **Paperwork & tax:** "contract.pdf… where" → contract date and links; "IVA ???" → Mexican withholding (retenciones); CSV export with retenciones worked out; help desk (`/chat`, rules only).
   - **Organization:** "new client email" → paste a brief, get a project (you check it first); project and deadline table; your own private account; a dashboard layout that remembers you.
3. **1 am: quiet. (Story and purpose)** First-person founder story, edited lightly from the owner's own words (supplied 2026-11-09; save his text verbatim as the source in `docs/week6/FOUNDER_STORY_SOURCE.md`, then write the page copy from it and have him approve the final wording). The substance:
   - **The true detail that anchors it:** he worked as a videographer and video editor. The work was very time-consuming and took most of his effort and attention, which made it hard to always remember when his deadlines were and what he could expect to earn afterwards. (That is exactly the deadline table and the forecast, so the story leads straight into the product.)
   - He had to build a website for a class and asked what would have been useful to him: something to make his life, and the lives of his friends and others around him, easier. Having done freelance work, it is something he wishes he had had.
   - Building projects on his own, and doing them for other people, was already difficult and stressful. A helper, like a personal assistant that reduces that friction, is important and meaningful to him.
   - He has been through it, he wants people to know that, and he wants to listen so he can make the best possible app for everyone.
   - What visitors should feel: it serves a real purpose for them, it is made for them and of actual use, it adds surplus value to their workflow, and it may even become a "necessity".

   The mission sentence ("bring ease to freelancers") and the promise to keep listening and improving follow. The story ends unsigned; on hover/tap/scroll into view, **"Brayden" writes itself in handwriting**, followed by a short P.S.
4. **"You said → we changed." (Desire, as proof)** A short log of real changes made because a user, interviewee or tester said something. The first entry is the friend's pricing advice ("start free, charge once later"; source: `docs/week2/VALIDATION_CONVERSATION.md`). **The friend stays unnamed** (owner's decision): "a freelancer friend". A second theme comes from another freelancer friend's note, reported by the owner on 2026-11-09: they would use FreeFlow if it is genuinely updated consistently with new features and fixes, because a tool that makes their workflow easier is genuinely useful. Use it as the message "steady updates, built with your feedback", unnamed. Record the owner's account as a dated source note in `docs/week6/` so it traces to a real file. Other entries come from the iteration logs and the Week 2 interview (e.g. contract tracking). Every entry cites its source file in code comments. No testimonials, counts or logos. Placeholders, clearly labelled, until real ones exist.
5. **Now you try: the game. (Climax)** See the game spec. The upgrades are the features the visitor just met.
6. **8:00 am: morning. (Action)** Primary: "Use FreeFlow free now" (→ sign-up). Secondary, optional: "Get notified when the lifetime version launches" (email). No price.
7. **Footer:** contact and a visible feedback link, both to braydenemeryc@gmail.com (a `mailto:` works signed out, unlike `/chat`, which requires sign-in). Also "If we get it wrong" (links to the impact section in `/docs`), and a short privacy note for the email list. The note says who holds the emails (Brayden, at that address), what they are used for (launch news only), and how to be removed (email that address; every launch email also carries a remove-me link).

### Tone

Friendly, direct, peer-to-peer, calm, low-jargon, personal founder voice. No corporate or legal-heavy language. (Proposed by me; the owner accepted the playback.)

## The game

Validated as `game-spike.html` ("That is really cool"). Working name "Freelance Rush"; final name left to the builder and owner.

- **Timed round, 60 seconds.** Timer starts on first interaction.
- **Do the work:** clicks fill a project's progress. A finished project becomes an invoice. Project names follow the picker's job.
- **Collect invoices:** each ages through fresh → yellow → red (overdue). Click to collect its current value. Overdue invoices lose value.
- **Upgrades are real FreeFlow features**, bought with collected money, each with a one-line "This is real in FreeFlow" link: Paste a brief (more work per click), Overdue alert (warning pulse, slower loss), Contract tracking (overdue invoices keep most of their value), Payment terms (invoices collect themselves on schedule). Balance is left to the builder: it should be winnable, replayable, and reward buying upgrades.
- **Score** = money collected.
- **End screen:** "You collected $X. FreeFlow does the chasing for you." It shows the visitor's personal best (stored only in this browser, which is fine to lose) and the launch-list sign-up and "Try FreeFlow free" actions.
- **No leaderboard, no prize, no score sent to the server.** A "round played" event is recorded for the public count.
- Must be playable by touch and by keyboard, and must pause or behave sensibly when the tab is hidden.

## `/dashboard`

- **Your work (signed in):** today's dashboard (overdue alert, summary cards, project table, forecast, withholding, saved layout) moved from `/` unchanged. Signed out, this tab invites sign-in.
- **FreeFlow in public (everyone):** live counts only, framed honestly as early days: "here's every number". Initial metrics:
  - people using FreeFlow (accounts)
  - people on the launch list
  - things you asked for, shipped (count of "You said → we changed" entries; the same single list as `/demo`)
  - bugs testers found / fixed
  - game rounds played
  - "Try free" clicks from `/demo`
  - V2 votes per roadmap item (or a link to them)
- Small numbers are shown as they are, never padded.
- *My call, on definitions:* "people using FreeFlow" excludes the owner's, grader and test accounts through an explicit, documented exclusion list. "Bugs testers found / fixed" counts **Week 6 external testers only** and comes from a static data file filled in from the real test sessions (not from the persona tests Claude wrote, nor the Week 5 walkthrough).

## `/docs`

In order:

1. **The journey** (validated as `agent-map-v2.html`, "perfect"): one horizontal line with **Start** on the left and **Now** on the right, and seven numbered dots: Dashboard (Week 0), Paste a brief (1), Research (2), Pricing (3), Marketing (4), Help desk (5), One venture (6). One card shows at a time, with "What it was for / What was built / What changed" and one quiet line naming what powers it (e.g. "Agent: Claude, with a fallback · You approve", "Rules, no AI"). Back/Next and clickable dots. No arcs, legends or extra panels. This is the **agent map**. Card text comes from each week's packet and iteration log.
2. **Timeline, week by week:** one card per week with what was built and the decision that mattered; expand for prompts, iterations, tests and the decision.
3. **Prompt library:** all coding prompts, filterable by week.
4. **Testing summary:** Week 6 external tests and the regression results.
5. **Practical impact check** (below).
6. **V2 roadmap** (below).

Friends' names never appear. Content is drawn from `docs/week*/` but written for a reader, not pasted.

## Practical impact check (content)

1. **Does it help?** Evidence only: Week 2 interview findings, tester results, the "things you asked for, shipped" count.
2. **Where could it hurt someone, and what protects against it:**

| Could go wrong | Who is hurt | Protection |
|---|---|---|
| Wrong withholding figure | the user's tax planning | tested rules, the math shown, a "not tax advice" note |
| Paste a brief misreads a deadline or rate | the user and their **client** | user checks before saving; extraction states what it was unsure about |
| Planning on money that is only "likely" | the user's income | scheduled and likely shown separately |
| Help desk wrong answer | the user | rules only, no AI invention |
| Private data exposed | the user and their clients | row-level security per account; owner states plainly that he can read help chats |
| Outage or data loss | deadlines | CSV export; fallbacks keep pages working |

3. **If we get it wrong: the "make it right" ladder** (owner's accountability promise, shown publicly):
   1. **Every problem:** tell affected users quickly and plainly, fix it, and add it to the public "what changed" log.
   2. **It affected their work:** the owner personally helps repair it (e.g. correcting records). If FreeFlow's error caused a problem with *their client*, the owner offers a short note explaining that FreeFlow made the mistake.
   3. **It cost them real money or a client:** free lifetime access when FreeFlow goes paid, given automatically, without asking.

   The page says "we'll make it right". It does **not** promise cash compensation for lost income. Research behind this: Buffer 2013 and GitLab 2017 (transparency), Slack and Google (automatic credits, not cash).
4. **Can it last?** One paragraph: free now, a one-time purchase later, and the costs it must cover.

## V2 roadmap (content)

Each item can be upvoted by visitors (one vote per item per browser is enough; not a security boundary).

- **Next:** a simpler forecast (owner's pick: one plain sentence first, detail underneath); the one-time purchase launch; what Week 6 testers ask for (filled in after testing).
- **Later:** tax and paperwork support beyond Mexico (US, Europe…); more languages (Spanish first); more currencies than today's eleven; legal Mexican e-invoices (CFDI via an authorised provider); a game leaderboard and prize, once scores can be trusted.
- **Someday:** proof of work attached to invoices; studio accounts with several people.

## Data and storage

New Supabase tables, each with a migration in `supabase/` following the existing idempotent-with-verify-block pattern. **The owner runs migrations.** The builder never handles the Supabase secret key.

- **Funnel events:** event type (`try_free_click`, `round_played`, `story_complete`, …), chosen job, anonymous visit id, timestamp. Anonymous insert allowed; no public read.
- **Launch list:** email, consent flag and text version, source, timestamp. Anonymous insert allowed; no public read; duplicate emails handled gracefully.
- **Roadmap votes:** item id, anonymous voter key, timestamp; one vote per item per key.
- **Public counts:** exposed through a narrow read path that returns aggregates only (e.g. a SQL function or view), never rows.
- "You said → we changed" entries and roadmap items are **static data in the repo**, one source each, used by every page that shows them.
- All write endpoints are rate-limited (`lib/ratelimit.ts` exists) and validate input.
- Every page degrades rather than fails when Supabase is unreachable. `/demo` must fully work with no database and no AI key; writes then fail quietly and say so where relevant.

## Constraints

- **Next.js 16 has breaking changes:** read the relevant guide in `node_modules/next/dist/docs/` before writing code. Route protection lives in `proxy.ts`.
- Course: free tools only; Next.js/React + Tailwind + Vercel + GitHub + Supabase. No paid APIs required; simulated or fallback AI output is labelled.
- Brand: black canvas, white ink, grey hairlines, Geist; `app/globals.css` is the single source of truth. Picker accents come from it.
- Responsive (375 px and up, 16 px gutters, no horizontal scroll), accessible (keyboard, screen-reader labels, contrast, `prefers-reduced-motion` gives a calm static version of every animation), and fast. Keep animation libraries small; prefer CSS and small hand-written code.
- Email capture needs a plain consent line and a short privacy note (Mexico's data-protection law expects a privacy notice). The owner should confirm the wording.
- Existing test suites must keep passing (`npm test`, `npm run test:chat`); run `tsc` after build.

## Course deliverables (Module 6)

- **Gate 1, before any product code:** Build Discipline Packet in `docs/week6/`: problem, user, success, UX concept, scope cut, product spec with acceptance criteria, architecture, tech stack, DevOps, test plan, and the exact coding-agent prompt. **The UX mockup is made by Claude** (the owner's request): a designed mockup of `/demo`, plus key frames of the Dock, `/dashboard` and `/docs`, built as HTML from the validated prototypes and rendered to PNG. It is labelled honestly as a Claude-made mockup/wireframe, not as AI-image-generator output (the rubric accepts "mockup or wireframe"). Include the macro-prompt's image prompt in the packet for reference.
- **Gate 2:** at least 5 commits and 2 Vercel deployments; a prompt log with at least 5 coding prompts.
- **Gate 3:** tests documented, at least one bug found in testing fixed, then redeployed. Iteration log.
- **Gate 4:** a **5-minute** demo video and a human decision note (150–250 words, **in the owner's own words**).
- One submission document with the live URL, GitHub link and video link, matching the earlier weeks' format.

## Testing

- **5 external users**, recruited by the owner, each walking through `/demo` → sign-up → dashboard → docs. Record only what really happened. Tester names stay out of the repo.
- **Full-site regression:** all automated suites, plus a live check of every page signed out, signed in, and at phone width, including the Dock on each page.
- **Automated:** game logic (timing, ageing, collection, upgrades, scoring) as pure functions with unit tests; funnel/vote/launch-list endpoints (validation, rate limits, no-DB behaviour); routing (`/` signed in/out, `/demo` signed in); public counts expose no personal data.
- **Acceptance criteria** for each feature are written in the Gate 1 packet before coding.

## Order of work

The owner said the deadline does not change scope, so plan the full design. *My call on order:* requirement-map items first (packet, routing, Dock, `/dashboard`, `/docs`, the funnel's chapters and actions, tables). Then the polish that makes it feel special (game, colour wave, handwriting, scroll-driven mood). Start the tester sessions as soon as `/demo` works end to end, not at the end.

## Left to the builder

- The animation and scroll technique, exact layout, spacing and visual polish, as long as it feels like the validated prototypes.
- Game balance, final name and exact upgrade numbers.
- Exact worry and feature copy per job, within the rules above.
- Accent colour per job, within the brand and contrast rules.
- How the Dock fits small phones.
- Table and function names and API shapes.
- Which sample data or screenshots the chapter 2 steps show.

## Still owed by the owner (does not block planning)

- Approval of the final founder story wording (source supplied 2026-11-09).
- A final read of the consent/privacy wording.
- Recruiting and running the 5 testers.
