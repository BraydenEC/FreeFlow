# Domain and email troubleshooting — 2026-09-22

Two problems, unrelated to each other, both configuration rather than code.
One of them is already solved and you may not have noticed.

## Already working: the domain is live

`freeflow.website` was registered at Name.com today and its nameservers are
already delegated to Vercel (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`). The
zone exists, the records resolve, and Vercel issued a TLS certificate at
16:30 UTC today.

Verified from the command line:

| Check | Result |
|---|---|
| `https://www.freeflow.website/research` | `200`, 128 KB, **11 unsourced badges** — the real app |
| `https://freeflow.website/…` | `308` → `www` (www is your canonical host) |
| `https://www.freeflow.website/` and `/core` signed out | `307` → `/signup` |
| TLS certificate | `CN=*.freeflow.website`, valid to 21 Dec 2026 |

So the site is on your domain already. Nothing to fix there.

> A note on my own first answer: my initial DNS lookups came back empty and I
> was about to tell you the zone did not exist. That was my resolver holding a
> cached "no such domain" from before you registered it, minutes earlier.
> Querying Vercel's nameservers directly showed the truth. If a brand-new
> domain looks missing, suspect the cache before the configuration.

## Problem 1 — Brevo says "your records don't match"

**Cause: there are no TXT records in the zone at all.** I queried Vercel's
nameservers for every name Brevo uses and all four are empty:

```
freeflow.website                    TXT  — none —
mail._domainkey.freeflow.website    TXT  — none —
brevo._domainkey.freeflow.website   TXT  — none —
_dmarc.freeflow.website             TXT  — none —
```

**The likely reason: you added them at Name.com.** Name.com is your registrar,
but your nameservers point at Vercel, so Name.com's DNS panel is not consulted
by anyone. Records have to go in **Vercel**.

### Where to put them

Vercel → your project → **Settings** → **Domains** → `freeflow.website` →
**DNS Records** (or the top-level **Domains** tab → the domain → DNS Records).

### The one mistake that causes this exact message

Vercel's **Name** field takes the *subdomain only*, not the full hostname. If
Brevo tells you to create a record for

```
mail._domainkey.freeflow.website
```

then in Vercel you enter Name = `mail._domainkey` — **not** the whole thing.
Entering the full hostname produces
`mail._domainkey.freeflow.website.freeflow.website`, which resolves to nothing
and reads to Brevo exactly as "records don't match".

For a record on the bare domain, leave **Name** empty (or `@` if it insists).

### What Brevo will ask for

Three TXT records. Copy the values from Brevo's screen — two of them contain a
code unique to your account, so do not retype them from anywhere else:

| Vercel **Name** | Type | Value |
|---|---|---|
| *(leave empty)* | TXT | `brevo-code:…` — from Brevo |
| `mail._domainkey` | TXT | `k=rsa;p=…` — the long DKIM key from Brevo |
| `_dmarc` | TXT | `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com` |

Save each one, then press **Verify** in Brevo. Vercel's DNS publishes in
seconds — the "up to 48 hours" warning is generic and rarely applies here. If
it still fails after a minute, the Name field is the thing to re-check.

### The faster alternative, if you want to move on

Domain verification is not required to send. In Brevo, **Senders** → **Add a
sender** → `braydencredeur@gmail.com`, click the link Brevo emails you, and use
that as your Supabase sender. No DNS at all.

Domain verification is still worth finishing afterwards: mail from
`noreply@freeflow.website` looks like a product, and it lands in inboxes rather
than spam far more reliably.

## Problem 2 — the confirmation link went to `localhost:3000`

The URL in your screenshot was:

```
localhost:3000/?error=access_denied&error_code=otp_expired
                &error_description=Email+link+is+invalid+or+has+expired
```

Your instinct was right. Two things went wrong, and the second is a consequence
of the first.

**Supabase's Site URL is still `http://localhost:3000`.** The app asks for the
confirmation to come back to whatever origin you signed up on, but Supabase
only honours that if the address is on its redirect allow-list. It is not, so
Supabase fell back to the Site URL — the default from when the project was
created. The link was therefore pointed at your own laptop, where nothing was
running, so the browser said "refused to connect".

**`otp_expired` means the link was already spent.** A confirmation link is
single-use. The first click consumed it and bounced to localhost; every click
after that reports an expired link. So this particular email is burned — after
fixing the settings you need a *new* one.

### The fix

Supabase → **Authentication** → **URL Configuration**:

- **Site URL**: `https://www.freeflow.website`
- **Redirect URLs** — add all four:
  - `https://www.freeflow.website/**`
  - `https://freeflow.website/**`
  - `https://servicepro-orpin.vercel.app/**`
  - `http://localhost:3000/**`  ← so local development still works

Use the `www` form as the Site URL. The bare domain 308-redirects to `www`, and
there is no reason to make an auth callback take an extra hop.

### Then get a fresh link

Go to <https://www.freeflow.website/login>, sign in with the password you
chose. The app recognises an unconfirmed account and sends you to a waiting
room with a **Resend the link** button. The new email will point at
`https://www.freeflow.website/auth/confirm`, which is a real server route that
verifies the token and signs you in.

If you have hit the two-per-hour limit again, finish the Brevo SMTP setup first
— that limit disappears once Supabase stops using its own mailer.

## Order to do these in

1. Brevo sender working — either the DNS records in **Vercel**, or the
   single-address shortcut
2. Supabase → SMTP Settings → point at Brevo
3. Supabase → URL Configuration → Site URL + the four redirect URLs
4. Sign in at `/login` → **Resend the link** → click it
5. Run `supabase/accounts.sql` (step 6 in ACTION_ITEMS.md)
