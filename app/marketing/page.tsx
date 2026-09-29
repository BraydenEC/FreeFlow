import SubNav from "@/components/SubNav";
import MarketingWorkbench from "@/components/marketing/MarketingWorkbench";
import { PERSONA } from "@/lib/marketing/persona";
import { SEED_CONTENT } from "@/lib/marketing/content";
import { isModelConfigured } from "@/lib/marketing/engine";
import { getSavedMarketing } from "@/lib/marketing/saved";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";

/*
  /marketing — the Week 4 module.

  Four bands mirroring the UX mockup: context (persona + brand, the input),
  content (the generated cards, the output), calendar and A/B test (the
  evidence), and saved assets. The interactive bands live in MarketingWorkbench;
  this server component reads the account state and the seed campaign, so the
  page renders a complete campaign even with no key and no database.
*/

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Marketing Engine — FreeFlow",
  description:
    "The content engine: a validated persona, a generated campaign, a 14-day calendar, and an A/B headline test — labelled by provenance.",
};

const BRAND_VOICE = [
  "Say what it is before asking for anything.",
  "Concrete over aspirational — name the task, not the feeling.",
  "Never claim what isn't built; label generated copy as generated.",
  "Honest about being free: free while we grow, optional donation.",
];

const STATUS_SWATCHES = [
  { name: "In Progress", token: "bg-status-progress" },
  { name: "Awaiting Review", token: "bg-status-review" },
  { name: "Invoice Sent", token: "bg-status-sent" },
  { name: "Overdue", token: "bg-status-overdue" },
];

export default async function MarketingPage() {
  const supabase = await getServerSupabase();
  const user = await getSessionUser(supabase);
  const saved = await getSavedMarketing();

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <SubNav />

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl page-stack px-5 sm:px-8 lg:px-10">
          <header className="max-w-3xl">
            <h1 className="page-title">Marketing Engine</h1>
            <p className="text-ink-muted mt-4 text-base leading-relaxed">
              The engine that turns FreeFlow into posts: a validated persona, a
              generated campaign, a 14-day calendar, and an A/B headline test —
              every claim traceable, every generated line labelled.
            </p>
          </header>

          {/* ── Context band: persona + brand ──────────────────────────── */}
          <section id="band-context" className="scroll-mt-20 grid gap-4 lg:grid-cols-2">
            <div className="border-hairline bg-surface rounded-xl border p-5">
              <span className="text-ink-faint text-[11px] tracking-[0.14em] uppercase">
                Persona · validated, not invented
              </span>
              <h2 className="text-ink mt-2 text-lg font-semibold">{PERSONA.name}</h2>
              <p className="text-ink-muted mt-2 text-sm leading-relaxed">
                {PERSONA.role}
              </p>
              <blockquote className="border-accent text-ink mt-4 border-l-2 pl-3 text-sm italic">
                “{PERSONA.quote}”
              </blockquote>
              <dl className="mt-4 space-y-1.5 text-sm">
                <div className="flex gap-2">
                  <dt className="text-ink-faint shrink-0">Finds work by</dt>
                  <dd className="text-ink-muted">{PERSONA.acquisition}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-ink-faint shrink-0">Bills</dt>
                  <dd className="text-ink-muted">{PERSONA.billing}</dd>
                </div>
              </dl>
            </div>

            <div className="border-hairline bg-surface rounded-xl border p-5">
              <span className="text-ink-faint text-[11px] tracking-[0.14em] uppercase">
                Brand · documented in BRAND.md
              </span>
              <h2 className="text-ink mt-2 text-lg font-semibold">
                Monochrome, plain, unwilling to flatter
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {STATUS_SWATCHES.map((s) => (
                  <span
                    key={s.name}
                    className="border-hairline text-ink-muted inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px]"
                  >
                    <span className={`${s.token} h-2.5 w-2.5 rounded-full`} />
                    {s.name}
                  </span>
                ))}
              </div>
              <p className="text-ink-faint mt-3 text-xs">
                Black-and-white canvas; colour reserved for project status. Voice:
              </p>
              <ul className="text-ink-muted mt-2 space-y-1 text-sm">
                {BRAND_VOICE.map((rule) => (
                  <li key={rule} className="flex gap-2">
                    <span className="text-ink-faint">—</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Interactive bands: content, calendar, A/B */}
          <MarketingWorkbench
            initialContent={SEED_CONTENT}
            modelConfigured={isModelConfigured()}
            signedIn={Boolean(user)}
          />

          {/* ── Saved band ─────────────────────────────────────────────── */}
          <section id="band-saved" className="scroll-mt-20">
            <h2 className="page-title text-base">Saved to your account</h2>
            {!user ? (
              <p className="text-ink-muted mt-3 text-sm">
                Sign in to save assets. Saved posts, scripts and headline winners
                appear here, per account.
              </p>
            ) : saved.length === 0 ? (
              <p className="text-ink-muted mt-3 text-sm">
                Nothing saved yet. Use “Save” on any card, or “Save winner” on an
                A/B test — it appears here on reload.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {saved.map((a) => (
                  <li
                    key={a.id}
                    className="border-hairline bg-surface flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5"
                  >
                    <span className="text-ink-faint text-[11px] tracking-wider uppercase">
                      {a.kind}
                    </span>
                    <span className="text-ink-muted min-w-0 flex-1 truncate text-sm">
                      {previewOf(a.content)}
                    </span>
                    <span className="text-ink-faint text-[11px]">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

/** A short, safe preview line for a saved asset of any shape. */
function previewOf(content: Record<string, unknown>): string {
  const c = content as { hook?: string; title?: string; text?: string };
  return c.hook ?? c.title ?? c.text ?? JSON.stringify(content).slice(0, 80);
}
