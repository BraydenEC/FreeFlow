/*
  The content rules /chat answers from.

  Every answer here is a claim about FreeFlow, so each one is written from the
  code it describes, not from memory of what the feature was meant to do.
  Keywords and phrases are normalised (lower-case, no accents, no punctuation).
  A rule only competes when the user's first two intake answers fall inside
  its categories and areas.

  This file is meant to be edited: each training session with the owner turns
  a wrong answer into a sample in samples.ts and a fix here.
*/

import type { Rule } from "./types";

export const CONTENT_RULES: Rule[] = [
  {
    id: "forecast-zero",
    categories: ["broken", "how_to"],
    areas: ["forecast", "dashboard"],
    keywords: ["forecast", "zero", "empty", "nothing", "missing", "pronostico"],
    phrases: ["next month", "shows zero", "shows 0", "is empty"],
    answer:
      "The forecast puts each unpaid project in the month its money is expected: the deadline plus payment terms, which are 30 days unless the project sets its own. So work due next month usually lands the month after. Paid projects aren't counted, and money already past its expected date shows as late rather than in a month.",
  },
];
