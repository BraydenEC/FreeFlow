import { NextResponse } from "next/server";
import { CONSENT_VERSION, LaunchListSchema } from "@/lib/venture/schemas";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { getServerSupabase } from "@/lib/supabase/server";

/*
  POST /api/launch-list: add an email to the list told when the lifetime
  version of FreeFlow launches. Nothing else is sent to it.

  Consent is required and its wording version is stored with the address.
  Signing up twice is a success ("already on the list"), never an error: the
  table's unique index on lower(email) refuses the duplicate and the route
  reads that as done. Rows can't be read back by anyone but the owner.
*/

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { ok, retryAfterMs } = rateLimit(clientKey(request, "launch-list"), {
    limit: 5,
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

  const parsed = LaunchListSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ saved: false }, { status: 400 });
  }

  const { email, consent, source } = parsed.data;
  const { error } = await supabase
    .from("launch_list")
    .insert({ email, consent, consent_version: CONSENT_VERSION, source });

  if (error?.code === "23505") {
    return NextResponse.json({ saved: true, already: true }, { status: 200 });
  }
  if (error) {
    console.warn("[launch-list] Save failed:", error.message);
    return NextResponse.json({ saved: false }, { status: 503 });
  }
  return NextResponse.json({ saved: true }, { status: 200 });
}
