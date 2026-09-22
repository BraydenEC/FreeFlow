import { NextResponse } from "next/server";
import { NewProjectSchema, toRow } from "@/lib/projects/schema";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";

/*
  POST /api/projects — create one project for the signed-in user.

  Same discipline as every other write: re-validate on the server, refuse
  without a user, stamp user_id so RLS accepts the row. The first 400 message
  is returned flat so the form can show it next to the field.
*/

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }
  const user = await getSessionUser(supabase);
  if (!user) {
    return NextResponse.json({ error: "Sign in to add projects." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = NewProjectSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      {
        error: first?.message ?? "Invalid project.",
        field: first?.path?.[0] ?? null,
        issues: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: user.id, ...toRow(parsed.data) })
    .select("id")
    .single();

  if (error) {
    console.warn("[projects] Insert failed:", error.message);
    return NextResponse.json({ error: `Could not save: ${error.message}` }, { status: 500 });
  }
  return NextResponse.json({ id: data.id }, { status: 201 });
}
