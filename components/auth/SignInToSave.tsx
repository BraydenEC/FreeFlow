"use client";

import Link from "next/link";

/*
  Replaces a Save button on public pages when nobody is signed in. Reading
  stays open; writing needs an owner. Says why, and where to go.
*/
export default function SignInToSave({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/login"
      className={`border-hairline text-ink-muted hover:text-ink hover:border-ink-faint inline-flex items-center rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors ${className}`}
    >
      Sign in to save
    </Link>
  );
}
