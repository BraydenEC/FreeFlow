import type { Metadata } from "next";
import VerifyEmailPanel from "@/components/auth/VerifyEmailPanel";

export const metadata: Metadata = { title: "Confirm your email — ServicePro" };
export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return <VerifyEmailPanel email={email ?? ""} />;
}
