"use client";

import Link from "next/link";
import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";

/*
  Request a password reset link.

  Until the mailer worked, this flow could not exist — a locked-out user
  needed the database owner to intervene, which is not a product. Brevo made
  it possible, so the dead end is now a door.

  Always reports success, whatever Supabase says about the address. Telling a
  stranger "no account with that email" turns this form into a tool for
  discovering who has an account here. The one failure worth surfacing is the
  rate limit, which is temporary and actionable.
*/
export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setNotice("Accounts are not configured on this deployment.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm`,
    });
    setBusy(false);

    if (error && /rate|limit|seconds/i.test(error.message)) {
      setNotice(error.message);
      return;
    }
    setSent(true);
  }

  const inputClass =
    "bg-raised border-hairline text-ink placeholder:text-ink-faint focus-visible:ring-accent w-full rounded-lg border px-3 py-2.5 text-sm focus-visible:ring-2 focus-visible:outline-none";

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

      {sent ? (
        <>
          <h1 className="text-xl font-semibold tracking-tight">Check your email</h1>
          <p className="text-ink-muted mt-2 text-sm">
            If an account exists for{" "}
            <span className="text-ink font-medium break-all">{email}</span>, a
            reset link is on its way. Open it and you will be asked to choose a
            new password.
          </p>
          <p className="text-ink-faint mt-3 text-xs">
            Check spam if it has not arrived within a minute.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-xl font-semibold tracking-tight">Reset your password</h1>
          <p className="text-ink-muted mt-1 text-sm">
            Enter your email and we will send you a link.
          </p>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-ink-muted">Email</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </label>

            {notice && (
              <p role="alert" className="text-status-review text-sm">
                {notice}
              </p>
            )}

            <button
              type="submit"
              disabled={busy || !email}
              className="bg-accent text-app focus-visible:ring-accent mt-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:outline-none"
            >
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        </>
      )}

      <p className="text-ink-muted mt-6 text-center text-sm">
        <Link href="/login" className="text-ink underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
