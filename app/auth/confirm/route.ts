import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

/*
  GET /auth/confirm — the landing point for the link in a confirmation email.

  Supabase can deliver a confirmation two different ways, and which one you get
  depends on the email template:

    token_hash in the query string  → verified here, on the server, where the
                                      session cookie can actually be written.
                                      This is the flow we want.

    tokens in the URL fragment      → the default template's flow. A fragment
                                      is never sent to a server, so there is
                                      nothing to read here. Those requests fall
                                      through to /login, whose client-side
                                      catcher reads the fragment. The fragment
                                      survives the redirect, which is the only
                                      reason that works.

  A Route Handler rather than a page because only a handler can set cookies.
*/

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const redirectTo = (path: string, error?: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = error ? `?error=${encodeURIComponent(error)}` : "";
    url.hash = "";
    return NextResponse.redirect(url);
  };

  // No token_hash: either the fragment flow, or somebody opened this by hand.
  // /login handles both — it catches a fragment session, and shows a form if
  // there is none.
  if (!token_hash || !type) return redirectTo("/login");

  const supabase = await getServerSupabase();
  if (!supabase) return redirectTo("/login", "Accounts are not configured.");

  const { error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (error) {
    // Expired and already-used links both land here. The message is Supabase's
    // own, which is already user-facing.
    return redirectTo("/login", error.message);
  }

  // A recovery link is not a sign-in, it is permission to choose a new
  // password. Dropping the user on the dashboard would leave them signed in
  // with the password they could not remember.
  return redirectTo(type === "recovery" ? "/reset-password" : "/");
}
