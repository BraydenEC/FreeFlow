"use client";

import { useSession } from "@/components/auth/SessionProvider";
import { COPY } from "@/lib/funnel/copy";

/*
  The demo's call to action. Signed out it is the one sign-up label (M10);
  signed in, offering to sign up again made no sense (L10), so it opens the
  dashboard and is not counted as a try-free click.
*/
export function useCta() {
  const user = useSession();
  return user
    ? { href: "/dashboard", label: "Open dashboard", signedIn: true }
    : { href: "/signup", label: COPY.tryFree, signedIn: false };
}
