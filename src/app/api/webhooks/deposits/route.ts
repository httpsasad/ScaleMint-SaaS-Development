import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { verifyWebhookSignature, DepositWebhookPayload } from '@/lib/financial/webhooks';
import { executeAtomicLedgerAdjustment } from '@/lib/services/wallet-service';
import { centsToDollars } from '@/lib/financial/money';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-scalemint-signature') || request.headers.get('stripe-signature') || '';
    const isProd = process.env.NODE_ENV === 'production';
    const secret = process.env.DEPOSIT_WEBHOOK_SECRET;

    if (isProd && !secret) {
      console.error('[ScaleMint Security] DEPOSIT_WEBHOOK_SECRET is not configured in production.');
      return NextResponse.json(
        { success: false, error: 'Server misconfiguration: Webhook secret not set.' },
        { status: 500 }
      );
    }

    const effectiveSecret = secret || 'dev_insecure_webhook_secret_do_not_use_in_prod';

    // Verify HMAC-SHA256 signature
    const verification = verifyWebhookSignature({
      payload: rawBody,
      signatureHeader: signature,
      secret: effectiveSecret,
    });

    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: `Signature verification failed: ${verification.error}` },
        { status: 401 }
      );
    }

    const payload: DepositWebhookPayload = JSON.parse(rawBody);

    if (!payload.depositId || !payload.amountCents || !payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Malformed payload: depositId, amountCents, and userId are required.' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Check if deposit exists
    const { data: deposit, error: depErr } = await supabase
      .from('deposits')
      .select('*')
      .eq('id', payload.depositId)
      .maybeSingle();

    if (depErr || !deposit) {
      return NextResponse.json({ success: false, error: 'Target deposit record not found.' }, { status: 404 });
    }

    // Idempotency: If already confirmed, acknowledge receipt with 200 OK without re-crediting
    if (deposit.status === 'confirmed') {
      return NextResponse.json({
        success: true,
        isIdempotentReplay: true,
        message: 'Deposit already processed and credited.',
      });
    }

    // Atomically credit wallet through ledger
    const ledgerResult = await executeAtomicLedgerAdjustment({
      walletId: deposit.wallet_id,
      userId: payload.userId,
      entryType: 'credit',
      amountCents: payload.amountCents,
      description: `Automated payment provider confirmation (Ref: ${payload.providerReference})`,
      referenceId: payload.depositId,
      idempotencyKey: `webhook_credit_${payload.eventId || payload.depositId}`,
    });

    if (!ledgerResult.success) {
      return NextResponse.json(
        { success: false, error: `Ledger credit error: ${ledgerResult.errorMessage}` },
        { status: 500 }
      );
    }

    // Update deposit status to confirmed
    await supabase
      .from('deposits')
      .update({
        status: 'confirmed',
        provider_reference: payload.providerReference,
        provider_signature: signature,
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', deposit.id);

    // Record completed transaction
    await supabase.from('transactions').insert({
      user_id: payload.userId,
      wallet_id: deposit.wallet_id,
      type: 'deposit',
      amount: centsToDollars(payload.amountCents),
      amount_cents: payload.amountCents,
      currency: payload.currency || 'USD',
      status: 'completed',
      description: `Automated deposit via provider: ${payload.providerReference}`,
      related_deposit_id: deposit.id,
      reference_id: payload.providerReference,
    });

    return NextResponse.json({
      success: true,
      depositId: payload.depositId,
      status: 'confirmed',
      newBalanceDollars: ledgerResult.newBalanceDollars,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
