/**
 * ScaleMint Financial Precision Engine
 * Minor Unit (Cents) & Decimal Safety Module
 * 
 * Rules:
 * 1. Financial math is conducted strictly in integer minor units (cents) to eliminate
 *    IEEE 754 floating-point drift.
 * 2. Supported currency is USD.
 * 3. Enforces permitted transaction limits:
 *    - Minimum: $100.00 USD (10,000 cents)
 *    - Maximum: $25,000.00 USD (2,500,000 cents)
 */

export const MIN_FUNDING_REQUEST_CENTS = 10_000; // $100.00
export const MAX_FUNDING_REQUEST_CENTS = 2_500_000; // $25,000.00
export const DEFAULT_FEE_RATE_BPS = 750; // 7.50% (750 basis points)

export class FinancialPrecisionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FinancialPrecisionError';
  }
}

/**
 * Converts a dollar amount (number or string representation) into integer minor units (cents).
 * Rejects inputs with more than 2 decimal digits of precision (sub-cent fractions).
 */
export function dollarsToCents(amount: number | string): number {
  if (typeof amount === 'string') {
    amount = amount.trim();
    if (!/^-?\d+(\.\d{1,2})?$/.test(amount)) {
      throw new FinancialPrecisionError(
        `Invalid currency format: "${amount}". Must be an exact number with at most 2 decimal digits.`
      );
    }
  }

  const numericValue = typeof amount === 'number' ? amount : parseFloat(amount);

  if (isNaN(numericValue) || !isFinite(numericValue)) {
    throw new FinancialPrecisionError(`Invalid currency amount: value is NaN or infinite.`);
  }

  // Multiply by 100 and round to nearest integer to safely handle potential binary representation
  const cents = Math.round(numericValue * 100);

  if (!Number.isSafeInteger(cents)) {
    throw new FinancialPrecisionError(`Amount exceeds safe integer representation limits.`);
  }

  return cents;
}

/**
 * Converts integer minor units (cents) to dollars for display or reporting.
 */
export function centsToDollars(cents: number | bigint): number {
  const numericCents = typeof cents === 'bigint' ? Number(cents) : cents;

  if (!Number.isInteger(numericCents)) {
    throw new FinancialPrecisionError(`Expected integer cents, received: ${cents}`);
  }

  return numericCents / 100;
}

/**
 * Formats integer cents into a standardized USD string e.g. "$500.00".
 */
export function formatCentsToCurrency(cents: number | bigint, currency: string = 'USD'): string {
  const dollars = centsToDollars(cents);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Validates whether a requested amount in cents falls within the permitted platform boundaries.
 */
export function validateFundingAmountLimits(cents: number): {
  valid: boolean;
  error?: string;
} {
  if (!Number.isInteger(cents)) {
    return { valid: false, error: 'Funding amount must be an exact integer minor unit (cents).' };
  }

  if (cents <= 0) {
    return { valid: false, error: 'Funding amount must be strictly greater than $0.00.' };
  }

  if (cents < MIN_FUNDING_REQUEST_CENTS) {
    return {
      valid: false,
      error: `Minimum funding request is ${formatCentsToCurrency(MIN_FUNDING_REQUEST_CENTS)} (received ${formatCentsToCurrency(cents)}).`,
    };
  }

  if (cents > MAX_FUNDING_REQUEST_CENTS) {
    return {
      valid: false,
      error: `Maximum single funding request limit is ${formatCentsToCurrency(MAX_FUNDING_REQUEST_CENTS)} (received ${formatCentsToCurrency(cents)}).`,
    };
  }

  return { valid: true };
}
