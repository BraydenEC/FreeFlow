"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import Logo from "@/components/Logo";
import { inboxLink, PENDING_EMAIL_KEY, splitEmail } from "@/lib/auth/validate";

/*
  Shown after sign-up, while the account waits on a confirmation click.

  User testing (H2): all five confirmation emails landed in Spam, and to a new
  user sign-up looked like a dead end. So the spam folder is the headline, not
  a footnote, and Gmail/Outlook users get a button straight into it. (The
  sender reputation itself, SPF/DKIM/DMARC in Brevo, is fixed outside the app.)

  L9: the address comes from this tab's sessionStorage, written by the sign-up
  form, never from the URL. L1: it can only wrap after the "@".

  The resend button exists because Supabase's mailer is rate-limited and the
  limit is low; a 429 says when to try again.
*/

const noopSubscribe = () => () => {};

function readPendingEmail(): string {
  try {
    return window.sessionStorage.getItem(PENDING_EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}

export default function VerifyEmailPanel() {
  const email = useSyncExternalStore(noopSubscribe, readPendingEmail, () => "");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [notice, setNotice] = useState<string | null>(null);
  const [local, domain] = splitEmail(email);
  const inbox = email ? inboxLink(email) : null;

  async function resend() {
    setNotice(null);
    setState("sending");
    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = (await res.json()) as { message?: string; error?: string };
      if (res.status === 429) {
        setNotice(json.message ?? "Too many emails just now. Wait a minute and try again.");
        setState("idle");
        return;
      }
      if (!res.ok) {
        setNotice(json.error ?? "Could not resend just now.");
        setState("idle");
        return;
      }
      setState("sent");
    } catch {
      setNotice("Network error. Try again.");
      setState("idle");
    }
  }

  return (
    <div className="border-hairline bg-surface w-full max-w-sm rounded-2xl border p-6 sm:p-8">
      <Link href="/" aria-label="FreeFlow home" className="mb-6 inline-flex">
        <Logo wordmark />
      </Link>

      <h1 className="text-xl font-semibold tracking-tight">Check your Spam folder</h1>
      <p className="text-ink-muted mt-2 text-sm">
        We sent a confirmation link to{" "}
        {email ? (
          <span className="text-ink font-medium">
            <span className="whitespace-nowrap">{local}</span>
            <wbr />
            <span className="whitespace-nowrap">{domain}</span>
          </span>
        ) : (
          "your inbox"
        )}
        . It often lands in Spam or Junk. Open it and you&rsquo;re signed in.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {inbox && (
          <a
            href={inbox.href}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent text-app focus-visible:ring-accent flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none"
          >
            {inbox.label} ↗
          </a>
        )}
        <button
          type="button"
          onClick={resend}
          disabled={state !== "idle" || !email}
          className="border-hairline text-ink hover:border-ink-faint focus-visible:ring-accent min-h-11 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:outline-none"
        >
          {state === "sending" ? "Sending…" : state === "sent" ? "Sent ✓" : "Resend the link"}
        </button>
        {!email && (
          <p className="text-ink-faint text-xs">
            Opened in a new tab? <Link href="/signup" className="underline underline-offset-2">Sign up again</Link>{" "}
            with the same email to get a new link.
          </p>
        )}

        {notice && (
          <p role="status" className="text-status-review text-xs">
            {notice}
          </p>
        )}
      </div>

      <p className="text-ink-muted mt-6 text-center text-sm">
        Already confirmed?{" "}
        <Link href="/login" className="text-ink underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
