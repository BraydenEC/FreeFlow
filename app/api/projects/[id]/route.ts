import { NextResponse } from "next/server";
import { NewProjectSchema, toUpdateRow } from "@/lib/projects/schema";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";

/*
  PATCH  /api/projects/[id] — correct a project.
  DELETE /api/projects/[id] — remove one.

  Until now a project could be created and never corrected. A typo in a client
  name or a wrong fee meant editing the database by hand, which is not a thing
  a user can do.

  Both verbs filter on user_id as well as id. RLS already restricts the rows,
  but the explicit filter means someone else's id updates zero rows and comes
  back 404 rather than confirming that the id exists.

  PATCH validates the whole object with the same schema the create route uses,
  so an edit cannot put a project into a state a new project could not have
  been created in. It writes through toUpdateRow, which excludes is_paid and
  paid_at — payment is owned by the mark-paid route, and an edit must not be
  able to quietly take money back out of the monthly earnings figure.
*/

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }
  const user = await getSessionUser(supabase);
  if (!user) {
    return NextResponse.json({ error: "Sign in to edit projects." }, { status: 401 });
  }

  const { id } = await params;

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
    .update(toUpdateRow(parsed.data))
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.warn("[projects] Update failed:", error.message);
    return NextResponse.json({ error: `Could not save: ${error.message}` }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }
  return NextResponse.json({ id: data.id });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }
  const user = await getSessionUser(supabase);
  if (!user) {
    return NextResponse.json({ error: "Sign in to delete projects." }, { status: 401 });
  }

  const { id } = await params;

  // .select() so a delete that matched nothing is distinguishable from one
  // that worked. Without it PostgREST reports success either way, and
  // "deleted" on a row that was never yours is a lie.
  const { data, error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.warn("[projects] Delete failed:", error.message);
    return NextResponse.json({ error: `Could not delete: ${error.message}` }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }
  return NextResponse.json({ id: data.id });
}
