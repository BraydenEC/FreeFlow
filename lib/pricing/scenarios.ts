import type { PricingInputs, ScenarioId } from "@/types/pricing";

/*
  The three scenario presets.

  The conservative case is the one that matters, and it is the reason this file
  needed care. A pessimistic scenario that is the base case reduced by twenty
  percent is decoration — it looks like a stress test while proving nothing.

  So conservative encodes what the Week 2 validation conversation actually
  found, rather than a softer version of the plan:

    - Most freelancers are content with a spreadsheet. It is free, familiar,
      already open, and it never goes down.
    - The one freelancer interviewed said he would not buy, and would build his
      own before paying for someone else's unmaintained tool.
    - Acquisition is hard. His own hardest problem was "getting clients", and
      having a product does not solve that.

  Those translate into low conversion, high churn, and near-flat growth. The
  resulting ARR should be uncomfortable to look at, and the test suite asserts
  that it is at most half of base.
*/

export type Scenario = {
  id: ScenarioId;
  name: string;
  summary: string;
  inputs: PricingInputs;
};

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  conservative: {
    id: "conservative",
    name: "Conservative",
    summary:
      "What the validation conversation suggests: freelancers stay on spreadsheets, conversion is low, churn is high, and acquisition is the real bottleneck.",
    inputs: {
      freelancers: 120,
      studios: 4,
      seatsPerStudio: 3,
      // 12% — free-to-paid conversion for solo tools is usually low single
      // digits, so even this is on the generous side of pessimistic.
      freelancerPaidShare: 0.12,
      monthlyChurn: 0.09,
      monthlyGrowth: 0.02,
      annualDiscount: 0.2,
      annualShare: 0.15,
    },
  },

  base: {
    id: "base",
    name: "Base",
    summary:
      "Stated assumptions, each carrying a confidence level in the table below. Most are estimated rather than sourced, and the page says so.",
    inputs: {
      freelancers: 400,
      studios: 25,
      seatsPerStudio: 3,
      freelancerPaidShare: 0.35,
      monthlyChurn: 0.05,
      monthlyGrowth: 0.08,
      annualDiscount: 0.2,
      annualShare: 0.3,
    },
  },

  optimistic: {
    id: "optimistic",
    name: "Optimistic",
    summary:
      "Everything goes right at once: the CFDI gap converts, word of mouth works, and churn stays low. The least likely of the three, and labelled as such.",
    inputs: {
      freelancers: 900,
      studios: 70,
      seatsPerStudio: 4,
      freelancerPaidShare: 0.55,
      monthlyChurn: 0.03,
      monthlyGrowth: 0.15,
      annualDiscount: 0.2,
      annualShare: 0.45,
    },
  },
};

export const SCENARIO_ORDER: ScenarioId[] = [
  "conservative",
  "base",
  "optimistic",
];
