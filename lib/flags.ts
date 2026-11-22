/*
  Feature switches.

  Kept in a module with no imports and no data, so client components that
  read a switch (the Dock, the sidebar, the feature map) don't pull pricing or
  donation data into the browser along with it.
*/

/*
  DONATIONS ARE ON
  /pricing is built around optional donations (lib/support.ts). Turning this
  off hides the donation section, the Dock and footer links, and the help
  desk's donation answers; nothing is deleted.
*/
export const DONATIONS_ENABLED = true;

/*
  PER-PROJECT PRICING IS OFF
  The Project tier (billed per job) from the old revenue model. The model is
  no longer on /pricing, so this only affects the feature data and the help
  desk. Nothing is deleted; set it to true to bring it back.
*/
export const PER_PROJECT_PRICING_ENABLED = false;

/*
  COURSE PAGES ARE HIDDEN
  /research (market research) and /docs (the build log, prompt library and
  testing summary) were written for the Ibero course, not for customers. Off,
  they answer 404 and leave the menus, the sitemap and the help desk. The code
  stays, so either can come back.
*/
export const RESEARCH_PAGE_ENABLED = false;
export const DOCS_PAGE_ENABLED = false;

/*
  THE MARKETING ENGINE IS A PREVIEW
  /marketing stays reachable by its address while it is reworked into a tool
  customers use for their own marketing, but it isn't in any menu or the
  sitemap.
*/
export const MARKETING_IN_MENUS = false;
