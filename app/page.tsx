import type { Metadata } from "next";
import DemoFunnel from "@/components/funnel/DemoFunnel";

/*
  The root: the front page story, the same component as /demo (not a copy),
  with /demo as the canonical address.

  A signed-in visitor never sees it: the proxy, which already checks the
  session, sends them to /dashboard, so this page does no session lookup of
  its own.
*/

export const metadata: Metadata = {
  alternates: { canonical: "/demo" },
};

export default function Home() {
  return <DemoFunnel />;
}
