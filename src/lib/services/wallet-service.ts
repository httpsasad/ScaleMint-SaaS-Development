/**
 * ScaleMint Wallet & Ledger Backend Service
 * Authoritative ledger accounting, balance derivation, and atomic operations.
 */

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { dollarsToCents, centsToDollars } from '@/lib/financial/money';
import { DEMO_WALLET } from '@/lib/supabase/demo-data';

export interface LedgerEntryRecord {
  id: string;
  wallet_id: string;
  user_id: string;
  entry_type: 'credit' | 'debit' | 'reversal';
  amount_cents: number;
  amount_dollars: number;
  running_balance_cents: number;
  running_balance_dollars: number;
  currency: string;
  transaction_id?: string;
  description: string;
  reference_id?: string;
  authorized_actor?: string;
  created_at: string;
}

export interface WalletSummary {
  walletId: string;
  userId: string;
  balanceCents: number;
  balanceDollars: number;
  currency: string;
  updatedAt: string;
  recentLedgerEntries: LedgerEntryRecord[];
}

/**
 * Retrieves the authoritative wallet summary and recent ledger entries.
 */
export async function getAuthoritativeWalletSummary(userId: string): Promise<WalletSummary> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If unauthenticated or sandbox dev mode
  if (!user) {
    const demoBalanceCents = dollarsToCents(DEMO_WALLET.balance);
    return {
      walletId: DEMO_WALLET.id,
      userId,
      balanceCents: demoBalanceCents,
      balanceDollars: DEMO_WALLET.balance,
      currency: DEMO_WALLET.currency,
      updatedAt: DEMO_WALLET.updated_at,
      recentLedgerEntries: [
        {
          id: 'ledger-demo-001',
          wallet_id: DEMO_WALLET.id,
          user_id: userId,
          entry_type: 'credit',
          amount_cents: 250000,
          amount_dollars: 2500.00,
          running_balance_cents: 250000,
          running_balance_dollars: 2500.00,
          currency: 'USD',
          description: 'Initial verified treasury deposit (Wire ref: WIRE-99318)',
          created_at: new Date(Date.now() - 86400000 * 3).toISOString()
        },
        {
          id: 'ledger-demo-002',
          wallet_id: DEMO_WALLET.id,
          user_id: userId,
          entry_type: 'debit',
          amount_cents: 50000,
          amount_dollars: 500.00,
          running_balance_cents: 200000,
          running_balance_dollars: 2000.00,
          currency: 'USD',
          description: 'Funding request allocation: Account TT-ADV-88319',
          created_at: new Date(Date.now() - 86400000 * 2).toISOString()
        }
      ]
    };
  }

  // Authoritative database fetch
  const { data: wallet, error: walletErr } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (walletErr || !wallet) {
    throw new Error(`Wallet not found for user: ${userId}`);
  }

  // Fetch recent ledger entries
  const { data: ledgerRows, error: ledgerErr } = await supabase
    .from('wallet_ledger')
    .select('*')
    .eq('wallet_id', wallet.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (ledgerErr) {
    console.warn(`[Wallet Ledger Error] ${ledgerErr.message}`);
  }

  const balanceCents = wallet.balance_cents || dollarsToCents(wallet.balance || 0);

  const formattedLedger: LedgerEntryRecord[] = (ledgerRows || []).map((row) => ({
    id: row.id,
    wallet_id: row.wallet_id,
    user_id: row.user_id,
    entry_type: row.entry_type,
    amount_cents: row.amount_cents,
    amount_dollars: centsToDollars(row.amount_cents),
    running_balance_cents: row.running_balance_cents,
    running_balance_dollars: centsToDollars(row.running_balance_cents),
    currency: row.currency || 'USD',
    transaction_id: row.transaction_id,
    description: row.description,
    reference_id: row.reference_id,
    authorized_actor: row.authorized_actor,
    created_at: row.created_at,
  }));

  return {
    walletId: wallet.id,
    userId: wallet.user_id,
    balanceCents,
    balanceDollars: centsToDollars(balanceCents),
    currency: wallet.currency || 'USD',
    updatedAt: wallet.updated_at,
    recentLedgerEntries: formattedLedger,
  };
}

/**
 * Executes an atomic financial operation via the PostgreSQL `execute_wallet_ledger_entry` procedure.
 */
export async function executeAtomicLedgerAdjustment({
  walletId,
  userId,
  entryType,
  amountCents,
  description,
  referenceId,
  authorizedActor,
  idempotencyKey,
}: {
  walletId: string;
  userId: string;
  entryType: 'credit' | 'debit' | 'reversal';
  amountCents: number;
  description: string;
  referenceId?: string;
  authorizedActor?: string;
  idempotencyKey?: string;
}): Promise<{
  success: boolean;
  ledgerId?: string;
  newBalanceCents: number;
  newBalanceDollars: number;
  errorMessage?: string;
}> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Sandbox simulation if not connected
  if (!user) {
    const currentBalanceCents = dollarsToCents(DEMO_WALLET.balance);
    const newBalanceCents =
      entryType === 'debit'
        ? Math.max(0, currentBalanceCents - amountCents)
        : currentBalanceCents + amountCents;

    return {
      success: true,
      ledgerId: `ledger-mock-${Date.now().toString(36)}`,
      newBalanceCents,
      newBalanceDollars: centsToDollars(newBalanceCents),
    };
  }

  // Call the atomic database function
  const { data, error } = await supabase.rpc('execute_wallet_ledger_entry', {
    p_wallet_id: walletId,
    p_user_id: userId,
    p_entry_type: entryType,
    p_amount_cents: amountCents,
    p_description: description,
    p_reference_id: referenceId || null,
    p_authorized_actor: authorizedActor || user.id,
    p_idempotency_key: idempotencyKey || null,
  });

  if (error) {
    return {
      success: false,
      newBalanceCents: 0,
      newBalanceDollars: 0,
      errorMessage: error.message,
    };
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result || !result.success) {
    return {
      success: false,
      newBalanceCents: result?.new_balance_cents || 0,
      newBalanceDollars: centsToDollars(result?.new_balance_cents || 0),
      errorMessage: result?.error_message || 'Ledger adjustment rejected by database constraints.',
    };
  }

  return {
    success: true,
    ledgerId: result.ledger_id,
    newBalanceCents: result.new_balance_cents,
    newBalanceDollars: centsToDollars(result.new_balance_cents),
  };
}
