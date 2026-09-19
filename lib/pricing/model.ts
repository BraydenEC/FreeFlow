import { tierById } from "@/lib/pricing/tiers";
import type {
  PricingInputs,
  PricingResult,
  ProjectionMonth,
} from "@/types/pricing";

/*
  Pricing arithmetic — pure. No React, no I/O, no imports from components.

  That boundary is the point of this file. The required pricing-logic tests
  must execute the real calculation rather than a copy of it, and Week 2 proved
  what happens otherwise: the filter predicate had to be extracted mid-week
  after its acceptance criteria turned out to have been asserted rather than
  run. Here the seam exists before the UI does.

  Two functions below encode the two ways a revenue model is usually wrong, and
  both errors flatter:

    1. Multiplying a discounted monthly price by twelve overstates annual
       revenue, because the discount gets applied twice or not at all.
    2. Subtracting churn instead of compounding it overstates retention badly.
       100 accounts at 5% monthly churn retain ~54 after a year, not 40.

  Each has its own test.
*/

/** Clamp a rate into 0–1. Inputs come from a form; a user can type anything. */
function rate(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/** Clamp a count to a non-negative integer. */
function count(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.floor(value);
}

/** Round to cents so comparisons are exact rather than float-fuzzy. */
export function money(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Annual price for a monthly plan, with the discount applied.
 *
 * The discount applies to the whole year, once — not per month and then again
 * at the end. Getting this wrong in either direction misstates ARR, and the
 * appealing direction is to forget the discount entirely.
 */
export function annualPrice(monthlyUsd: number, discount: number): number {
  return money(monthlyUsd * 12 * (1 - rate(discount)));
}

/**
 * Effective monthly revenue from one account, blending monthly and annual payers.
 *
 * An annual payer contributes their discounted annual price spread across
 * twelve months, so MRR reflects what actually arrives rather than list price.
 */
export function effectiveMonthly(
  monthlyUsd: number,
  annualDiscount: number,
  annualShare: number,
): number {
  const share = rate(annualShare);
  const annualMonthlyEquivalent =
    annualPrice(monthlyUsd, annualDiscount) / 12;
  return money(monthlyUsd * (1 - share) + annualMonthlyEquivalent * share);
}

/**
 * Accounts remaining after N months of churn.
 *
 * COMPOUNDING, not subtraction. This is the single largest lever in the model
 * and the easiest to get wrong in the encouraging direction:
 *
 *   100 accounts, 5% monthly churn, 12 months
 *     compounded:  100 × 0.95^12 ≈ 54    ← correct
 *     subtracted:  100 − (100 × 0.05 × 12) = 40
 *
 * The subtracted figure is lower here, which makes the error look conservative
 * — but it is wrong, and at higher churn rates subtraction goes negative and
 * stops meaning anything at all.
 */
export function retained(
  startingAccounts: number,
  monthlyChurn: number,
  months: number,
): number {
  const c = rate(monthlyChurn);
  const m = Math.max(0, Math.floor(months));
  return count(startingAccounts) * Math.pow(1 - c, m);
}

/**
 * Accounts after N months of churn and growth together.
 *
 * Growth applies to the surviving base each month, so the two compound against
 * each other rather than being netted once at the end.
 */
export function projectAccounts(
  startingAccounts: number,
  monthlyChurn: number,
  monthlyGrowth: number,
  months: number,
): number {
  const net = (1 - rate(monthlyChurn)) * (1 + rate(monthlyGrowth));
  return count(startingAccounts) * Math.pow(net, Math.max(0, Math.floor(months)));
}

/**
 * Blended average revenue per paying account.
 *
 * A weighted mean across segments, not the average of each segment's ARPU.
 * Averaging averages silently assumes the segments are the same size, which
 * they are not.
 */
export function blendedArpu(mrr: number, payingAccounts: number): number {
  if (payingAccounts <= 0) return 0;
  return money(mrr / payingAccounts);
}

/** The whole model. Deterministic: same inputs always give the same result. */
export function computePricing(inputs: PricingInputs): PricingResult {
  const solo = tierById("solo");
  const pro = tierById("pro");
  const studio = tierById("studio");

  const freelancers = count(inputs.freelancers);
  const studios = count(inputs.studios);
  const seatsPerStudio = Math.max(1, count(inputs.seatsPerStudio));

  // Free Solo accounts are users, not revenue. Only the paid share counts.
  const payingFreelancers = Math.round(
    freelancers * rate(inputs.freelancerPaidShare),
  );
  const payingStudios = studios;
  const payingSeats = payingStudios * seatsPerStudio;

  const proMonthly = effectiveMonthly(
    pro.monthlyUsd,
    inputs.annualDiscount,
    inputs.annualShare,
  );
  const studioMonthly = effectiveMonthly(
    studio.monthlyUsd,
    inputs.annualDiscount,
    inputs.annualShare,
  );

  // solo.monthlyUsd is 0; referenced so the free tier's contribution is
  // explicit rather than silently omitted.
  const mrr = money(
    payingFreelancers * proMonthly +
      payingSeats * studioMonthly +
      (freelancers - payingFreelancers) * solo.monthlyUsd,
  );

  const projection: ProjectionMonth[] = [];
  for (let m = 1; m <= 12; m++) {
    const f = projectAccounts(
      freelancers,
      inputs.monthlyChurn,
      inputs.monthlyGrowth,
      m,
    );
    const s = projectAccounts(
      studios,
      inputs.monthlyChurn,
      inputs.monthlyGrowth,
      m,
    );
    const payingF = f * rate(inputs.freelancerPaidShare);
    projection.push({
      month: m,
      freelancers: Math.round(f),
      studios: Math.round(s),
      mrr: money(payingF * proMonthly + s * seatsPerStudio * studioMonthly),
    });
  }

  return {
    payingFreelancers,
    payingStudios,
    payingSeats,
    mrr,
    // ARR is twelve times *current* MRR, deliberately: it is a run-rate, not
    // the sum of the projection. Summing a growing projection and calling it
    // ARR is a common and flattering conflation.
    arr: money(mrr * 12),
    arpu: blendedArpu(mrr, payingFreelancers + payingSeats),
    projection,
  };
}
