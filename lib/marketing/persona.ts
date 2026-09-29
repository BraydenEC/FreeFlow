/*
  The marketing persona.

  Not invented — this is the Week 2 validation interviewee, quoted verbatim.
  Full findings in docs/extras/VALIDATION_FINDINGS.md. Every claim in marketing
  copy should be reachable from this object or from the feature map; a persona
  that is made up is the first place a product starts lying to itself.
*/

export type Persona = {
  name: string;
  role: string;
  /** How they find work. */
  acquisition: string;
  /** How they bill. */
  billing: string;
  /** The pain in their own words. */
  quote: string;
  /** The buying insight — why they are a subscription customer. */
  insight: string;
  /** What copy must avoid saying to them. */
  antiPatterns: string[];
};

export const PERSONA: Persona = {
  name: "The per-project installer",
  role: "Freelancer who installs software for small firms — one-time jobs, priced per project, contract signed up front, billed on completion.",
  acquisition:
    "Cold email, cold SMS, cold calling, and occasionally walking into offices unannounced.",
  billing: "Fixed fee per job. Never hourly, never a retainer.",
  quote: "kinda what u got just its annoying on mobile",
  insight:
    "He said he would rather rent something maintained than build it himself. He is a subscription customer by temperament — the tracking pain is small today and real at scale.",
  antiPatterns: [
    "Generic freelancer-hustle language ('unlock your freedom').",
    "Assuming an hourly or retainer model — he prices per job.",
    "A desktop-only experience — he checks things on his phone.",
    "Claiming features that are not built.",
  ],
};
