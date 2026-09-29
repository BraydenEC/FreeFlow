import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";

/*
  POST /api/marketing/save — persist one chosen marketing asset.

  Auth is the first thing checked, before the body is even read: a logged-out
  request gets 401, not a 400 that leaks the expected payload shape (the bug
  fixed in the Week 3 save routes). Then the payload is re-validated server-side,
  because RLS controls who may write, not what.
*/

export const dynamic = "force-dynamic";

const SaveRequestSchema = z.object({
  kind: z.enum(["post", "script", "calendar", "headline"]),
  extractor: z.enum(["model", "heuristic"]),
  // Shape varies by kind; stored as jsonb. Bounded so a save cannot be used to
  // write an unbounded blob.
  content: z.record(z.string(), z.unknown()),
});

export async function POST(request: Request) {
  const supabase = await getServerSupabase();

  if (!supabase) {
    return NextResponse.json(
      { error: "Database is not configured on this deployment." },
      { status: 503 },
    );
  }

  // Auth first — before reading the body.
  const user = await getSessionUser(supabase);
  if (!user) {
    return NextResponse.json({ error: "Sign in to save." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = SaveRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Payload did not match the expected shape.",
        issues: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  const { kind, extractor, content } = parsed.data;

  const { data, error } = await supabase
    .from("marketing_assets")
    .insert({ user_id: user.id, kind, extractor, content })
    .select("id")
    .single();

  if (error) {
    console.warn("[marketing] Save failed:", error.message);
    return NextResponse.json(
      { error: `Could not save: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
