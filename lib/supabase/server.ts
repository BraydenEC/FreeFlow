import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

/*
  Server-side Supabase client — one per request, aware of the session cookie.

  This replaces the process-wide anon client from Weeks 0–3. Under per-user RLS
  a client with no session sees nothing, so every server read and write must be
  made *as the signed-in user*. The session lives in cookies; this client reads
  them and, where it can, writes refreshed tokens back.

  Null-safe for the same reason the old client was: missing credentials must
  never fail the build. The app renders mock data instead.
*/

export type ServerSupabase = SupabaseClient;

export async function getServerSupabase(): Promise<ServerSupabase | null> {
  const env = getSupabaseEnv();
  if (!env) return null;

  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        // Server Components cannot set cookies; only Route Handlers and Server
        // Actions can. The proxy refreshes the session on every request, so a
        // failed write here is expected and safe to ignore.
        try {
          for (const { name, value, options } of toSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          /* read-only context */
        }
      },
    },
  });
}

export type SessionUser = { id: string; email: string | null };

/**
  The signed-in user, or null. `getUser()` validates the token against
  Supabase rather than trusting the cookie's claims, which is what makes it
  safe to use for authorisation on the server.
*/
export async function getSessionUser(
  supabase: ServerSupabase | null,
): Promise<SessionUser | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return { id: data.user.id, email: data.user.email ?? null };
  } catch {
    return null;
  }
}
