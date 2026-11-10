/*
  Dock tests.
  Run: npm run test:nav

  The Dock replaces the top bar's page links. What's pinned here: the pages it
  lists and their order (every page in the product, grouped as the spec
  fixes), and the magnification curve, which must peak under the pointer and
  settle back to the base size by 150 px away.
*/

import { DOCK_GROUPS } from "@/lib/nav/dock";
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
    "/demo,/dashboard,/core,/chat,/research,/product,/pricing,/marketing,/docs,/support",
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

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
