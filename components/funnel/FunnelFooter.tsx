import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/site";

/*
  /demo footer: how to reach a person, how to send feedback, what happens if
  FreeFlow gets something wrong, and the launch list's privacy note.

  mailto: links rather than /chat, because /chat needs an account and these
  must work for a signed-out visitor. "We listen" is the brand, so feedback is
  one click from anywhere on the page.
*/

export default function FunnelFooter() {
  return (
    <footer className="border-hairline text-ink-muted mt-16 border-t py-10 text-sm">
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-ink underline-offset-4 hover:underline">
          Contact: {CONTACT_EMAIL}
        </a>
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=FreeFlow%20feedback`}
          className="hover:text-ink underline-offset-4 hover:underline"
        >
          Send feedback
        </a>
        <Link href="/terms#if-we-get-it-wrong" className="hover:text-ink underline-offset-4 hover:underline">
          If we get it wrong
        </Link>
      </div>
      {/* M6: say plainly, where people decide, what FreeFlow doesn't do. */}
      <p className="text-ink-muted mt-4 max-w-2xl text-xs leading-relaxed">
        FreeFlow tracks the invoices you send from other tools. It doesn&rsquo;t create or send invoices yet,
        and it doesn&rsquo;t issue Mexican CFDI invoices.
      </p>
      <p className="text-ink-faint mt-4 max-w-2xl text-xs leading-relaxed">
        Your email is used only to tell you, once, before FreeFlow starts charging. It is kept by Brayden ({CONTACT_EMAIL}). To be removed, email that address. That email also has a remove-me link.
      </p>
    </footer>
  );
}
