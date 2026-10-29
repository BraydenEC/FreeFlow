import Link from "next/link";
import SubNav from "@/components/SubNav";
import ChatWindow from "@/components/chat/ChatWindow";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";

/*
  /chat — the Week 5 module: FreeFlow's guided help assistant.

  For signed-in users only, to keep load down, but the page itself always
  loads: a signed-out visitor gets a short explanation and a way in, never an
  error. Answers come from written rules (lib/chat), not a model, so nothing
  here costs money per message.
*/

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Help — FreeFlow",
  description:
    "FreeFlow's automated guide: answers from written rules, and a ticket to the owner when it can't help.",
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
            <h1 className="page-title">Help</h1>
            <p className="text-ink-muted mt-4 text-base leading-relaxed">
              FreeFlow&apos;s automated guide. It answers from written rules, and anything
              it can&apos;t solve becomes a ticket the owner reads.
            </p>
          </header>

          {user ? (
            <ChatWindow userEmail={user.email ?? ""} />
          ) : (
            <section className="border-hairline bg-raised rounded-xl border p-5 text-sm">
              <p className="text-ink">Help is for people who use FreeFlow.</p>
              <p className="text-ink-muted mt-1">
                Sign in and the guide can answer questions about your projects, the
                forecast, pricing and more.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/login" className="bg-ink text-app rounded-lg px-3 py-2 font-medium">
                  Sign in
                </Link>
                <Link href="/signup" className="border-hairline text-ink rounded-lg border px-3 py-2">
                  Create an account
                </Link>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
