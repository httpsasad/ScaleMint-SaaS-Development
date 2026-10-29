/**
 * ScaleMint Funding Backend Service
 * Server-validated creation, fee recalculation, and state machine transitions.
 */

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { 
  dollarsToCents, 
  centsToDollars, 
  validateFundingAmountLimits 
} from '@/lib/financial/money';
import { 
  calculateFundingFee, 
  DEFAULT_FEE_RATE_BPS 
} from '@/lib/financial/fees';
import { 
  FundingRequestBackendStatus, 
  isValidStateTransition, 
  validateStateTransitionPermission 
} from '@/lib/financial/state-machine';
import { DEMO_FUNDING_REQUESTS } from '@/lib/supabase/demo-data';

export interface CreateFundingRequestInput {
  userId: string;
  accountId: string;
  accountName: string;
  requestedAmountDollars: number | string;
  idempotencyKey?: string;
}

export interface TransitionFundingRequestInput {
  requestId: string;
  targetStatus: FundingRequestBackendStatus;
  actorId: string;
  actorRole: string;
  reason?: string;
}

/**
 * Creates a new funding request with server-authoritative fee calculation and idempotency validation.
 */
export async function createAuthoritativeFundingRequest(input: CreateFundingRequestInput) {
  // 1. Convert to integer minor units (cents)
  const requestedCents = dollarsToCents(input.requestedAmountDollars);

  // 2. Validate platform limits ($100.00 min, $25,000.00 max)
  const limitCheck = validateFundingAmountLimits(requestedCents);
  if (!limitCheck.valid) {
    throw new Error(limitCheck.error);
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // In sandbox dev mode
  if (!user) {
    const feeResult = calculateFundingFee(requestedCents, DEFAULT_FEE_RATE_BPS);
    const mockId = `req-mock-${Date.now().toString(36)}`;
    return {
      success: true,
      requestId: mockId,
      status: 'pending' as const,
      requestedAmountCents: feeResult.requestedAmountCents,
      requestedAmountDollars: feeResult.requestedAmountDollars,
      feeRateBps: feeResult.feeRateBps,
      feeAmountCents: feeResult.feeAmountCents,
      feeAmountDollars: feeResult.feeAmountDollars,
      netAmountCents: feeResult.netAmountCents,
      netAmountDollars: feeResult.netAmountDollars,
      currency: 'USD',
      idempotencyKey: input.idempotencyKey || `idem-${mockId}`,
      createdAt: new Date().toISOString(),
    };
  }

  // 3. Query active platform fee configuration rate
  let activeRateBps = DEFAULT_FEE_RATE_BPS;
  const { data: feeConfig } = await supabase
    .from('fee_configurations')
    .select('rate_percentage')
    .eq('is_active', true)
    .single();

  if (feeConfig && feeConfig.rate_percentage) {
    activeRateBps = Math.round(Number(feeConfig.rate_percentage) * 100);
  }

  // 4. Authoritative fee calculation
  const feeResult = calculateFundingFee(requestedCents, activeRateBps);

  // 5. Verify wallet balance sufficiency
  const { data: wallet, error: wErr } = await supabase
    .from('wallets')
    .select('id, balance_cents, balance')
    .eq('user_id', input.userId)
    .single();

  if (wErr || !wallet) {
    throw new Error('Client wallet not found.');
  }

  const availableCents = wallet.balance_cents ?? dollarsToCents(wallet.balance ?? 0);
  if (availableCents < requestedCents) {
    throw new Error(
      `Insufficient wallet balance: Your available balance is $${centsToDollars(availableCents).toFixed(2)}, but $${feeResult.requestedAmountDollars.toFixed(2)} was requested.`
    );
  }

  // 6. Check for duplicate idempotency key
  if (input.idempotencyKey) {
    const { data: existing } = await supabase
      .from('funding_requests')
      .select('id, status, requested_amount_cents, fee_amount_cents, net_amount_cents')
      .eq('idempotency_key', input.idempotencyKey)
      .maybeSingle();

    if (existing) {
      return {
        success: true,
        isIdempotentReplay: true,
        requestId: existing.id,
        status: existing.status,
        requestedAmountCents: existing.requested_amount_cents,
        requestedAmountDollars: centsToDollars(existing.requested_amount_cents),
        feeAmountCents: existing.fee_amount_cents,
        feeAmountDollars: centsToDollars(existing.fee_amount_cents),
        netAmountCents: existing.net_amount_cents,
        netAmountDollars: centsToDollars(existing.net_amount_cents),
      };
    }
  }

  // 7. Insert authoritative record into funding_requests
  const { data: inserted, error: insertErr } = await supabase
    .from('funding_requests')
    .insert({
      user_id: input.userId,
      account_id: input.accountId,
      account_name: input.accountName,
      requested_amount: feeResult.requestedAmountDollars,
      requested_amount_cents: feeResult.requestedAmountCents,
      fee_rate_bps: feeResult.feeRateBps,
      fee_amount: feeResult.feeAmountDollars,
      fee_amount_cents: feeResult.feeAmountCents,
      net_amount: feeResult.netAmountDollars,
      net_amount_cents: feeResult.netAmountCents,
      currency: 'USD',
      status: 'pending',
      idempotency_key: input.idempotencyKey || null,
    })
    .select()
    .single();

  if (insertErr) {
    throw new Error(`Database error creating funding request: ${insertErr.message}`);
  }

  return {
    success: true,
    requestId: inserted.id,
    status: inserted.status,
    requestedAmountCents: inserted.requested_amount_cents,
    requestedAmountDollars: centsToDollars(inserted.requested_amount_cents),
    feeRateBps: inserted.fee_rate_bps,
    feeAmountCents: inserted.fee_amount_cents,
    feeAmountDollars: centsToDollars(inserted.fee_amount_cents),
    netAmountCents: inserted.net_amount_cents,
    netAmountDollars: centsToDollars(inserted.net_amount_cents),
    currency: inserted.currency,
    idempotencyKey: inserted.idempotency_key,
    createdAt: inserted.created_at,
  };
}

/**
 * Transitions a funding request's status atomically using the database stored procedure.
 */
export async function transitionAuthoritativeFundingRequest({
  requestId,
  targetStatus,
  actorId,
  actorRole,
  reason,
}: TransitionFundingRequestInput) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Sandbox fallback
  if (!user) {
    const existing = DEMO_FUNDING_REQUESTS.find(r => r.id === requestId);
    const currentStatus = (existing?.status || 'pending') as FundingRequestBackendStatus;

    // Check state machine
    const validCheck = isValidStateTransition(currentStatus, targetStatus);
    if (!validCheck.valid) {
      throw new Error(validCheck.error);
    }

    const permCheck = validateStateTransitionPermission(actorRole, currentStatus, targetStatus);
    if (!permCheck.permitted) {
      throw new Error(permCheck.error);
    }

    return {
      success: true,
      requestId,
      previousStatus: currentStatus,
      newStatus: targetStatus,
      message: `[Sandbox] Status successfully transitioned to "${targetStatus}".`,
    };
  }

  // 1. Fetch current status
  const { data: existing, error: fetchErr } = await supabase
    .from('funding_requests')
    .select('id, status, user_id, requested_amount_cents')
    .eq('id', requestId)
    .single();

  if (fetchErr || !existing) {
    throw new Error('Funding request not found.');
  }

  const currentStatus = existing.status as FundingRequestBackendStatus;

  // 2. Validate transition against state machine
  const validCheck = isValidStateTransition(currentStatus, targetStatus);
  if (!validCheck.valid) {
    throw new Error(validCheck.error);
  }

  // 3. Validate permissions
  const permCheck = validateStateTransitionPermission(actorRole, currentStatus, targetStatus);
  if (!permCheck.permitted) {
    throw new Error(permCheck.error);
  }

  // 4. If client is cancelling, ensure it is their own request
  if (targetStatus === 'cancelled' && actorRole !== 'scalemint_owner' && actorRole !== 'scalemint_admin') {
    if (existing.user_id !== actorId) {
      throw new Error('Unauthorized: You cannot cancel another client’s request.');
    }
  }

  // 5. Call the atomic PostgreSQL stored procedure `transition_funding_request_status`
  const { data: rpcData, error: rpcErr } = await supabase.rpc('transition_funding_request_status', {
    p_request_id: requestId,
    p_new_status: targetStatus,
    p_actor_id: actorId,
    p_reason: reason || null,
  });

  if (rpcErr) {
    throw new Error(`Database error transitioning funding request: ${rpcErr.message}`);
  }

  const result = Array.isArray(rpcData) ? rpcData[0] : rpcData;
  if (!result || !result.success) {
    throw new Error(result?.message || 'State transition rejected by database.');
  }

  return {
    success: true,
    requestId,
    previousStatus: currentStatus,
    newStatus: targetStatus,
    message: result.message,
  };
}
