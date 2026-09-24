/*
  Feature map integrity tests.
  Run: npm run test:features

  WHY THIS FILE EXISTS

  /product is the page a visitor opens to find out what the product actually
  does, and it has now gone stale four separate times — features shipped, the
  map was not updated, and the page went on confidently describing a smaller
  product than the one that existed. A feature map that lags is worse than no
  feature map, because it is read as current.

  Three of those four drifts would have been caught by the checks below. The
  fourth — a shipped feature nobody added at all — cannot be caught by a test,
  because there is no ground truth to compare against. That one needs the
  convention: a feature is not shipped until it is in the map, the same rule
  the project already applies to nav items.

  What IS testable is that every claim the map makes is structurally sound:
  that a feature claiming a page links to a page that exists, that nothing is
  marked built without saying when it shipped, and that nothing marked planned
  quietly links somewhere.
*/

import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { FEATURE_GROUPS, featureSummary } from "@/lib/product/features";
import { TIERS } from "@/lib/pricing/tiers";

let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean, detail = "") {
  if (condition) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}${detail ? "  —  " + detail : ""}`);
  }
}

/*
  Every route the app actually serves, discovered from the filesystem.

  Route groups — the (auth) directory — are part of the path on disk and not
  part of the URL, so they are stripped. This is the piece that makes the test
  real rather than a restatement of the data: it reads the app, not the map.
*/
function discoverRoutes(dir: string, prefix = ""): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "api") continue;
      const segment = entry.startsWith("(") && entry.endsWith(")") ? "" : `/${entry}`;
      out.push(...discoverRoutes(full, prefix + segment));
    } else if (entry === "page.tsx") {
      out.push(prefix === "" ? "/" : prefix);
    }
  }
  return out;
}

const ROUTES = new Set(discoverRoutes("app"));
const ALL = FEATURE_GROUPS.flatMap((g) => g.features);
const TIER_IDS = new Set(TIERS.map((t) => t.id));

console.log("\nFEATURE MAP\n" + "─".repeat(64));
console.log(`  discovered routes: ${[...ROUTES].sort().join(" ")}\n`);

// --- The check that would have caught the drift --------------------------
assert("the app serves at least five routes", ROUTES.size >= 5, String(ROUTES.size));

for (const f of ALL) {
  if (f.route !== null) {
    assert(
      `"${f.name}" links to a route that exists (${f.route})`,
      ROUTES.has(f.route),
      `${f.route} is not served by app/`,
    );
  }
}

// --- built and planned must mean what they say ---------------------------
for (const f of ALL) {
  if (f.status === "built") {
    assert(`"${f.name}" says when it shipped`, Boolean(f.shippedIn), "built but shippedIn is null");
    assert(`"${f.name}" links somewhere`, f.route !== null, "built but route is null");
  } else {
    assert(`"${f.name}" claims no ship date`, f.shippedIn === null, String(f.shippedIn));
    // A planned feature linking to a page would send a visitor to something
    // that does not do the thing the link promised.
    assert(`"${f.name}" links nowhere`, f.route === null, String(f.route));
  }
}

// --- Internal consistency -------------------------------------------------
{
  const ids = ALL.map((f) => f.id);
  assert("feature ids are unique", new Set(ids).size === ids.length, ids.join(","));

  const groupIds = FEATURE_GROUPS.map((g) => g.id);
  assert("group ids are unique", new Set(groupIds).size === groupIds.length);

  assert("every group has at least one feature", FEATURE_GROUPS.every((g) => g.features.length > 0));
  assert("every group states its purpose", FEATURE_GROUPS.every((g) => g.purpose.trim().length > 20));
}

for (const f of ALL) {
  assert(
    `"${f.name}" has a description worth reading`,
    f.description.trim().length >= 40,
    `${f.description.length} chars`,
  );
  // tier is nullable in the type, so a null must be allowed explicitly
  // rather than silently coerced — a feature belonging to no tier is a
  // different claim from one belonging to a tier that does not exist.
  assert(
    `"${f.name}" names a real tier or none`,
    f.tier === null || TIER_IDS.has(f.tier),
    String(f.tier),
  );
}

// --- The summary the pages render ----------------------------------------
{
  const s = featureSummary();
  assert("summary totals match the list", s.built + s.planned === s.total);
  assert("summary counts every feature", s.total === ALL.length, `${s.total} vs ${ALL.length}`);
  assert("summary counts every group", s.groups === FEATURE_GROUPS.length);
  // The landing page prints "X of Y". Both must be believable.
  assert("something is built", s.built > 0);
  assert("something is still planned", s.planned > 0, "a map with nothing left to do is a map nobody updated");
}

// --- CFDI is the promise that is not kept --------------------------------
// Named explicitly because the pricing argument depends on it, and because a
// day when this starts passing for the wrong reason is worth noticing.
{
  const cfdi = ALL.find((f) => f.id === "cfdi-issue");
  assert("CFDI issuance is still in the map", Boolean(cfdi));
  assert(
    "CFDI issuance is still honestly marked unbuilt",
    cfdi?.status === "planned",
    "if this shipped, update the landing page and the pricing argument too",
  );
}

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
