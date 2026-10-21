# Week 4 Screenshot Guide

Twelve screenshots, in the order the submission document uses them. Save each
one into `docs/week4/screenshots/` with the file name given. The submission
document already references those names, so the images appear automatically
when you re-export.

**Take them all fresh.** The interface has changed since earlier weeks; an old
capture will not match what a grader sees.

**Setup, once:**
1. Use Chrome. Sign in at <https://www.freeflow.website/login>.
2. Open a **second window in Incognito** (⌘⇧N) for the signed-out shots.
3. Screenshot a region on a Mac: **⌘⇧4**, then drag. Whole window: **⌘⇧4**,
   then **Space**, then click the window.
4. Files land on your Desktop. Rename them and move them into
   `docs/week4/screenshots/`.

---

## 1. Homepage, signed out → `01-homepage.png`
1. In the **Incognito** window, go to <https://www.freeflow.website>.
2. Capture the top of the page: the headline "Know what is coming, not just
   what you are owed" and the section below it.

**Proves:** homepage upgraded, landing page copy.

## 2. Marketing page, persona and brand → `02-persona-brand.png`
1. In the **signed-in** window, go to <https://www.freeflow.website/marketing>.
2. Capture the title "Marketing Engine" and the two cards under it: the
   persona (with the quote) and the brand (with the four status colours).

**Proves:** target persona, brand system.

## 3. Generated posts → `03-posts-ai-generated.png`
1. Click **Generate live**. Wait about 40 seconds until the cards change.
2. Capture the content band with several post cards, making sure the green
   **"AI-generated"** badges are visible.

**Proves:** 10 social posts, AI output clearly labelled.

## 4. Video scripts → `04-video-scripts.png`
1. Scroll down to the three video script cards (Hook / Body / CTA).
2. Capture all three.

**Proves:** 3 video scripts.

## 5. Copy and export → `05-copy-export.png`
1. Click **Copy** on one card so it changes to "Copied", and capture that card
   *quickly* (it resets after about 1.5 s).
2. Optional: click **Export CSV** and capture the downloaded
   `freeflow-marketing.csv` open in Numbers or Excel.

**Proves:** copy/export buttons.

## 6. 14-day calendar → `06-calendar.png`
1. Scroll to **14-day calendar**.
2. Capture all fourteen days.

**Proves:** 14-day campaign calendar.

## 7. A/B headline test → `07-ab-test.png`
1. Scroll to **A/B headline test**.
2. In one test, click the headline you want as the winner, then **Save winner**
   so it shows "Saved".
3. Capture both tests with a winner selected.

**Proves:** A/B headline test, A/B tester.

## 8. Saved assets → `08-saved-assets.png`
1. Reload the page (**⌘R**; a full reload, not a scroll).
2. Scroll to **Saved to your account** and capture the list of saved items.

**Proves:** saved marketing assets (C12).

## 9. Supabase table → `09-supabase-table.png`
1. Go to <https://supabase.com/dashboard> → your project → **Table Editor** →
   **marketing_assets**.
2. Capture the rows: `kind`, `content`, `extractor`, `created_at`.

**Proves:** Supabase evidence.

## 10. Supabase security policies → `10-supabase-rls.png`
1. In Supabase, open **Authentication → Policies** (or Table Editor →
   marketing_assets → **RLS policies**).
2. Capture the four policies (select, insert, update, delete), all scoped to the
   owner.

**Proves:** per-user security on saved assets.

## 11. Tests passing → `11-tests.png`
1. In Terminal, in the project folder, run `npm run test:marketing`.
2. Capture the output ending in **22 passed, 0 failed**.

**Proves:** 2 A/B tests + 3 software tests.

## 12. Commits and deployments → `12a-github-commits.png`, `12b-vercel-deployments.png`
1. Go to <https://github.com/BraydenEC/FreeFlow/commits/main> and capture the
   Week 4 commits (Sept 28–30, plus this week's).
2. Go to the Vercel dashboard → your project → **Deployments**. Capture the list
   showing at least two successful (green "Ready") deployments.

**Proves:** minimum 5 commits, minimum 2 deployments.

---

## Optional, and worth it

**13. Mobile view → `13-mobile.png`.** In Chrome on `/marketing`, open DevTools
(**⌥⌘I**), toggle the device toolbar (**⌘⇧M**), choose iPhone, and capture. The
persona's one complaint was "annoying on mobile", so this shot answers him
directly.
