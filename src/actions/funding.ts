'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { FundingRequest } from '@/types/dashboard';
import { dollarsToCents, validateFundingAmountLimits } from '@/lib/financial/money';
import { calculateFundingFee } from '@/lib/financial/fees';

export interface FundingSubmissionResult {
  success: boolean;
  message: string;
  data?: FundingRequest;
  errors?: Record<string, string>;
}

/**
 * Server Action to submit a funding request.
 * SECURITY:
 * 1. Validates all inputs on the server.
 * 2. Recalculates fee on the trusted server. Client-submitted fees are completely ignored.
 * 3. Does NOT automatically deduct funds or claim successful external funding.
 */
export async function submitFundingRequest(formData: {
  accountId: string;
  requestedAmount: number;
  referenceNotes?: string;
}): Promise<FundingSubmissionResult> {
  const { accountId, requestedAmount, referenceNotes } = formData;

  const errors: Record<string, string> = {};

  if (!accountId || typeof accountId !== 'string' || accountId.trim() === '') {
    errors.accountId = 'Please select a valid advertising account.';
  }

  const parsedAmount = Number(requestedAmount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    errors.requestedAmount = 'Requested amount must be a positive number greater than 0.';
  }

  if (parsedAmount > 100000) {
    errors.requestedAmount = 'Maximum single request threshold is $100,000.00. Contact enterprise desk for larger tranches.';
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Validation failed. Please correct the errors and retry.',
      errors
    };
  }

  // TRUSTED SERVER-SIDE FINANCIAL CALCULATION IN INTEGER MINOR UNITS (CENTS)
  let requestedCents: number;
  try {
    requestedCents = dollarsToCents(parsedAmount);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid currency format';
    return { success: false, message: msg };
  }

  const limitCheck = validateFundingAmountLimits(requestedCents);
  if (!limitCheck.valid) {
    return { success: false, message: limitCheck.error || 'Amount out of permitted bounds.' };
  }

  // Exact 7.50% fee calculation in integer cents
  const feeResult = calculateFundingFee(requestedCents, 750);

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // If Supabase is connected and user is authenticated, insert into PostgreSQL
    if (user) {
      const { data, error } = await supabase
        .from('funding_requests')
        .insert({
          user_id: user.id,
          account_id: accountId,
          requested_amount: feeResult.requestedAmountDollars,
          requested_amount_cents: feeResult.requestedAmountCents,
          fee_rate_bps: feeResult.feeRateBps,
          fee_amount: feeResult.feeAmountDollars,
          fee_amount_cents: feeResult.feeAmountCents,
          net_amount: feeResult.netAmountDollars,
          net_amount_cents: feeResult.netAmountCents,
          currency: 'USD',
          status: 'pending',
          reference_notes: referenceNotes?.trim() || null
        })
        .select()
        .single();

      if (error) {
        console.error('[Funding Request Error]', error);
        return {
          success: false,
          message: `Database error: ${error.message}`
        };
      }

      return {
        success: true,
        message: 'Funding request staged successfully. It is currently under treasury compliance review. Submitting a request does not immediately transfer external funds.',
        data: data as FundingRequest
      };
    }

    // Sandbox / Demo Mode fallback when Supabase is unconfigured
    const newRequest: FundingRequest = {
      id: `req-sandbox-${Date.now().toString(36)}`,
      user_id: 'demo-user-001',
      account_id: accountId,
      requested_amount: feeResult.requestedAmountDollars,
      fee_rate: 0.075,
      fee_amount: feeResult.feeAmountDollars,
      net_amount: feeResult.netAmountDollars,
      status: 'pending_review',
      reference_notes: referenceNotes?.trim() || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return {
      success: true,
      message: 'Funding request staged in Sandbox Mode (Pending Treasury Review). Server verified fee: 7.50%. External transfers require treasury confirmation.',
      data: newRequest
    };
  } catch (err) {
    console.error('[Server Action Error]', err);
    return {
      success: false,
      message: 'An unexpected server error occurred while processing the funding request.'
    };
  }
}
