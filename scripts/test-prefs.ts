/*
  Preferences resilience tests.

  Run: npm run test:prefs

  localStorage is user-writable. Every one of these inputs is something a
  real browser could hand back, and every one must resolve to a valid
  preferences object rather than a crash.
*/

import { DEFAULT_PREFS, parsePrefs, WIDGET_IDS } from "@/lib/prefs/schema";

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

console.log("\nPREFERENCES RESILIENCE\n" + "─".repeat(64));

// Garbage in every shape a browser might return.
const garbage: [string, unknown][] = [
  ["null", null],
  ["undefined", undefined],
  ["empty string", ""],
  ["a number", 42],
  ["an array", [1, 2, 3]],
  ["empty object", {}],
  ["wrong version", { ...DEFAULT_PREFS, version: 99 }],
  ["density typo", { ...DEFAULT_PREFS, density: "cozy" }],
  ["widgets not an array", { ...DEFAULT_PREFS, dashboard: { pinOverdue: true, widgets: "nope" } }],
  ["unknown widget id", { ...DEFAULT_PREFS, dashboard: { pinOverdue: true, widgets: [{ id: "hacker", visible: true, width: "full" }] } }],
];

for (const [name, input] of garbage) {
  const p = parsePrefs(input);
  assert(
    `${name} → defaults`,
    JSON.stringify(p) === JSON.stringify(DEFAULT_PREFS),
  );
}

console.log("\nREPAIR — partial but valid input is completed, not rejected\n" + "─".repeat(64));

// A saved file from before a widget existed: it must be appended, not dropped.
const older = {
  ...DEFAULT_PREFS,
  dashboard: {
    pinOverdue: false,
    widgets: [
      { id: "metrics", visible: false, width: "half" },
      { id: "projects", visible: true, width: "full" },
    ],
  },
};
const repaired = parsePrefs(older);
assert("user's choices survive", repaired.dashboard.widgets[0].visible === false);
assert("user's order survives", repaired.dashboard.widgets[1].id === "projects");
assert(
  "missing widgets appended",
  repaired.dashboard.widgets.length === WIDGET_IDS.length,
  `got ${repaired.dashboard.widgets.length}, want ${WIDGET_IDS.length}`,
);
assert("pinOverdue preserved", repaired.dashboard.pinOverdue === false);

// A hand-edited file that lists a widget twice.
const duped = {
  ...DEFAULT_PREFS,
  dashboard: {
    pinOverdue: true,
    widgets: [
      { id: "metrics", visible: true, width: "full" },
      { id: "metrics", visible: false, width: "half" },
    ],
  },
};
const deduped = parsePrefs(duped);
assert(
  "duplicate widget ids collapse to the first",
  deduped.dashboard.widgets.filter((w) => w.id === "metrics").length === 1 &&
    deduped.dashboard.widgets.find((w) => w.id === "metrics")?.visible === true,
);
assert(
  "no widget id appears twice after repair",
  new Set(deduped.dashboard.widgets.map((w) => w.id)).size === deduped.dashboard.widgets.length,
);

console.log("\nDEFAULTS — the product is the default\n" + "─".repeat(64));
assert("default density is compact", DEFAULT_PREFS.density === "compact");
assert("default is work mode (reasoning hidden)", DEFAULT_PREFS.showReasoning === false);
assert("overdue pinned by default", DEFAULT_PREFS.dashboard.pinOverdue === true);
assert("every widget visible by default", DEFAULT_PREFS.dashboard.widgets.every((w) => w.visible));
assert("defaults themselves validate", JSON.stringify(parsePrefs(DEFAULT_PREFS)) === JSON.stringify(DEFAULT_PREFS));

console.log("\n" + "─".repeat(64));
console.log(`\n  ${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
