/*
  The /demo funnel's headline strings, in one place.

  RETIRED_LANDING_HEADLINES are the pain-point headlines from the signed-out
  landing page that /demo replaces (components/landing/LandingPage.tsx), kept
  so chapter 1 can reuse the strongest of them.
*/

import { JOBS, type JobId } from "@/lib/funnel/jobs";

export const COPY = {
  nightHeadline: (job: JobId) => `I'm a freelance ${JOBS[job].label}, and it's all in my head.`,
  calmHeadline: "…and now it's all in one place.",
  cantKeepUp: "You can't keep up by hand. Nobody can.",
  restButton: "Let FreeFlow handle the rest",
  tryFree: "Try FreeFlow free",
  useFree: "Use FreeFlow free now",
  launchListCta: "Get notified when the lifetime version launches",
  RETIRED_LANDING_HEADLINES: [
    "You cannot tell whether March is going to be fine",
    "The deadline and the invoice live in different tools",
    "You find out you were not paid by remembering",
    "Invoicing in Mexico takes money off the top",
  ],
};
