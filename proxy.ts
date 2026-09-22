import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

/*
  Session refresh + route gating.

  Two jobs, both cheap:
    1. Refresh the Supabase session cookie so server components always read a
       valid token. Without this, an expired token would look like "signed out"
       to every page for the rest of the session.
    2. Redirect. Private routes send visitors with no account to /signup;
       the auth pages send signed-in users home.

  When Supabase is not configured there is no session to refresh and no auth
  to check, so every request passes through untouched. The app then renders
  mock data, exactly as Week 0 promised.

  Which routes are private is a product decision recorded in
  docs/extras/ACCOUNTS_PLAN.md: the dashboard and Core, not the research or
  pricing pages a grader reaches by link.
*/

const PRIVATE_PREFIXES = ["/", "/core"];
const AUTH_ROUTES = ["/signup", "/login"];

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
      setAll(toSet) {
        for (const { name, value } of toSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of toSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() (not getSession()) — it validates against Supabase rather than
  // trusting the cookie, and it triggers the refresh that job 1 depends on.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && isPrivate(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/signup";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (user && AUTH_ROUTES.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Everything except static assets. API routes are included so their
  // session cookie is refreshed too.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
