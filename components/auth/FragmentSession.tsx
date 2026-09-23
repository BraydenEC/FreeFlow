"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";

/*
  Catches a session delivered in the URL fragment.

  Supabase's default confirmation email sends the browser to the site with
  `#access_token=...` attached. A fragment never reaches the server, so the
  proxy and every Server Component are blind to it — only the browser client
  can see it, and it does, automatically, on construction
  (detectSessionInUrl). Constructing the client is therefore the whole job;
  this component waits for the result and moves on.

  With the recommended TokenHash email template this never fires: /auth/confirm
  verifies on the server before any page renders. It exists so the default
  template also works instead of failing in a way that looks like a broken site.

  The fragment is read through useSyncExternalStore, not an effect. The URL is
  external state, the server cannot see it, and reading it in an effect to call
  setState is the cascading-render pattern the lint rule rejects — the same
  conclusion the preferences store reached for localStorage.
*/

// The fragment is fixed for the life of the page load; nothing to subscribe to.
const noopSubscribe = () => () => {};

function readFragment(): boolean {
  if (typeof window === "undefined") return false;
  const hash = window.location.hash;
  return hash.includes("access_token") || hash.includes("error_description");
}

export default function FragmentSession() {
  const router = useRouter();
  const hasFragment = useSyncExternalStore(noopSubscribe, readFragment, () => false);
  // Only ever set from inside an async callback, never during the effect body.
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!hasFragment) return;
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    // Supabase marks the purpose in the fragment. A recovery link has to end
    // at the password form, not the dashboard.
    const isRecovery = window.location.hash.includes("type=recovery");
    let cancelled = false;
    void (async () => {
      // The client consumed the fragment as it was constructed; read the result.
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      // Strip the fragment either way, so a refresh cannot replay it.
      window.history.replaceState(null, "", window.location.pathname);
      if (data.session) {
        router.replace(isRecovery ? "/reset-password" : "/");
        router.refresh();
      } else {
        setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasFragment, router]);

  if (!hasFragment || failed) return null;

  return (
    <p className="text-ink-muted mt-4 text-sm" role="status">
      Signing you in…
    </p>
  );
}
