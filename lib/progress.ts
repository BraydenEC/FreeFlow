import type { Project } from "@/types/project";

/*
  Pipeline progress for one project.

  The mockup this UI follows has a PROGRESS column with a percentage bar. This
  project has no "percent of work completed" field, and inventing one would put
  a fabricated number on the most scannable part of the page. So progress is
  derived from the two things that are real: where the project sits in the
  billing pipeline, and whether the money has arrived.

    Contract Signed  10%   agreed, work not started
    In Progress      30%   work underway
    Awaiting Review  55%   delivered, not yet billed
    Invoice Sent     80%   billed, unpaid
    Overdue          80%   billed, unpaid, and late
    Paid            100%   done

  `isPaid` wins over `status`. A paid project is finished whatever its status
  column says, and the stale-status case is exactly when a reader most needs
  the truth.

  Overdue and Invoice Sent share a percentage on purpose: they are the same
  stage of the pipeline. Lateness is urgency, not progress, and the table shows
  it in the deadline column where it belongs.
*/

export type ProjectProgress = {
  label: string;
  /** 0-100, integer. */
  percent: number;
  /** True when the money is in. Lets the UI style the completed state. */
  complete: boolean;
};

export function projectProgress(project: Project): ProjectProgress {
  if (project.isPaid) return { label: "Paid", percent: 100, complete: true };

  switch (project.status) {
    case "contracted":
      return { label: "Contract Signed", percent: 10, complete: false };
    case "in_progress":
      return { label: "In Progress", percent: 30, complete: false };
    case "awaiting_review":
      return { label: "Awaiting Review", percent: 55, complete: false };
    case "invoice_sent":
      return { label: "Invoice Sent", percent: 80, complete: false };
    case "overdue":
      return { label: "Overdue", percent: 80, complete: false };
  }
}
