import type { Metadata } from "next";
import DemoFunnel from "@/components/funnel/DemoFunnel";

/*
  /demo: the public funnel, and its canonical address. Signed-out visitors to
  / see the same component; that page points its canonical here too, so the
  two don't count as duplicate content. Not gated by the proxy, and it works
  signed in.
*/

export const metadata: Metadata = {
  title: "FreeFlow — one night, sorted",
  description:
    "I'm a freelancer, and it's all in my head. See how FreeFlow sorts your projects, deadlines and money, then try it free.",
  alternates: { canonical: "/demo" },
};

export default function DemoPage() {
  return <DemoFunnel />;
}
