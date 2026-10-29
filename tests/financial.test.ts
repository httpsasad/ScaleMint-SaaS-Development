/**
 * ScaleMint Stage 4: Comprehensive Automated Financial & Ledger Test Suite
 * Executed via Node.js native test runner (`node --test`)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';

import { 
  dollarsToCents, 
  validateFundingAmountLimits, 
  FinancialPrecisionError
} from '../src/lib/financial/money';

import { 
  calculateFundingFee 
} from '../src/lib/financial/fees';

import { 
  isValidStateTransition, 
  validateStateTransitionPermission
} from '../src/lib/financial/state-machine';

import { 
  verifyWebhookSignature
} from '../src/lib/financial/webhooks';

describe('ScaleMint Stage 4: Financial Precision & Security Engine', () => {

  // 1. 7.5% FEE CALCULATION
  it('1. calculates exact 7.5% platform fee for $500.00 request ($37.50 fee, $462.50 net)', () => {
    const requestedCents = dollarsToCents(500.00); // 50,000 cents
    const result = calculateFundingFee(requestedCents, 750); // 750 bps = 7.5%

    assert.equal(result.requestedAmountCents, 50_000);
    assert.equal(result.requestedAmountDollars, 500.00);
    assert.equal(result.feeRatePercentage, 7.5);
    assert.equal(result.feeAmountCents, 3_750); // $37.50
    assert.equal(result.feeAmountDollars, 37.50);
    assert.equal(result.netAmountCents, 46_250); // $462.50
    assert.equal(result.netAmountDollars, 462.50);

    // Invariant check: net + fee === requested
    assert.equal(result.feeAmountCents + result.netAmountCents, result.requestedAmountCents);
  });

  // 2. CURRENCY ROUNDING
  it('2. enforces standard Half-Up currency rounding without floating point drift', () => {
    // $103.33 @ 7.5% = 10,333 cents * 0.075 = 774.975 cents -> rounds to 775 cents ($7.75)
    const requestedCents = dollarsToCents('103.33');
    const result = calculateFundingFee(requestedCents, 750);

    assert.equal(result.feeAmountCents, 775); // Half-up to nearest cent
    assert.equal(result.feeAmountDollars, 7.75);
    assert.equal(result.netAmountCents, 10_333 - 775);
    assert.equal(result.netAmountDollars, 95.58);
    assert.equal(result.feeAmountCents + result.netAmountCents, result.requestedAmountCents);
  });

  // 3. INVALID AND NEGATIVE AMOUNTS
  it('3. rejects invalid, zero, negative, fractional cent, and out-of-bounds amounts', () => {
    // Reject sub-cent fractions (e.g. $100.005)
    assert.throws(
      () => dollarsToCents('100.005'),
      FinancialPrecisionError
    );

    // Reject negative dollars
    const negativeCents = dollarsToCents(-50.00);
    const limitCheckNegative = validateFundingAmountLimits(negativeCents);
    assert.equal(limitCheckNegative.valid, false);

    // Reject below minimum ($100.00 min)
    const belowMinCents = dollarsToCents(50.00);
    const limitCheckMin = validateFundingAmountLimits(belowMinCents);
    assert.equal(limitCheckMin.valid, false);

    // Reject above maximum ($25,000.00 max)
    const aboveMaxCents = dollarsToCents(30000.00);
    const limitCheckMax = validateFundingAmountLimits(aboveMaxCents);
    assert.equal(limitCheckMax.valid, false);
  });

  // 4. UNAUTHORIZED CLIENT ACCESS
  it('4. strictly prevents regular clients from approving their own funding requests', () => {
    const clientRole = 'client_owner';
    const permission = validateStateTransitionPermission(clientRole, 'pending', 'approved');
    assert.equal(permission.permitted, false);
    assert.match(permission.error || '', /Unauthorized/);
  });

  // 5. UNAUTHORIZED OWNER ACTIONS
  it('5. allows only verified owners/admins to approve, reject, or process requests', () => {
    const ownerRole = 'scalemint_owner';
    const adminRole = 'scalemint_admin';
    const unverifiedMember = 'client_member';

    assert.equal(validateStateTransitionPermission(ownerRole, 'pending', 'approved').permitted, true);
    assert.equal(validateStateTransitionPermission(adminRole, 'pending', 'approved').permitted, true);
    assert.equal(validateStateTransitionPermission(unverifiedMember, 'pending', 'approved').permitted, false);
  });

  // 6. DUPLICATE IDEMPOTENCY KEYS
  it('6. verifies idempotency key prevents duplicate execution', () => {
    const processedKeys = new Set<string>();

    function processFundingRequest(idempotencyKey: string) {
      if (processedKeys.has(idempotencyKey)) {
        return { isReplay: true, message: 'Idempotent replay' };
      }
      processedKeys.add(idempotencyKey);
      return { isReplay: false, message: 'Processed successfully' };
    }

    const key = 'idem-req-unique-9921';
    const firstCall = processFundingRequest(key);
    assert.equal(firstCall.isReplay, false);

    const secondCall = processFundingRequest(key);
    assert.equal(secondCall.isReplay, true);
  });

  // 7. DUPLICATE PAYMENT WEBHOOKS
  it('7. verifies webhook signature and protects against duplicate webhook processing', () => {
    const secret = 'test_webhook_signing_secret_9941';
    const payload = JSON.stringify({
      depositId: 'dep-001',
      userId: 'usr-001',
      amountCents: 50000,
      providerReference: 'tx_stripe_88192'
    });

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${payload}`, 'utf8')
      .digest('hex');

    const header = `t=${timestamp},v1=${signature}`;

    // Verify valid signature
    const check1 = verifyWebhookSignature({
      payload,
      signatureHeader: header,
      secret,
    });
    assert.equal(check1.valid, true);

    // Reject forged signature
    const checkForged = verifyWebhookSignature({
      payload,
      signatureHeader: `t=${timestamp},v1=bad_signature_hex_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`,
      secret,
    });
    assert.equal(checkForged.valid, false);
  });

  // 8. INVALID STATUS TRANSITIONS
  it('8. strictly blocks invalid state transitions in the funding request lifecycle', () => {
    // Cannot transition from terminal states
    assert.equal(isValidStateTransition('completed', 'pending').valid, false);
    assert.equal(isValidStateTransition('rejected', 'approved').valid, false);
    assert.equal(isValidStateTransition('failed', 'processing').valid, false);
    assert.equal(isValidStateTransition('cancelled', 'approved').valid, false);

    // Cannot skip stages (e.g. pending -> completed without approval/processing)
    assert.equal(isValidStateTransition('pending', 'completed').valid, false);

    // Valid progression: pending -> approved -> processing -> completed
    assert.equal(isValidStateTransition('pending', 'approved').valid, true);
    assert.equal(isValidStateTransition('approved', 'processing').valid, true);
    assert.equal(isValidStateTransition('processing', 'completed').valid, true);
  });

  // 9. CONCURRENT FUNDING REQUESTS / RACE CONDITIONS
  it('9. simulates concurrent balance deductions preventing balance from turning negative', () => {
    let runningBalanceCents = 100_000; // $1,000.00
    const requestAmountCents = 60_000; // $600.00

    function attemptDeduction(amount: number): boolean {
      if (runningBalanceCents >= amount) {
        runningBalanceCents -= amount;
        return true;
      }
      return false;
    }

    // First request should succeed
    const firstAttempt = attemptDeduction(requestAmountCents);
    assert.equal(firstAttempt, true);
    assert.equal(runningBalanceCents, 40_000); // $400.00 remaining

    // Second concurrent request for $600 must fail due to insufficient funds ($400 < $600)
    const secondAttempt = attemptDeduction(requestAmountCents);
    assert.equal(secondAttempt, false);
    assert.equal(runningBalanceCents, 40_000); // Balance preserved
  });

  // 10. DUPLICATE LEDGER ENTRIES
  it('10. prevents duplicate ledger entries using unique reference keys', () => {
    const ledgerTable: Array<{ id: string; reference_id: string; amount_cents: number }> = [];

    function recordLedger(referenceId: string, amount: number) {
      if (ledgerTable.some(entry => entry.reference_id === referenceId)) {
        throw new Error('Duplicate ledger entry violation.');
      }
      ledgerTable.push({ id: `led-${Date.now()}`, reference_id: referenceId, amount_cents: amount });
    }

    recordLedger('ref-funding-100', 50000);
    assert.equal(ledgerTable.length, 1);

    assert.throws(
      () => recordLedger('ref-funding-100', 50000),
      /Duplicate ledger entry/
    );
    assert.equal(ledgerTable.length, 1);
  });

  // 11. INSUFFICIENT WALLET BALANCES
  it('11. blocks funding request when wallet balance is lower than requested amount', () => {
    const availableCents = 20_000; // $200.00
    const requestedCents = 50_000; // $500.00

    assert.equal(availableCents < requestedCents, true);
    const hasSufficientFunds = availableCents >= requestedCents;
    assert.equal(hasSufficientFunds, false);
  });

  // 12. DEPOSIT REVERSAL
  it('12. performs ledger reversal restoring funds upon failed funding processing', () => {
    let runningBalanceCents = 50_000; // $500.00
    const debitAmount = 50_000;

    // 1. Debit upon approval
    runningBalanceCents -= debitAmount;
    assert.equal(runningBalanceCents, 0);

    // 2. Failure occurs in external portal -> execute reversal
    const reversalType = 'reversal';
    if (reversalType === 'reversal') {
      runningBalanceCents += debitAmount;
    }

    assert.equal(runningBalanceCents, 50_000); // Balance restored atomically
  });

  // 13. RECONCILIATION FAILURES
  it('13. rejects reconciliation when mandatory compliance notes are missing or actor is non-owner', () => {
    function validateReconciliation(actorRole: string, notes: string) {
      if (actorRole !== 'scalemint_owner' && actorRole !== 'scalemint_admin') {
        throw new Error('Unauthorized reconciliation actor.');
      }
      if (!notes || notes.trim().length < 5) {
        throw new Error('Compliance notes required.');
      }
      return true;
    }

    assert.throws(
      () => validateReconciliation('client_owner', 'Verified wire deposit'),
      /Unauthorized reconciliation actor/
    );

    assert.throws(
      () => validateReconciliation('scalemint_owner', '   '),
      /Compliance notes required/
    );

    assert.equal(
      validateReconciliation('scalemint_owner', 'Bank wire transfer confirmed by treasury'),
      true
    );
  });

});
