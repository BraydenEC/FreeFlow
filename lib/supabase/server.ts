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
        // Actions can. The proxy refreshes the session on every route that
        // reads it, so a failed write here is expected and safe to ignore.
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
  The signed-in user, or null. `getClaims()` verifies the session token's
  signature against the project's public keys (cached, so usually no network
  call), unlike `getSession()`, which trusts the cookie. That makes it safe for
  authorisation on the server, and it is the same token RLS checks anyway.
*/
export async function getSessionUser(
  supabase: ServerSupabase | null,
): Promise<SessionUser | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getClaims();
    const claims = data?.claims;
    if (error || !claims?.sub) return null;
    return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : null };
  } catch {
    return null;
  }
}
