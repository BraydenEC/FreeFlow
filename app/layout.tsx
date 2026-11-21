import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PrefsProvider } from "@/components/prefs/PrefsProvider";
import { SessionProvider } from "@/components/auth/SessionProvider";
import TopBar from "@/components/TopBar";
import Dock from "@/components/nav/Dock";
import SiteFooter from "@/components/SiteFooter";
import { getUserPrefs } from "@/lib/prefs/server";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.freeflow.website"),
  title: "FreeFlow — Freelance Project & Invoice Tracker",
  description:
    "Track projects, cash flow, and deadlines in one place. Built for independent contractors, freelance developers, designers, and consultants.",
};

/*
  The layout resolves the session once per request and hands two things down:
  who is signed in, and their saved preferences. Passing the preferences here
  means the server renders the user's layout on the first paint — no flash —
  which the localStorage-only version could not do.
*/
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = await getServerSupabase();
  const user = await getSessionUser(supabase);
  const prefs = user ? await getUserPrefs(supabase, user.id) : null;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-app text-ink min-h-full pb-28">
        <SessionProvider user={user}>
          <PrefsProvider initial={prefs} scope={user?.id ?? null}>
            {/* M13: a skip link, the first thing a keyboard reaches. */}
            <a
              href="#main"
              className="bg-accent text-app sr-only z-50 rounded-md px-3 py-2 text-sm font-semibold focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
            >
              Skip to content
            </a>
            <TopBar />
            <div id="main" tabIndex={-1} className="focus:outline-none">
              {children}
            </div>
            <SiteFooter />
            <Dock />
          </PrefsProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
