import type { ProjectStatus } from "@/types/project";

/*
  Status label.

  Weeks 0-3 rendered this as a coloured pill — one hue per state. The interface
  is now monochrome and typographic, so the pill is gone and the label carries
  itself: small, uppercase, letterspaced, the same treatment as the column
  headers.

  One exception. Overdue keeps its colour, because it is the only status that
  means money is late, and stripping every signal in the name of restraint
  would make the page prettier and less useful. Colour is never the only cue —
  the word "Overdue" is always printed — so this stays readable in greyscale
  and for colour-blind readers.
*/

const LABELS: Record<ProjectStatus, string> = {
  in_progress: "In Progress",
  awaiting_review: "Awaiting Review",
  invoice_sent: "Invoice Sent",
  overdue: "Overdue",
};

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`text-[11px] font-medium tracking-[0.08em] whitespace-nowrap uppercase ${
        status === "overdue" ? "text-status-overdue" : "text-ink-muted"
      }`}
    >
      {LABELS[status]}
    </span>
  );
}
