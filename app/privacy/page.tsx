import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy — FreeFlow" };

/*
  M5. Every statement here is one the code can back: it matches the help
  desk's data-privacy, data-encryption and brief-privacy answers in
  lib/chat/rules.ts. Nothing is claimed that the repo can't show.
*/
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy">
      <p>
        FreeFlow is a small product run by one person. This page says, in plain words, what it keeps and who
        can see it.
      </p>

      <h2>What FreeFlow keeps</h2>
      <ul>
        <li>Your account: your email address and a password, handled by Supabase Auth.</li>
        <li>Your projects: names, clients, amounts, dates, links and payment status, plus your settings.</li>
        <li>Briefs you add as projects, with what was read from them.</li>
        <li>
          Help desk conversations: your first message, the answers you got and your ratings. The full
          conversation is kept only for tickets, thumbs-down answers and questions the help desk couldn&rsquo;t
          answer, with secrets removed.
        </li>
        <li>Anonymous counts on the demo page (for example, how many games were played). No names.</li>
        <li>Your email, if you join the launch list. It is used once, when the lifetime version launches.</li>
      </ul>

      <h2>Who can see it</h2>
      <p>
        Your data is stored in a hosted Supabase database. Row-level security stops other users from seeing your
        rows. The owner can read saved data and tickets to fix problems, so don&rsquo;t store anything you
        wouldn&rsquo;t want seen, like passwords or bank details.
      </p>

      <h2>Who else handles it</h2>
      <ul>
        <li>Supabase stores the database and runs sign-in.</li>
        <li>Vercel hosts the site.</li>
        <li>
          When AI reading is on, the text you paste into Paste a brief (and Research notes) is sent to
          Anthropic&rsquo;s Claude to be read.
        </li>
        <li>Account emails (confirming your address, resetting your password) are sent through an email provider.</li>
      </ul>
      <p>FreeFlow has no ads and doesn&rsquo;t sell or share your data with anyone else.</p>

      <h2>Cookies and storage</h2>
      <p>
        A sign-in cookie keeps you signed in. Your browser also keeps a few conveniences, such as your layout
        before you sign in and an unfinished form, for the current tab.
      </p>

      <h2>Deleting your data</h2>
      <p>
        You can delete any project yourself. To delete your account and everything in it, email{" "}
        <a className="text-ink underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or submit a ticket
        in the help desk, and the owner will delete it and confirm by email.
      </p>
    </LegalPage>
  );
}
