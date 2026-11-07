# Week 5 Screenshot Guide

All 15 images in `docs/week5/screenshots/` were captured on 2026-11-06. You only
need this guide to retake one, for example if the page changes before you submit.
Keep the same file name and rebuild the document.

| File | Page or view | What to show | Proves |
|---|---|---|---|
| `01-chat-signed-out.png` | `/chat` in a private window | The sign-in prompt | Page loads for everyone |
| `02-intake-category.png` | `/chat`, signed in | The four category buttons | Intake question 1 |
| `03-intake-area.png` | Tap a category | The nine area buttons | Intake question 2 |
| `04-answer-rating.png` | Type "my forecast shows zero for next month", tap 👍 | Rule name and the selected thumb | Response logic, rating |
| `05-guardrails.png` | Tax question, a fake password, then "my client threatened a lawsuit" | `guard-tax-advice`, `[removed]`, "No rule matched" | Guardrails, redaction, honest no-answer |
| `06-ticket-preview.png` | Still stuck? Submit a ticket | The preview panel | Human checkpoint |
| `07-ticket-filed.png` | Submit ticket | The "Filed" message | Human checkpoint |
| `08-fix-verified-live.png` | Card with a CVV, then "my password is broken" | `[removed]` and the reset steps | The bug fixes are live |
| `09-supabase-table.png` | Supabase → Table Editor → `chat_sessions`, scrolled right | `first_message`, `rules_fired`, `ratings`, `outcome` | Chat and test storage |
| `09b-supabase-ticket-status.png` | Same table, scrolled further | `transcript`, `ticket_status`, dates | Tickets are stored |
| `10-supabase-rls.png` | Supabase → Database → Policies | The four own-row policies | Per-user security |
| `11-tests.png` | Terminal: `npm run test:chat` | "838 passed, 0 failed" | Software tests |
| `12a-github-commits.png` | github.com/BraydenEC/FreeFlow/commits/main | Recent commits | Minimum 5 commits |
| `12b-vercel-deployments.png` | Vercel → Deployments | Green "Ready" rows | Minimum 2 deployments |
| `13-mobile.png` | `/chat` at phone width | The intake buttons wrapping | Usable on a phone |

**Keep real email addresses out of the shots.** The repository is public, so scroll
the Supabase table right until `user_email` is off screen, as these shots do.

`11-tests.png` is real command output rendered as an image. Its last two lines are a
written summary of the `npm test` result, not printed by that command in that form.
`13-mobile.png` was taken in a 390px iframe, not on a phone.
