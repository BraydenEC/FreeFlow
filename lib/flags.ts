/*
  Feature switches.

  Kept in a module with no imports and no data, so client components that
  read a switch (the Dock, the sidebar, the feature map) don't pull pricing or
  donation data into the browser along with it.

  CLASS PRESENTATION MODE (2026-11-23)
  For the Ibero class presentation every page and feature the Module 1–6
  documents ask for is on, and what they don't ask for is off. Nothing is
  deleted. The public product site that was live before this is the git tag
  public-site-before-class; its switch values are noted beside each switch.
*/

/*
  DONATIONS ARE ON (public site: on)
  Off hides every donation: the /pricing donation section, the Dock and
  footer links, the help desk's donation answers, the dashboard line, and the
  donation paragraphs in /terms and /privacy. lib/support.ts keeps the wording.
*/
export const DONATIONS_ENABLED = true;

/*
  PRICING SHOWS THE REVENUE MODEL (public site: off)
  On, /pricing is Module 3's page: tiers, segments, the revenue simulator, the
  assumptions table and saved scenarios. Off, it is the donation-first page
  (components/pricing/DonationPricing.tsx).
*/
export const PRICING_SIMULATOR_ENABLED = true;

/*
  WHERE THE DONATION PAGE IS (follows the two switches above)
  With the revenue model on /pricing, the whole donation page is at /support.
  With it off, the donation page is /pricing and /support redirects there.
  Every donation link uses DONATE_HREF.
*/
export const DONATE_HREF = PRICING_SIMULATOR_ENABLED ? "/support#support" : "/pricing#support";
export const DONATE_PAGE_NAME = PRICING_SIMULATOR_ENABLED ? "Support FreeFlow" : "Pricing";

/*
  PER-PROJECT PRICING IS OFF (public site: off)
  The Project tier (billed per job) and its segment were added after Week 3
  as a separate estimate. Off: no Per-project tab on /pricing, no Project tier
  card or segment card, no Project badge on /product, and the help desk
  doesn't quote it.
*/
export const PER_PROJECT_PRICING_ENABLED = false;

/*
  COURSE PAGES ARE ON (public site: off)
  /research (market research, Module 2) and /docs (prompt library, build log,
  agent map, testing summary, impact check, Module 6). Off, they answer 404
  and leave the menus, the sitemap and the help desk.
*/
export const RESEARCH_PAGE_ENABLED = true;
export const DOCS_PAGE_ENABLED = true;

/*
  THE MARKETING ENGINE IS IN THE MENUS (public site: off)
  /marketing (Module 4) always answers; off, it is an unlisted preview.
*/
export const MARKETING_IN_MENUS = true;

/*
  /features IS OFF (public site: on)
  The public Features page (built from the home page walkthrough). Off, it
  redirects to /product, Module 3's feature map, and the menus say Product.
*/
export const FEATURES_PAGE_ENABLED = false;

/*
  "WHAT'S NEW" IS OFF (public site: on)
  The changelog list on /roadmap. The version 2 roadmap itself always shows.
*/
export const WHATS_NEW_ENABLED = false;

/*
  THE DASHBOARD'S PUBLIC TAB IS ON (public site: off)
  "FreeFlow in public": the venture's own counts, visible signed out. Module
  6's "/dashboard shows records" was met with "Your work" plus this tab.
*/
export const DASHBOARD_PUBLIC_TAB_ENABLED = true;
