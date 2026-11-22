import Link from "next/link";
import CorePreview from "@/components/core/CorePreview";
import DashboardGrid from "@/components/dashboard/DashboardGrid";
import DashboardShortcuts from "@/components/dashboard/DashboardShortcuts";
import ProjectFilters from "@/components/dashboard/ProjectFilters";
import ProjectForm from "@/components/dashboard/ProjectForm";
import ForecastPanel from "@/components/dashboard/ForecastPanel";
import OverdueAlert from "@/components/dashboard/OverdueAlert";
import WithholdingPanel from "@/components/dashboard/WithholdingPanel";
import ProjectsTable from "@/components/ProjectsTable";
import SubNav from "@/components/SubNav";
import SummaryCards from "@/components/SummaryCards";
import { getSavedOutputs } from "@/lib/core/saved";
import { lateness } from "@/lib/format";
import { DEFAULT_CURRENCY } from "@/lib/currency";
import { DEFAULT_TERMS_DAYS } from "@/lib/forecast/model";
import { DEFAULT_TAX_REGIME } from "@/lib/tax/withholding";
import { filterFromParams, filterProjects, isFilterActive } from "@/lib/projects/filter";
import { getDashboardData } from "@/lib/projects";
import { getUserPrefs } from "@/lib/prefs/server";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";
import { DONATIONS_ENABLED } from "@/lib/flags";

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
  /dashboard: the signed-in user's work. Signed out, it is an invitation to
  sign in instead (the proxy doesn't gate it, so the pitch can show).

  The public tab of venture counts was course material and is
  gone; the counts stay in the database for the owner.
*/
export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; payment?: string; tab?: string }>;
}) {
  const supabase = await getServerSupabase();
  const user = await getSessionUser(supabase);
  const params = await searchParams;

  if (!user) {
    return (
      <DashboardShell>
        <header>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-ink-muted mt-1 text-sm">
            Your projects live here once you sign in.
          </p>
        </header>
        <SignInInvite />
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

  // M1: an invoice is late after its payment terms, as the forecast assumes.
  const hasOverdue = projects.some((p) => lateness(p, now, termsDays).late);

  return (
    <div data-source={source} className="flex min-h-[calc(100vh-3.5rem)]">
      <DashboardShortcuts />
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
                {/* L3: a brand-new account was greeted with "Welcome back". */}
                {projects.length === 0
                  ? "Welcome. Add your first project and FreeFlow tracks its deadline and money from here."
                  : "Welcome back. Here\u2019s where your money and deadlines stand."}
              </p>
              {/* M7: on a phone the New project form sat 1,500px down the page. */}
              {projects.length > 0 && (
                <a
                  href="#new-project"
                  className="border-hairline text-ink mt-3 inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-medium sm:hidden"
                >
                  + New project
                </a>
              )}
            </header>

            <>

                      <DashboardGrid
                        hasOverdue={hasOverdue}
                        hidden={[
                          ...(hasWithholding ? [] : ["withholding" as const]),
                          ...(hasForecast ? [] : ["forecast" as const]),
                        ]}
                        widgets={{
                          overdue: <OverdueAlert projects={projects} now={now} currency={currency} termsDays={termsDays} />,
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
                              termsDays={termsDays}
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
                        }}
                      />
    
                      {/*
                        The only nudge inside the product. One line, below the work,
                        never in the way of it — a tracker that interrupts someone
                        checking whether they have been paid, to ask them for money, has
                        misread the room. It is also deliberately not dismissible,
                        because a thing this quiet does not need a dismiss button.
                      */}
                      {DONATIONS_ENABLED && (
                      <p className="text-ink-faint text-center text-xs">
                        FreeFlow is free while it grows.{" "}
                        <Link
                          href="/pricing#support"
                          className="text-ink-muted hover:text-ink underline-offset-4 hover:underline"
                        >
                          Chip in for hosting
                        </Link>{" "}
                        if it is earning its place.
                      </p>
                      )}
            </>
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

/* H10: what FreeFlow is and how to start, before any numbers about it. */
function SignInInvite() {
  return (
    <section className="border-hairline bg-surface rounded-xl border px-5 py-6 sm:px-8 sm:py-8">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
        Your projects, deadlines and money, in one place
      </h2>
      <p className="text-ink-muted mt-2 max-w-xl text-sm leading-relaxed">
        FreeFlow is a free tracker for freelancers. Add each job, see what&rsquo;s due and what you&rsquo;re
        owed, and get a month-by-month forecast of the money coming in.
      </p>
      <ul className="text-ink mt-4 grid max-w-2xl gap-2 text-sm sm:grid-cols-3">
        <li className="border-hairline rounded-lg border px-3 py-2">Deadlines and late invoices flagged</li>
        <li className="border-hairline rounded-lg border px-3 py-2">Six-month income forecast</li>
        <li className="border-hairline rounded-lg border px-3 py-2">Paste a client message, get a project</li>
      </ul>
      <p className="text-ink-faint mt-3 max-w-xl text-xs leading-relaxed">
        It tracks invoices you send from other tools; it doesn&rsquo;t create or send them yet. Your projects are
        private to you.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/signup"
          className="bg-accent text-app inline-flex min-h-11 items-center rounded-lg px-5 text-base font-semibold"
        >
          Create a free account
        </Link>
        <Link href="/login" className="border-hairline text-ink inline-flex min-h-11 items-center rounded-lg border px-4 text-sm">
          Sign in
        </Link>
        <Link href="/demo" className="text-ink-muted hover:text-ink inline-flex min-h-11 items-center px-2 text-sm underline underline-offset-4">
          See the demo first
        </Link>
      </div>
    </section>
  );
}
