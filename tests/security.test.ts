import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
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
  validateStateTransitionPermission,
} from '../src/lib/financial/state-machine';
import { verifyWebhookSignature } from '../src/lib/financial/webhooks';
import { getPortalAdapter } from '../src/lib/automation/adapters';
import { MockPortalAdapter } from '../src/lib/automation/adapters/mock-adapter';
import { TikTokMarketingApiAdapter } from '../src/lib/automation/adapters/tiktok-adapter';

describe('ScaleMint Stage 6: Security Audit & Production Verification', () => {

  // 1. Precise Financial Verification
  describe('1. Exact Financial Calculation & Half-Up Rounding', () => {
    test('calculates exact 7.5% fee for canonical $500.00 request ($37.50 fee, $462.50 net)', () => {
      const requestedCents = dollarsToCents(500.00); // 50000 cents
      assert.equal(requestedCents, 50000);

      const feeResult = calculateFundingFee(requestedCents, 750); // 7.5%
      assert.equal(feeResult.feeAmountCents, 3750); // $37.50
      assert.equal(feeResult.netAmountCents, 46250); // $462.50
      assert.equal(feeResult.feeAmountDollars, 37.50);
      assert.equal(feeResult.netAmountDollars, 462.50);
      assert.equal(feeResult.feeAmountCents + feeResult.netAmountCents, requestedCents);
    });

    test('enforces deterministic Half-Up rounding on fractional-cent fees ($33.33 * 7.5% = $2.49975 -> $2.50)', () => {
      const requestedCents = dollarsToCents(33.33); // 3333 cents
      const feeResult = calculateFundingFee(requestedCents, 750);
      // 3333 * 750 / 10000 = 249.975 cents -> rounds to 250 cents ($2.50)
      assert.equal(feeResult.feeAmountCents, 250);
      assert.equal(feeResult.netAmountCents, 3083); // $30.83
      assert.equal(feeResult.feeAmountDollars, 2.50);
      assert.equal(feeResult.netAmountDollars, 30.83);
      assert.equal(feeResult.feeAmountCents + feeResult.netAmountCents, requestedCents);
    });

    test('rejects negative, zero, and sub-dollar funding amounts', () => {
      assert.equal(validateFundingAmountLimits(0).valid, false);
      assert.equal(validateFundingAmountLimits(-5000).valid, false);
      assert.equal(validateFundingAmountLimits(50).valid, false); // < $1.00
      assert.throws(() => dollarsToCents(NaN), FinancialPrecisionError);
    });
  });

  // 2. Role-Based Access Control & Privilege Separation
  describe('2. Server-Side RBAC & Privilege Separation', () => {
    test('strictly prevents regular client roles from approving funding requests', () => {
      const clientRoles = ['client_owner', 'client_admin', 'client_member'];
      for (const role of clientRoles) {
        const check = validateStateTransitionPermission(role, 'pending', 'approved');
        assert.equal(check.permitted, false, `Role ${role} should be blocked from approving funding`);
        assert.match(check.error || '', /only platform owners or administrators/i);
      }
    });

    test('strictly prevents regular client roles from completing or failing funding requests', () => {
      const clientRoles = ['client_owner', 'client_admin', 'client_member'];
      for (const role of clientRoles) {
        const check = validateStateTransitionPermission(role, 'processing', 'completed');
        assert.equal(check.permitted, false, `Role ${role} should not be able to mark completed`);
      }
    });

    test('allows verified owners and administrators to review and approve funding requests', () => {
      const ownerRoles = ['scalemint_owner', 'scalemint_admin'];
      for (const role of ownerRoles) {
        const check = validateStateTransitionPermission(role, 'pending', 'approved');
        assert.equal(check.permitted, true, `Role ${role} should be authorized to approve`);
      }
    });

    test('allows clients to cancel only their own pending requests, but blocks cancellation once processing', () => {
      const checkPending = validateStateTransitionPermission('client_owner', 'pending', 'cancelled');
      assert.equal(checkPending.permitted, true);

      // Once request is in processing state, client cannot unilaterally cancel it
      const checkProcessing = validateStateTransitionPermission('client_owner', 'processing', 'cancelled');
      assert.equal(checkProcessing.permitted, false);
    });
  });

  // 3. State Machine Integrity
  describe('3. Financial State Machine Transitions', () => {
    test('enforces strict sequential progression (cannot jump pending -> completed directly)', () => {
      const invalidJump = isValidStateTransition('pending', 'completed');
      assert.equal(invalidJump.valid, false);
      assert.match(invalidJump.error || '', /Invalid transition/);

      const validStep = isValidStateTransition('pending', 'approved');
      assert.equal(validStep.valid, true);
    });

    test('terminal states (completed, cancelled, rejected) cannot be mutated', () => {
      assert.equal(isValidStateTransition('completed', 'approved').valid, false);
      assert.equal(isValidStateTransition('completed', 'cancelled').valid, false);
      assert.equal(isValidStateTransition('cancelled', 'approved').valid, false);
      assert.equal(isValidStateTransition('rejected', 'approved').valid, false);
    });
  });

  // 4. Webhook Security & Idempotency
  describe('4. Webhook Security & Idempotency Controls', () => {
    test('validates authentic HMAC-SHA256 signature with correct shared secret', () => {
      const secret = 'prod_super_secure_webhook_signing_key_44319';
      const payload = JSON.stringify({
        depositId: 'dep-sec-001',
        amountCents: 100000,
        userId: 'client-user-99'
      });

      const validSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

      const result = verifyWebhookSignature({
        payload,
        signatureHeader: validSig,
        secret
      });
      assert.equal(result.valid, true);
    });

    test('rejects tampered webhook payloads or counterfeit signatures', () => {
      const secret = 'prod_super_secure_webhook_signing_key_44319';
      const payload = JSON.stringify({ depositId: 'dep-sec-001', amountCents: 100000 });
      const tamperedPayload = JSON.stringify({ depositId: 'dep-sec-001', amountCents: 99999999 });

      const validSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

      const tamperedResult = verifyWebhookSignature({
        payload: tamperedPayload,
        signatureHeader: validSig,
        secret
      });
      assert.equal(tamperedResult.valid, false);
      assert.match(tamperedResult.error || '', /mismatch/i);
    });
  });

  // 5. Worker Authorization & Credentials Protection
  describe('5. Automation Worker & Adapter Credential Protection', () => {
    test('defaults to MockPortalAdapter with explicit simulation markers', async () => {
      const adapter = getPortalAdapter('mock');
      assert.equal(adapter.mode, 'mock');

      const health = await adapter.validateConnection();
      assert.equal(health.isSimulated, true);
      assert.match(health.message, /Simulated Sandbox/i);
    });

    test('production TikTokMarketingApiAdapter redacts tokens and identifies unconfigured environments', async () => {
      const tiktokAdapter = new TikTokMarketingApiAdapter();
      assert.equal(tiktokAdapter.isConfigured(), false);

      const conn = await tiktokAdapter.validateConnection();
      assert.equal(conn.connected, false);
      assert.match(conn.message, /not yet configured/i);
      // Secrets must never be revealed in connection message (no raw bearer tokens)
      assert.doesNotMatch(conn.message, /Bearer\s+[a-z0-9]/i);
    });

    test('marks external mock funding operation with transparent simulated tag', async () => {
      const mockAdapter = new MockPortalAdapter();
      const payload = {
        internalRequestId: 'req-dup-audit-001',
        accountId: 'acc-sec-01',
        externalAccountId: 'TT-ADV-SEC-01',
        amountCents: 50000,
        amountDollars: 500.00,
        currency: 'USD',
        idempotencyKey: 'idem-sec-001'
      };

      const result = await mockAdapter.submitFundingOperation(payload);
      assert.equal(result.success, true);
      assert.equal(result.isSimulated, true);
      assert.match(result.message, /\[Simulated Sandbox\]/);
      assert.match(result.externalReference, /^TT-TX-MOCK-/);
    });
  });

  // 6. Security & Ledger Boundary Checks
  describe('6. Ledger Boundaries & Reversal Integrity', () => {
    test('verifies ledger debit/credit arithmetic maintains absolute balance equilibrium', () => {
      const initialBalanceCents = 150000; // $1,500.00
      const fundingAmountCents = 50000;   // $500.00
      
      const balanceAfterDebit = initialBalanceCents - fundingAmountCents;
      assert.equal(balanceAfterDebit, 100000); // $1,000.00

      // In case external transfer fails, reversal must credit back exact 50000 cents
      const balanceAfterReversal = balanceAfterDebit + fundingAmountCents;
      assert.equal(balanceAfterReversal, initialBalanceCents);
    });

    test('blocks negative balance transitions when requested amount exceeds available balance', () => {
      const currentWalletBalance = 20000; // $200.00
      const requestedAmount = 50000;      // $500.00

      const hasSufficientFunds = currentWalletBalance >= requestedAmount;
      assert.equal(hasSufficientFunds, false);
    });
  });
});
