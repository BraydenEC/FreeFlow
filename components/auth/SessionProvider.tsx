"use client";

import { createContext, useContext } from "react";
import type { SessionUser } from "@/lib/supabase/server";

/*
  Who is signed in, made available to client components.

  The root layout resolves the user once on the server and passes it down.
  Client components never query auth themselves — they read this. That keeps
  one source of truth per request and means the sidebar renders the right
  state on the server, with no "signed out" flicker before hydration.
*/

const SessionContext = createContext<SessionUser | null>(null);

export function SessionProvider({
  user,
  children,
}: {
  user: SessionUser | null;
  children: React.ReactNode;
}) {
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}

/** The signed-in user, or null on public pages when nobody is signed in. */
export function useSession(): SessionUser | null {
  return useContext(SessionContext);
}
