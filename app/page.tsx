import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DemoFunnel from "@/components/funnel/DemoFunnel";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";

/*
  The root.

  Signed in, it sends you to /dashboard, where the dashboard has lived since
  Week 6. Signed out, it shows the /demo funnel (the same component, not a
  copy), with /demo as the canonical address. The session decides here rather
  than in the proxy, so a cold visitor is never bounced to a sign-up form
  before being told what FreeFlow is.
*/

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/demo" },
};

export default async function Home() {
  const supabase = await getServerSupabase();
  const user = await getSessionUser(supabase);
  if (user) redirect("/dashboard");
  return <DemoFunnel />;
}
