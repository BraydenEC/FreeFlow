/*
  Supabase credentials, read in one place.

  Both variables are NEXT_PUBLIC_ because the anon key is designed to be public
  and every table is guarded by RLS (see supabase/*.sql). The service_role key
  must never appear here — it bypasses row-level security entirely.

  Empty strings count as missing: .env.local ships with the keys present but
  blank, which would otherwise pass an undefined check and fail later inside
  createClient with a much less obvious message.
*/
export function getSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

/** True when both credentials are present. Used for log messages, not control flow. */
export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}
