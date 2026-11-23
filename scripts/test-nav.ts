/*
  Navigation tests.
  Run: npm run test:nav

  The Dock replaces the top bar's page links. What's pinned here: the pages it
  lists and their order (every page in the product, grouped as the spec
  fixes). The magnification curve was removed for speed (a CSS hover scale
  replaced it).
*/

import { DOCK_GROUPS, FOOTER_COLUMNS, SITE_LINKS, TOP_LINKS } from "@/lib/nav/dock";
import { DOCS_PAGE_ENABLED, DONATIONS_ENABLED, MARKETING_IN_MENUS, RESEARCH_PAGE_ENABLED } from "@/lib/flags";
import { activeSubNavTab } from "@/lib/nav/subnav";

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


const hrefs = DOCK_GROUPS.flatMap((g) => g.items.map((i) => i.href));
// The user's own tools first, then the public pages about FreeFlow.
assert(
  "the Dock lists the user's tools first, then About FreeFlow",
  hrefs.join() === "/dashboard,/brief,/chat,/demo,/features,/pricing,/roadmap",
  hrefs.join(),
);
assert("groups are Your tools and About FreeFlow", DOCK_GROUPS.map((g) => g.label).join() === "Your tools,About FreeFlow");
assert(
  "every item has a label",
  DOCK_GROUPS.every((g) => g.items.every((i) => i.label.trim().length > 0)),
);
// M10: one name per feature
const labels = DOCK_GROUPS.flatMap((g) => g.items.map((i) => i.label));
assert("brief extraction is called Paste a brief", labels.includes("Paste a brief"));
assert("help is called Help desk", labels.includes("Help desk"));
assert("the story page is called Tour, not Demo", labels.includes("Tour") && !labels.includes("Demo"));
assert("TOP_LINKS are the user's tools", TOP_LINKS.map((l) => l.href).join() === "/dashboard,/brief,/chat");
assert("signed-out visitors get the public pages", SITE_LINKS.map((l) => l.href).join() === "/features,/pricing,/roadmap,/chat");

// Course pages stay out of every menu while their switches are off.
const everyLink = [
  ...hrefs,
  ...SITE_LINKS.map((l) => l.href),
  ...FOOTER_COLUMNS.flatMap((c) => c.links.map((l) => l.href)),
];
assert("no menu links to /research while it's hidden", RESEARCH_PAGE_ENABLED || !everyLink.includes("/research"));
assert("no menu links to /docs while it's hidden", DOCS_PAGE_ENABLED || !everyLink.some((h) => h.startsWith("/docs")));
assert("the marketing preview isn't in a menu", MARKETING_IN_MENUS || !everyLink.includes("/marketing"));
assert("nothing links to the old /core, /product or /support addresses", !everyLink.some((h) => ["/core", "/product", "/support"].includes(h)));

assert("the footer has Product, Support and Legal columns", FOOTER_COLUMNS.map((c) => c.heading).join() === "Product,Support,Legal");
assert("the footer links Privacy and Terms", everyLink.includes("/privacy") && everyLink.includes("/terms"));
assert("the footer links the donation section while donations are on", everyLink.includes("/pricing#support") === DONATIONS_ENABLED);

// The sidebar highlights the same tab the page shows: an unknown or hidden
// ?tab= (an old /pricing?tab=project link) falls back to the first tab.
const tabItems = [{ label: "Simulator", href: "?tab=simulator" }, { label: "Tiers", href: "?tab=tiers" }];
assert("sidebar highlights the tab in the URL", activeSubNavTab(tabItems, "tiers") === "tiers");
assert("sidebar falls back to the first tab with no ?tab=", activeSubNavTab(tabItems, null) === "simulator");
assert("sidebar falls back to the first tab for a hidden or unknown ?tab=", activeSubNavTab(tabItems, "project") === "simulator");
assert("anchor-only sidebars have no active tab", activeSubNavTab([{ label: "Overview", href: "#widget-metrics" }], null) === undefined);

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
