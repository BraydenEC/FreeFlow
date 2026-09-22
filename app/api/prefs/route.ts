import { NextResponse } from "next/server";
import { parsePrefs } from "@/lib/prefs/schema";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";

/*
  PUT /api/prefs — save the signed-in user's preferences.

  The body is re-parsed with the same parsePrefs the client uses, so the row
  can only ever hold a valid, repaired preferences object. A malformed body is
  refused rather than repaired-and-saved, because "you sent garbage, so I reset
  your layout" is not a kindness.
*/

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  const supabase = await getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }
  const user = await getSessionUser(supabase);
  if (!user) {
    return NextResponse.json({ error: "Sign in to save preferences." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Expected a preferences object." }, { status: 400 });
  }

  const prefs = parsePrefs(body);
  const { error } = await supabase
    .from("user_prefs")
    .upsert({ user_id: user.id, prefs, updated_at: new Date().toISOString() });

  if (error) {
    console.warn("[prefs] Save failed:", error.message);
    return NextResponse.json({ error: `Could not save: ${error.message}` }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
