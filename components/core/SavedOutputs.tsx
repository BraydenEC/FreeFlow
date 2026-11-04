import BriefToProject from "@/components/core/BriefToProject";
import ExtractorBadge from "@/components/core/ExtractorBadge";
import type { CurrencyCode } from "@/lib/currency";
import { formatCurrency } from "@/lib/format";
import type { SavedOutput } from "@/lib/core/saved";

function value(o: SavedOutput, currency: CurrencyCode): string {
  if (o.hourlyRate === null || o.hoursLogged === null) return "value incomplete";
  return formatCurrency(o.hourlyRate * o.hoursLogged, currency);
}

export default function SavedOutputs({
  outputs,
  currency,
}: {
  outputs: SavedOutput[];
  currency: CurrencyCode;
}) {
  return (
    <section
      aria-labelledby="saved-heading"
      className="border-hairline bg-surface rounded-xl border"
    >
      <div className="border-hairline flex items-center justify-between border-b px-5 py-4">
        <h2 id="saved-heading" className="text-[15px] font-semibold">
          Saved outputs
        </h2>
        <span className="text-ink-faint text-xs">
          {outputs.length === 0
            ? "none yet"
            : `${outputs.length} saved`}
        </span>
      </div>

      {outputs.length === 0 ? (
        <p className="text-ink-faint px-5 py-8 text-center text-sm">
          Extracted projects you save will appear here.
        </p>
      ) : (
        <ul>
          {outputs.map((o) => (
            <li
              key={o.id}
              className="border-hairline space-y-2 border-t px-5 py-4 first:border-t-0"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{o.projectName}</p>
                  <p className="text-ink-muted truncate text-xs">
                    {o.client ?? "client not found"}
                  </p>
                </div>
                <ExtractorBadge extractor={o.extractor} />
              </div>
              <div className="text-ink-faint flex items-center gap-3 text-xs">
                <span className="numeric">{value(o, currency)}</span>
                <span aria-hidden>·</span>
                <span>{o.deadline ?? "no deadline"}</span>
                <span aria-hidden>·</span>
                <span>{o.promptVersion}</span>
              </div>
              <BriefToProject
                fields={{
                  project_name: o.projectName,
                  client: o.client,
                  hourly_rate: o.hourlyRate,
                  hours_logged: o.hoursLogged,
                  deadline: o.deadline,
                  status: o.status,
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
