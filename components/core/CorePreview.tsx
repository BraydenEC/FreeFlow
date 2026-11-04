import Link from "next/link";
import ExtractorBadge from "@/components/core/ExtractorBadge";
import type { CurrencyCode } from "@/lib/currency";
import { formatCurrency } from "@/lib/format";
import type { SavedOutput } from "@/lib/core/saved";

/*
  Dashboard preview of the generative core.

  The Week 1 spec requires a "Dashboard preview" as a distinct feature from the
  /core page itself. The point is that the core module should feed the product
  rather than sit beside it: a freelancer lands on the dashboard and sees that
  briefs they pasted have become structured records.

  Deliberately narrower than SavedOutputs on /core — name, client, value, and
  which extractor produced it. Anyone wanting the confidence note or the full
  field set follows the link.
*/

function value(o: SavedOutput, currency: CurrencyCode): string {
  if (o.hourlyRate === null || o.hoursLogged === null) return "incomplete";
  return formatCurrency(o.hourlyRate * o.hoursLogged, currency);
}

/** "3m ago" / "2h ago" / "5d ago". Computed server-side against an injected
    `now`, same discipline as the deadline column — see lib/format.ts. */
function relativeTime(iso: string, now: Date): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const mins = Math.floor((now.getTime() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function CorePreview({
  outputs,
  now,
  currency,
}: {
  outputs: SavedOutput[];
  now: Date;
  currency: CurrencyCode;
}) {
  return (
    <section
      aria-labelledby="core-preview-heading"
      className="border-hairline bg-surface rounded-xl border"
    >
      <div className="border-hairline flex items-center justify-between gap-3 border-b px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h2
            id="core-preview-heading"
            className="text-[15px] font-semibold"
          >
            Recent extractions
          </h2>
          <p className="text-ink-faint mt-0.5 text-xs">
            Client briefs turned into structured projects
          </p>
        </div>
        <Link
          href="/core"
          className="focus-visible:ring-accent text-accent-soft hover:bg-accent/10 shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          Open Core →
        </Link>
      </div>

      {outputs.length === 0 ? (
        /*
          The empty state is load-bearing. This panel is empty until someone
          saves their first extraction, so it must read as "nothing here yet"
          rather than "this is broken" — and it should say what to do about it.
        */
        <div className="px-5 py-8 text-center sm:px-6">
          <p className="text-ink-muted text-sm">No extractions saved yet.</p>
          <p className="text-ink-faint mx-auto mt-1 max-w-sm text-xs">
            Paste a client email or message into the Core workbench and it will
            be turned into a structured project record.
          </p>
          <Link
            href="/core"
            className="focus-visible:ring-accent bg-accent/10 text-accent-soft hover:bg-accent/15 mt-4 inline-flex rounded-lg px-3.5 py-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            Extract your first brief
          </Link>
        </div>
      ) : (
        <ul>
          {outputs.map((o) => (
            <li
              key={o.id}
              className="border-hairline flex items-center justify-between gap-4 border-t px-5 py-3.5 first:border-t-0 sm:px-6"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{o.projectName}</p>
                <p className="text-ink-muted truncate text-xs">
                  {o.client ?? "client not found"}
                  <span aria-hidden className="mx-1.5">
                    ·
                  </span>
                  <span className="numeric">{value(o, currency)}</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-ink-faint hidden text-xs sm:inline">
                  {relativeTime(o.createdAt, now)}
                </span>
                <ExtractorBadge extractor={o.extractor} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
