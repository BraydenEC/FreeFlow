import Link from "next/link";
import CorePreview from "@/components/core/CorePreview";
import DashboardGrid from "@/components/dashboard/DashboardGrid";
import ProjectForm from "@/components/dashboard/ProjectForm";
import ForecastPanel from "@/components/dashboard/ForecastPanel";
import OverdueAlert from "@/components/dashboard/OverdueAlert";
import WithholdingPanel from "@/components/dashboard/WithholdingPanel";
import ProjectsTable from "@/components/ProjectsTable";
import ResearchWidget from "@/components/research/ResearchWidget";
import SubNav from "@/components/SubNav";
import LandingPage from "@/components/landing/LandingPage";
import SummaryCards from "@/components/SummaryCards";
import { getSavedOutputs } from "@/lib/core/saved";
import { daysUntil } from "@/lib/format";
import { DEFAULT_CURRENCY } from "@/lib/currency";
import { getDashboardData } from "@/lib/projects";
import { getUserPrefs } from "@/lib/prefs/server";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";

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

/*
  The root serves two different pages.

  Signed out it is a landing page, because the proxy used to bounce a cold
  visitor straight to a sign-up form whose whole explanation was one sentence.
  Asking for an email before saying what the product is was the largest leak
  in the funnel.

  Signed in it is the dashboard, unchanged. The session decides, not the
  proxy, so there is no redirect and no flash of the wrong page.
*/
export default async function Home() {
  const supabase = await getServerSupabase();
  const user = await getSessionUser(supabase);
  if (!user) return <LandingPage />;

  const now = new Date();
  const [{ projects, metrics, source }, savedOutputs, prefs] = await Promise.all([
    getDashboardData(now),
    getSavedOutputs(),
    getUserPrefs(supabase, user.id),
  ]);

  // Threaded rather than read inside each component, exactly like `now`: one
  // request renders one currency everywhere, and a value pulled from ambient
  // state can differ between two halves of the same page.
  const currency = prefs?.currency ?? DEFAULT_CURRENCY;

  // Withholding only has something to say when an unpaid invoice is going to
  // a company. Otherwise the panel is a row of zeroes about a tax that does
  // not apply, so the grid is told to leave the cell out entirely.
  // Nothing unpaid means nothing to forecast, and an empty chart teaches a
  // new user only that the product has a chart.
  const hasForecast = projects.some((p) => !p.isPaid);

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
              hidden={[
                ...(hasWithholding ? [] : ["withholding" as const]),
                ...(hasForecast ? [] : ["forecast" as const]),
              ]}
              widgets={{
                overdue: <OverdueAlert projects={projects} now={now} currency={currency} />,
                forecast: <ForecastPanel projects={projects} now={now} currency={currency} />,
                withholding: <WithholdingPanel projects={projects} currency={currency} />,
                metrics: <SummaryCards metrics={metrics} currency={currency} />,
                projects: (
                  <ProjectsTable
                    projects={projects}
                    now={now}
                    currency={currency}
                    action={<ProjectForm defaultOpen={projects.length === 0} />}
                  />
                ),
                core: <CorePreview outputs={savedOutputs} now={now} />,
                research: <ResearchWidget />,
              }}
            />

            {/*
              The only nudge inside the product. One line, below the work,
              never in the way of it — a tracker that interrupts someone
              checking whether they have been paid, to ask them for money, has
              misread the room. It is also deliberately not dismissible,
              because a thing this quiet does not need a dismiss button.
            */}
            <p className="text-ink-faint text-center text-xs">
              FreeFlow is free and always will be for what it does today.{" "}
              <Link
                href="/support"
                className="text-ink-muted hover:text-ink underline-offset-4 hover:underline"
              >
                Chip in for hosting
              </Link>{" "}
              if it is earning its place.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
