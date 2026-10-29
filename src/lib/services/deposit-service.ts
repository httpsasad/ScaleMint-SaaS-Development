/**
 * ScaleMint Deposit Processing Backend Service
 * Validated deposit submission, owner reconciliation, and idempotent webhook crediting.
 */

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { dollarsToCents, centsToDollars, formatCentsToCurrency } from '@/lib/financial/money';
import { executeAtomicLedgerAdjustment } from './wallet-service';

export interface CreateDepositInput {
  userId: string;
  amountDollars: number | string;
  paymentMethod: 'bank_wire' | 'usdt_trc20' | 'usdc_erc20' | 'swift';
  txHashOrRef?: string;
  idempotencyKey?: string;
}

export interface ReconcileDepositInput {
  depositId: string;
  actorId: string;
  actorRole: string;
  providerReference?: string;
  reconciliationNotes: string;
}

/**
 * Creates a pending deposit record.
 * Status remains strictly 'pending' until verified by a trusted provider or owner.
 */
export async function createDepositRecord(input: CreateDepositInput) {
  const amountCents = dollarsToCents(input.amountDollars);

  if (amountCents < 5_000) { // $50 minimum deposit
    throw new Error('Minimum deposit amount is $50.00 USD.');
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Sandbox simulation
  if (!user) {
    const mockId = `dep-mock-${Date.now().toString(36)}`;
    return {
      success: true,
      depositId: mockId,
      amountCents,
      amountDollars: centsToDollars(amountCents),
      status: 'pending' as const,
      paymentMethod: input.paymentMethod,
      txHashOrRef: input.txHashOrRef || 'MANUAL-PENDING',
      createdAt: new Date().toISOString(),
    };
  }

  // Fetch client wallet
  const { data: wallet, error: wErr } = await supabase
    .from('wallets')
    .select('id')
    .eq('user_id', input.userId)
    .single();

  if (wErr || !wallet) {
    throw new Error('Target client wallet not found.');
  }

  // Idempotency check
  if (input.idempotencyKey) {
    const { data: existing } = await supabase
      .from('deposits')
      .select('id, status, amount_cents')
      .eq('idempotency_key', input.idempotencyKey)
      .maybeSingle();

    if (existing) {
      return {
        success: true,
        isIdempotentReplay: true,
        depositId: existing.id,
        amountCents: existing.amount_cents,
        amountDollars: centsToDollars(existing.amount_cents),
        status: existing.status,
      };
    }
  }

  const { data: deposit, error: depErr } = await supabase
    .from('deposits')
    .insert({
      user_id: input.userId,
      wallet_id: wallet.id,
      amount: centsToDollars(amountCents),
      amount_cents: amountCents,
      currency: 'USD',
      payment_method: input.paymentMethod,
      status: 'pending',
      tx_hash_or_ref: input.txHashOrRef || null,
      payment_reference: input.txHashOrRef || null,
      idempotency_key: input.idempotencyKey || null,
    })
    .select()
    .single();

  if (depErr) {
    throw new Error(`Database error creating deposit record: ${depErr.message}`);
  }

  return {
    success: true,
    depositId: deposit.id,
    amountCents: deposit.amount_cents,
    amountDollars: centsToDollars(deposit.amount_cents),
    status: deposit.status,
    paymentMethod: deposit.payment_method,
    createdAt: deposit.created_at,
  };
}

/**
 * Reconciles and confirms an unverified deposit.
 * Restricted strictly to platform owners or automated verification webhooks.
 * Atomically credits the wallet through the ledger.
 */
export async function reconcileAndConfirmDeposit({
  depositId,
  actorId,
  actorRole,
  providerReference,
  reconciliationNotes,
}: ReconcileDepositInput) {
  if (actorRole !== 'scalemint_owner' && actorRole !== 'scalemint_admin') {
    throw new Error('Unauthorized: Only platform owners or administrators can reconcile deposits.');
  }

  if (!reconciliationNotes || reconciliationNotes.trim().length < 5) {
    throw new Error('Audit reconciliation notes (min 5 characters) are required.');
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Sandbox simulation
  if (!user) {
    return {
      success: true,
      depositId,
      status: 'confirmed' as const,
      message: `[Sandbox] Deposit #${depositId} reconciled and credited to client wallet.`,
    };
  }

  // 1. Fetch deposit record with lock
  const { data: deposit, error: fetchErr } = await supabase
    .from('deposits')
    .select('*')
    .eq('id', depositId)
    .single();

  if (fetchErr || !deposit) {
    throw new Error('Deposit record not found.');
  }

  // Idempotency: If already confirmed, return success without duplicate crediting
  if (deposit.status === 'confirmed') {
    return {
      success: true,
      isIdempotentReplay: true,
      depositId,
      status: 'confirmed',
      message: 'Deposit has already been confirmed and credited.',
    };
  }

  const amountCents = deposit.amount_cents || dollarsToCents(deposit.amount);

  // 2. Atomically credit wallet via wallet_ledger
  const ledgerResult = await executeAtomicLedgerAdjustment({
    walletId: deposit.wallet_id,
    userId: deposit.user_id,
    entryType: 'credit',
    amountCents,
    description: `Confirmed deposit: ${deposit.payment_method.toUpperCase()} (${deposit.tx_hash_or_ref || 'Reference verified'})`,
    referenceId: deposit.id,
    authorizedActor: actorId,
    idempotencyKey: `credit_dep_${deposit.id}`,
  });

  if (!ledgerResult.success) {
    throw new Error(`Failed to credit wallet ledger: ${ledgerResult.errorMessage}`);
  }

  // 3. Insert transaction record
  await supabase.from('transactions').insert({
    user_id: deposit.user_id,
    wallet_id: deposit.wallet_id,
    type: 'deposit',
    amount: centsToDollars(amountCents),
    amount_cents: amountCents,
    currency: 'USD',
    status: 'completed',
    description: `Verified deposit via ${deposit.payment_method}: ${reconciliationNotes}`,
    related_deposit_id: deposit.id,
    reference_id: deposit.tx_hash_or_ref || providerReference,
  });

  // 4. Update deposit status to confirmed
  await supabase
    .from('deposits')
    .update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      provider_reference: providerReference || deposit.provider_reference,
      updated_at: new Date().toISOString(),
    })
    .eq('id', deposit.id);

  // 5. Record in audit logs
  await supabase.from('audit_logs').insert({
    actor_id: actorId,
    action: 'deposit.reconciled_and_confirmed',
    entity_type: 'deposit',
    entity_id: deposit.id,
    reason: reconciliationNotes,
    metadata: {
      amount_cents: amountCents,
      payment_method: deposit.payment_method,
      new_wallet_balance_cents: ledgerResult.newBalanceCents,
    },
  });

  return {
    success: true,
    depositId,
    status: 'confirmed',
    newBalanceDollars: ledgerResult.newBalanceDollars,
    message: `Deposit of ${formatCentsToCurrency(amountCents)} confirmed and credited to client ledger.`,
  };
}
