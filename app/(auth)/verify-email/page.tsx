import type { Metadata } from "next";
import VerifyEmailPanel from "@/components/auth/VerifyEmailPanel";

export const metadata: Metadata = { title: "Confirm your email — FreeFlow" };

/*
  L9: the address used to come from ?email=, which put it in browser history
  and analytics, and let any link choose who the resend went to. It now waits
  in sessionStorage from the sign-up form, read by the panel.
*/
export default function VerifyEmailPage() {
  return <VerifyEmailPanel />;
}
