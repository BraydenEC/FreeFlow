import { redirect } from "next/navigation";
import LandingPage from "@/components/landing/LandingPage";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";

/*
  The root.

  Signed in, it sends you to /dashboard, where the dashboard has lived since
  Week 6. Signed out, it shows the public front page. The session decides
  here rather than in the proxy, so a cold visitor is never bounced to a
  sign-up form before being told what FreeFlow is.
*/

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await getServerSupabase();
  const user = await getSessionUser(supabase);
  if (user) redirect("/dashboard");
  return <LandingPage />;
}
