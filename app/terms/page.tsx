import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Terms — FreeFlow" };

/* M5: plain terms for a product that is free today, takes optional donations, and plans a one-time purchase later. */
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

      <h2>Free, for now</h2>
      <p>
        FreeFlow is free, with every feature, for everyone. At some point it will become a one-time purchase, not a
        subscription; the price isn&rsquo;t set yet. You&rsquo;ll get plenty of notice before that happens, you can
        always export your data, and nothing you have will be charged for without you choosing to buy it. See{" "}
        <Link className="text-ink underline" href="/pricing">Pricing</Link>.
      </p>

      <h2 id="donations">Donations</h2>
      <p>
        Donations are optional gifts toward running FreeFlow. They are handled by Stripe, and FreeFlow never sees your
        card. A donation doesn&rsquo;t buy features, faster support or a say in what gets built.
      </p>
      <p>
        One thank-you: anyone who donates, of any amount, before the paid version launches gets it free. Donate with the
        same email as your FreeFlow account, or email us to say which account is yours. If you donated by mistake,
        email us and we&rsquo;ll sort it out.
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

      <h2 id="if-we-get-it-wrong">If we get something wrong</h2>
      <p>FreeFlow is made by one person, and mistakes will happen. When one does:</p>
      <ul>
        <li>Everyone affected is told quickly and plainly, and it gets fixed.</li>
        <li>
          If it affected your work, Brayden helps put it right, for example by correcting your records or writing a
          short note to your client explaining that FreeFlow made the mistake.
        </li>
        <li>If it cost you real money or a client, you get the paid version free when it launches, without asking.</li>
      </ul>
      <p>FreeFlow doesn&rsquo;t pay cash for lost income, and won&rsquo;t pretend otherwise.</p>

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
