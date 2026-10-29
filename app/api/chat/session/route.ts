import { NextResponse } from "next/server";
import { SessionRequestSchema } from "@/lib/chat/schema";
import { canWrite, firstMessage, needsTranscript, outcomeFor, replay } from "@/lib/chat/session";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";

/*
  POST /api/chat/session — save one /chat conversation (create or update).

  The browser sends only what the user did: intake answers, what they typed,
  ratings, and whether they filed a ticket. The conversation is then replayed
  through the same rule engine the page used, so the transcript, the rules
  that fired and the outcome are computed here rather than trusted. Every
  message is redacted again on the way through.

  Order matters: rate limit, then auth before the body is read (a signed-out
  request gets 401, not a 400 that describes the payload), then validation.
  A conversation that already has a ticket is frozen: the route answers 409,
  and the table's RLS policies refuse the write even if the route were
  bypassed. ticket_status is never read from the request.
*/

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { ok, retryAfterMs } = rateLimit(clientKey(request, "chat"), {
    limit: 30,
    windowMs: 60_000,
  });
  if (!ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  const supabase = await getServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Database is not configured on this deployment." },
      { status: 503 },
    );
  }

  const user = await getSessionUser(supabase);
  if (!user) {
    return NextResponse.json({ error: "Sign in to use help." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = SessionRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload did not match the expected shape." },
      { status: 400 },
    );
  }

  const { id, category, area, messages, ratings, fileTicket } = parsed.data;

  const { data: existing, error: readError } = await supabase
    .from("chat_sessions")
    .select("ticket_status")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (readError) {
    console.warn("[chat] Session read failed:", readError.message);
    return NextResponse.json({ error: "Could not save the conversation." }, { status: 500 });
  }
  if (!canWrite(existing)) {
    return NextResponse.json(
      { error: "This conversation already has a ticket." },
      { status: 409 },
    );
  }

  const turns = replay(category, area, messages);
  const outcome = outcomeFor(turns, fileTicket);
  const rulesFired = turns
    .filter((t) => t.role === "bot" && t.ruleId)
    .map((t) => t.ruleId as string);
  // A rating only counts for an answer this conversation actually gave.
  const keptRatings = ratings.filter((r) => rulesFired.includes(r.ruleId));

  const { error } = await supabase.from("chat_sessions").upsert(
    {
      id,
      user_id: user.id,
      // user_email is not sent: the column defaults to the signed-in user's
      // email from their token, so it always matches what RLS checks.
      category,
      area,
      first_message: firstMessage(turns),
      rules_fired: rulesFired,
      ratings: keptRatings,
      outcome,
      transcript: needsTranscript(outcome, keptRatings) ? turns : null,
      ticket_status: fileTicket ? "open" : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  // 42501: RLS refused the write. The read above said the row was writable, so
  // a ticket was filed in between (a double-click, or a save racing the
  // ticket). The ticket is intact; tell the browser so.
  if (error?.code === "42501") {
    return NextResponse.json(
      { error: "This conversation already has a ticket." },
      { status: 409 },
    );
  }
  if (error) {
    console.warn("[chat] Session save failed:", error.message);
    return NextResponse.json({ error: "Could not save the conversation." }, { status: 500 });
  }

  return NextResponse.json({ outcome, ticket: fileTicket }, { status: 200 });
}
