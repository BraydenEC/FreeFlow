/*
  A progress bar for one project's pipeline stage.

  Monochrome, matching the rest of the interface: a filled portion in ink over
  a raised track. The percentage is printed next to it rather than inside, so
  it stays readable at every width, and the whole thing carries an ARIA
  progressbar role with the label spelled out for screen readers — the visual
  bar is a convenience, not the only way to read the value.
*/
export default function ProgressBar({
  percent,
  label,
  complete,
}: {
  percent: number;
  label: string;
  complete: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="numeric text-ink-muted w-9 shrink-0 text-xs tabular-nums">
        {percent}%
      </span>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} — ${percent}% through the billing pipeline`}
        className="bg-raised h-1.5 w-full min-w-16 overflow-hidden rounded-full"
      >
        <div
          className={`h-full rounded-full ${complete ? "bg-ink" : "bg-ink-muted"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
