/*
  Checks on component source, for the fixes that live in markup.
  Run: npm run test:ui-source

  These suites run under plain node, which cannot execute JSX, so a component
  can't be rendered here. Reading its source is the next best thing: it can't
  say a page looks right, but it does stop each of these specific faults from
  coming back unnoticed.
*/

import { existsSync, readFileSync } from "node:fs";

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

// ── /chat ticket integrity ──────────────────────────────────────────────────
const route = read("app/api/chat/session/route.ts");
const refused = route.slice(route.indexOf('error?.code === "42501"'));
assert(
  "an RLS refusal only reports 409 after confirming a ticket exists",
  refused.includes("canWrite") && refused.indexOf("canWrite") < refused.indexOf("status: 409"),
);
assert("the save route keeps a guardrail transcript", route.includes("needsTranscript(outcome, keptRatings, turns)"));
const chatWindow = read("components/chat/ChatWindow.tsx");
const keepChatting = chatWindow.slice(0, chatWindow.indexOf("Keep chatting"));
assert(
  "Keep chatting is disabled while a ticket is being filed",
  keepChatting.slice(keepChatting.lastIndexOf("<button")).includes("disabled={busy}"),
);

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
// The dashboard moved from / to /dashboard in Week 6.
const home = read("app/dashboard/page.tsx");
assert("the dashboard makes no forever promise", !/always will be/i.test(home));
assert("it uses the words the other pages use", /free while it grows/.test(home));

// ── Week 6 anonymous write routes ───────────────────────────────────────────
for (const path of [
  "app/api/funnel/route.ts",
  "app/api/launch-list/route.ts",
  "app/api/roadmap/vote/route.ts",
]) {
  let src = "";
  try {
    src = read(path);
  } catch {
    assert(`${path} exists`, false);
    continue;
  }
  const limitAt = src.indexOf("rateLimit(");
  assert(`${path}: rate limit comes before reading the body`, limitAt >= 0 && limitAt < src.indexOf("request.json()"));
  const noClient = src.slice(src.indexOf("if (!supabase)"));
  assert(
    `${path}: no database answers 503`,
    src.includes("if (!supabase)") && noClient.indexOf("status: 503") >= 0 && noClient.indexOf("status: 503") < 300,
  );
  assert(`${path}: a duplicate (23505) is a success`, src.includes('"23505"'));
  assert(`${path}: never reads rows back`, !src.includes(".select("));
}

// ── Week 6 Dock ─────────────────────────────────────────────────────────────
const readOr = (path: string) => {
  try {
    return read(path);
  } catch {
    return "";
  }
};
const dockSrc = readOr("components/nav/Dock.tsx");
assert("the Dock exposes its open state", dockSrc.includes("aria-expanded"));
assert("the Dock closes on Escape", dockSrc.includes('"Escape"'));
assert("the Dock respects reduced motion", /prefers-reduced-motion/.test(dockSrc));
assert("the Dock is a labelled nav", /<nav[^>]*aria-label=/.test(dockSrc));
assert("the Dock toggle is a real button", /<button[\s\S]{0,200}aria-expanded/.test(dockSrc));
assert("the top bar no longer lists pages", !readOr("components/TopBar.tsx").includes("PRIMARY_NAV"));

// ── Week 6 /dashboard ───────────────────────────────────────────────────────
assert("signed-in visitors to / go to the dashboard", read("app/page.tsx").includes('redirect("/dashboard")'));
const dashPage = readOr("app/dashboard/page.tsx");
assert(
  "the dashboard has Your work and FreeFlow in public tabs",
  dashPage.includes("<Tabs") && dashPage.includes('id: "work"') && dashPage.includes('id: "public"'),
);
assert("the dashboard stays dynamic", dashPage.includes('export const dynamic = "force-dynamic"'));
const proxySrc = read("proxy.ts");
const authBounce = proxySrc.slice(proxySrc.indexOf("AUTH_ROUTES.includes(pathname)"));
assert("signed-in users on auth pages go to /dashboard", authBounce.slice(0, 200).includes('"/dashboard"'));
assert("the dashboard is not gated by the proxy", !/PRIVATE_PREFIXES = \[[^\]]*\/dashboard/.test(proxySrc));
assert("email confirmation lands on /dashboard", read("app/auth/confirm/route.ts").includes('"/dashboard"'));
for (const path of [
  "components/auth/AuthForm.tsx",
  "components/auth/FragmentSession.tsx",
  "components/auth/ResetPasswordForm.tsx",
  "components/core/BriefToProject.tsx",
  "app/core/page.tsx",
]) {
  const src = read(path);
  assert(`${path} sends people to /dashboard, not /`, src.includes('"/dashboard"') && !/(href=|push\(|replace\()[^\n]{0,40}"\/"[^\w]/.test(src));
}
const publicNumbers = readOr("components/venture/PublicNumbers.tsx");
assert("the public tab exists", publicNumbers.length > 0);
assert("the public tab never mentions email", !/email/i.test(publicNumbers));
assert("the public tab says when numbers are unavailable", publicNumbers.includes("Live numbers are unavailable right now"));

// ── Week 6 /docs ────────────────────────────────────────────────────────────
const docsPage = readOr("app/docs/page.tsx");
const order = ["<JourneyStepper", "<WeekTimeline", "<PromptLibrary", "<TestingSummary", "<ImpactCheck", "<Roadmap"];
const positions = order.map((tag) => docsPage.indexOf(tag));
assert(
  "/docs renders journey, timeline, prompts, testing, impact, roadmap in that order",
  positions.every((p) => p >= 0) && positions.every((p, i) => i === 0 || p > positions[i - 1]),
  positions.join(","),
);
assert("/docs has the impact and roadmap anchors", docsPage.includes('id="impact"') && docsPage.includes('id="roadmap"'));
const impact = readOr("components/venture/ImpactCheck.tsx");
assert("the impact check gives the public contact", impact.includes("braydenemeryc@gmail.com"));
assert("the impact check's top tier is free lifetime access", impact.includes("free lifetime access"));
assert("the impact check promises no refunds or cash", !/refund/i.test(impact));
const roadmapSrc = readOr("components/venture/Roadmap.tsx");
// Every line that touches browser storage sits within three lines of a try.
const storageGuarded = (src: string, store: string) => {
  const lines = src.split("\n");
  const uses = lines.map((l, i) => (l.includes(store) ? i : -1)).filter((i) => i >= 0);
  return uses.length > 0 && uses.every((i) => lines.slice(Math.max(0, i - 3), i + 1).some((l) => l.includes("try {")));
};
assert("roadmap storage access is wrapped in try", storageGuarded(roadmapSrc, "localStorage"));
assert("roadmap votes are real buttons", roadmapSrc.includes("<button"));
const stepper = readOr("components/venture/JourneyStepper.tsx");
assert("the journey moves with arrow keys", stepper.includes('"ArrowRight"') && stepper.includes('"ArrowLeft"'));

// ── Week 6 /demo shell ──────────────────────────────────────────────────────
const demoPage = readOr("app/demo/page.tsx");
assert("/demo declares itself canonical", /alternates:\s*\{\s*canonical:\s*"\/demo"/.test(demoPage));
const rootPage = read("app/page.tsx");
assert("signed-out / renders the same funnel", rootPage.includes("<DemoFunnel"));
assert("the old landing page is gone", !existsSync("components/landing/LandingPage.tsx") && !rootPage.includes("LandingPage"));
const trackSrc = readOr("lib/funnel/track.ts");
assert("tracking survives blocked session storage", storageGuarded(trackSrc, "sessionStorage"));
assert("tracking never throws", trackSrc.includes(".catch("));
const jobCtx = readOr("components/funnel/JobContext.tsx");
assert("the colour wave is skipped under reduced motion", /prefers-reduced-motion/.test(jobCtx));
assert("the visit's choice survives blocked session storage", storageGuarded(jobCtx, "sessionStorage"));
assert("the old swatch row is gone", !existsSync("components/funnel/JobPicker.tsx"));
const jobWord = readOr("components/funnel/JobWord.tsx");
assert("the job word is a real button that says if it's open", jobWord.includes("<button") && jobWord.includes("aria-expanded"));
assert("the picker closes on Escape", jobWord.includes('"Escape"'));
assert("every swatch is a named button", /CHOICE_ORDER\.map[\s\S]{0,400}<button[\s\S]{0,300}aria-label/.test(jobWord));
assert("the sticky CTA tracks try-free clicks", readOr("components/funnel/StickyCta.tsx").includes('track("try_free_click"'));

// ── Week 6 /demo chapter 1 ──────────────────────────────────────────────────
assert("the old chapter 1 is gone", !existsSync("components/funnel/ChapterNight.tsx"));
const funnel = readOr("components/funnel/DemoFunnel.tsx");
assert("the funnel opens with the new hero", funnel.includes("<HeroField") && funnel.includes("<FlowsPin") && funnel.includes("<EndBand") && !funnel.includes("ChapterNight"));
assert("smooth scroll is skipped under reduced motion", /prefers-reduced-motion[\s\S]{0,300}new Lenis/.test(funnel));
assert("smooth scroll is torn down on leaving", funnel.includes(".destroy()"));
assert("the red edge glow is retired", !funnel.includes("248,113,113"));
assert("the funnel never scrolls sideways", funnel.includes("overflow-x-clip"));
const hero = readOr("components/funnel/HeroField.tsx");
assert("the hero reads reduced motion", /prefers-reduced-motion/.test(hero));
assert("sorting the night is tracked", hero.includes('track("night_sorted"'));
assert("the field canvas is decorative and lets touches through", /<canvas[^>]*aria-hidden[^>]*pointer-events-none|<canvas[^>]*pointer-events-none[^>]*aria-hidden/.test(hero));
assert("keyboard users can sort it", hero.includes("Sort it for me"));
assert("screen readers get the worries as a list", hero.includes("sr-only") && hero.includes("<ul"));
assert("the field stops drawing in a hidden tab", hero.includes("visibilitychange"));
assert("the job word never leaves its comma", /whitespace-nowrap[\s\S]{0,200}<JobWord/.test(hero));
const contours = readOr("components/funnel/Contours.tsx");
assert("the contour lines hold still under reduced motion", /prefers-reduced-motion/.test(contours));

// ── Week 6 /demo chapters 2-4 ───────────────────────────────────────────────
assert("the handwritten signature is retired", !existsSync("components/funnel/Signature.tsx"));
const storySrc = readOr("components/funnel/ChapterStory.tsx");
assert("the story is signed — Brayden", storySrc.includes("— Brayden"));
assert("the story's line is already drawn under reduced motion", /prefers-reduced-motion/.test(storySrc));
assert("the story's line is decorative", /<svg[^>]*aria-hidden/.test(storySrc));
const flows = readOr("components/funnel/FlowsPin.tsx");
assert("flows. is already filled under reduced motion", /prefers-reduced-motion/.test(flows));
assert("the flows screen pins", flows.includes("sticky"));
// The ink must be on the left of the gradient, so sliding it from 100% to 0% fills flows. left to right.
assert("flows. fills with colour, it doesn't drain", /linear-gradient\(90deg,\s*var\(--job\) 0%/.test(flows));
const heroSrcNow = readOr("components/funnel/HeroField.tsx");
assert("sorted rows snap into line", /order > 0\.9[\s\S]{0,160}\* 0\.12/.test(heroSrcNow));
const proof = readOr("components/funnel/ChapterProof.tsx");
assert("proof comes from CHANGES", proof.includes("CHANGES.map("));
assert("proof hard-codes no quotes", !/[“"][A-Z][^"”]{20,}[”"]/.test(proof.replace(/className="[^"]*"/g, "")));
assert("the story is tracked once read", readOr("components/funnel/ChapterStory.tsx").includes('track("story_complete"'));
const walk = readOr("components/funnel/ChapterWalkthrough.tsx");
assert("walkthrough samples are labelled Sample", walk.includes(">Sample<"));

// ── Week 6 /demo chapters 5-6 and footer ────────────────────────────────────
const game = readOr("components/funnel/Game.tsx");
assert("the game pauses when the tab is hidden", game.includes("visibilitychange"));
assert("the game's personal best survives blocked storage", storageGuarded(game, "localStorage"));
assert("invoices and upgrades are real buttons", game.includes("<button") && /invoices\.map[\s\S]{0,400}<button/.test(game) && /UPGRADES\.map[\s\S]{0,600}<button/.test(game));
assert("a finished round is tracked", game.includes('track("round_played"'));
assert("the game sends no score to the server", !/fetch\(/.test(game));
const launchForm = readOr("components/funnel/LaunchListForm.tsx");
assert("the launch list needs a consent checkbox", /type="checkbox"[\s\S]{0,200}required/.test(launchForm));
assert("the consent label is exact", launchForm.includes("Email me when the lifetime version launches. Nothing else."));
assert("the launch list posts to its route", launchForm.includes('"/api/launch-list"'));
assert("a 503 says it couldn't save", launchForm.includes("Couldn't save right now. Please try again later."));
assert("a repeat sign-up says already on the list", launchForm.includes("You're already on the list."));
const footer = readOr("components/funnel/FunnelFooter.tsx");
assert("the footer gives the contact address", footer.includes("mailto:braydenemeryc@gmail.com"));
assert("the footer links to the impact check", footer.includes("/docs#impact"));
assert(
  "the footer carries the exact privacy note",
  footer.includes(
    "Your email is used only to tell you when the lifetime version of FreeFlow launches. It is kept by Brayden (braydenemeryc@gmail.com). To be removed, email that address. Every launch email also has a remove-me link.",
  ),
);
assert("the old morning chapter is gone", !existsSync("components/funnel/ChapterMorning.tsx"));
const band = readOr("components/funnel/EndBand.tsx");
assert("the end band tracks the click", band.includes('track("try_free_click"'));
assert("the end band goes to sign-up", band.includes('href="/signup"'));
assert("the end band states no price", !/\$\s?\d|\bMXN\b|per month/i.test(band));
assert("the launch list sits under the band", band.includes("<LaunchListForm"));
assert("the end band has no rounded button", !/rounded/.test(band));
assert("the top link is square", !/rounded/.test(readOr("components/funnel/StickyCta.tsx")));
assert("events never send a neutral pick as a job", ["StickyCta", "EndBand", "ChapterStory", "Game"].every((f) => readOr(`components/funnel/${f}.tsx`).includes("trackJob")));

// ── Week 6 /pricing framing ─────────────────────────────────────────────────
assert(
  "/pricing says the tiers are long-term and launch is one-time",
  read("app/pricing/page.tsx").includes(
    "These tiers are a possible long-term model. The plan for launch is a one-time purchase for full access.",
  ),
);
const cfdiIssuance = [...read("lib/pricing/tiers.ts").matchAll(/"([^"]*CFDI[^"]*issuance[^"]*)"/g)]
  .map((m) => m[1])
  .filter((t) => !t.startsWith("No "));
assert(
  "every tier line offering CFDI issuance is marked planned",
  cfdiIssuance.length > 0 && cfdiIssuance.every((t) => t.endsWith("(planned)")),
  cfdiIssuance.join(" | "),
);

// ── Week 6 final review fixes ───────────────────────────────────────────────
// I1: hover-opening the Dock moves the toggle; page icons must not take a
// click until the visitor has had a moment to see the Dock open.
const dockNow = read("components/nav/Dock.tsx");
assert("a hover-opened Dock ignores clicks for a moment", dockNow.includes("armed") && /pointer-events-none/.test(dockNow));
// I2, I3 (dragged worries in the old chapter 1) retired with ChapterNight in the front-page redesign.
// I4: help-desk answers match the Week 6 site.
const rulesNow = read("lib/chat/rules.ts");
assert("the help desk no longer sends phone users to the top bar", !/top bar scrolls/.test(rulesNow));
assert("the help desk knows about the launch list", !/no newsletters/i.test(rulesNow) && /launch list/i.test(rulesNow));
assert(
  "the help desk lists the public pages",
  /id: "account-required"[\s\S]{0,900}Demo[\s\S]{0,300}Docs/.test(rulesNow),
);
// M4: the database refuses what the routes would refuse.
const ventureSql = read("supabase/week6_venture.sql");
assert(
  "votes are limited to roadmap items in the database",
  ["simpler-forecast", "one-time-launch", "tester-requests", "more-countries", "more-languages", "more-currencies", "cfdi", "leaderboard", "proof-of-work", "studio-accounts"].every((id) => ventureSql.includes(`'${id}'`)),
);
assert("launch-list emails are checked in the database", /email ~ /.test(ventureSql) && /email = lower\(email\)/.test(ventureSql));

// Re-graded from the final review's minors by their effect on visitors.
// M1, M11 (old chapter 1) retired with ChapterNight in the front-page redesign.
const gameLatest = read("components/funnel/Game.tsx");
assert("a round is counted once, even if the job changes after it (M2)", gameLatest.includes("countedRound"));

// /demo front page: final review fixes.
assert("the colour wave isn't hidden behind the page (I1)", !/ref=\{rootRef\}\s*className=\{`[^`]*bg-\[/.test(funnel) && /className="[^"]*bg-\[#0a0a0a\][^"]*"/.test(readOr("components/funnel/JobContext.tsx")));
assert("a finger drag moves the notes sideways instead of being taken by the browser (I2)", (hero.match(/touch-pan-y touch-pinch-zoom/g) ?? []).length >= 2);
assert("the picker panel stays on screen on a phone (I3)", readOr("components/funnel/JobWord.tsx").includes("innerWidth"));
assert("Sort it for me scrolls the rows clear of the headline (M2, re-graded)", /sortForMe[\s\S]{0,800}scrollTo/.test(hero));

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
