# ✋ Action Items — Things Only You Can Do

**Everything else is automated.** Commits, code, builds, and docs are handled
for you. This file lists only the steps that need your accounts, your camera, or
your voice.

Status legend: 🔴 blocking · 🟡 soon · ⚪ later

---

## 🔴 ACCOUNTS FEATURE — 4 steps, ~6 minutes (added 2026-09-22)

The accounts build is live and every signed-out path is verified. These four
steps turn on the signed-in half. Do them in this order — step 4 depends on
step 3 having happened.

### 1. Turn off email confirmation (2 min) 🔴
Supabase → **Authentication** → **Providers** → **Email** → turn
**"Confirm email"** OFF → Save.

Why: it is currently ON — I checked against your live project. With it on,
signing up creates the account but hands back no session, so you land back on
the form. The app says "Check your inbox to confirm your email" rather than
appearing to hang, but Supabase's built-in mailer only sends a few messages an
hour, which will fail you mid-demo. Off is the right setting for a school
project, and the plan doc records that as a deliberate choice.

### 2. Delete the test user (1 min) 🔴
Supabase → **Authentication** → **Users** → delete
`servicepro.smoketest@outlook.com`.

I created it to find out whether confirmation was on. It has no data attached.

### 3. Sign up on the live site (1 min) 🔴
Go to <https://servicepro-orpin.vercel.app/signup> and create an account with
**braydencredeur@gmail.com**. Any password of 6+ characters.

The email matters: the migration in step 4 looks for exactly that address when
deciding who owns the existing projects.

### 4. Run the migration (2 min) 🔴
Supabase → **SQL Editor** → **New query** → paste all of
`supabase/accounts.sql` → **Run**.

Read the result row at the bottom:
- `moved_projects` should be **6** — your seed projects now belong to you
- every `orphan_*` should be **0**
- `policies` should read `core_outputs:2, pricing_scenarios:2, projects:4,
  research_records:2, user_prefs:3`

If `moved_projects` is 0, step 3 did not finish — sign up, then run it again.
The file is safe to re-run.

**Between steps 3 and 4** your account exists but owns nothing and cannot add
projects, because the per-user policies do not exist yet. A few minutes, then
it resolves itself.

### Then try it
Sign in, and you should see your six projects, the Settings drawer, and
**+ New project**. Change the layout, sign out, sign back in — the layout
follows the account now, not the browser.

---

## 🔴 NOW — 3 accounts, ~20 minutes total

These three block Phase 4 (deployment), which is the single highest-value
remaining item. **Do these while I keep coding.**

### 1. GitHub repository (5 min) 🔴
1. Sign in at <https://github.com> (create an account if needed)
2. Click **New repository**
3. Name it `servicepro`
4. Visibility: **Public** (simplest for Vercel + easiest for your professor to open)
5. ⚠️ **Do NOT** check "Add a README", ".gitignore", or "license" — the repo
   already has all three locally, and pre-filling causes a merge conflict on first push
6. Click **Create repository**
7. **Copy the URL** it shows you and send it to me — looks like
   `https://github.com/YOUR-USERNAME/servicepro.git`

Then I'll give you two commands to paste. That's it.

### 2. Vercel account (5 min) 🔴
1. Go to <https://vercel.com/signup>
2. **Sign up with GitHub** — this matters. It makes importing the repo one click
   and enables automatic deploys on every push, which is what generates the
   "minimum 2 deployments" evidence for free
3. Authorize Vercel to access your repositories
4. Stop there — don't import yet. I'll walk you through it in Phase 4

### 3. Supabase project (10 min) 🔴
1. Go to <https://supabase.com/dashboard> and sign in (GitHub sign-in is fine)
2. Click **New project**
3. Fill in:
   - **Name:** `servicepro`
   - **Database password:** generate one and **save it somewhere** — you cannot
     retrieve it later, only reset it
   - **Region:** whichever is closest to you
   - **Plan:** Free
4. Click **Create new project** and wait ~2 minutes while it provisions
5. When it's ready: **Project Settings** (gear, bottom-left) → **API**
6. Send me these two values, or paste them straight into `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys → `anon` / `public`** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> ⚠️ The `anon` key is safe to expose — it's designed for browsers and the table
> is protected by a read-only policy. **Never** send me or commit the
> `service_role` key; it bypasses all row-level security.

---

## 🟡 Phase 4 — First deployment (~5 min, after the accounts exist)

This is the step that removes the **"no live deployment = maximum 5/10"** cap.
Everything after it is upside.

1. I give you two `git` commands → you paste them into the terminal
2. In Vercel: **Add New → Project → Import** your `servicepro` repo
3. Leave every build setting at its default (Vercel detects Next.js correctly)
4. Click **Deploy**, wait ~1 minute
5. **Send me the live URL** — looks like `https://servicepro-xxxx.vercel.app`

> The app deploys successfully with **no environment variables set**. That's
> deliberate and already verified — it falls back to mock data rather than
> failing the build. Supabase keys come next.

---

## 🟡 Phase 5 — Connect the database (~10 min)

1. In Supabase: **SQL Editor** → **New query**
2. Paste the contents of `supabase/schema.sql` (I'll have it ready) → **Run**
3. Confirm rows appear under **Table Editor → projects**
4. In Vercel: **Settings → Environment Variables**, add both keys, then
   **Deployments → ⋯ → Redeploy**
5. Confirm the live site now shows *your* data

**Screenshots to capture here (graded evidence):**
- [ ] Supabase Table Editor showing the populated `projects` table
- [ ] The RLS policy listed under **Authentication → Policies**

---

## ⚪ Phase 8 — Test evidence (~15 min)

Three self-tests, screenshots for each. I'll write up the results; you capture:

- [ ] Live URL loading in a **private/incognito window** (proves it's public)
- [ ] Browser console open, showing **no errors** (proves no hydration issues)
- [ ] The site at **mobile width** (~375px — use device toolbar in DevTools)
- [ ] The site at **desktop width**
- [ ] **Vercel Deployments tab** showing 2+ successful deployments
- [ ] **GitHub commits page** showing 5+ commits

---

## ⚪ Phase 9 — Only you can do these (~45 min)

### Demo video (2–3 min) — worth 0.5 pts
Shot list:
| Time | Content |
|---|---|
| 0:00–0:20 | The problem: freelancers juggling Excel, Word, scattered notes |
| 0:20–1:00 | Live URL walkthrough — summary cards, table, statuses, deadlines |
| 1:00–1:30 | Resize to mobile, show the layout adapt |
| 1:30–2:10 | Supabase table → refresh the site → data flowing end to end |
| 2:10–2:40 | Stack summary + one engineering decision (the mock-data fallback) |

> Record with the site already loaded and the console **closed** for the main
> walkthrough. Open it only if you want to demonstrate the clean console.

### Human Decision Note (150–250 words) — worth 1.0 pt
Must cover **decisions, rejections, corrections, and tradeoffs**. Write it in
your own voice — I'll hand you a factual bullet list to work from, drawn from
`CONVERSATION_LOG.md`. The raw material is already there: the deployment
reordering, rejecting hardcoded metrics, the static-prerender catch, and the
Supabase-vs-mock tradeoff are all genuine decisions with real reasoning.

### Final submission
- [ ] Assemble into **one PDF**: Build Discipline Packet + evidence + links
- [ ] Live URL, GitHub URL, and video link at the **top** of the document
- [ ] Submit to Dropbox

---

## ✅ Handled for you — no action needed

Commits · code · builds · lint · the schema SQL · README · architecture diagram ·
prompt log · test write-ups · iteration log · implementation note · stack table ·
testable acceptance criteria.
