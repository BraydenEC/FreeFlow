import type { Metadata } from "next";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Create account — FreeFlow" };
export const dynamic = "force-dynamic";

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
