import Link from "next/link";

/*
  /demo footer: how to reach a person, how to send feedback, what happens if
  FreeFlow gets something wrong, and the launch list's privacy note.

  mailto: links rather than /chat, because /chat needs an account and these
  must work for a signed-out visitor. "We listen" is the brand, so feedback is
  one click from anywhere on the page.
*/

const CONTACT = "braydenemeryc@gmail.com";

export default function FunnelFooter() {
  return (
    <footer className="border-hairline text-ink-muted mt-16 border-t py-10 text-sm">
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <a href="mailto:braydenemeryc@gmail.com" className="hover:text-ink underline-offset-4 hover:underline">
          Contact: {CONTACT}
        </a>
        <a
          href="mailto:braydenemeryc@gmail.com?subject=FreeFlow%20feedback"
          className="hover:text-ink underline-offset-4 hover:underline"
        >
          Send feedback
        </a>
        <Link href="/docs#impact" className="hover:text-ink underline-offset-4 hover:underline">
          If we get it wrong
        </Link>
      </div>
      <p className="text-ink-faint mt-4 max-w-2xl text-xs leading-relaxed">
        Your email is used only to tell you when the lifetime version of FreeFlow launches. It is kept by Brayden (braydenemeryc@gmail.com). To be removed, email that address. Every launch email also has a remove-me link.
      </p>
    </footer>
  );
}
