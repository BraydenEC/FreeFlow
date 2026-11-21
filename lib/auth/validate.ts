/*
  Sign-up and sign-in, checked before the server and explained after it.

  User testing (M14) sent "abc@", a 5-character password and a 300-character
  email straight to Supabase, whose replies were shown raw ("Unable to
  validate email address: invalid format"). These checks run in the browser
  first, and anything the server still says is reworded.
*/

export type AuthProblem = { field: "email" | "password"; message: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function authProblems(email: string, password: string, mode: "signup" | "login"): AuthProblem[] {
  const out: AuthProblem[] = [];
  const e = email.trim();
  if (!e) out.push({ field: "email", message: "Enter your email address." });
  else if (e.length > 254) out.push({ field: "email", message: "That email address is too long." });
  else if (!EMAIL.test(e)) out.push({ field: "email", message: "That doesn't look like an email address, like ana@gmail.com." });
  if (!password) out.push({ field: "password", message: "Enter your password." });
  else if (mode === "signup" && password.length < 6) out.push({ field: "password", message: "Use at least 6 characters." });
  return out;
}

export function friendlyAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return "That email and password don't match. Check them, or reset your password.";
  if (/already (registered|exists)/i.test(message)) return "There's already an account with that email. Sign in instead.";
  if (/too long/i.test(message)) return "That email address is too long.";
  if (/invalid format|validate email|invalid email/i.test(message)) return "That doesn't look like an email address, like ana@gmail.com.";
  if (/password should be|weak password|at least \d+ characters/i.test(message)) return "Use at least 6 characters.";
  if (/rate|too many|seconds/i.test(message)) return "Too many tries just now. Wait a minute and try again.";
  return "Something went wrong. Try again in a moment.";
}

/** L5: where to go after signing in. Only a path on this site, never another one. */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return "/dashboard";
  return next;
}

/** H2: a one-tap way into the inbox (spam folder) for the big providers. */
export function inboxLink(email: string): { label: string; href: string } | null {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (domain === "gmail.com" || domain === "googlemail.com") {
    return { label: "Open Gmail", href: "https://mail.google.com/mail/u/0/#spam" };
  }
  if (/^(outlook|hotmail|live|msn)\./.test(domain)) {
    return { label: "Open Outlook", href: "https://outlook.live.com/mail/0/junkemail" };
  }
  if (/^yahoo\./.test(domain)) return { label: "Open Yahoo Mail", href: "https://mail.yahoo.com/" };
  return null;
}

/** L1: "ana@" and "gmail.com", so a line can break only after the @. */
export function splitEmail(email: string): [string, string] {
  const at = email.indexOf("@");
  return at === -1 ? [email, ""] : [email.slice(0, at + 1), email.slice(at + 1)];
}

/** L9: the address waits in this tab, not in the URL. */
export const PENDING_EMAIL_KEY = "freeflow:pending-email";
