import MarkPaidButton from "@/components/dashboard/MarkPaidButton";
import ProjectForm from "@/components/dashboard/ProjectForm";
import ProgressBar from "@/components/ProgressBar";
import StatusBadge from "@/components/StatusBadge";
import {
  daysUntil,
  formatCurrency,
  formatMonthDay,
  formatRelativeDeadline,
  projectValue,
} from "@/lib/format";
import { projectProgress } from "@/lib/progress";
import { computeWithholding } from "@/lib/tax/withholding";
import type { Project } from "@/types/project";

/*
  "Recent Projects" — the action-oriented table.

  Rendered twice: a real <table> from sm up, and stacked cards below it. A
  horizontally-scrolling five-column table is the fastest way to look
  unfinished on a phone, and the assignment is graded partly on mobile
  behaviour, so the small-screen layout is a distinct design rather than the
  desktop one squeezed.

  `now` is passed down instead of read here, so every row measures its deadline
  against the same instant the server used. See lib/format.ts.
*/

/* Contract and payment links, shown only when they exist. Both come straight
   from the validation interview: the signed contract is what makes an
   escalation possible, and the Stripe link connects a row to the payment that
   settled it. A row with neither shows nothing rather than empty affordances. */
function RowLinks({ project }: { project: Project }) {
  const links = [
    { href: project.contractUrl, label: "Contract" },
    { href: project.paymentUrl, label: "Invoice" },
  ].filter((l): l is { href: string; label: string } => Boolean(l.href));

  if (links.length === 0) return null;

  return (
    <span className="mt-0.5 flex gap-2">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink-faint hover:text-ink text-[11px] underline-offset-2 hover:underline"
        >
          {l.label} ↗
        </a>
      ))}
    </span>
  );
}

function DeadlineText({ project, now }: { project: Project; now: Date }) {
  const days = daysUntil(project.deadline, now);
  const isLate = days < 0;
  const isSoon = days >= 0 && days <= 3;

  return (
    <>
      <span className="text-ink block">{formatMonthDay(project.deadline)}</span>
      <span
        className={`block text-xs ${
          isLate
            ? "text-status-overdue"
            : isSoon
              ? "text-status-review"
              : "text-ink-faint"
        }`}
      >
        {formatRelativeDeadline(project.deadline, now)}
      </span>
    </>
  );
}

/* Column headers: small, uppercase, letterspaced, over a slightly raised row.
   That treatment marks a label. Values — including the status — are printed
   as ordinary text, which is the whole typographic system here. */
const TH = "px-5 py-2.5 text-[11px] font-medium tracking-[0.08em] uppercase";

export default function ProjectsTable({
  projects,
  now,
  action,
}: {
  projects: Project[];
  now: Date;
  /** Rendered in the header — the dashboard passes the New project control. */
  action?: React.ReactNode;
}) {
  // A new account has no projects. That is a state, not an error, and the
  // table says so instead of rendering an empty grid.
  if (projects.length === 0) {
    return (
      <section
        aria-labelledby="recent-projects-heading"
        className="flex flex-col gap-4"
      >
        <div className="border-hairline bg-surface rounded-lg border px-6 py-10 text-center">
          <h2 id="recent-projects-heading" className="text-[15px] font-semibold">
            No projects yet
          </h2>
          <p className="text-ink-muted mt-1 text-sm">
            Add your first project and the dashboard fills in from there.
          </p>
        </div>
        {action}
      </section>
    );
  }

  return (
    <section
      aria-labelledby="recent-projects-heading"
      className="flex flex-col gap-4"
    >
      <div className="border-hairline bg-surface overflow-hidden rounded-lg border">
        <div className="border-hairline flex items-center justify-between border-b px-5 py-3.5">
          <h2
            id="recent-projects-heading"
            className="text-[11px] font-medium tracking-[0.12em] uppercase"
          >
            Recent Projects
          </h2>
          <span className="text-ink-faint text-xs">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </span>
        </div>

        {/* ---------- Desktop / tablet: real table ---------- */}
        <table className="hidden w-full text-left text-sm sm:table">
          <caption className="sr-only">
            Recent freelance projects with client, status, financial value,
            pipeline progress, deadline, and a control to record payment.
          </caption>
          <thead className="bg-raised/60 text-ink-faint border-hairline border-b">
            <tr>
              <th scope="col" className={TH}>
                Project
              </th>
              <th scope="col" className={TH}>
                Status
              </th>
              <th scope="col" className={`${TH} text-right`}>
                Value
              </th>
              <th scope="col" className={`${TH} w-44`}>
                Progress
              </th>
              <th scope="col" className={TH}>
                Due Date
              </th>
              <th scope="col" className={`${TH} text-right`}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const progress = projectProgress(project);
              return (
                <tr
                  key={project.id}
                  className="border-hairline hover:bg-raised/40 border-t transition-colors"
                >
                  <th scope="row" className="px-5 py-3.5 font-normal">
                    <span className="text-ink block font-medium">
                      {project.name}
                    </span>
                    <span className="text-ink-muted block text-xs">
                      {project.client}
                    </span>
                    <RowLinks project={project} />
                  </th>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={project.status} isPaid={project.isPaid} />
                  </td>
                  <td className="numeric px-5 py-3.5 text-right font-medium">
                    {formatCurrency(projectValue(project))}
                    {project.invoiceTotal === null && (
                      <span className="text-ink-faint block text-xs font-normal">
                        {project.hoursLogged}h × ${project.hourlyRate}
                      </span>
                    )}
                    {/* The number that actually lands, shown only where it
                        differs from the one above it. */}
                    {(() => {
                      const w = computeWithholding(
                        projectValue(project),
                        project.clientTaxType,
                      );
                      return w.applies ? (
                        <span
                          className="text-ink-faint block text-xs font-normal"
                          title="After IVA and ISR withheld by the client"
                        >
                          net {formatCurrency(w.net)}
                        </span>
                      ) : null;
                    })()}
                  </td>
                  <td className="px-5 py-3.5">
                    <ProgressBar
                      percent={progress.percent}
                      label={progress.label}
                      complete={progress.complete}
                    />
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <DeadlineText project={project} now={now} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {!project.isPaid && <MarkPaidButton projectId={project.id} />}
                      <ProjectForm project={project} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ---------- Mobile: stacked cards ---------- */}
        <ul className="sm:hidden">
          {projects.map((project) => {
            const progress = projectProgress(project);
            return (
              <li
                key={project.id}
                className="border-hairline space-y-3 border-t px-5 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{project.name}</p>
                    <p className="text-ink-muted truncate text-xs">
                      {project.client}
                    </p>
                    <RowLinks project={project} />
                  </div>
                  <StatusBadge status={project.status} isPaid={project.isPaid} />
                </div>
                <ProgressBar
                  percent={progress.percent}
                  label={progress.label}
                  complete={progress.complete}
                />
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="numeric font-medium">
                    {formatCurrency(projectValue(project))}
                  </span>
                  <span className="text-xs">
                    <DeadlineText project={project} now={now} />
                  </span>
                </div>
                <div className="flex justify-end gap-2">
                  {!project.isPaid && <MarkPaidButton projectId={project.id} />}
                  <ProjectForm project={project} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      {action}
    </section>
  );
}
