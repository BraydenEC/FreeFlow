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
    router.push("/signup");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className="text-ink-faint hover:text-ink text-[11px] underline-offset-4 hover:underline disabled:opacity-40"
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
