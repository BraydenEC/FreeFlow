import { NextResponse } from "next/server";
import { FunnelEventSchema } from "@/lib/venture/schemas";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { getServerSupabase } from "@/lib/supabase/server";

/*
  POST /api/funnel: record one anonymous /demo funnel event (a "Try free"
  click, a game round, the story read to the end, the night sorted).

  Fire-and-forget from the browser: the page never waits on this and never
  breaks when it fails. Order follows /api/chat/session: rate limit, database
  check, then the body. No account is needed; the table takes inserts from
  anyone and lets nobody read rows back (supabase/week6_venture.sql).
*/

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { ok, retryAfterMs } = rateLimit(clientKey(request, "funnel"), {
    limit: 60,
    windowMs: 60_000,
  });
  if (!ok) {
    return NextResponse.json(
      { saved: false },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  const supabase = await getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ saved: false }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ saved: false }, { status: 400 });
  }

  const parsed = FunnelEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ saved: false }, { status: 400 });
  }

  const { event, job, visitId } = parsed.data;
  const { error } = await supabase
    .from("funnel_events")
    .insert({ event, job: job ?? null, visit_id: visitId });

  // No unique constraint here today, but a duplicate is never an error.
  if (error?.code === "23505") {
    return NextResponse.json({ saved: true, already: true }, { status: 200 });
  }
  if (error) {
    console.warn("[funnel] Event save failed:", error.message);
    return NextResponse.json({ saved: false }, { status: 503 });
  }
  return NextResponse.json({ saved: true }, { status: 200 });
}
