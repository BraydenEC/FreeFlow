/*
  Dock tests.
  Run: npm run test:nav

  The Dock replaces the top bar's page links. What's pinned here: the pages it
  lists and their order (every page in the product, grouped as the spec
  fixes), and the magnification curve, which must peak under the pointer and
  settle back to the base size by 150 px away.
*/

import { DOCK_GROUPS } from "@/lib/nav/dock";
import { DONATIONS_ENABLED } from "@/lib/flags";
import { activeSubNavTab } from "@/lib/nav/subnav";
import { iconSize } from "@/lib/nav/magnify";

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

assert("icon is largest under the pointer", iconSize(0) === 78);
assert("icon is base size at the radius", iconSize(150) === 48);
assert("icon stays base size beyond the radius", iconSize(400) === 48);
assert("closer icons are larger", iconSize(50) > iconSize(100));
assert("size never drops below base", iconSize(-20) <= 78 && iconSize(1e6) === 48);

const hrefs = DOCK_GROUPS.flatMap((g) => g.items.map((i) => i.href));
assert(
  "the Dock lists every page in the spec's order",
  hrefs.join() ===
    "/demo,/dashboard,/core,/chat,/research,/product,/pricing,/marketing,/docs" + (DONATIONS_ENABLED ? ",/support" : ""),
  hrefs.join(),
);
assert(
  "groups are demo, work, business, about",
  DOCK_GROUPS.map((g) => g.id).join() === "demo,work,business,about",
);
assert(
  "every item has a label",
  DOCK_GROUPS.every((g) => g.items.every((i) => i.label.trim().length > 0)),
);

assert("the Dock lists Support only while donations are on", hrefs.includes("/support") === DONATIONS_ENABLED);

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
