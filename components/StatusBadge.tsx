import type { ProjectStatus } from "@/types/project";

/*
  Status label.

  Weeks 0-3 rendered this as a coloured pill — one hue per state. The interface
  is now monochrome and typographic, so the pill is gone and the status reads
  as ordinary text at the same size as the row around it. Uppercase
  letterspacing is reserved for labels — column headers and the like — and a
  status is a value, not a label.

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
      className={`text-sm whitespace-nowrap ${
        status === "overdue" ? "text-status-overdue" : "text-ink"
      }`}
    >
      {LABELS[status]}
    </span>
  );
}
