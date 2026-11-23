import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

/*
  Session refresh + route gating.

  Two jobs, both cheap. getClaims() verifies the session token locally against
  the project's cached public keys (the project signs with ES256), so this no
  longer costs a network round trip to Supabase on every request; it only
  calls Supabase when the token is near expiry and needs refreshing.

    1. Refresh the Supabase session cookie so server components always read a
       valid token. Without this, an expired token would look like "signed out"
       to every page for the rest of the session.
    2. Redirect. Private routes send visitors with no account to /login
       (with ?next= so they come back);
       the auth pages send signed-in users home.

  When Supabase is not configured there is no session to refresh and no auth
  to check, so every request passes through untouched. The app then renders
  mock data, exactly as Week 0 promised.

  Which routes are private is a product decision recorded in
  docs/extras/ACCOUNTS_PLAN.md: the dashboard and Core, not the research or
  pricing pages a grader reaches by link.
*/

/*
  "/" and "/dashboard" are deliberately not private. The root shows the public
  front page when signed out; a signed-in visitor is sent to /dashboard below,
  here rather than in the page, so the page itself stays static and cached.
  /dashboard shows a signed-out visitor the pitch, so the page decides.
*/
const PRIVATE_PREFIXES = ["/core"];
// Pages a signed-in user has no business seeing. /auth/confirm is absent on
// purpose: it must run even for someone already signed in, or a second click
// of a confirmation link would bounce before verifying.
const AUTH_ROUTES = ["/signup", "/login", "/verify-email", "/forgot-password"];

function isPrivate(pathname: string): boolean {
  return PRIVATE_PREFIXES.some((p) =>
    p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(`${p}/`),
  );
}

export async function proxy(request: NextRequest) {
  const env = getSupabaseEnv();
  if (!env) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet, headers) {
        for (const { name, value } of toSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of toSet) {
          response.cookies.set(name, value, options);
        }
        // A refreshed session must never be cached by a CDN: Supabase hands
        // over the cache headers to send with it.
        for (const [key, value] of Object.entries(headers ?? {})) response.headers.set(key, value);
      },
    },
  });

  // getClaims() verifies the token's signature (unlike getSession(), which
  // trusts the cookie) and refreshes it when it is about to expire, which is
  // what job 1 depends on. Never put code between creating the client and
  // this call.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims?.sub ? data.claims : null;

  const { pathname } = request.nextUrl;

  // L5: say why, and come back here after signing in (AuthForm reads ?next=).
  if (!user && isPrivate(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  if (user && (pathname === "/" || AUTH_ROUTES.includes(pathname))) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Every page and API route, everything except static assets. The root
  // layout reads the session on every page, so the proxy must refresh it on
  // every page first: a Server Component can't save a refreshed cookie, and a
  // refresh that isn't saved can get the session revoked. getClaims() keeps
  // this cheap (no network call unless the token needs refreshing).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
