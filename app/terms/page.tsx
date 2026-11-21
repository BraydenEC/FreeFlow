import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Terms — FreeFlow" };

/* M5: plain terms for an early-access product that charges nothing. */
export default function TermsPage() {
  return (
    <LegalPage title="Terms">
      <p>By creating an account you agree to these terms. They are short on purpose.</p>

      <h2>What FreeFlow is</h2>
      <p>
        A tracker for freelancers&rsquo; projects, deadlines and money, with a forecast. It tracks invoices you send
        from other tools; it doesn&rsquo;t create, send or stamp invoices, and it isn&rsquo;t tax or legal advice.
        Its tax figures for Mexico are estimates to plan with; check anything you file with your accountant.
      </p>

      <h2>Early access</h2>
      <p>
        FreeFlow is free during early access, with every feature. At launch it becomes a one-time purchase; the
        price isn&rsquo;t set yet, and nothing you have will be charged for without you choosing to buy it. See{" "}
        <Link className="text-ink underline" href="/pricing">Pricing</Link>.
      </p>
      <p>
        It is new software made by one person. Features may change, and things can break. Keep your own copy of
        anything important; the dashboard can export your projects as a CSV at any time.
      </p>

      <h2>Your part</h2>
      <ul>
        <li>Use your own account and keep your password to yourself.</li>
        <li>Don&rsquo;t store anything you aren&rsquo;t allowed to, or anything you wouldn&rsquo;t want the owner to see.</li>
        <li>Don&rsquo;t try to break, overload or get into other people&rsquo;s data.</li>
      </ul>

      <h2>Your data</h2>
      <p>
        What you put in stays yours. How it is kept is on the{" "}
        <Link className="text-ink underline" href="/privacy">Privacy</Link> page. You can ask for your account to be
        deleted at any time.
      </p>

      <h2>Contact</h2>
      <p>
        Questions: <a className="text-ink underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
