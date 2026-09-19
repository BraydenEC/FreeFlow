import { getSupabaseClient } from "@/lib/supabase";
import type { PricingInputs, ScenarioId } from "@/types/pricing";

/*
  Reading saved scenarios. Same fallback discipline as every other data read in
  this project: never throw, never break the page.
*/

export type SavedScenario = {
  id: string;
  name: string;
  scenario: ScenarioId;
  inputs: PricingInputs;
  mrr: number;
  arr: number;
  createdAt: string;
};

type Row = {
  id: string;
  name: string;
  scenario: string;
  inputs: PricingInputs;
  mrr: number | string;
  arr: number | string;
  created_at: string;
};

const SCENARIOS: ScenarioId[] = ["conservative", "base", "optimistic"];

function num(v: number | string): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function getSavedScenarios(limit = 10): Promise<SavedScenario[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("pricing_scenarios")
      .select("id, name, scenario, inputs, mrr, arr, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.warn("[pricing] Could not read pricing_scenarios:", error.message);
      return [];
    }

    return (data as Row[]).map((r) => ({
      id: r.id,
      name: r.name,
      scenario: SCENARIOS.includes(r.scenario as ScenarioId)
        ? (r.scenario as ScenarioId)
        : "base",
      inputs: r.inputs,
      mrr: num(r.mrr),
      arr: num(r.arr),
      createdAt: r.created_at,
    }));
  } catch (error) {
    console.warn("[pricing] pricing_scenarios unreachable:", error);
    return [];
  }
}
