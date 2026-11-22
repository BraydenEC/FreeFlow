import Link from "next/link";
import SubNav from "@/components/SubNav";
import ChatWindow from "@/components/chat/ChatWindow";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";

/*
  /chat — the Week 5 module: FreeFlow's guided help assistant.

  Open to everyone since user testing (M2). Signed-out visitors get answers
  but nothing is saved, and a ticket asks them to sign in. Answers come from written rules (lib/chat), not a model, so nothing
  here costs money per message.
*/

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Help desk — FreeFlow",
  description:
    "Ask FreeFlow's help desk anything. If it can't answer, your question goes straight to the person who builds FreeFlow.",
};

export default async function ChatPage() {
  const supabase = await getServerSupabase();
  const user = await getSessionUser(supabase);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <SubNav />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-3xl page-stack px-4 sm:px-8">
          <header>
            <h1 className="page-title">Help desk</h1>
            <p className="text-ink-muted mt-4 text-base leading-relaxed">
              Ask anything about FreeFlow. If the help desk can&apos;t answer, your question goes
              straight to Brayden, who builds FreeFlow and reads every one.
            </p>
          </header>

          {/* M2: signed out, nobody stuck at sign-up could ask anything. Answers
              come from written rules in the browser and cost nothing, so
              everyone can ask; saving and tickets need an account. */}
          {!user && (
            <p className="border-hairline text-ink-muted rounded-lg border px-4 py-3 text-sm">
              You&apos;re not signed in, so this conversation isn&apos;t saved and tickets need an account.{" "}
              <Link href="/login?next=/chat" className="text-ink underline underline-offset-2">Sign in</Link>
            </p>
          )}
          <ChatWindow userEmail={user?.email ?? ""} signedIn={Boolean(user)} />
        </div>
      </main>
    </div>
  );
}
