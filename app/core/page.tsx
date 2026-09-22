import Link from "next/link";
import CoreWorkbench from "@/components/core/CoreWorkbench";
import SavedOutputs from "@/components/core/SavedOutputs";
import SubNav from "@/components/SubNav";
import { getSavedOutputs } from "@/lib/core/saved";
import { isModelConfigured } from "@/lib/core/extract";

/*
  /core — the generative core module.

  Server Component: it reads saved outputs before the HTML is sent, and checks
  model configuration server-side so the key is never involved in client code.
  The interactive half is a separate client component.
*/

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Core — FreeFlow",
  description:
    "Turn an unstructured client brief into a structured project record.",
};

export default async function CorePage() {
  const [saved, modelConfigured] = await Promise.all([
    getSavedOutputs(),
    Promise.resolve(isModelConfigured()),
  ]);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <SubNav />

      <main className="min-w-0 flex-1">
        <div className="relative">
          <div
            aria-hidden
            className="from-accent/8 pointer-events-none absolute inset-x-0 top-0 h-64 bg-linear-to-b to-transparent"
          />

          <div className="relative mx-auto max-w-7xl page-stack px-5 sm:px-8 lg:px-10">
            <header>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="page-title">
                  FreeFlow Core
                </h1>
                {!modelConfigured && (
                  <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-300 ring-1 ring-amber-400/20 ring-inset">
                    pattern-matching mode
                  </span>
                )}
              </div>
              <p className="text-ink-muted mt-1 text-sm">
                Paste a client brief. Get a structured project you can save —
                without retyping a thing.
              </p>
              <Link
                href="/"
                className="text-accent-soft mt-3 inline-block text-xs hover:underline"
              >
                ← Back to dashboard
              </Link>
            </header>

            <CoreWorkbench />

            <div>
              <h2 className="sr-only">Previously saved</h2>
              <span className="text-accent-soft mb-3 block text-[15px] font-semibold">
                3<span className="text-ink ml-2">Saved to database</span>
              </span>
              <SavedOutputs outputs={saved} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
