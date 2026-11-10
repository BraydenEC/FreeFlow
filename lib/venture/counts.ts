import type { SupabaseClient } from "@supabase/supabase-js";

/*
  The public numbers behind /dashboard's "FreeFlow in public" tab and the
  /docs roadmap votes.

  One RPC, venture_counts(), a security-definer SQL function that returns
  aggregate counts only, never rows (supabase/week6_venture.sql). Null when
  there is no database or the call fails, so pages can say "unavailable"
  rather than show zeros that look real.
*/

export type VentureCounts = {
  users: number;
  launchList: number;
  tryFreeClicks: number;
  roundsPlayed: number;
  votes: Record<string, number>;
};

const count = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : 0);

export async function getVentureCounts(supabase: SupabaseClient | null): Promise<VentureCounts | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.rpc("venture_counts");
    if (error || !data || typeof data !== "object") return null;
    const d = data as Record<string, unknown>;
    const votes: Record<string, number> = {};
    if (d.votes && typeof d.votes === "object") {
      for (const [id, n] of Object.entries(d.votes as Record<string, unknown>)) votes[id] = count(n);
    }
    return {
      users: count(d.users),
      launchList: count(d.launchList),
      tryFreeClicks: count(d.tryFreeClicks),
      roundsPlayed: count(d.roundsPlayed),
      votes,
    };
  } catch {
    return null;
  }
}
