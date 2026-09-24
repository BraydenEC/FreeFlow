import { csvFilename, projectsToCsv } from "@/lib/export/csv";
import { DEFAULT_CURRENCY } from "@/lib/currency";
import { getUserPrefs } from "@/lib/prefs/server";
import { getDashboardData } from "@/lib/projects";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";

/*
  GET /api/export/projects — every project as CSV.

  Deliberately NOT /api/projects/export. That path sits inside the dynamic
  segment /api/projects/[id], and although Next resolves the static child
  first in development, production resolved it as an id and answered 405 —
  the method-not-allowed from the [id] handler, which only accepts PATCH and
  DELETE. A route that works locally and 405s in production is the worst kind
  of routing bug, so the collision is removed rather than relied upon.

  Reads through getDashboardData, the same function the dashboard renders
  from, so the file and the screen can never disagree about what exists.

  That shared path brings one hazard with it. getDashboardData falls back to
  mock data whenever the database is unreachable, which is correct for a page
  that must still render and completely wrong for a file somebody is about to
  hand their accountant. Six invented projects downloaded as "your projects"
  is a worse failure than a download that refuses. So the source is checked,
  and a fallback render refuses to become a file.
*/

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await getServerSupabase();
  if (!supabase) {
    return Response.json({ error: "Database is not configured." }, { status: 503 });
  }
  const user = await getSessionUser(supabase);
  if (!user) {
    return Response.json({ error: "Sign in to export." }, { status: 401 });
  }

  const now = new Date();
  const { projects, source } = await getDashboardData(now);

  if (source !== "supabase") {
    return Response.json(
      {
        error:
          "Your projects could not be loaded, so there is nothing safe to export. Try again shortly.",
      },
      { status: 503 },
    );
  }

  const prefs = await getUserPrefs(supabase, user.id);
  const csv = projectsToCsv(projects, prefs?.currency ?? DEFAULT_CURRENCY);

  return new Response(csv, {
    status: 200,
    headers: {
      // charset matters as much as the BOM for the accented client names.
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${csvFilename(now)}"`,
      // A financial export should never be served from a shared cache.
      "Cache-Control": "no-store, private",
    },
  });
}
