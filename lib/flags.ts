/*
  Feature switches.

  Kept in a module with no imports and no data, so client components that
  read a switch (the Dock, the sidebar, the feature map) don't pull pricing or
  donation data into the browser along with it.
*/

/*
  DONATIONS ARE OFF FOR NOW
  The final assignment doesn't ask for a donation page, and a "chip in" ask
  beside "free" confused the story. This one switch hides it everywhere:
  /support answers 404, the Dock drops it, the dashboard and /pricing drop
  their links, the help desk says donations aren't taken right now, and the
  marketing copy stops promising a donation button. Nothing is deleted; set it
  to true to bring all of it back as it was.
*/
export const DONATIONS_ENABLED = false;

/*
  PER-PROJECT PRICING IS OFF FOR NOW
  The Project tier (billed per job) and its segment were added after Week 3
  as a separate estimate. For the final assignment they are hidden: no
  Per-project tab or sidebar link on /pricing, no Project tier card, no
  per-project segment card, no Project badge on /product, and the help desk
  doesn't quote it. Nothing is deleted; set this to true to bring them back.
*/
export const PER_PROJECT_PRICING_ENABLED = false;
