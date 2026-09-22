import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";
import { RESEARCH_PROMPT_VERSION } from "@/lib/research/prompt";
import {
  RESEARCH_CATEGORIES,
  RESEARCH_CONFIDENCE,
  RESEARCH_REGIONS,
} from "@/lib/research/schema";

/*
  POST /api/research/save

  Persists a structured record to research_records.

  Unlike the extract route, this one reports failure honestly rather than
  degrading: a save that silently does nothing is worse than an error, because
  the user believes their work was kept.
*/

export const dynamic = "force-dynamic";

const SaveSchema = z.object({
  raw_input: z.string().trim().min(1).max(8000),
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().min(1).max(2000),
  category: z.enum(RESEARCH_CATEGORIES),
  region: z.enum(RESEARCH_REGIONS),
  source_url: z.string().trim().url().nullable(),
  confidence: z.enum(RESEARCH_CONFIDENCE),
  extractor: z.enum(["model", "heuristic"]),
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
        error: "Invalid record.",
        issues: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      },
      { status: 400 },
    );
  }

  // Mirrors the database CHECK constraint. Enforced in both places on purpose:
  // the database guarantees it, and this returns a message a person can act on.
  if (parsed.data.confidence === "verified" && !parsed.data.source_url) {
    return NextResponse.json(
      {
        error:
          "A record cannot be marked verified without a source URL. Set confidence to reported or estimated instead.",
      },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("research_records")
    .insert({
      user_id: user.id,
      raw_input: parsed.data.raw_input,
      title: parsed.data.title,
      summary: parsed.data.summary,
      category: parsed.data.category,
      region: parsed.data.region,
      source_url: parsed.data.source_url,
      verified_on: parsed.data.source_url
        ? new Date().toISOString().slice(0, 10)
        : null,
      confidence: parsed.data.confidence,
      extractor: parsed.data.extractor,
      prompt_version: RESEARCH_PROMPT_VERSION,
    })
    .select("id")
    .single();

  if (error) {
    // Surfaced verbatim — when this failed during Week 1 testing the message
    // named the exact missing table, which is what made it a two-minute fix.
    return NextResponse.json(
      { error: `Could not save: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
