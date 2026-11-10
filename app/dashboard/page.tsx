import Link from "next/link";
import { Suspense } from "react";
import CorePreview from "@/components/core/CorePreview";
import DashboardGrid from "@/components/dashboard/DashboardGrid";
import ProjectFilters from "@/components/dashboard/ProjectFilters";
import ProjectForm from "@/components/dashboard/ProjectForm";
import ForecastPanel from "@/components/dashboard/ForecastPanel";
import OverdueAlert from "@/components/dashboard/OverdueAlert";
import WithholdingPanel from "@/components/dashboard/WithholdingPanel";
import ProjectsTable from "@/components/ProjectsTable";
import ResearchWidget from "@/components/research/ResearchWidget";
import SubNav from "@/components/SubNav";
import SummaryCards from "@/components/SummaryCards";
import Tabs from "@/components/prefs/Tabs";
import PublicNumbers from "@/components/venture/PublicNumbers";
import { getVentureCounts } from "@/lib/venture/counts";
import { getSavedOutputs } from "@/lib/core/saved";
import { daysUntil } from "@/lib/format";
import { DEFAULT_CURRENCY } from "@/lib/currency";
import { DEFAULT_TERMS_DAYS } from "@/lib/forecast/model";
import { DEFAULT_TAX_REGIME } from "@/lib/tax/withholding";
import { filterFromParams, filterProjects, isFilterActive } from "@/lib/projects/filter";
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

export const metadata = { title: "Dashboard — FreeFlow" };

/*
  /dashboard has two tabs.

  "Your work" is the signed-in dashboard, moved here unchanged from / in Week
  6. Signed out, that tab is an invitation to sign in instead.

  "FreeFlow in public" is visible to everyone: the venture's own numbers,
  aggregate counts only, from venture_counts(). It is the default tab for a
  signed-out visitor. The proxy does not gate this page for that reason.
*/
export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; payment?: string; tab?: string }>;
}) {
  const supabase = await getServerSupabase();
  const user = await getSessionUser(supabase);
  const params = await searchParams;
  const counts = getVentureCounts(supabase);

  if (!user) {
    return (
      <DashboardShell>
        <header>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-ink-muted mt-1 text-sm">
            Your projects live here once you sign in. FreeFlow&rsquo;s own numbers are public.
          </p>
        </header>
        <Suspense fallback={null}>
          <Tabs
            tablist="always"
            initial="public"
            tabs={[
              { id: "work", label: "Your work", content: <SignInInvite /> },
              { id: "public", label: "FreeFlow in public", content: <PublicNumbers counts={await counts} /> },
            ]}
          />
        </Suspense>
      </DashboardShell>
    );
  }

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
  const regime = prefs?.taxRegime ?? DEFAULT_TAX_REGIME;
  const termsDays = prefs?.defaultTermsDays ?? DEFAULT_TERMS_DAYS;

  // The filter narrows the TABLE only. The summary cards, the forecast and
  // the overdue alert keep reading every project, because a filter is a way
  // of looking at a list rather than a statement about what you are owed —
  // and a forecast that silently dropped half your income because a search
  // box had text in it would be the worst possible bug in this product.
  const filter = filterFromParams(params);
  const visibleProjects = filterProjects(projects, filter, now);
  const filterActive = isFilterActive(filter);

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

            <Suspense fallback={null}>
              <Tabs
                tablist="always"
                initial="work"
                tabs={[
                  {
                    id: "work",
                    label: "Your work",
                    content: (
                      <>

                      <DashboardGrid
                        hasOverdue={hasOverdue}
                        hidden={[
                          ...(hasWithholding ? [] : ["withholding" as const]),
                          ...(hasForecast ? [] : ["forecast" as const]),
                        ]}
                        widgets={{
                          overdue: <OverdueAlert projects={projects} now={now} currency={currency} />,
                          forecast: (
                            <ForecastPanel
                              projects={projects}
                              now={now}
                              currency={currency}
                              regime={regime}
                              termsDays={termsDays}
                            />
                          ),
                          withholding: <WithholdingPanel projects={projects} currency={currency} regime={regime} />,
                          metrics: <SummaryCards metrics={metrics} currency={currency} />,
                          projects: (
                            <ProjectsTable
                              projects={visibleProjects}
                              now={now}
                              currency={currency}
                              regime={regime}
                              action={<ProjectForm defaultOpen={projects.length === 0} />}
                              filterActive={filterActive}
                              total={projects.length}
                              filters={
                                projects.length > 0 ? (
                                  <ProjectFilters
                                    query={filter.query}
                                    status={filter.status}
                                    payment={filter.payment}
                                    total={projects.length}
                                    showing={visibleProjects.length}
                                  />
                                ) : null
                              }
                            />
                          ),
                          core: <CorePreview outputs={savedOutputs} now={now} currency={currency} />,
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
                        FreeFlow is free while it grows.{" "}
                        <Link
                          href="/support"
                          className="text-ink-muted hover:text-ink underline-offset-4 hover:underline"
                        >
                          Chip in for hosting
                        </Link>{" "}
                        if it is earning its place.
                      </p>
                      </>
                    ),
                  },
                  { id: "public", label: "FreeFlow in public", content: <PublicNumbers counts={await counts} /> },
                ]}
              />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-w-0 flex-1">
      <div className="relative mx-auto max-w-7xl page-stack px-5 sm:px-8 lg:px-10">{children}</div>
    </main>
  );
}

function SignInInvite() {
  return (
    <section className="border-hairline bg-surface rounded-xl border px-5 py-6 sm:px-6">
      <h2 className="text-[15px] font-semibold">Your projects, deadlines and money, in one place</h2>
      <p className="text-ink-muted mt-2 max-w-xl text-sm leading-relaxed">
        Sign in to see your dashboard, or create a free account. Your projects are private to you.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/signup" className="bg-accent text-app rounded-lg px-4 py-2 text-sm font-semibold">
          Create a free account
        </Link>
        <Link href="/login" className="border-hairline text-ink rounded-lg border px-4 py-2 text-sm">
          Sign in
        </Link>
      </div>
    </section>
  );
}
