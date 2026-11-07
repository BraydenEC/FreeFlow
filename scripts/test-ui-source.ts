/*
  Checks on component source, for the fixes that live in markup.
  Run: npm run test:ui-source

  These suites run under plain node, which cannot execute JSX, so a component
  can't be rendered here. Reading its source is the next best thing: it can't
  say a page looks right, but it does stop each of these specific faults from
  coming back unnoticed.
*/

import { readFileSync } from "node:fs";

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

const read = (path: string) => readFileSync(path, "utf8");

// ── Settings drawer ─────────────────────────────────────────────────────────
const drawer = read("components/prefs/LayoutDrawer.tsx");
const scroller = 'overflow-y-auto px-5 py-4';
assert("the drawer is headed Settings", /id="drawer-title"[^>]*>\s*Settings\s*</.test(drawer));
assert("it has one padded scrolling area", drawer.split(scroller).length === 2);
for (const field of ["prefs-terms", "prefs-regime", "prefs-currency"]) {
  assert(
    `${field} sits inside the padded area`,
    drawer.indexOf(scroller) !== -1 && drawer.indexOf(scroller) < drawer.indexOf(`htmlFor="${field}"`),
  );
}

// ── The project form: room to read it ───────────────────────────────────────
const table = read("components/ProjectsTable.tsx");
const editing = read("components/dashboard/EditProject.tsx");
const form = read("components/dashboard/ProjectForm.tsx");
const columns = table.match(/<th scope="col"/g)?.length ?? 0;
assert("the table has its six columns", columns === 6, `found ${columns}`);
assert("no edit form is left inside a table cell", !/<ProjectForm\b/.test(table));
assert("the desktop row uses the full-width edit row", table.includes("<EditableProjectRow"));
assert("the phone card uses the full-width edit panel", table.includes("<EditableProjectCard"));
assert(`the edit row spans every column`, table.includes(`COLUMN_COUNT = ${columns}`) && table.includes("colSpan={COLUMN_COUNT}") && editing.includes("colSpan={colSpan}"));
assert("the Edit button says whether the form is open", editing.includes("aria-expanded={editing}") && editing.includes("aria-controls"));
assert("closing hands focus back to the Edit button", /\.focus\(\)/.test(editing));
assert("Edit stays the button's name, which the guide relies on", />\s*Edit\s*</.test(editing));
assert("the form takes a whole line beside Export CSV", /<form[\s\S]{0,120}className="[^"]*\bw-full\b/.test(form));
assert("the form no longer pre-fills a signing date", !/contract_signed_on: todayIso/.test(form));

// ── Paid projects in the Due Date column ────────────────────────────────────
assert("every layout's deadline goes through one decision", table.includes("deadlineNote(") && !table.includes("formatRelativeDeadline"));

// ── The promise under the dashboard ─────────────────────────────────────────
const home = read("app/page.tsx");
assert("the dashboard makes no forever promise", !/always will be/i.test(home));
assert("it uses the words the other pages use", /free while it grows/.test(home));

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
