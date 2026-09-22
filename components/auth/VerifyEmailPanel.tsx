"use client";

import Link from "next/link";
import { useState } from "react";

/*
  Shown after sign-up, while the account waits on a confirmation click.

  The resend button exists because Supabase's mailer is rate-limited and the
  limit is low. When it is hit, the API returns 429 with Supabase's own
  wording, which is shown as-is — "try again in N seconds" is actionable, and
  a generic "something went wrong" is not.
*/

export default function VerifyEmailPanel({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [notice, setNotice] = useState<string | null>(null);

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
        setNotice(json.message ?? "Too many emails just now — wait a minute and try again.");
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
      setNotice("Network error — try again.");
      setState("idle");
    }
  }

  return (
    <div className="border-hairline bg-surface w-full max-w-sm rounded-2xl border p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-2.5">
        <span className="bg-ink text-app flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold">
          F
        </span>
        <span className="text-[15px] font-semibold tracking-tight">
          Free<span className="text-ink-muted">Flow</span>
        </span>
      </div>

      <h1 className="text-xl font-semibold tracking-tight">Confirm your email</h1>
      <p className="text-ink-muted mt-2 text-sm">
        We sent a link to{" "}
        <span className="text-ink font-medium break-all">{email || "your inbox"}</span>. Open it
        and you will be signed in automatically.
      </p>
      <p className="text-ink-faint mt-3 text-xs">
        Check spam if it has not arrived — confirmation mail often lands there.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={resend}
          disabled={state !== "idle" || !email}
          className="border-hairline text-ink hover:border-ink-faint focus-visible:ring-accent rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:outline-none"
        >
          {state === "sending" ? "Sending…" : state === "sent" ? "Sent ✓" : "Resend the link"}
        </button>

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
