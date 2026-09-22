import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PrefsProvider } from "@/components/prefs/PrefsProvider";
import { SessionProvider } from "@/components/auth/SessionProvider";
import TopBar from "@/components/TopBar";
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
      <body className="bg-app text-ink min-h-full">
        <SessionProvider user={user}>
          <PrefsProvider initial={prefs} scope={user?.id ?? null}>
            <TopBar />
            {children}
          </PrefsProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
