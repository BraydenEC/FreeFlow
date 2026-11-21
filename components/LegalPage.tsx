import { LEGAL_UPDATED } from "@/lib/site";

/* A plain, readable page for Privacy and Terms (M5). */
export default function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
      <h1 className="page-title">{title}</h1>
      <p className="text-ink-faint mt-1 text-xs">Last updated {LEGAL_UPDATED}</p>
      <div className="text-ink-muted mt-6 space-y-4 text-sm leading-relaxed [&_h2]:text-ink [&_h2]:mt-8 [&_h2]:text-[15px] [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {children}
      </div>
    </main>
  );
}
