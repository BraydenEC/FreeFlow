/*
  Sign-up and sign-in tests (M14, L5, H2, L1 in docs/user-testing/USER_TESTING_HANDOFF.md).
  Run: npm run test:auth
*/

import { authProblems, friendlyAuthError, inboxLink, safeNext, splitEmail } from "@/lib/auth/validate";

let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean, detail = "") {
  if (condition) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}${detail ? "  —  " + detail : ""}`);
  }
}

// ── M14: checked in the browser, in plain words ────────────────────────────
assert("abc@ is refused before it reaches the server", authProblems("abc@", "secret1", "signup").some((p) => p.field === "email"));
assert("a 5-character password is refused on sign-up", authProblems("ana@gmail.com", "12345", "signup").some((p) => p.field === "password"));
assert("a short password is fine on sign-in (the server decides)", authProblems("ana@gmail.com", "12345", "login").length === 0);
assert("a 300-character email is refused", authProblems(`${"a".repeat(290)}@gmail.com`, "secret1", "signup").some((p) => /too long/.test(p.message)));
assert("both problems are reported at once", authProblems("", "", "signup").length === 2);
assert("a good sign-up has no problems", authProblems(" ana@gmail.com ", "secret1", "signup").length === 0);
const raw = [
  "Unable to validate email address: invalid format",
  "An email address is too long",
  "Invalid login credentials",
  "User already registered",
  "Password should be at least 6 characters.",
  "For security purposes, you can only request this after 42 seconds.",
  "some new internal error",
];
for (const m of raw) {
  const f = friendlyAuthError(m);
  assert(`raw server text is reworded: ${m}`, f !== m && !/validate|registered|internal/i.test(f), f);
}
assert("wrong password says what to do", /reset/i.test(friendlyAuthError("Invalid login credentials")));

// ── L5: back to the page you came from, and only to this site ─────────────
assert("next=/brief returns to /brief", safeNext("/brief") === "/brief");
assert("no next goes to the dashboard", safeNext(null) === "/dashboard");
assert("another site is refused", safeNext("https://evil.example") === "/dashboard" && safeNext("//evil.example") === "/dashboard");
assert("a backslash trick is refused", safeNext("/\\evil.example") === "/dashboard");

// ── H2: open the inbox, spam folder first ─────────────────────────────────
assert("gmail gets an Open Gmail link", inboxLink("ana@gmail.com")?.label === "Open Gmail");
assert("outlook and hotmail get Outlook", inboxLink("a@hotmail.com")?.label === "Open Outlook" && inboxLink("a@outlook.com")?.label === "Open Outlook");
assert("an unknown provider gets no link", inboxLink("a@studio.mx") === null);

// ── L1: break the address only after the @ ────────────────────────────────
assert("split at the @", JSON.stringify(splitEmail("ana.lopez@gmail.com")) === JSON.stringify(["ana.lopez@", "gmail.com"]));
assert("no @ stays whole", JSON.stringify(splitEmail("broken")) === JSON.stringify(["broken", ""]));

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
