import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";

/*
  POST /api/auth/resend — send the confirmation email again.

  Supabase's built-in mailer is rate-limited to a handful of messages per hour.
  That limit is the reason this endpoint exists: when it bites, the user needs
  to be told "wait a minute", not left pressing a button that silently does
  nothing. Supabase's own rate-limit message says exactly that, so it is
  passed through rather than replaced.

  Always returns 200 for a well-formed request, whatever Supabase says about
  the address. Reporting "no such user" here would turn this into an endpoint
  for discovering who has an account.
*/

export const dynamic = "force-dynamic";

const Body = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Accounts are not configured." }, { status: 503 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: `${origin}/auth/confirm` },
  });

  // Rate limiting is the one failure worth surfacing — it is temporary and
  // the user can act on it.
  if (error && /rate|limit|seconds/i.test(error.message)) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 429 });
  }

  return NextResponse.json({ ok: true });
}
