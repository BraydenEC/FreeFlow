"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import FragmentSession from "@/components/auth/FragmentSession";
import Logo from "@/components/Logo";
import { authProblems, friendlyAuthError, PENDING_EMAIL_KEY, safeNext, type AuthProblem } from "@/lib/auth/validate";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { FEATURES_PAGE_ENABLED } from "@/lib/flags";

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
    cta: "Create a free account",
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
  // L5: a private page sent you here; go back to it afterwards.
  const next = safeNext(params.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [problems, setProblems] = useState<AuthProblem[]>([]);
  const problem = (field: AuthProblem["field"]) => problems.find((p) => p.field === field)?.message;

  function waitForConfirmation() {
    // L9: the address waits in this tab, not in the URL (history, analytics).
    try {
      window.sessionStorage.setItem(PENDING_EMAIL_KEY, email.trim());
    } catch {
      // Storage blocked: the confirm page still works, without the address.
    }
    router.push("/verify-email");
  }
  const [busy, setBusy] = useState(false);
  const copy = COPY[mode];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    // M14: checked here first, all at once, in plain words.
    const found = authProblems(email, password, mode);
    setProblems(found);
    if (found.length > 0) {
      document.getElementById(`auth-${found[0].field}`)?.focus();
      return;
    }

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("Accounts are not configured on this deployment.");
      return;
    }

    setBusy(true);
    const result =
      mode === "signup"
        ? await supabase.auth.signUp({
            email: email.trim(),
            password,
            // Send the confirmation link to the handler that can actually
            // write a session cookie, rather than to the bare site root.
            options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
          })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);

    if (result.error) {
      const message = result.error.message;
      // "Email not confirmed" is not a wrong password — it is an unfinished
      // sign-up, and the waiting room can resend the link.
      if (/not confirmed/i.test(message)) {
        waitForConfirmation();
        return;
      }
      setError(friendlyAuthError(message));
      return;
    }

    // Confirmation is on, so sign-up returns a user and no session.
    if (mode === "signup" && !result.data.session) {
      waitForConfirmation();
      return;
    }

    router.push(next);
    router.refresh();
  }

  const inputClass =
    "bg-raised border-hairline text-ink placeholder:text-ink-faint focus-visible:ring-accent aria-invalid:border-status-overdue w-full rounded-lg border px-3 py-2.5 text-base sm:text-sm focus-visible:ring-2 focus-visible:outline-none";

  return (
    <div className="border-hairline bg-surface w-full max-w-sm rounded-2xl border p-6 sm:p-8">
      <Link href="/" aria-label="FreeFlow home" className="mb-6 inline-flex">
        <Logo wordmark />
      </Link>

      <h1 className="text-xl font-semibold tracking-tight">{copy.title}</h1>
      <p className="text-ink-muted mt-1 text-sm">{copy.sub}</p>
      {params.get("next") && (
        <p role="status" className="border-hairline text-ink mt-4 rounded-lg border px-3 py-2 text-sm">
          {next === "/core" ? "Sign in to use Paste a brief." : "Sign in to see that page."} You&rsquo;ll go straight back to it.
        </p>
      )}

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
            id="auth-email"
            type="email"
            name="email"
            autoComplete="email"
            autoFocus
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
              setProblems((list) => list.filter((p) => p.field !== "email"));
            }}
            aria-invalid={problem("email") ? true : undefined}
            aria-describedby={problem("email") ? "auth-email-error" : undefined}
            className={inputClass}
          />
          {problem("email") && (
            <span id="auth-email-error" className="text-status-overdue text-xs">
              {problem("email")}
            </span>
          )}
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-ink-muted">Password</span>
          <input
            type="password"
            name="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            id="auth-password"
            minLength={6}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
              setProblems((list) => list.filter((p) => p.field !== "password"));
            }}
            aria-invalid={problem("password") ? true : undefined}
            aria-describedby={problem("password") ? "auth-password-error" : undefined}
            className={inputClass}
          />
          {problem("password") && (
            <span id="auth-password-error" className="text-status-overdue text-xs">
              {problem("password")}
            </span>
          )}
          {mode === "signup" ? (
            <span className="text-ink-faint text-xs">At least 6 characters.</span>
          ) : (
            <Link
              href="/forgot-password"
              className="text-ink-faint hover:text-ink self-start text-xs underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          )}
        </label>

        {error && (
          <p role="alert" className="text-status-overdue text-sm">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="bg-accent text-app focus-visible:ring-accent mt-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:outline-none"
        >
          {busy ? copy.busy : copy.cta}
        </button>
        {mode === "signup" && (
          // M5: sign-up had no consent line and nowhere to read the terms.
          <p className="text-ink-faint text-center text-xs">
            By creating an account you agree to the{" "}
            <Link href="/terms" className="text-ink-muted underline underline-offset-2">Terms</Link> and{" "}
            <Link href="/privacy" className="text-ink-muted underline underline-offset-2">Privacy policy</Link>.
          </p>
        )}
      </form>

      <p className="text-ink-muted mt-6 text-center text-sm">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href={params.get("next") ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="text-ink underline-offset-4 hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href={params.get("next") ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="text-ink underline-offset-4 hover:underline">
              Create a free account
            </Link>
          </>
        )}
      </p>

      <p className="text-ink-faint mt-4 text-center text-xs">
        <Link href="/demo" className="underline-offset-4 hover:underline">Tour</Link>
        {" · "}
        {FEATURES_PAGE_ENABLED ? (
          <Link href="/features" className="underline-offset-4 hover:underline">Features</Link>
        ) : (
          <Link href="/product" className="underline-offset-4 hover:underline">Product</Link>
        )}
        {" · "}
        <Link href="/pricing" className="underline-offset-4 hover:underline">Pricing</Link>
      </p>
    </div>
  );
}
