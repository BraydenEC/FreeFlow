/*
  Checks on component source, for the fixes that live in markup.
  Run: npm run test:ui-source

  These suites run under plain node, which cannot execute JSX, so a component
  can't be rendered here. Reading its source is the next best thing: it can't
  say a page looks right, but it does stop each of these specific faults from
  coming back unnoticed.
*/

import { existsSync, readFileSync } from "node:fs";
import {
  DASHBOARD_PUBLIC_TAB_ENABLED,
  DOCS_PAGE_ENABLED,
  DONATIONS_ENABLED,
  FEATURES_PAGE_ENABLED,
  MARKETING_IN_MENUS,
  PRICING_SIMULATOR_ENABLED,
  RESEARCH_PAGE_ENABLED,
  WHATS_NEW_ENABLED,
} from "@/lib/flags";

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
assert("the table has its five columns (M1 dropped Progress)", columns === 5 && !table.includes("ProgressBar"), `found ${columns}`);
assert("no edit form is left inside a table cell", !/<ProjectForm\b/.test(table));
assert("the desktop row uses the full-width edit row", table.includes("<EditableProjectRow"));
assert("the phone card uses the full-width edit panel", table.includes("<EditableProjectCard"));
assert(`the edit row spans every column`, table.includes(`COLUMN_COUNT = ${columns}`) && table.includes("colSpan={COLUMN_COUNT}") && editing.includes("colSpan={colSpan}"));
assert("the Edit button says whether the form is open", editing.includes("aria-expanded={editing}") && editing.includes("aria-controls"));
assert("closing hands focus back to the Edit button", /\.focus\(\)/.test(editing));
assert("Edit stays the button's name, which the guide relies on", />\s*Edit\s*</.test(editing));
assert("the form takes a whole line beside Export CSV", /<form[\s\S]{0,600}className="[^"]*\bw-full\b/.test(form));
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
assert("the Dock respects reduced motion (motion-safe only)", /motion-safe:/.test(dockSrc) && !/transition-\[width/.test(dockSrc));
assert("the Dock is a labelled nav", /<nav[^>]*aria-label=/.test(dockSrc));
assert("the Dock toggle is a real button", /<button[\s\S]{0,200}aria-expanded/.test(dockSrc));
// H3: the Dock must never be the only, icon-only menu, nor cover content
assert("the top bar lists the user's tools on desktop", readOr("components/TopBar.tsx").includes("TOP_LINKS"));
assert("open Dock labels are always visible", !/opacity-0 group-hover:opacity-100/.test(dockSrc));
assert("the open Dock shows its group names", dockSrc.includes("{group.label}"));
assert("the Dock hides on the sign-in pages", dockSrc.includes("AUTH_ROUTES"));
assert("the Dock hides while Settings is open", dockSrc.includes("data-dock") && read("app/globals.css").includes('[data-sheet="open"] [data-dock]') && readOr("components/prefs/LayoutDrawer.tsx").includes("dataset.sheet"));
assert("the open Dock wraps on phones instead of scrolling sideways", dockSrc.includes("flex-wrap"));

// ── Week 6 /dashboard ───────────────────────────────────────────────────────
assert("signed-in visitors to / go to the dashboard (in the proxy)", /pathname === "\/"/.test(read("proxy.ts")));
const dashPage = readOr("app/dashboard/page.tsx");
assert(
  "the dashboard's public-numbers tab follows its switch",
  dashPage.includes("DASHBOARD_PUBLIC_TAB_ENABLED ? getVentureCounts(supabase) : null") &&
    dashPage.includes("FreeFlow in public") &&
    existsSync("components/venture/PublicNumbers.tsx"),
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
  // The logo's home link (L3) is a link home, not a post-sign-in destination.
  const src = read(path).replace(/<Link href="\/" aria-label="FreeFlow home"/g, "");
  const dest = path.endsWith("AuthForm.tsx") ? read("lib/auth/validate.ts") : src;
  assert(`${path} sends people to /dashboard, not /`, dest.includes('"/dashboard"') && !/(href=|push\(|replace\()[^\n]{0,40}"\/"[^\w]/.test(src));
}

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
assert("the impact check gives the public contact", impact.includes("{CONTACT_EMAIL}"));
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
{
  // No curse words anywhere the site is built from (pages, components, content).
  const { readdirSync, readFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const files = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? files(join(dir, e.name)) : /\.(tsx?|md|json)$/.test(e.name) && !/ 2\./.test(e.name) ? [join(dir, e.name)] : [],
    );
  const CURSES = /\b(shit\w*|fuck\w*|damn\w*|bullshit|ass(hole)?|bitch\w*|bastard|crap|pissed|mfs?|motherfuck\w*|wtf|cunt|mierda|pinche|chingad\w*|cabr[oó]n|pendej\w*|verga|joder|carajo|put[ao])\b/i;
  const dirty = ["app", "components", "lib"].flatMap(files).filter((f) => CURSES.test(readFileSync(f, "utf8")));
  assert("no curse words anywhere on the site", dirty.length === 0, dirty.join(", "));
}
assert("tier and segment cards use the visible lists", readOr("components/pricing/TierCards.tsx").includes("VISIBLE_TIERS.map(") && readOr("components/pricing/SegmentPanel.tsx").includes("VISIBLE_SEGMENTS.map("));
// The two switches live in a data-free module, so client components that read
// them (SubNav via lib/nav, the Dock, the feature map) don't bundle pricing or
// donation data.
assert("the feature switches live in a module with no imports", !/^import /m.test(readOr("lib/flags.ts")) && /export const DONATIONS_ENABLED/.test(readOr("lib/flags.ts")) && /export const PER_PROJECT_PRICING_ENABLED/.test(readOr("lib/flags.ts")));
assert("nav and the Dock read the switches from lib/flags only", ["lib/nav.tsx", "lib/nav/dock.ts"].every((f) => !/@\/lib\/(support|pricing\/tiers)"/.test(readOr(f))));
assert("the sidebar picks its active tab with the shared fallback", /activeSubNavTab\(/.test(readOr("components/SubNav.tsx")));
assert("the marketing generator and page use the shared free pitch, not donation wording", ["lib/marketing/engine.ts", "app/marketing/page.tsx"].every((f) => !/donation/i.test(readOr(f)) && /FREE_PITCH/.test(readOr(f))));
assert("/product hides the Project tier badge while per-project pricing is off", /PER_PROJECT_PRICING_ENABLED[\s\S]{0,120}"project"[\s\S]{0,120}TierBadge/.test(readOr("components/product/FeatureMap.tsx")));
assert("the impact check doesn't claim testers before they have tested", !readOr("components/venture/ImpactCheck.tsx").includes("Five outside testers use it this week"));
assert("scroll turns each note into its checked row gradually: no snap at 90%", hero.includes("worryProgress(") && hero.includes("morph(") && !/order > 0\.9|order < 0\.9/.test(hero));
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
assert("sorted rows land exactly in line (drawn at the row once a worry is sorted)", /const x = p\.x \+ \(t\.x - p\.x\) \* pk;/.test(heroSrcNow) && /const y = p\.y \+ \(t\.y - p\.y\) \* pk;/.test(heroSrcNow));
const proof = readOr("components/funnel/ChapterProof.tsx");
assert("proof comes from CHANGES", proof.includes("CHANGES.map("));
assert("proof hard-codes no quotes", !/[“"][A-Z][^"”]{20,}[”"]/.test(proof.replace(/className="[^"]*"/g, "")));
assert("the story is tracked once read", readOr("components/funnel/ChapterStory.tsx").includes('track("story_complete"'));
const walk = readOr("components/funnel/ChapterWalkthrough.tsx");
assert("walkthrough samples are labelled Sample", walk.includes(">Sample<"));

// ── Week 6 /demo chapters 5-6 and footer ────────────────────────────────────
const game = readOr("components/funnel/Game.tsx");
const gamePrefs = readOr("lib/game/prefs.ts");
assert("the game pauses when the tab is hidden", game.includes("visibilitychange"));
assert("best score and style survive blocked storage", storageGuarded(gamePrefs, "localStorage") && !game.includes("localStorage"));
assert("a finished run is tracked once", game.includes('track("round_played"') && game.includes("countedRound"));
assert("the game sends no score to the server", !/fetch\(/.test(game));
assert("the game draws on a labelled canvas", /<canvas[\s\S]{0,300}aria-label=/.test(game));
assert("new jobs and questions are announced to screen readers", /aria-live="polite"/.test(game));
assert("keys act on the focused canvas only, and Space doesn't scroll", /onKeyDown=\{/.test(game) && game.includes("preventDefault") && !/document\.addEventListener\("keydown"/.test(game));
assert("reduced motion stops the ramp and decoration", game.includes("prefers-reduced-motion") && /ramp:\s*!/.test(game));
assert("the style switch offers all four styles", game.includes("STYLE_IDS.map("));
assert("the closing line doesn't claim FreeFlow learns changes itself", game.includes("FreeFlow keeps every deadline and amount in one place, so you don't have to."));
assert("Start free is tracked", game.includes('track("try_free_click"'));
assert("the launch list stays at the end of the game", game.includes('<LaunchListForm source="game_end"'));
// Final review fixes.
assert("the game square is measured inside the card's padding, and follows container resizes (I1)", !game.includes("parentElement") && game.includes("new ResizeObserver("));
assert("a finger scrolling past the start screen doesn't start a run (I2)", (game.match(/onPointerDown=/g) ?? []).length === 1 && /onPointerDown=\{\(e\) => \{\s*if \(screen !== "playing"\) return;/.test(game));
assert("the game page uses no red: red means overdue, on the canvas only (I3)", !/status-overdue|#ef4444|text-red/.test(game));
assert("the message strip clears when the run isn't playing", /const msg = screen === "playing" \? hud\.message : null/.test(game));
assert("the end screen takes keyboard focus on Play again", game.includes("playAgainRef") && /playAgainRef\.current\?\.focus\(/.test(game));
assert("screen readers get the game as an application and the hearts as an image", /<canvas[\s\S]{0,200}role="application"/.test(game) && /role="img"[\s\S]{0,40}aria-label=\{`\$\{hud\.hearts\} hearts left`\}/.test(game));
assert("a question's openings are read out, top to bottom", game.includes("Openings, top to bottom:") && /className="sr-only"/.test(game));
const launchForm = readOr("components/funnel/LaunchListForm.tsx");
assert("the launch list needs a consent checkbox", /type="checkbox"[\s\S]{0,200}required/.test(launchForm));
assert("the consent label is exact", launchForm.includes("Email me once, before FreeFlow starts charging. Nothing else."));
assert("the launch list posts to its route", launchForm.includes('"/api/launch-list"'));
assert("a 503 says it couldn't save", launchForm.includes("Couldn't save right now. Please try again later."));
assert("a repeat sign-up says already on the list", launchForm.includes("You're already on the list."));
const footer = readOr("components/funnel/FunnelFooter.tsx");
assert("the footer gives the contact address", footer.includes("mailto:${CONTACT_EMAIL}") && read("lib/site.ts").includes('CONTACT_EMAIL = "hello@freeflow.website"'));
assert("the footer links to the make-it-right promise", footer.includes("/terms#if-we-get-it-wrong") && read("app/terms/page.tsx").includes('id="if-we-get-it-wrong"'));
assert(
  "the footer carries the exact privacy note",
  footer.includes(
    "Your email is used only to tell you, once, before FreeFlow starts charging. It is kept by Brayden ({CONTACT_EMAIL}). To be removed, email that address. That email also has a remove-me link.",
  ),
);
assert("the old morning chapter is gone", !existsSync("components/funnel/ChapterMorning.tsx"));
const band = readOr("components/funnel/EndBand.tsx");
assert("the end band tracks the click", band.includes('track("try_free_click"'));
assert("the end band goes to sign-up (or the dashboard when signed in)", band.includes("href={cta.href}") && read("components/funnel/useCta.ts").includes('"/signup"') && read("components/funnel/useCta.ts").includes('"/dashboard"'));
assert("the end band states no price", !/\$\s?\d|\bMXN\b|per month/i.test(band));
assert("the launch list sits under the band", band.includes("<LaunchListForm"));
assert("the end band has no rounded button", !/rounded/.test(band));
assert("the top link is square", !/rounded/.test(readOr("components/funnel/StickyCta.tsx")));
assert("events never send a neutral pick as a job", ["StickyCta", "EndBand", "ChapterStory", "Game"].every((f) => readOr(`components/funnel/${f}.tsx`).includes("trackJob")));

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
assert("the Dock never ignores a click (no arming delay)", !dockNow.includes("armed") && !dockNow.includes("armTimer"));
// I2, I3 (dragged worries in the old chapter 1) retired with ChapterNight in the front-page redesign.
// I4: help-desk answers match the Week 6 site.
const rulesNow = read("lib/chat/rules.ts");
assert("the help desk no longer sends phone users to the top bar", !/top bar scrolls/.test(rulesNow));
assert("the help desk knows about the launch list", !/no newsletters/i.test(rulesNow) && /launch list/i.test(rulesNow));
assert(
  "the help desk lists the public pages",
  /id: "account-required"[\s\S]{0,900}Demo[\s\S]{0,300}Docs/.test(rulesNow),
);
// M4: the database refuses what the routes would refuse, and accepts every item on the page.
const ROADMAP_IDS_FOR_DB = [...read("lib/venture/roadmap.ts").matchAll(/id: "([a-z-]+)"/g)].map((m) => m[1]);
const ventureSql = read("supabase/week6_venture.sql");
assert(
  "votes are limited to roadmap items in the database",
  ROADMAP_IDS_FOR_DB.every((id) => ventureSql.includes(`'${id}'`)),
);
assert("launch-list emails are checked in the database", /email ~ /.test(ventureSql) && /email = lower\(email\)/.test(ventureSql));

// Re-graded from the final review's minors by their effect on visitors.
// M1, M11 (old chapter 1) retired with ChapterNight in the front-page redesign.

// /demo front page: final review fixes.
assert("the colour wave isn't hidden behind the page (I1)", !/ref=\{rootRef\}\s*className=\{`[^`]*bg-\[/.test(funnel) && /className="[^"]*bg-\[#0a0a0a\][^"]*"/.test(readOr("components/funnel/JobContext.tsx")));
assert("a finger drag moves the notes sideways instead of being taken by the browser (I2)", (hero.match(/touch-pan-y touch-pinch-zoom/g) ?? []).length >= 2);
assert("the picker panel stays on screen on a phone (I3)", readOr("components/funnel/JobWord.tsx").includes("innerWidth"));
assert("Sort it for me scrolls the rows clear of the headline (M2, re-graded)", /sortForMe[\s\S]{0,800}scrollTo/.test(hero));


// ── H4: Mark paid can be undone and dated ──────────────────────────────────
{
  const paidRoute = read("app/api/projects/[id]/paid/route.ts");
  const del = paidRoute.slice(paidRoute.indexOf("export async function DELETE"));
  assert("the paid route can mark a project unpaid", paidRoute.includes("export async function DELETE"));
  assert("unpaid clears both columns together", del.includes("is_paid: false") && del.includes("paid_at: null"));
  assert("unpaid only touches the signed-in user's project", del.includes('.eq("user_id", user.id)'));
  assert("a future paid date is refused by the route", paidRoute.includes("paidDateError("));
  const button = read("components/dashboard/MarkPaidButton.tsx");
  assert("Mark paid sends the local date", button.includes("localToday()") && button.includes("paid_at"));
  assert("a paid row offers Mark unpaid", button.includes("Mark unpaid") && button.includes('method: "DELETE"'));
  const table = read("components/ProjectsTable.tsx");
  assert("paid rows keep a payment control", !table.includes("!project.isPaid && <MarkPaidButton") && table.split("<MarkPaidButton projectId={project.id} isPaid={project.isPaid} />").length === 3);
  const form = read("components/dashboard/ProjectForm.tsx");
  assert("Edit shows Paid on for a paid project", form.includes("Paid on") && form.includes("project?.isPaid"));
  assert("a changed Paid on is saved through the paid route", form.includes("paidDateChanged(") && form.includes("/paid`"));
}


// ── H7 / M15: project routes ───────────────────────────────────────────────
for (const path of ["app/api/projects/route.ts", "app/api/projects/[id]/route.ts"]) {
  assert(`${path} returns every error at once`, read(path).includes("errors: projectErrors("));
}
for (const path of ["app/api/projects/[id]/route.ts", "app/api/projects/[id]/paid/route.ts"]) {
  const src = read(path);
  assert(`${path} answers a malformed id with 404`, (src.match(/isProjectId\(id\)/g) ?? []).length === 2);
}


// ── H7 / M8 / M13: the project form ────────────────────────────────────────
{
  const form = read("components/dashboard/ProjectForm.tsx");
  const submit = form.slice(form.indexOf("async function onSubmit"));
  assert("the form checks every field before sending", submit.indexOf("projectErrors(form)") > -1 && submit.indexOf("projectErrors(form)") < submit.indexOf("fetch("));
  assert("a failed submit focuses the first problem", form.includes("focusField(list[0].field)"));
  assert("the error summary sits by the submit button", form.includes("fields need attention"));
  assert("opening the form focuses its first field", form.includes('focusField("name")'));
  assert("Escape closes the form", /e\.key === "Escape"[\s\S]{0,80}close\(\)/.test(form));
  assert("a half-filled new project is kept for the tab", form.includes("sessionStorage") && form.includes("DRAFT_KEY"));
  assert("unsaved changes warn before leaving", form.includes("beforeunload"));
  assert("a new project hides the extras under More details", form.includes("More details"));
  assert("form text is 16px on phones", form.includes("text-base sm:text-sm"));
}

// ── H5 / H6 / M10: Paste a brief ───────────────────────────────────────────
{
  const bench = read("components/core/CoreWorkbench.tsx");
  assert("the brief and result survive a reload", bench.includes("readDraft(window.sessionStorage)") && bench.includes("writeDraft(window.sessionStorage"));
  assert("an unadded result warns before leaving", bench.includes("beforeunload"));
  assert("one way forward: no Save to database button", !bench.includes("Save to database"));
  assert("the button has a plain name", !bench.includes("Extract core") && bench.includes("Read the brief"));
  assert("the keyboard hint is hidden on touch screens", bench.includes("[@media(hover:hover)]:inline"));
  assert("a budget is shown when the brief has one", bench.includes('label="Budget"'));
  assert("adding the project is the primary action", read("components/core/BriefToProject.tsx").includes('createLabel="Add to my projects"'));
}


// ── H9 / H10 / M1 / M6 / H8 ────────────────────────────────────────────────
{
  const pricing = read(PRICING_SIMULATOR_ENABLED ? "components/pricing/SimulatorPricing.tsx" : "components/pricing/DonationPricing.tsx");
  assert("/pricing says FreeFlow doesn't send invoices", pricing.includes("doesn&rsquo;t create or send invoices"));
  const dash = read("app/dashboard/page.tsx");
  const signedOut = dash.slice(dash.indexOf("if (!user)"), dash.indexOf("const now = new Date()"));
  assert("a signed-out visitor opens on the pitch", signedOut.includes("<SignInInvite />"));
  assert("a new account isn't welcomed back", dash.includes("projects.length === 0") && dash.includes("Welcome. Add your first project"));
  assert("lateness uses payment terms on the dashboard", dash.includes("lateness(p, now, termsDays)") && read("components/dashboard/OverdueAlert.tsx").includes("lateness("));
  assert("the summary says which currency", read("components/SummaryCards.tsx").includes("Amounts in {currency}"));
  assert("a currency switch warns that nothing was converted", read("components/prefs/LayoutDrawer.tsx").includes("Existing amounts were not converted"));
}


// ── M5 / M13 / M14 / L1 / L5 / L9 / H2 ─────────────────────────────────────
{
  for (const f of ["app/privacy/page.tsx", "app/terms/page.tsx", "app/not-found.tsx", "app/robots.ts", "app/sitemap.ts"]) {
    assert(`${f} exists`, existsSync(f));
  }
  const layout = read("app/layout.tsx");
  assert("every page has the footer with Privacy and Terms", layout.includes("<SiteFooter />") && read("lib/nav/dock.ts").includes('href: "/privacy"'));
  assert("a skip link comes before the top bar", layout.indexOf("Skip to content") > -1 && layout.indexOf("Skip to content") < layout.indexOf("<TopBar />"));
  assert("the Settings gear has a name", read("components/TopBar.tsx").includes('aria-label="Settings"'));
  const auth = read("components/auth/AuthForm.tsx");
  assert("sign-up checks fields before the server", auth.indexOf("authProblems(") > -1 && auth.indexOf("authProblems(") < auth.indexOf("signUp("));
  assert("server errors are reworded", auth.includes("friendlyAuthError(message)") && !auth.includes("setError(message)"));
  assert("the email field takes the cursor", auth.includes("autoFocus"));
  assert("sign-up has a consent line", auth.includes('href="/terms"') && auth.includes('href="/privacy"'));
  assert("the email never goes in the URL", !auth.includes("verify-email?email") && !read("app/(auth)/verify-email/page.tsx").includes("searchParams"));
  assert("signing in returns to where you were", auth.includes("router.push(next)") && read("proxy.ts").includes("?next="));
  assert("signing out goes home", read("components/auth/SignOutButton.tsx").includes('router.push("/")'));
  const verify = read("components/auth/VerifyEmailPanel.tsx");
  assert("the confirm page leads with the spam folder", verify.includes("Check your Spam folder"));
  assert("the address wraps only after the @", verify.includes("<wbr />") && !verify.includes("break-all"));
  assert("resend is rate limited per visitor", read("app/api/auth/resend/route.ts").includes("rateLimit("));
}


// ── M2 / M3 / M4 / M7 / M9 / M13 / L2 / L6 / L8 ────────────────────────────
{
  const chatWin = read("components/chat/ChatWindow.tsx");
  assert("help desk hides internal rule names", !chatWin.includes("Answer from rule"));
  assert("help desk shows a text box from the start", chatWin.includes('step !== "preview" && step !== "filed"'));
  assert("help desk routes a typed question by its words", chatWin.includes("guessIntake(raw)"));
  assert("help desk keeps the conversation across reloads", chatWin.includes("sessionStorage") && chatWin.includes("STORE_KEY"));
  assert("signed out, nothing is saved", chatWin.includes("!signedIn ||"));
  assert("signed-out visitors get the help desk", read("app/chat/page.tsx").includes("signedIn={Boolean(user)}") && !read("app/chat/page.tsx").includes("Help is for people who use FreeFlow"));
  const hero = read("components/funnel/HeroField.tsx");
  assert("Sort it for me is a visible button", hero.includes("Sort it for me") && !hero.includes("-left-[9999px]"));
  assert("the role dots carry visible names", !read("components/funnel/JobWord.tsx").includes("opacity-0 group-hover:opacity-100"));
  assert("phones get one note per worry", hero.includes("fieldCount(w, list.length)"));
  assert("/product shows no week stamps", !read("components/product/FeatureMap.tsx").includes("{f.shippedIn}"));
  assert("search is full width on phones", read("components/dashboard/ProjectFilters.tsx").includes("basis-full"));
  assert("phones get 16px fields everywhere", read("app/globals.css").includes("font-size: 16px !important"));
  assert("extraction notes are shown in plain words", read("components/core/CoreWorkbench.tsx").includes("plainNote(fields.confidence_note)"));
  assert("tabs move with the arrow keys", read("components/prefs/Tabs.tsx").includes("ArrowRight"));
  assert("dashboard shortcuts are mounted", read("app/dashboard/page.tsx").includes("<DashboardShortcuts />"));
  assert("every slider has a number field", read("components/pricing/PricingCalculator.tsx").includes("exact value"));
}

// ── /pricing: Module 3's revenue model, or the donation-first page ─────────
{
  const page = read("app/pricing/page.tsx");
  assert("/pricing picks its version from the switch", /if \(!PRICING_SIMULATOR_ENABLED\) return <DonationPricing \/>;/.test(page) && page.includes("<SimulatorPricing tab={tab} />"));
  // The donation-first page is kept whole while it is switched off.
  const donation = read("components/pricing/DonationPricing.tsx");
  const lead = donation.indexOf("Free. Every feature, for everyone.");
  assert("the donation page leads with free", lead > -1 && lead < donation.indexOf('id="support"'));
  assert("the donation page has the donation section", donation.includes('id="support"') && donation.includes("SUGGESTED_AMOUNTS.map(") && donation.includes("<DonateButton"));
  assert("the donation page explains what donations pay for and don't buy", donation.includes("WHAT_IT_FUNDS.map(") && donation.includes("WHAT_IT_DOES_NOT_BUY.map("));
  assert("the donation page answers 'will it always be free?'", donation.includes("Will FreeFlow always be free?") && donation.includes("PRICING_FAQ"));
  assert("the donation page shows no revenue model", !/PricingCalculator|TierCards|SavedScenarios|AssumptionsTable|Build log/.test(donation));
  // Module 3: tiers, segments, calculator, scenario toggle, assumptions, saved scenarios.
  const sim = read("components/pricing/SimulatorPricing.tsx");
  assert("the simulator page has tiers and segments", sim.includes("<TierCards />") && sim.includes("<SegmentPanel />"));
  assert("the simulator page has the calculator, assumptions and saved scenarios", sim.includes("<PricingCalculator />") && sim.includes("<AssumptionsTable />") && sim.includes("<SavedScenarios scenarios={saved} />"));
  assert("the simulator page says nothing is charged today", sim.includes("None of this is being charged today."));
  assert("the calculator has the scenario toggle", /SCENARIOS|scenario/i.test(read("components/pricing/PricingCalculator.tsx")));
  assert("the /pricing sidebar follows the switch", read("lib/nav.tsx").includes('"/pricing": [') && read("lib/nav.tsx").includes("PRICING_SIMULATOR_ENABLED"));
  const support = read("app/support/page.tsx");
  assert("/support sends people to the donation section, or 404s with donations off", support.includes("if (!DONATIONS_ENABLED) notFound();") && /redirect\("\/pricing#support"\)/.test(support));
  // Donations off hides the legal paragraphs too (kept in the code).
  assert("/terms hides its donation section with donations off", /\{DONATIONS_ENABLED && \(\s*<>\s*<h2 id="donations">/.test(read("app/terms/page.tsx")));
  assert("/privacy hides its Stripe line with donations off", /\{DONATIONS_ENABLED && \(\s*<li>\s*Donations are processed by Stripe/.test(read("app/privacy/page.tsx")));
  assert("the roadmap promises donors nothing with donations off", read("lib/venture/roadmap.ts").includes("DONATIONS_ENABLED\n      ? "));
  assert("What's new on /roadmap follows its switch", read("app/roadmap/page.tsx").includes("{WHATS_NEW_ENABLED && ("));
  void DONATIONS_ENABLED;
  void WHATS_NEW_ENABLED;
}

// ── Public site: menus ──────────────────────────────────────────────────────
{
  const bar = read("components/TopBar.tsx");
  assert("the top bar shows visitors the public pages and members their tools", /\(user \? TOP_LINKS : SITE_LINKS\)/.test(bar));
  assert("a visitor gets a sign-up button in the top bar", /href="\/signup"[\s\S]{0,600}Create a free account/.test(bar));
  const footer = read("components/SiteFooter.tsx");
  assert("the footer draws its columns from FOOTER_COLUMNS", footer.includes("FOOTER_COLUMNS.map("));
  assert("the footer keeps the contact address", footer.includes("mailto:${CONTACT_EMAIL}"));
  const sitemap = read("app/sitemap.ts");
  assert("the sitemap lists the public pages", ["/roadmap", "/pricing", "/demo", "/privacy", "/terms"].every((p) => sitemap.includes(`"${p}"`)));
  assert("the sitemap lists /features or /product by the switch", sitemap.includes('FEATURES_PAGE_ENABLED ? "/features" : "/product"'));
  assert("the sitemap lists course pages only by their switches", ["RESEARCH_PAGE_ENABLED ? [\"/research\"]", "MARKETING_IN_MENUS ? [\"/marketing\"]", "DOCS_PAGE_ENABLED ? [\"/docs\"]"].every((x) => sitemap.includes(x)));
  assert("the sitemap leaves out private pages", !sitemap.includes('"/core"'));
  for (const [page, flag] of [["app/research/page.tsx", "RESEARCH_PAGE_ENABLED"], ["app/docs/page.tsx", "DOCS_PAGE_ENABLED"]]) {
    assert(`${page} answers 404 while it's switched off`, new RegExp(`if \\(!${flag}\\) notFound\\(\\);`).test(read(page)));
  }
}

// ── Public site: tidy addresses ────────────────────────────────────────────
{
  const config = read("next.config.ts");
  assert("/brief goes back to /core, temporarily", /source: "\/brief",\s*destination: "\/core",\s*permanent: false/.test(config));
  assert("/product is a page again, not a redirect", existsSync("app/product/page.tsx") && !/source: "\/product"/.test(config));
  assert("/features redirects to /product while switched off", /if \(!FEATURES_PAGE_ENABLED\) redirect\("\/product"\);/.test(read("app/features/page.tsx")));
  assert("Paste a brief lives at /core", existsSync("app/core/page.tsx") && !existsSync("app/brief/page.tsx"));
  assert("/core needs an account", /PRIVATE_PREFIXES = \["\/core"\]/.test(read("proxy.ts")));
  assert("robots keep crawlers out of /core", read("app/robots.ts").includes('"/core"'));
  const { readdirSync } = await import("node:fs");
  const { join } = await import("node:path");
  const hidden = /^(app\/(docs|research)|components\/research)\//;
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(join(dir, e.name)) : /\.tsx?$/.test(e.name) && !/ 2\./.test(e.name) ? [join(dir, e.name)] : [],
    );
  const staleLink = DOCS_PAGE_ENABLED ? /href[=:]\s*["{`]\/brief\b|route: "\/brief"|"\/support"/ : /href[=:]\s*["{`]\/brief\b|route: "\/brief"|"\/support"|\/docs#/;
  const stale = ["components", "lib", "app"].flatMap(walk).filter((f) => !hidden.test(f)).filter((f) => staleLink.test(read(f)));
  assert("nothing links to /brief or /support (or /docs anchors while /docs is off)", stale.length === 0, stale.join(", "));
}

// ── Public site: /features ──────────────────────────────────────────────────
{
  const page = read("app/features/page.tsx");
  assert("/features is built from the walkthrough list", page.includes("WALKTHROUGH.filter(") && page.includes("WALKTHROUGH_AREAS.map("));
  assert("each feature has the anchor the home page links to", page.includes("id={featureAnchor(s.featureName)}"));
  assert("/features says what FreeFlow doesn't do", page.includes("doesn&rsquo;t create or send invoices") && page.includes("CFDI"));
  assert("/features links to the roadmap", page.includes('href="/roadmap"'));
  assert("the home page no longer says Chapter 2", !read("components/funnel/ChapterWalkthrough.tsx").includes("Chapter 2"));
}

// ── Class presentation: every module's required page is on ─────────────────
{
  assert("Module 1: /core has the intake, output card and save", existsSync("app/core/page.tsx") && read("app/core/page.tsx").includes("<CoreWorkbench") && read("app/core/page.tsx").includes("<SavedOutputs"));
  assert("Module 1: the dashboard previews saved briefs", read("app/dashboard/page.tsx").includes("<CorePreview"));
  assert("Module 2: /research is on", RESEARCH_PAGE_ENABLED);
  assert("Module 2: the dashboard has the research widget", read("app/dashboard/page.tsx").includes("research: <ResearchWidget />"));
  assert("Module 3: /product is the feature map", read("app/product/page.tsx").includes("<FeatureMap />"));
  assert("Module 3: /pricing shows the revenue model", PRICING_SIMULATOR_ENABLED);
  assert("Module 4: /marketing is in the menus", MARKETING_IN_MENUS && existsSync("app/marketing/page.tsx"));
  assert("Module 5: /chat exists", existsSync("app/chat/page.tsx"));
  assert("Module 6: /docs is on (prompt library, build log, agent map, testing, impact)", DOCS_PAGE_ENABLED && ["<PromptLibrary", "<WeekTimeline", "<JourneyStepper", "<TestingSummary", "<ImpactCheck", "<Roadmap"].every((c) => read("app/docs/page.tsx").includes(c)));
  assert("Module 6: /dashboard shows the public records tab", DASHBOARD_PUBLIC_TAB_ENABLED);
  assert("not asked for by any module: /features is off", !FEATURES_PAGE_ENABLED);
}

// ── Speed: fewer round trips, cacheable pages, a Dock that keeps up ─────────
{
  const proxy = read("proxy.ts");
  assert("the proxy checks the session locally with getClaims, not getUser", proxy.includes("auth.getClaims()") && !proxy.includes("auth.getUser()"));
  assert("the proxy passes Supabase's cache headers on", /setAll\(toSet, headers\)/.test(proxy) && proxy.includes("response.headers.set("));
  assert("the proxy still runs on every page (the layout reads the session, so it must be refreshed first)", !/matcher[\s\S]*(demo|features|pricing|terms)\$/.test(proxy));
  assert("the proxy sends a signed-in visitor from / to the dashboard", /pathname === "\/"[\s\S]{0,200}"\/dashboard"/.test(proxy));
  const home = read("app/page.tsx");
  assert("the home page does no session lookup of its own", !home.includes("getSessionUser") && !home.includes("force-dynamic"));
  const server = read("lib/supabase/server.ts");
  assert("pages read the user with getClaims (verified locally), not a network getUser", server.includes("auth.getClaims()") && !server.includes("auth.getUser()"));
  assert("navigations show a loading state at once", existsSync("app/loading.tsx"));
  const dock = read("components/nav/Dock.tsx");
  assert("the Dock doesn't resize icons on every mouse move", !dock.includes("onPointerMove") && !dock.includes("getBoundingClientRect"));
  assert("the Dock skips the costly backdrop blur", !dock.includes("backdrop-blur"));
  assert("the toggle stays under the pointer when the Dock opens", dock.includes("sm:flex-row-reverse"));
  assert("a Dock link shows it's loading", dock.includes("useLinkStatus"));
}

// ── Public site: check-your-records note (a commitment in the owner's essay) ──
{
  const site = read("lib/site.ts");
  assert("one shared check-your-records note", /export const CHECK_YOUR_RECORDS =\s*"[^"]*own records[^"]*"/.test(site));
  const cards = read("components/SummaryCards.tsx");
  assert("dashboard totals carry the note", cards.includes("{CHECK_YOUR_RECORDS}"));
  const exportButton = read("components/dashboard/ExportButton.tsx");
  assert("the CSV export carries the note", exportButton.includes("{CHECK_YOUR_RECORDS}"));
}

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
