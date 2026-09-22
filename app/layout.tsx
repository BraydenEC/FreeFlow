import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PrefsProvider } from "@/components/prefs/PrefsProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ServicePro — Freelance Project & Invoice Tracker",
  description:
    "Track projects, cash flow, and deadlines in one place. Built for independent contractors, freelance developers, designers, and consultants.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-app text-ink min-h-full">
        <PrefsProvider>{children}</PrefsProvider>
      </body>
    </html>
  );
}
