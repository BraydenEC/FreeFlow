"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";

/*
  Choose a new password.

  Reached only by clicking a recovery link, which signs the user in before
  they arrive — that session is what authorises the change, so this form asks
  for the new password and not the old one.

  If there is no session, the link was expired, already used, or the page was
  opened directly. That is said plainly with a way forward, rather than
  showing a form that would fail on submit.

  The session check runs in an effect but only ever calls setState from
  inside the async callback, which is the pattern the lint rule allows. It
  starts as "checking" so the form is never shown and then yanked away.
*/

export default function ResetPasswordForm() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionState, setSessionState] = useState<"checking" | "ok" | "missing">(
    "checking",
  );

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    let cancelled = false;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setSessionState(data.session ? "ok" : "missing");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("Accounts are not configured on this deployment.");
      return;
    }

    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
    router.refresh();
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

      {done ? (
        <>
          <h1 className="text-xl font-semibold tracking-tight">Password changed</h1>
          <p className="text-ink-muted mt-2 text-sm">
            You are signed in with the new password.
          </p>
          <Link
            href="/"
            className="bg-accent text-app mt-6 inline-block rounded-lg px-4 py-2.5 text-sm font-semibold"
          >
            Go to dashboard
          </Link>
        </>
      ) : sessionState === "missing" ? (
        <>
          <h1 className="text-xl font-semibold tracking-tight">This link has expired</h1>
          <p className="text-ink-muted mt-2 text-sm">
            Reset links can only be used once, and they do not last long. Request
            a fresh one and it will work.
          </p>
          <Link
            href="/forgot-password"
            className="bg-accent text-app mt-6 inline-block rounded-lg px-4 py-2.5 text-sm font-semibold"
          >
            Send a new link
          </Link>
        </>
      ) : (
        <>
          <h1 className="text-xl font-semibold tracking-tight">Choose a new password</h1>
          <p className="text-ink-muted mt-1 text-sm">
            At least 6 characters. You will stay signed in.
          </p>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-ink-muted">New password</span>
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-ink-muted">Confirm new password</span>
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputClass}
              />
            </label>

            {error && (
              <p role="alert" className="text-status-overdue text-sm">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy || !password || !confirm || sessionState !== "ok"}
              className="bg-accent text-app focus-visible:ring-accent mt-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:outline-none"
            >
              {busy ? "Saving…" : "Change password"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
