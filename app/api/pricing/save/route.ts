import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";
import { computePricing, money } from "@/lib/pricing/model";

/*
  POST /api/pricing/save

  Recomputes the scenario server-side before storing it. The client sends its
  own mrr/arr, and they are checked rather than trusted — a saved figure that
  disagrees with the model is either a stale client or a tampered request, and
  either way storing it would put an unverifiable number in the database.
*/

export const dynamic = "force-dynamic";

const InputsSchema = z.object({
  freelancers: z.number().finite(),
  studios: z.number().finite(),
  seatsPerStudio: z.number().finite(),
  freelancerPaidShare: z.number().finite(),
  monthlyChurn: z.number().finite(),
  monthlyGrowth: z.number().finite(),
  annualDiscount: z.number().finite(),
  annualShare: z.number().finite(),
});

const SaveSchema = z.object({
  name: z.string().trim().min(1).max(120),
  scenario: z.enum(["conservative", "base", "optimistic"]),
  inputs: InputsSchema,
  mrr: z.number().finite().nonnegative(),
  arr: z.number().finite().nonnegative(),
});

export async function POST(request: Request) {
  // Auth is the first gate. Validating a payload we would refuse anyway tells
  // an anonymous caller which fields exist; "sign in" is the honest answer and
  // the cheaper one.
  const supabase = await getServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Database is not configured on the server." },
      { status: 503 },
    );
  }

  // Writes belong to someone. Public pages may read; only accounts save.
  const user = await getSessionUser(supabase);
  if (!user) {
    return NextResponse.json({ error: "Sign in to save." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = SaveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid scenario.",
        issues: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      },
      { status: 400 },
    );
  }

  // Recompute rather than trust. Same model the client used, run again here.
  const recomputed = computePricing(parsed.data.inputs);
  if (
    Math.abs(recomputed.mrr - parsed.data.mrr) > 0.02 ||
    Math.abs(recomputed.arr - parsed.data.arr) > 0.02
  ) {
    return NextResponse.json(
      {
        error:
          "Submitted figures do not match a server-side recomputation of the inputs. Nothing was saved.",
        expected: { mrr: recomputed.mrr, arr: recomputed.arr },
        received: { mrr: parsed.data.mrr, arr: parsed.data.arr },
      },
      { status: 409 },
    );
  }

  const { data, error } = await supabase
    .from("pricing_scenarios")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      scenario: parsed.data.scenario,
      inputs: parsed.data.inputs,
      mrr: money(recomputed.mrr),
      arr: money(recomputed.arr),
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: `Could not save: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
