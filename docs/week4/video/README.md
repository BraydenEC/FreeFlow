# Week 4 Video: what changed, and the outline

**Length:** 2–3 minutes · **Rubric:** "Demo proves the feature works live"
(0.5 pts) · **Required live page:** <https://www.freeflow.website/marketing>

---

## What changed in Module 4 (the short version)

1. **The homepage became a real landing page.** Signed out, `/` says what
   FreeFlow is ("Know what is coming, not just what you are owed") and what it
   is not, before asking for an email.
2. **A brand system.** The site is black-and-white by design; colour appears
   only on the four project statuses. Documented in `BRAND.md`, which also
   covers a bug where the brand had silently reverted to indigo.
3. **A new page, `/marketing`: the Marketing Engine.**
   - **Persona:** the real freelancer from the Week 2 interview, quoted word for
     word, not an invented one.
   - **10 social posts and 3 video scripts**, generated live by Claude or shown
     from built-in seed copy. Every card is labelled with which one it is.
   - **Copy** on every card and **Export CSV** for the whole campaign.
   - **A 14-day campaign calendar**, built from the posts and scripts so it
     never schedules something that does not exist.
   - **An A/B headline tester** with two tests: value-prop and audience. Pick a
     winner; it is remembered, and "Save winner" stores it to your account.
   - **Saved to your account:** saved posts, scripts and winners, stored in
     Supabase and visible only to you.
4. **Tests:** 2 A/B tests and 3 software tests (22 assertions), all passing.
5. **Security pass:** the AI route is rate limited, errors no longer leak
   database details, and Next.js was patched.

---

## Outline (about 2:30)

Talking points, not a script. Say them your own way.

| Time | On screen | Say |
|---|---|---|
| **0:00–0:15** | Title: freeflow.website | "Week 4 was the marketing engine: a credible landing page, plus a page that turns FreeFlow into posts, scripts and a campaign." |
| **0:15–0:35** | `/` in a **signed-out** window | The homepage upgrade: the headline says what it is first; the page also says what is *not* built. |
| **0:35–0:55** | `/marketing`, top band | The persona is the real person I interviewed, quoted. The brand: monochrome, colour only for status, and the four voice rules. |
| **0:55–1:30** | Content band → **Generate live** | 10 posts, 3 scripts. Click Generate live; the badges switch from "seed copy" to "AI-generated". Click **Copy** on one card, then **Export CSV**. |
| **1:30–1:45** | 14-day calendar | Built from the content, two weeks, every slot a real post or script. |
| **1:45–2:05** | A/B headline test | Pick a winner in one test, click **Save winner**. Reload: the choice is still there. |
| **2:05–2:20** | "Saved to your account" (+ Supabase table, optional) | The saved items, stored per account. Only the owner can see them. |
| **2:20–2:40** | Terminal: `npm run test:marketing` | 22 passed, 0 failed: the 2 A/B tests and 3 software tests. One line on the security pass if there is time. |

---

## Before you hit record

- [ ] **Generate live takes about 40 seconds.** Click it *first*, then talk over
      the persona and brand while it works, or generate before recording and
      show the result.
- [ ] Signed in (for Save), with a **second signed-out window** ready for the
      homepage.
- [ ] At least one item already saved, so the Saved band is not empty if
      anything goes wrong live.
- [ ] Terminal open in the project folder with `npm run test:marketing` typed.
- [ ] Browser console closed.
