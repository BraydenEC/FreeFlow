import type { Confidence } from "@/types/research";

/*
  Pricing model types.

  The Week 2 `Confidence` type is reused deliberately rather than redefined. A
  pricing assumption and a research claim are the same kind of object: a
  statement that might be wrong, carrying an honest label about how much weight
  it can bear. Most pricing assumptions will read `estimated`, and that is the
  finding rather than a gap.
*/

export type TierId = "solo" | "pro" | "studio" | "project";
export type SegmentId = "freelancer" | "studio" | "project";
export type ScenarioId = "conservative" | "base" | "optimistic";

export type Tier = {
  id: TierId;
  name: string;
  /** Monthly price per account or seat, in USD. 0 means free. */
  monthlyUsd: number;
  audience: string;
  /** What this tier is for, phrased as upkeep rather than as a feature list. */
  pitch: string;
  includes: string[];
  /** Why this price, anchored to a competitor verified in Week 2. */
  anchor: string;
  anchorSourceUrl: string | null;
};

export type Segment = {
  id: SegmentId;
  name: string;
  description: string;
  /** Which tier this segment is expected to land on. */
  defaultTier: TierId;
};

/** One row of the assumptions table. */
export type Assumption = {
  id: string;
  label: string;
  value: string;
  /** What goes wrong if this is wrong — the reason the row exists. */
  ifWrong: string;
  sourceUrl: string | null;
  confidence: Confidence;
};

/** Everything the calculator takes. Saved verbatim so a scenario is reproducible. */
export type PricingInputs = {
  /** Paying freelancer accounts at month zero. */
  freelancers: number;
  /** Paying studio accounts at month zero. */
  studios: number;
  /** Billable seats in an average studio. */
  seatsPerStudio: number;
  /** Share of freelancers on the paid Pro tier rather than free Solo. 0–1. */
  freelancerPaidShare: number;
  /** Monthly account churn. 0–1. */
  monthlyChurn: number;
  /** Monthly new-account growth. 0–1. */
  monthlyGrowth: number;
  /** Discount applied to annual billing. 0–1. */
  annualDiscount: number;
  /** Share of accounts paying annually rather than monthly. 0–1. */
  annualShare: number;
};

export type PricingResult = {
  /** Paying accounts at month zero, after the free tier is excluded. */
  payingFreelancers: number;
  payingStudios: number;
  payingSeats: number;
  /** Monthly recurring revenue in USD, with annual discounting applied. */
  mrr: number;
  /** Annual recurring revenue in USD. */
  arr: number;
  /** Blended average revenue per paying account. */
  arpu: number;
  /** Accounts and MRR at each of the next 12 month-ends. */
  projection: ProjectionMonth[];
};

export type ProjectionMonth = {
  month: number;
  freelancers: number;
  studios: number;
  mrr: number;
};
