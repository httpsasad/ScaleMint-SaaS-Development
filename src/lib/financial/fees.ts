/**
 * ScaleMint Server-Side Fee Engine
 * Authoritative Fee Calculation and Snapshotting
 * 
 * Rounding Policy:
 * Standard Half-Up rounding is applied to integer cents:
 * `fee_cents = Math.round((requested_cents * rate_bps) / 10000)`
 * `net_cents = requested_cents - fee_cents`
 * 
 * Invariant Guarantee:
 * `fee_cents + net_cents === requested_cents`
 */

import { FinancialPrecisionError, centsToDollars, DEFAULT_FEE_RATE_BPS } from './money';

export { DEFAULT_FEE_RATE_BPS };

export interface FeeCalculationResult {
  requestedAmountCents: number;
  requestedAmountDollars: number;
  feeRateBps: number; // e.g. 750
  feeRatePercentage: number; // e.g. 7.50
  feeAmountCents: number;
  feeAmountDollars: number;
  netAmountCents: number;
  netAmountDollars: number;
  currency: string;
}

/**
 * Calculates fee and net disbursement amounts with exact integer minor unit arithmetic.
 * 
 * Example:
 * Request: $500.00 (50,000 cents)
 * Rate: 7.5% (750 basis points)
 * Fee: Math.round((50000 * 750) / 10000) = 3750 cents ($37.50)
 * Net: 50000 - 3750 = 46250 cents ($462.50)
 */
export function calculateFundingFee(
  requestedAmountCents: number,
  feeRateBps: number = 750
): FeeCalculationResult {
  if (!Number.isInteger(requestedAmountCents) || requestedAmountCents <= 0) {
    throw new FinancialPrecisionError(
      `Invalid requested amount for fee calculation: ${requestedAmountCents}. Must be a positive integer in cents.`
    );
  }

  if (!Number.isInteger(feeRateBps) || feeRateBps < 100 || feeRateBps > 2500) {
    throw new FinancialPrecisionError(
      `Fee rate basis points must be an integer between 100 (1.00%) and 2500 (25.00%). Received: ${feeRateBps}`
    );
  }

  // Exact integer multiplication followed by division by 10,000 (basis point denominator)
  // Math.round implements Half-Up rounding for positive cents
  const feeAmountCents = Math.round((requestedAmountCents * feeRateBps) / 10_000);
  const netAmountCents = requestedAmountCents - feeAmountCents;

  // Invariant verification: net + fee MUST EXACTLY EQUAL requested amount
  if (feeAmountCents + netAmountCents !== requestedAmountCents) {
    throw new FinancialPrecisionError(
      `Invariant violation: fee (${feeAmountCents}) + net (${netAmountCents}) != requested (${requestedAmountCents})`
    );
  }

  return {
    requestedAmountCents,
    requestedAmountDollars: centsToDollars(requestedAmountCents),
    feeRateBps,
    feeRatePercentage: feeRateBps / 100,
    feeAmountCents,
    feeAmountDollars: centsToDollars(feeAmountCents),
    netAmountCents,
    netAmountDollars: centsToDollars(netAmountCents),
    currency: 'USD',
  };
}

/**
 * Converts a percentage number (e.g. 7.5) to integer basis points (750).
 */
export function percentageToBasisPoints(percentage: number): number {
  if (typeof percentage !== 'number' || isNaN(percentage)) {
    throw new FinancialPrecisionError(`Invalid fee percentage: ${percentage}`);
  }

  const bps = Math.round(percentage * 100);
  if (bps < 100 || bps > 2500) {
    throw new FinancialPrecisionError(
      `Fee percentage must be between 1.00% and 25.00%. Received: ${percentage}%`
    );
  }

  return bps;
}
