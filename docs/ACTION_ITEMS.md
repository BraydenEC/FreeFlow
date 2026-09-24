# ✋ Action Items — Things Only You Can Do

**Everything else is automated.** Commits, code, builds, and docs are handled
for you. This file lists only the steps that need your accounts, your camera, or
your voice.

Status legend: 🔴 blocking · 🟡 soon · ⚪ later

---

## 🟡 DONATIONS — one step, ~3 minutes (added 2026-09-24)

The `/support` page is live and explains everything. It has no button yet,
because the payment link does not exist. Until you make one the page says so
plainly rather than showing something broken.

### Create a Stripe Payment Link

1. Stripe dashboard → **Payment links** → **New**
2. Product: **"Support FreeFlow"** (or whatever you want donors to see)
3. Pricing → choose **"Customers choose what to pay"**, and set a suggested
   amount if you like. This is what lets the suggested amounts on the page
   pre-fill.
4. Create it, then **copy the URL** — it looks like
   `https://buy.stripe.com/xxxxxxxx`
5. Vercel → your project → **Settings** → **Environment Variables** → add:
   - Name: `NEXT_PUBLIC_DONATE_URL`
   - Value: the URL you copied
6. **Redeploy** — Vercel → Deployments → the latest → ⋯ → **Redeploy**, with
   the build cache **off**

The button appears the moment that variable is set. Nothing else changes.

> It must be **https** and a full URL. The site refuses anything else on
> purpose, and there are tests for it — a donate button that 404s inside the
> app, or points at `http`, is worse than no button.

---

## 🔴 ACCOUNTS FEATURE — email confirmation stays ON (updated 2026-09-22)

You decided to keep email verification. The app now supports it properly:
sign-up hands off to a "confirm your email" waiting room, the link in the email
is received by `/auth/confirm`, and an expired link says so instead of failing
silently. All of that is live.

One thing is not code, and it is what stopped you: **the mailer.**

### What "email rate limit exceeded" means

Supabase's built-in mailer sends **2 emails per hour for the whole project** on
the free tier. It is a shared testing mailer, not a delivery service, and that
limit is deliberate.

My diagnostic sign-up earlier — the one that told us confirmation was on — used
one of those two. That was a cost of my check, and I should have used your own
sign-up to learn the same thing.

The limit resets on a rolling hour. It will also hit you again during a demo if
two people create an account in the same hour, which is why the fix below is
worth ten minutes.

### Step 1 — give Supabase a real mailer (10 min) 🔴 RECOMMENDED

**Brevo** is the right fit: 300 emails/day free, and it verifies a single email
address rather than requiring you to own a domain.

1. Sign up at <https://www.brevo.com> with `braydencredeur@gmail.com`
2. **Senders, Domains & Dedicated IPs** → **Senders** → **Add a sender** →
   use `braydencredeur@gmail.com` → confirm the verification email Brevo sends
3. **SMTP & API** → **SMTP** tab → copy the **login** and the **SMTP key**
   (the key is shown once — copy it now)
4. Supabase → **Project Settings** → **Authentication** → **SMTP Settings** →
   **Enable Custom SMTP**:
   - Host `smtp-relay.brevo.com`
   - Port `587`
   - Username: the Brevo SMTP login
   - Password: the Brevo SMTP key
   - Sender email: `braydencredeur@gmail.com`
   - Sender name: `FreeFlow`
5. Save.

Why Brevo and not Resend: Resend's free tier without a domain can only deliver
to your own address, so a grader creating an account would never get the email.
Brevo sends to anyone.

**If you would rather not set this up right now:** wait an hour and do steps 2–5
below. Everything works — it just breaks again the next time two people sign up
close together.

### Step 2 — point Supabase at the live site (2 min) 🔴 THIS IS THE LOCALHOST BUG

Supabase → **Authentication** → **URL Configuration**:

- **Site URL**: `https://www.freeflow.website`
- **Redirect URLs** — add all four:
  - `https://www.freeflow.website/**`
  - `https://freeflow.website/**`
  - `https://servicepro-orpin.vercel.app/**`
  - `http://localhost:3000/**`

This is why your confirmation link opened `localhost:3000`. Site URL is still
the default from when the project was created, and Supabase falls back to it
whenever the requested redirect is not on the allow-list.

Note the confirmation email you already received is spent — a link is
single-use, and `otp_expired` means it was consumed on the first click. Get a
fresh one from `/login` → **Resend the link**.

Full write-up: `docs/extras/DOMAIN_AND_EMAIL_SETUP.md`

### Step 3 — use the cleaner confirmation link (3 min) 🟡

Supabase → **Authentication** → **Email Templates** → **Confirm signup** →
replace the link line with:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup">
  Confirm your email
</a>
```

This makes the link land on the server handler, which writes the session cookie
directly. The default template works too — there is a client-side catcher for
it — but this path is the sturdier one and skips a redirect.

### Step 4 — delete the test user (1 min) 🔴

Supabase → **Authentication** → **Users** → delete
`servicepro.smoketest@outlook.com`. It has no data attached.

### Step 5 — sign up for real (2 min) 🔴

Go to <https://www.freeflow.website/signup> and use
**braydencredeur@gmail.com**. The migration in step 6 looks for that exact
address.

**If your earlier attempt already created the account**, signing up again will
say the user exists. In that case go to
<https://www.freeflow.website/login>, sign in with the password you
chose, and the app will send you to the waiting room with a **Resend the link**
button. Either route gets you confirmed.

### Step 6 — run the migration (2 min) 🔴

Supabase → **SQL Editor** → **New query** → paste all of
`supabase/accounts.sql` → **Run**.

Expected in the result row:
- `moved_projects` = **6**
- every `orphan_*` = **0**
- `policies` = `core_outputs:2, pricing_scenarios:2, projects:4,
  research_records:2, user_prefs:3`

If `moved_projects` is 0, step 5 did not finish. Confirm your email, then run
it again — the file is safe to re-run.

### Then try it

Sign in and you should see your six projects, the Settings drawer, and
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
