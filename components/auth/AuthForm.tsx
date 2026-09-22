"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import FragmentSession from "@/components/auth/FragmentSession";
import { getBrowserSupabase } from "@/lib/supabase/browser";

/*
  One form for both sign-up and sign-in; the mode changes the verb and the
  footer link. Supabase's error messages are already user-facing strings
  ("Invalid login credentials", "Password should be at least 6 characters"),
  so they are shown as-is rather than mapped.

  After success: push to the dashboard and refresh, so the server re-reads the
  new session cookie and the sidebar shows the account. Without the refresh
  the client cache would keep rendering the signed-out tree.

  Sign-up does not produce a session, because this project keeps email
  confirmation on. It hands off to /verify-email instead, which is a waiting
  room rather than an error — the account was created; it is simply not usable
  until a link is clicked.
*/

type Mode = "signup" | "login";

const COPY: Record<Mode, { title: string; sub: string; cta: string; busy: string }> = {
  signup: {
    title: "Create your account",
    sub: "A clean dashboard, your projects only. Takes ten seconds.",
    cta: "Create account",
    busy: "Creating…",
  },
  login: {
    title: "Welcome back",
    sub: "Sign in to see your projects.",
    cta: "Sign in",
    busy: "Signing in…",
  },
};

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  // /auth/confirm redirects here with ?error= when a link is expired or reused.
  const linkError = params.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const copy = COPY[mode];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("Accounts are not configured on this deployment.");
      return;
    }

    setBusy(true);
    const result =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            // Send the confirmation link to the handler that can actually
            // write a session cookie, rather than to the bare site root.
            options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
          })
        : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);

    if (result.error) {
      const message = result.error.message;
      // "Email not confirmed" is not a wrong password — it is an unfinished
      // sign-up, and the waiting room can resend the link.
      if (/not confirmed/i.test(message)) {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(message);
      return;
    }

    // Confirmation is on, so sign-up returns a user and no session.
    if (mode === "signup" && !result.data.session) {
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      return;
    }

    router.push("/");
    router.refresh();
  }

  const inputClass =
    "bg-raised border-hairline text-ink placeholder:text-ink-faint focus-visible:ring-accent w-full rounded-lg border px-3 py-2.5 text-sm focus-visible:ring-2 focus-visible:outline-none";

  return (
    <div className="border-hairline bg-surface w-full max-w-sm rounded-2xl border p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-2.5">
        <span className="bg-ink text-app flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold">
          S
        </span>
        <span className="text-[15px] font-semibold tracking-tight">
          Service<span className="text-ink-muted">Pro</span>
        </span>
      </div>

      <h1 className="text-xl font-semibold tracking-tight">{copy.title}</h1>
      <p className="text-ink-muted mt-1 text-sm">{copy.sub}</p>

      {/* Catches a session arriving in the URL fragment (default email template). */}
      <FragmentSession />

      {linkError && (
        <p role="alert" className="text-status-review mt-4 text-sm">
          {linkError}
        </p>
      )}

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
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-ink-muted">Password</span>
          <input
            type="password"
            name="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
          {mode === "signup" && (
            <span className="text-ink-faint text-xs">At least 6 characters.</span>
          )}
        </label>

        {error && (
          <p role="alert" className="text-status-overdue text-sm">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !email || !password}
          className="bg-accent text-app focus-visible:ring-accent mt-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:outline-none"
        >
          {busy ? copy.busy : copy.cta}
        </button>
      </form>

      <p className="text-ink-muted mt-6 text-center text-sm">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-ink underline-offset-4 hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="text-ink underline-offset-4 hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>

      <p className="text-ink-faint mt-4 text-center text-xs">
        <Link href="/research" className="underline-offset-4 hover:underline">Research</Link>
        {" · "}
        <Link href="/pricing" className="underline-offset-4 hover:underline">Pricing</Link>
        {" · "}
        <Link href="/product" className="underline-offset-4 hover:underline">Product</Link>
      </p>
    </div>
  );
}
