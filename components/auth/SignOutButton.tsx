"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export default function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setBusy(true);
    await supabase.auth.signOut();
    // L5: signing out landed on "Create your account". Home is where you left from.
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className="text-ink-faint hover:text-ink flex min-h-11 items-center px-2 text-xs underline-offset-4 hover:underline disabled:opacity-40 sm:min-h-0"
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
