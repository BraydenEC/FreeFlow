import { getServerSupabase } from "@/lib/supabase/server";
import type { ExtractorKind } from "@/lib/core/schema";

/*
  Reading saved outputs. Same fallback discipline as the Week 0 dashboard:
  never throw, never break the page — an unconfigured or unreachable database
  means an empty list, not a crash.
*/

export type SavedOutput = {
  id: string;
  projectName: string;
  client: string | null;
  hourlyRate: number | null;
  hoursLogged: number | null;
  deadline: string | null;
  status: string;
  confidenceNote: string;
  extractor: ExtractorKind;
  promptVersion: string;
  createdAt: string;
};

type Row = {
  id: string;
  project_name: string;
  client: string | null;
  hourly_rate: number | string | null;
  hours_logged: number | string | null;
  deadline: string | null;
  status: string;
  confidence_note: string;
  extractor: string;
  prompt_version: string;
  created_at: string;
};

/** Numeric columns may arrive as strings depending on serialization; coerce. */
function num(v: number | string | null): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function getSavedOutputs(limit = 8): Promise<SavedOutput[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("core_outputs")
      .select(
        "id, project_name, client, hourly_rate, hours_logged, deadline, status, confidence_note, extractor, prompt_version, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      // Most likely the migration has not been run yet. An empty list with a
      // logged reason beats a 500 on a page whose other half still works.
      console.warn("[core] Could not read core_outputs:", error.message);
      return [];
    }

    return (data as Row[]).map((r) => ({
      id: r.id,
      projectName: r.project_name,
      client: r.client,
      hourlyRate: num(r.hourly_rate),
      hoursLogged: num(r.hours_logged),
      deadline: r.deadline,
      status: r.status,
      confidenceNote: r.confidence_note,
      extractor: r.extractor === "model" ? "model" : "heuristic",
      promptVersion: r.prompt_version,
      createdAt: r.created_at,
    }));
  } catch (error) {
    console.warn("[core] core_outputs unreachable:", error);
    return [];
  }
}
