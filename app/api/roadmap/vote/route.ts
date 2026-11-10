import { NextResponse } from "next/server";
import { VoteSchema } from "@/lib/venture/schemas";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { getServerSupabase } from "@/lib/supabase/server";

/*
  POST /api/roadmap/vote: one upvote for a V2 roadmap item on /docs.

  One vote per item per browser, keyed by an anonymous uuid the browser keeps.
  That is a courtesy, not a security boundary: clearing storage gives a new
  key. A second vote from the same key hits the primary key and reads as
  success ("already voted"). Counts are only ever read through the aggregate
  venture_counts() function.
*/

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { ok, retryAfterMs } = rateLimit(clientKey(request, "roadmap-vote"), {
    limit: 20,
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

  const parsed = VoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ saved: false }, { status: 400 });
  }

  const { itemId, voterKey } = parsed.data;
  const { error } = await supabase
    .from("roadmap_votes")
    .insert({ item_id: itemId, voter_key: voterKey });

  if (error?.code === "23505") {
    return NextResponse.json({ saved: true, already: true }, { status: 200 });
  }
  if (error) {
    console.warn("[roadmap] Vote save failed:", error.message);
    return NextResponse.json({ saved: false }, { status: 503 });
  }
  return NextResponse.json({ saved: true }, { status: 200 });
}
