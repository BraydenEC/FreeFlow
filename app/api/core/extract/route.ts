import { NextResponse } from "next/server";
import { extractCore } from "@/lib/core/extract";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/ratelimit";

/*
  POST /api/core/extract

  A Route Handler rather than a Server Action for three reasons: the model key
  stays server-side, the fallback contract is enforced in exactly one place,
  and the endpoint is callable with curl — which is how the required test runs
  are evidenced.

  /core is a private page, but the page redirect does not protect this API from
  a direct POST — so the route checks the session itself (defense in depth) and
  returns 401 when signed out. Being authenticated, it is then rate limited per
  user rather than per IP. See lib/ratelimit.ts.
*/

export const dynamic = "force-dynamic";

const MAX_BRIEF_LENGTH = 8000;

export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  const user = supabase ? await getSessionUser(supabase) : null;
  if (!user) {
    return NextResponse.json({ error: "Sign in to use this." }, { status: 401 });
  }

  const limited = rateLimit(`core-extract:${user.id}`, {
    limit: 15,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(limited.retryAfterMs / 1000)) },
      },
    );
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

  const brief = (body as { brief?: unknown })?.brief;

  if (typeof brief !== "string" || brief.trim().length === 0) {
    return NextResponse.json(
      { error: "Provide a non-empty 'brief' string." },
      { status: 400 },
    );
  }

  // Bounded before it reaches the model: an unbounded paste is an unbounded
  // bill, and nothing useful lives past a few thousand characters here.
  if (brief.length > MAX_BRIEF_LENGTH) {
    return NextResponse.json(
      { error: `Brief exceeds ${MAX_BRIEF_LENGTH} characters.` },
      { status: 400 },
    );
  }

  const result = await extractCore(brief, new Date());

  // Always 200. Falling back is a successful outcome, not a failure — the
  // caller distinguishes the paths by reading `extractor`, never by status.
  return NextResponse.json(result, { status: 200 });
}
