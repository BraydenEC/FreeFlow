"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

/*
  Browser-side Supabase client. Used only by the auth forms and the sign-out
  button — everything else goes through API routes so the payload is
  re-validated on the server.

  One instance per tab; the ssr package writes the session into cookies the
  server client can read.
*/

let cached: SupabaseClient | null | undefined;

export function getBrowserSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const env = getSupabaseEnv();
  cached = env ? createBrowserClient(env.url, env.anonKey) : null;
  return cached;
}
