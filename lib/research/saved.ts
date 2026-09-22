import { getServerSupabase } from "@/lib/supabase/server";
import type { Confidence, Region } from "@/types/research";
import type { ExtractorKind } from "@/lib/research/schema";

/*
  Reading saved research records. Same fallback discipline as every other data
  read in this project: never throw, never break the page — an unconfigured or
  unreachable database yields an empty list, not a crash.
*/

export type SavedResearch = {
  id: string;
  title: string;
  summary: string;
  category: string;
  region: Region;
  sourceUrl: string | null;
  verifiedOn: string | null;
  confidence: Confidence;
  extractor: ExtractorKind;
  promptVersion: string;
  createdAt: string;
};

type Row = {
  id: string;
  title: string;
  summary: string;
  category: string;
  region: string;
  source_url: string | null;
  verified_on: string | null;
  confidence: string;
  extractor: string;
  prompt_version: string;
  created_at: string;
};

const CONFIDENCES: Confidence[] = ["verified", "reported", "estimated"];

export async function getSavedResearch(limit = 12): Promise<SavedResearch[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("research_records")
      .select(
        "id, title, summary, category, region, source_url, verified_on, confidence, extractor, prompt_version, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      // Most likely the migration has not been run. An empty list with a
      // logged reason beats a 500 on a page whose other 90% is static.
      console.warn("[research] Could not read research_records:", error.message);
      return [];
    }

    return (data as Row[]).map((r) => ({
      id: r.id,
      title: r.title,
      summary: r.summary,
      category: r.category,
      region: r.region === "mexico" ? "mexico" : "global",
      sourceUrl: r.source_url,
      verifiedOn: r.verified_on,
      // Degrade to the weakest level rather than crashing on an unexpected
      // value — an over-stated confidence would be worse than an under-stated one.
      confidence: CONFIDENCES.includes(r.confidence as Confidence)
        ? (r.confidence as Confidence)
        : "estimated",
      extractor: r.extractor === "model" ? "model" : "heuristic",
      promptVersion: r.prompt_version,
      createdAt: r.created_at,
    }));
  } catch (error) {
    console.warn("[research] research_records unreachable:", error);
    return [];
  }
}
