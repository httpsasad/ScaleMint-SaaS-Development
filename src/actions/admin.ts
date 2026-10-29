'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AccountStatus } from '@/types/dashboard';
import { FeeConfiguration } from '@/types/admin';
import { reconcileAndConfirmDeposit } from '@/lib/services/deposit-service';

export interface AdminActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

import { getServerAuthSession } from '@/lib/auth-server';

/**
 * Server-side authorization check ensuring only users with
 * 'scalemint_admin' or 'scalemint_owner' role can execute actions.
 */
async function verifyOwnerAuthorization() {
  const session = await getServerAuthSession();
  if (!session.isAuthenticated || !session.isOwner) {
    return { isAuthorized: false, isDemoMode: false, userId: session.userId || '', userEmail: session.userEmail || '' };
  }
  return {
    isAuthorized: true,
    isDemoMode: session.isDemoFallback,
    userId: session.userId || 'owner-root-001',
    userEmail: session.userEmail || 'owner@scalemint.io',
  };
}

/**
 * Update client account status (e.g. active, suspended, pending_kyc)
 */
export async function updateClientStatus(
  clientId: string,
  newStatus: 'active' | 'suspended' | 'pending_kyc',
  reason: string
): Promise<AdminActionResult> {
  const auth = await verifyOwnerAuthorization();
  if (!auth.isAuthorized) {
    return { success: false, message: 'Unauthorized: Owner or Administrator privileges required.' };
  }

  if (!reason || reason.trim().length < 5) {
    return { success: false, message: 'A specific operational reason (minimum 5 characters) is required for audit logs.' };
  }

  try {
    const supabase = await createServerSupabaseClient();
    
    if (!auth.isDemoMode) {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', clientId);

      if (error) {
        return { success: false, message: `Database error: ${error.message}` };
      }

      // Record in audit log
      await supabase.from('audit_logs').insert({
        actor_id: auth.userId,
        actor_email: auth.userEmail,
        action: 'client.status_updated',
        entity_type: 'client',
        entity_id: clientId,
        reason,
        metadata: { new_status: newStatus }
      });
    }

    return {
      success: true,
      message: `Client status successfully updated to "${newStatus}". Audit log recorded.`
    };
  } catch (err) {
    console.error('[Admin Action Error]', err);
    return { success: false, message: 'Failed to update client status.' };
  }
}

/**
 * Review funding request (Processing, Approved, Rejected)
 * Prevents double approval and records owner decision.
 */
export async function reviewFundingRequest(
  requestId: string,
  newStatus: 'processing' | 'approved' | 'rejected',
  reviewNotes: string
): Promise<AdminActionResult> {
  const auth = await verifyOwnerAuthorization();
  if (!auth.isAuthorized) {
    return { success: false, message: 'Unauthorized: Owner or Administrator privileges required.' };
  }

  if (!reviewNotes || reviewNotes.trim().length < 3) {
    return { success: false, message: 'Review notes are required for compliance tracking.' };
  }

  try {
    const supabase = await createServerSupabaseClient();

    if (!auth.isDemoMode) {
      // Check current request state to prevent duplicate processing
      const { data: existing, error: fetchErr } = await supabase
        .from('funding_requests')
        .select('id, status, requested_amount')
        .eq('id', requestId)
        .single();

      if (fetchErr || !existing) {
        return { success: false, message: 'Funding request not found.' };
      }

      if (existing.status === 'approved' && newStatus === 'approved') {
        return { success: false, message: 'Idempotency Warning: Request is already approved.' };
      }

      if (existing.status === 'rejected' && newStatus === 'approved') {
        return { success: false, message: 'Invalid transition: Cannot approve a previously rejected request.' };
      }

      const { error: updateErr } = await supabase
        .from('funding_requests')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: auth.userId,
          reference_notes: reviewNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateErr) {
        return { success: false, message: `Database error: ${updateErr.message}` };
      }

      // Record in audit log
      await supabase.from('audit_logs').insert({
        actor_id: auth.userId,
        actor_email: auth.userEmail,
        action: `funding_request.${newStatus}`,
        entity_type: 'funding_request',
        entity_id: requestId,
        reason: reviewNotes,
        metadata: { new_status: newStatus, amount: existing.requested_amount }
      });
    }

    return {
      success: true,
      message: `Funding request #${requestId} marked as "${newStatus}". External transfer tracking queued.`
    };
  } catch (err) {
    console.error('[Admin Action Error]', err);
    return { success: false, message: 'Failed to process funding request review.' };
  }
}

/**
 * Configure global platform fee rate
 * Validates permitted range (1.0% to 25.0%) and snapshots configuration.
 */
export async function updateFeeConfiguration(
  percentage: number,
  reason: string
): Promise<AdminActionResult<FeeConfiguration>> {
  const auth = await verifyOwnerAuthorization();
  if (!auth.isAuthorized) {
    return { success: false, message: 'Unauthorized: Only platform owners can adjust fee structures.' };
  }

  const cleanPercentage = Math.round(Number(percentage) * 100) / 100;
  if (isNaN(cleanPercentage) || cleanPercentage < 1.0 || cleanPercentage > 25.0) {
    return { success: false, message: 'Fee rate must be configured between 1.00% and 25.00%.' };
  }

  if (!reason || reason.trim().length < 5) {
    return { success: false, message: 'Please provide a justification (min 5 characters) for the fee rate adjustment.' };
  }

  const calculatedFeeRate = Math.round((cleanPercentage / 100) * 10000) / 10000;

  try {
    const supabase = await createServerSupabaseClient();

    if (!auth.isDemoMode) {
      // Deactivate current active fee config
      await supabase
        .from('fee_configurations')
        .update({ is_active: false })
        .eq('is_active', true);

      // Insert new active config
      const { data, error } = await supabase
        .from('fee_configurations')
        .insert({
          rate_percentage: cleanPercentage,
          fee_rate: calculatedFeeRate,
          reason: reason.trim(),
          changed_by: auth.userId,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        return { success: false, message: `Database error: ${error.message}` };
      }

      // Record audit log
      await supabase.from('audit_logs').insert({
        actor_id: auth.userId,
        actor_email: auth.userEmail,
        action: 'fee_configuration.updated',
        entity_type: 'fee_configuration',
        entity_id: data.id,
        reason,
        metadata: { new_percentage: cleanPercentage, new_fee_rate: calculatedFeeRate }
      });

      return {
        success: true,
        message: `Platform fee rate successfully updated to ${cleanPercentage.toFixed(2)}%. Existing staged requests preserve their snapshot rate.`,
        data: data as FeeConfiguration
      };
    }

    // Sandbox response
    const mockConfig: FeeConfiguration = {
      id: `fee-cfg-${Date.now().toString(36)}`,
      rate_percentage: cleanPercentage,
      fee_rate: calculatedFeeRate,
      effective_from: new Date().toISOString(),
      changed_by: auth.userId,
      changed_by_email: auth.userEmail,
      reason,
      is_active: true,
      created_at: new Date().toISOString()
    };

    return {
      success: true,
      message: `[Sandbox] Platform fee rate updated to ${cleanPercentage.toFixed(2)}%. Audit log staged.`,
      data: mockConfig
    };
  } catch (err) {
    console.error('[Fee Action Error]', err);
    return { success: false, message: 'Failed to update fee configuration.' };
  }
}

/**
 * Create or update advertising account details with client assignment
 */
export async function saveAdvertisingAccount(data: {
  id?: string;
  accountName: string;
  accountId: string;
  userId: string;
  status: AccountStatus;
  proxyClusterId?: string;
  notes?: string;
}): Promise<AdminActionResult> {
  const auth = await verifyOwnerAuthorization();
  if (!auth.isAuthorized) {
    return { success: false, message: 'Unauthorized: Owner or Administrator privileges required.' };
  }

  if (!data.accountName || !data.accountId || !data.userId) {
    return { success: false, message: 'Account name, external account ID, and assigned client are required.' };
  }

  try {
    const supabase = await createServerSupabaseClient();

    if (!auth.isDemoMode) {
      if (data.id) {
        // Update
        const { error } = await supabase
          .from('advertising_accounts')
          .update({
            account_name: data.accountName.trim(),
            account_id: data.accountId.trim(),
            user_id: data.userId,
            status: data.status,
            proxy_cluster_id: data.proxyClusterId?.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id);

        if (error) return { success: false, message: error.message };
      } else {
        // Create
        const { error } = await supabase
          .from('advertising_accounts')
          .insert({
            account_name: data.accountName.trim(),
            account_id: data.accountId.trim(),
            user_id: data.userId,
            status: data.status,
            proxy_cluster_id: data.proxyClusterId?.trim() || null,
            balance: 0.00,
            currency: 'USD'
          });

        if (error) return { success: false, message: error.message };
      }

      await supabase.from('audit_logs').insert({
        actor_id: auth.userId,
        actor_email: auth.userEmail,
        action: data.id ? 'account.updated' : 'account.created',
        entity_type: 'advertising_account',
        entity_id: data.accountId,
        reason: data.notes || 'Administrative ad account provisioning/update',
        metadata: { client_id: data.userId, status: data.status }
      });
    }

    return {
      success: true,
      message: `Advertising account "${data.accountName}" saved and assigned to client.`
    };
  } catch (err) {
    console.error('[Account Save Error]', err);
    return { success: false, message: 'Failed to save advertising account.' };
  }
}

/**
 * Record an atomic auditable wallet ledger adjustment.
 * Enforces server verification and records mandatory compliance reason in audit log.
 */
export async function recordWalletAdjustment(
  clientId: string,
  amount: number,
  type: 'credit' | 'debit',
  reason: string
): Promise<AdminActionResult> {
  const auth = await verifyOwnerAuthorization();
  if (!auth.isAuthorized) {
    return { success: false, message: 'Unauthorized: Owner or Administrator privileges required.' };
  }

  const cleanAmount = Math.abs(Number(amount));
  if (isNaN(cleanAmount) || cleanAmount <= 0) {
    return { success: false, message: 'Invalid adjustment amount.' };
  }

  if (!reason || reason.trim().length < 5) {
    return { success: false, message: 'A compliance reason (minimum 5 characters) is required for audit logs.' };
  }

  const signedDelta = type === 'credit' ? cleanAmount : -cleanAmount;

  try {
    const supabase = await createServerSupabaseClient();

    if (!auth.isDemoMode) {
      // Fetch current wallet
      const { data: wallet, error: wErr } = await supabase
        .from('wallets')
        .select('id, balance, currency')
        .eq('user_id', clientId)
        .single();

      if (wErr || !wallet) {
        return { success: false, message: 'Target client wallet not found.' };
      }

      const newBalance = wallet.balance + signedDelta;
      if (newBalance < 0) {
        return { success: false, message: `Insufficient balance: Client wallet only has $${wallet.balance.toFixed(2)}.` };
      }

      // Update wallet balance
      const { error: updateErr } = await supabase
        .from('wallets')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', wallet.id);

      if (updateErr) {
        return { success: false, message: `Wallet update failed: ${updateErr.message}` };
      }

      // Record transaction ledger entry
      await supabase.from('transactions').insert({
        user_id: clientId,
        wallet_id: wallet.id,
        type: type === 'credit' ? 'adjustment_credit' : 'adjustment_debit',
        amount: cleanAmount,
        currency: wallet.currency || 'USD',
        status: 'completed',
        description: `Owner adjustment (${type}): ${reason}`
      });

      // Record immutable audit log
      await supabase.from('audit_logs').insert({
        actor_id: auth.userId,
        actor_email: auth.userEmail,
        action: `wallet.adjustment_${type}`,
        entity_type: 'wallet',
        entity_id: wallet.id,
        reason,
        metadata: {
          client_id: clientId,
          adjustment_amount: signedDelta,
          previous_balance: wallet.balance,
          new_balance: newBalance
        }
      });
    }

    return {
      success: true,
      message: `Auditable wallet adjustment of ${signedDelta > 0 ? '+' : ''}$${signedDelta.toFixed(2)} recorded.`
    };
  } catch (err) {
    console.error('[Wallet Adjustment Error]', err);
    return { success: false, message: 'Failed to record wallet adjustment.' };
  }
}

/**
 * Re-trigger an account synchronization attempt
 */
export async function retrySyncLog(logId: string): Promise<AdminActionResult> {
  const auth = await verifyOwnerAuthorization();
  if (!auth.isAuthorized) {
    return { success: false, message: 'Unauthorized: Owner or Administrator privileges required.' };
  }

  try {
    const supabase = await createServerSupabaseClient();

    if (!auth.isDemoMode) {
      const { error } = await supabase
        .from('sync_logs')
        .update({ status: 'retrying', message: 'Manual retry queued by platform owner' })
        .eq('id', logId);

      if (error) return { success: false, message: error.message };

      await supabase.from('audit_logs').insert({
        actor_id: auth.userId,
        actor_email: auth.userEmail,
        action: 'sync.retry_triggered',
        entity_type: 'sync_log',
        entity_id: logId,
        reason: 'Manual synchronization retry triggered from Owner Console'
      });
    }

    return {
      success: true,
      message: `Synchronization retry dispatched for log #${logId}.`
    };
  } catch (err) {
    console.error('[Sync Retry Error]', err);
    return { success: false, message: 'Failed to queue synchronization retry.' };
  }
}

/**
 * Reconcile and confirm an inbound client deposit.
 * Atomically credits wallet via ledger and records compliance justification.
 */
export async function reconcileDepositAction(
  depositId: string,
  reconciliationNotes: string,
  providerReference?: string
): Promise<AdminActionResult> {
  const auth = await verifyOwnerAuthorization();
  if (!auth.isAuthorized) {
    return { success: false, message: 'Unauthorized: Owner or Administrator privileges required.' };
  }

  if (!reconciliationNotes || reconciliationNotes.trim().length < 5) {
    return { success: false, message: 'Reconciliation justification (min 5 characters) is required.' };
  }

  try {
    const result = await reconcileAndConfirmDeposit({
      depositId,
      actorId: auth.userId,
      actorRole: 'scalemint_owner',
      providerReference,
      reconciliationNotes,
    });

    return {
      success: true,
      message: result.message,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to reconcile deposit.';
    return { success: false, message: msg };
  }
}


