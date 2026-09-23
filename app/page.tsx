import CorePreview from "@/components/core/CorePreview";
import DashboardGrid from "@/components/dashboard/DashboardGrid";
import ProjectForm from "@/components/dashboard/ProjectForm";
import OverdueAlert from "@/components/dashboard/OverdueAlert";
import WithholdingPanel from "@/components/dashboard/WithholdingPanel";
import ProjectsTable from "@/components/ProjectsTable";
import ResearchWidget from "@/components/research/ResearchWidget";
import SubNav from "@/components/SubNav";
import SummaryCards from "@/components/SummaryCards";
import { getSavedOutputs } from "@/lib/core/saved";
import { daysUntil } from "@/lib/format";
import { getDashboardData } from "@/lib/projects";

/*
  The dashboard.

  A Server Component that fetches everything, then hands each widget's
  rendered content to a client grid that arranges them by the user's saved
  preferences — order, visibility, width. Data never leaves the server side
  of that boundary; only layout decisions happen in the browser.

  `now` is captured once and threaded to every child so no two components can
  disagree across a midnight boundary or hydration.
*/

export const dynamic = "force-dynamic";

export default async function Home() {
  const now = new Date();
  const [{ projects, metrics, source }, savedOutputs] = await Promise.all([
    getDashboardData(now),
    getSavedOutputs(),
  ]);

  // Withholding only has something to say when an unpaid invoice is going to
  // a company. Otherwise the panel is a row of zeroes about a tax that does
  // not apply, so the grid is told to leave the cell out entirely.
  const hasWithholding = projects.some(
    (p) => !p.isPaid && p.clientTaxType === "persona_moral",
  );

  const hasOverdue = projects.some(
    (p) => !p.isPaid && (p.status === "overdue" || daysUntil(p.deadline, now) < 0),
  );

  return (
    <div data-source={source} className="flex min-h-[calc(100vh-3.5rem)]">
      <SubNav />

      <main className="min-w-0 flex-1">
        <div className="relative">
          <div
            aria-hidden
            className="from-accent/8 pointer-events-none absolute inset-x-0 top-0 h-64 bg-linear-to-b to-transparent"
          />

          <div className="relative mx-auto max-w-7xl page-stack px-5 sm:px-8 lg:px-10">
            <header>
              <h1 className="page-title">
                Projects Overview
              </h1>
              <p className="text-ink-muted mt-1 text-sm">
                Welcome back — here&rsquo;s where your money and deadlines
                stand.
              </p>
            </header>

            <DashboardGrid
              hasOverdue={hasOverdue}
              hidden={hasWithholding ? [] : ["withholding"]}
              widgets={{
                overdue: <OverdueAlert projects={projects} now={now} />,
                withholding: <WithholdingPanel projects={projects} />,
                metrics: <SummaryCards metrics={metrics} />,
                projects: (
                  <ProjectsTable
                    projects={projects}
                    now={now}
                    action={<ProjectForm defaultOpen={projects.length === 0} />}
                  />
                ),
                core: <CorePreview outputs={savedOutputs} now={now} />,
                research: <ResearchWidget />,
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
