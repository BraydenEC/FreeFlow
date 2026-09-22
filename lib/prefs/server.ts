import { parsePrefs, type Prefs } from "@/lib/prefs/schema";
import type { ServerSupabase } from "@/lib/supabase/server";

/*
  Server-side read of a user's saved preferences.

  Returns null when there is no row — the caller treats that as "first visit
  since accounts existed" and pushes the browser's local prefs up. Returns
  defaults (via parsePrefs) when the row exists but does not match the schema,
  so a hand-edited or outdated row can never break the page.
*/
export async function getUserPrefs(
  supabase: ServerSupabase | null,
  userId: string,
): Promise<Prefs | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("user_prefs")
      .select("prefs")
      .eq("user_id", userId)
      .maybeSingle();
    if (error || !data) return null;
    return parsePrefs(data.prefs);
  } catch {
    return null;
  }
}
