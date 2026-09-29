import { getServerSupabase } from "@/lib/supabase/server";
import type { ContentKind, Provenance } from "./types";

/*
  Reading saved marketing assets. Same fallback discipline as the other data
  reads: an unconfigured or unreachable database (or a migration not yet run)
  yields an empty list, never a crash on a page whose rest is static.
*/

export type SavedAsset = {
  id: string;
  kind: ContentKind;
  content: Record<string, unknown>;
  extractor: Provenance;
  createdAt: string;
};

type Row = {
  id: string;
  kind: string;
  content: Record<string, unknown>;
  extractor: string;
  created_at: string;
};

const KINDS: ContentKind[] = ["post", "script", "calendar", "headline"];

export async function getSavedMarketing(limit = 12): Promise<SavedAsset[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("marketing_assets")
      .select("id, kind, content, extractor, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.warn("[marketing] Could not read marketing_assets:", error.message);
      return [];
    }

    return (data as Row[]).map((r) => ({
      id: r.id,
      kind: KINDS.includes(r.kind as ContentKind)
        ? (r.kind as ContentKind)
        : "post",
      content: r.content ?? {},
      extractor: r.extractor === "model" ? "model" : "heuristic",
      createdAt: r.created_at,
    }));
  } catch (error) {
    console.warn("[marketing] marketing_assets unreachable:", error);
    return [];
  }
}
