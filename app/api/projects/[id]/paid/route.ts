import { NextResponse } from "next/server";
import { z } from "zod";
import { isRealCalendarDate } from "@/lib/projects/schema";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";

/*
  POST /api/projects/[id]/paid — record that a project has been paid.

  The dashboard has computed "This Month's Earnings" from is_paid and paid_at
  since Week 0, and until now there was no way to set either without opening
  the database by hand. For an invoice tracker that is the most common action
  there is.

  Two columns move together because the table refuses to let them disagree:

    constraint paid_requires_date
      check ((is_paid = false and paid_at is null)
          or (is_paid = true  and paid_at is not null))

  So paid_at is always sent. It defaults to today rather than being guessed,
  and can be overridden for a payment that landed earlier — a freelancer
  reconciling a week late should not have the month's earnings attributed to
  the wrong month.

  Ownership is enforced by RLS plus an explicit user_id filter: a request for
  someone else's project updates zero rows and returns 404 rather than
  confirming that the id exists.
*/

export const dynamic = "force-dynamic";



const Body = z
  .object({
    paid_at: z
      .string()
      .refine(isRealCalendarDate, "paid_at must be a real date, YYYY-MM-DD")
      .optional(),
  })
  .optional();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }
  const user = await getSessionUser(supabase);
  if (!user) {
    return NextResponse.json({ error: "Sign in to update projects." }, { status: 401 });
  }

  const { id } = await params;

  // A body is optional — "mark it paid today" is the common case.
  let raw: unknown = undefined;
  try {
    const text = await request.text();
    raw = text ? JSON.parse(text) : undefined;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const paidAt = parsed.data?.paid_at ?? new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("projects")
    .update({ is_paid: true, paid_at: paidAt })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.warn("[projects] Mark paid failed:", error.message);
    return NextResponse.json({ error: `Could not update: ${error.message}` }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({ id: data.id, paid_at: paidAt });
}
