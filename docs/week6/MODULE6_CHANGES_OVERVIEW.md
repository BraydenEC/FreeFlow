# Module 6: Overview of Changes and Iterations

**Project:** FreeFlow · **Course:** Negocios Inteligentes y Comercio Digital, Ibero CDMX · **Module 6:** Integrated Agentic Venture + Impact & Viability · **Updated:** November 21, 2026

FreeFlow (https://www.freeflow.website) is a free tracker for freelancers: projects, deadlines, invoices and a six-month cash-flow forecast. Module 6 turned it from separate weekly features into one venture with a story, a front page, public numbers and a build log. Then it went through several rounds of review and testing. This page covers what changed, why, and how each change was checked.

---

## At a glance

| | |
|---|---|
| Week 6 commits | 70 on `week6` (Nov 9–21), including this write-up |
| Production deploys | 7 so far; the AI pre-test fixes are ready for the 8th |
| Automated tests | 22 suites, 2,054 passed, 0 failed (up from 21 suites and 1,852 on Nov 18) |
| Coding prompts logged | 55, quoted from the session transcripts |
| AI pre-test findings | 35 (10 high, 15 medium, 10 low): 32 fixed, 2 fixed in the app with an owner step left (H2, M5), 1 partly fixed by design (L6) |
| Still to come | 5 external users, the demo video, and the deploy of the latest fixes |

---

## 1. What Module 6 built

| Part | What it is |
|---|---|
| `/demo`, the front page | "One night, 11:47 pm to morning": the visitor's worries drift under the headline and sort into a checklist as they scroll. Then a walkthrough, the signed founder story, "you said, we changed", the Answer gates game, and a morning ending with sign-up and the launch list |
| The Dock | One button in the corner opens every page, grouped as *Your tools* and *About FreeFlow* |
| `/dashboard` | *Your work* (projects, forecast, withholding, overdue alert) and *FreeFlow in public* (aggregate counts only) |
| `/docs` | The build log: journey, week-by-week timeline, prompt library, testing, impact check and a roadmap people can vote on |
| `/pricing` | Says what FreeFlow costs first; the pricing model and simulator follow under *Build log* |
| Supabase | `funnel_events`, `launch_list`, `roadmap_votes`, `count_exclusions` (insert-only for the public) and `venture_counts()`, which returns counts and never rows |

---

## 2. Iterations, in order

### Gate 1: plan before code (Nov 9–10)
The design, the implementation plan and the build discipline packet were written and approved before any Week 6 code (`0019133`, `497e7ab`, `a457cd0`). The pricing source was changed to the friend's real chat, and mockups were cut to 1x to keep the repo light.

### Build and first review (Nov 10)
Tasks were built test-first. A fresh review of the whole branch found four problems a visitor would hit, and each got a test that failed first:
- the Dock moved under the mouse and opened the wrong page;
- dragged worries stuttered;
- phones couldn't scroll past the worry panel;
- three help desk answers described the old top bar.

Three smaller findings were fixed too. Deploys 1 and 2 followed.

### Owner review and front-page redesign (Nov 10–12)
- The founder story said FreeFlow was built "for a class". It now says it was built by choice.
- The front screen felt "generic". It was rebuilt from playable mockups, chosen option by option: the worry field, contour lines, a neutral start, "Brayden's own" grey, and the hook's comma on one line.
- A second review fixed the hidden colour wave, finger drag, the job picker on phones, and "Sort it for me" scrolling. That was deploy 3.

### The game (Nov 16–18)
Three rounds of playable prototypes led to **Answer gates**: fly and remember, with no setup before playing. A review fixed:
- spilling past its border on phones;
- accidental starts while scrolling, which inflated the public round count;
- red used for things that aren't overdue.

That was deploy 4, then 5. The hero's notes were also changed to turn into checked rows smoothly with the scroll (deploy 6).

### Scope trims (Nov 18–19)
- Donations were switched off: `/support` answers 404, with the code kept behind `DONATIONS_ENABLED`.
- Per-project pricing was hidden behind `PER_PROJECT_PRICING_ENABLED`.
- A curse word in an interview quote was reworded, and a test now scans the site for them.
- The packet was trimmed to what the Module 6 documents ask for.

All of this went live as deploy 7 (`81d8783`, Nov 21).

### AI-automated pre-test (Nov 18–19)
Claude Code drove five AI personas through the live site in isolated headless browsers (Playwright): impatient first-timer, non-technical user, power user, skeptic and mobile. They reported 35 issues. **This was AI, not people.** It is recorded as an AI pre-test and kept apart from the 5 external users the assignment asks for. The full write-up is `docs/user-testing/USER_TESTING_HANDOFF.md`.

### Fixing the pre-test's findings (Nov 21)
Every finding was worked through, test-first where code could be tested, in six commits:
- `76f4730`
- `6b2c87e`
- `40667ac`
- `c48154d`
- `c601d5a`
- `3557631`

Each commit passed the full test suite, lint and type check. The build was clean before the last browser check.

---

## 3. What each finding became

**Status key:**
- **Fixed:** done in code, with a test.
- **Fixed, owner step:** the app side is done, and one step outside the code remains.
- **Partly, by design:** the handoff's own advice was to wait.

### High impact

| ID | Finding | What changed | Status |
|---|---|---|---|
| H1 | Live site showed donations, Per-project pricing and a curse word | Deployed `week6` (deploy 7); checked live: `/support` 404, no Per-project on `/pricing` | Fixed |
| H2 | Confirmation email lands in Spam | The confirm page now leads with "Check your Spam folder", with an Open Gmail / Open Outlook button | Fixed, owner step: SPF/DKIM/DMARC in Brevo and a named sender |
| H3 | Floating "+" covers content and is an icon-only menu | Dock moved to the corner. Names always show under the icons, in two named groups. On phones it opens as a grid. It's hidden on sign-in pages and while Settings is open, and the top bar names the tools on desktop | Fixed |
| H4 | "Mark paid" can't be undone or dated | "Mark unpaid" on paid rows, a "Paid on" date in Edit, the local date on Mark paid, future dates refused | Fixed |
| H5 | Brief extraction drops the budget, currency and client type | Fixed total, currency and client type are now read (model prompt v1.1.0 plus the fallback extractor). They fill the form. One "Add to my projects" button replaces two | Fixed |
| H6 | Extraction lost on reload | The brief and its result are kept for the tab until the project is added, with a warning before leaving | Fixed |
| H7 | Form errors show one at a time, off-screen | Every problem shows at once, in plain words, beside the button, with the cursor on the first. The deadline starts empty. Extras sit under "More details" | Fixed |
| H8 | Currency switch is invisible and relabels amounts | "Amounts in MXN" on the dashboard, the currency in the Value column, and a warning on switching that nothing was converted | Fixed. A currency per project stays out on purpose: totals would need exchange rates |
| H9 | Pricing never says what FreeFlow costs | `/pricing`, Terms and the help desk all now open with the same line: "Free during early access… a one-time purchase at launch, and the price isn't set yet" | Fixed |
| H10 | Signed-out dashboard doesn't explain the product | It opens on a pitch, three things FreeFlow does, and "Create a free account" | Fixed |

### Medium impact

| ID | Finding | What changed | Status |
|---|---|---|---|
| M1 | Money figures contradict each other | An invoice now counts as late after its payment terms (as the forecast assumes), not at the deadline. Progress bars that only repeated the status are gone. The cards say "before any tax withheld", and the forecast says why the CSV total can be higher | Fixed |
| M2 | Help desk hard to reach, wrong answers, rule names shown | The text box is there from the start and typed questions are routed by their words. Signed-out visitors can ask. The conversation survives a reload, and rule names are hidden. The undo and bulk-action answers are fixed | Fixed |
| M3 | "Sort it for me" only reachable by keyboard | It's an ordinary visible button, and the role dots show their names | Fixed |
| M4 | Public pages read like a course project | No "Week N" stamps on `/product`. Grader material sits under "Build log" headings. Market research is off by default on the dashboard. The prompt library keeps its typos on purpose, as a verbatim record, and now says so | Fixed |
| M5 | No privacy, terms or contact; white 404 | `/privacy` and `/terms`, a footer on every page, a consent line on sign-up, a branded 404, `robots.txt` and `sitemap.xml` | Fixed, owner step: a domain contact address (one line in `lib/site.ts`) |
| M6 | FreeFlow can't send invoices | The dashboard, `/pricing`, Terms and the demo footer now say plainly that FreeFlow tracks invoices and doesn't send them yet. Sending stays on the roadmap | Fixed (copy); the feature is a roadmap item |
| M7 | Phone: tiny targets, zooming inputs, squashed search | 44px tap targets, 16px fields, full-width search, "+ New project" near the top, no ⌘ hint on touch | Fixed |
| M8 | Unsaved work lost without warning | New-project drafts, the brief and the help desk survive a reload. Unsaved Edit changes ask before leaving | Fixed |
| M9 | Jargon and field names shown | Plain tax labels, with the official term on hover. Extraction notes never show field names (prompt v1.2.0 plus a display filter) | Fixed |
| M10 | One feature, many names | "Paste a brief", "Help desk" and "Create a free account" are used everywhere | Fixed |
| M11 | A long name breaks the layout | Long words wrap in the table and the overdue banner | Fixed |
| M12 | Zero-value projects accepted; old dates have no year | Rates under 0.01 are refused, and dates outside this year show the year | Fixed |
| M13 | Keyboard focus gets lost | Focus moves into the form, Settings and the help desk, and to the first error. Escape closes Edit, arrow keys move between tabs, the gear has a name, and there's a skip link | Fixed |
| M14 | Sign-up/login show raw server errors | Email and password are checked in the browser, server text is reworded, errors clear on edit, and the email field gets the cursor | Fixed |
| M15 | A malformed project ID returns 500 | Every project route answers 404 for a malformed ID | Fixed |

### Low impact

| ID | Finding | What changed | Status |
|---|---|---|---|
| L1 | Email breaks mid-word | It wraps only after the "@" | Fixed |
| L2 | Home page notes overlap | Phones show each worry once, in its own slot. The duplicate "8:00 AM" label is gone | Fixed |
| L3 | Two logos, "Welcome back" for new users | One logo everywhere, and "Welcome" for an account with no projects | Fixed |
| L4 | Small copy and number mistakes | Tier and segment counts match their cards, ARPU shows cents, the Saved tab copy is right, statuses use one casing, and the CFDI text matches its built item | Fixed. The "People using FreeFlow" count drops when the owner deletes the 5 test accounts |
| L5 | Sign-out and sign-in land on the wrong page | Sign-out goes home. Private pages explain the redirect and return you after signing in | Fixed |
| L6 | No bulk actions or shortcuts | `n` (new project) and `/` (search) on the dashboard, and the help desk says what exists | Partly, by design: row checkboxes wait for users with many projects, as the handoff advised |
| L7 | Payment-terms field can't be emptied | It can be empty while typing | Fixed |
| L8 | Pricing sliders jump on touch | A number field beside every slider, and a taller touch area | Fixed |
| L9 | Resend trusts the email in the URL | The email is kept out of the URL, and resends are limited per visitor | Fixed |
| L10 | Demo keeps loading and shows "Try free" when signed in | Signed-in visitors see "Open dashboard". Idle polling didn't reproduce: no requests in 10 idle seconds on a local production build | Fixed |

---

## 4. How the fixes were checked

- **Tests first.** New suites cover sign-in (`test-auth`) and brief extraction (`test-core`), and existing suites gained cases for payment dates, all-at-once form errors, lateness after payment terms, phone note slots, help desk routing and source-level UI checks. Each one failed before its fix.
- **Gate on every commit:** `npm test` (22 suites, 2,054 passed), `npm run lint`, `npx tsc --noEmit`. `rm -rf .next && npm run build` was clean before the browser check.
- **In a browser, on a local production build:**
  - the signed-out dashboard opens on the pitch;
  - the Dock shows its labels on desktop and in a 390px-wide frame, with no sideways scroll (document width 388);
  - signed out, the help desk answers "How do I undo Mark paid?" correctly and keeps the conversation after a reload;
  - `/pricing` leads with the cost;
  - "Sort it for me" is visible;
  - `/demo` made no requests while idle.
- **Not yet checked:** signed-in flows in the browser (they need the owner's sign-in) and the live site after the next deploy.

---

## 5. What's left for the owner

1. **Deploy** the fixes (`week6` → `main`), then re-check them live.
2. **External users:** run 5 real testers and fill in the packet's table and iteration step 5.
3. **Demo video:** record 5 minutes, showing `/dashboard` signed in.
4. **Email deliverability (H2):** set up SPF, DKIM and DMARC for freeflow.website in Brevo, send from a named address, and score a message at mail-tester.com.
5. **Domain contact (M5):** set up `hello@freeflow.website` forwarding, then change `CONTACT_EMAIL` in `lib/site.ts`.
6. **Test accounts (L4):** delete the five `+test` accounts on production, so the public counts are true.
