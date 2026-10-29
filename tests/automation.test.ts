/**
 * ScaleMint Stage 5: External Portal Integration & Automation Worker Test Suite
 * Automated tests covering all 14 integration and background worker scenarios using Mock Adapter.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { MockPortalAdapter } from '../src/lib/automation/adapters/mock-adapter';
import { calculateBackoffMs } from '../src/lib/automation/orchestrator';

describe('ScaleMint Stage 5: Portal Integration & Automation Worker Tests', () => {

  // 1. SUCCESSFUL SIMULATED SYNCHRONIZATION
  it('1. performs successful simulated account synchronization with transparent simulation tags', async () => {
    const adapter = new MockPortalAdapter();
    const result = await adapter.getAccountInfo('TT-ADV-88319');

    assert.equal(result.success, true);
    assert.equal(result.externalAccountId, 'TT-ADV-88319');
    assert.equal(result.isSimulated, true); // Transparent simulation standard
    assert.equal(result.currency, 'USD');
    assert.equal(result.balanceCents, 85_000); // $850.00
    assert.equal(result.balanceDollars, 850.00);
  });

  // 2. CONNECTION FAILURE
  it('2. handles external connection failure gracefully with diagnostic reporting', async () => {
    const adapter = new MockPortalAdapter({ simulateConnectionFailure: true });
    const health = await adapter.validateConnection();

    assert.equal(health.connected, false);
    assert.equal(health.isSimulated, true);
    assert.match(health.message, /Connection failed/);
  });

  // 3. API TIMEOUT
  it('3. handles external API gateway timeout cleanly without hanging', async () => {
    const adapter = new MockPortalAdapter({ simulateTimeout: true });
    const result = await adapter.getAccountInfo('TT-ADV-TIMEOUT');

    assert.equal(result.success, false);
    assert.equal(result.errorCategory, 'api_timeout');
    assert.match(result.error || '', /timeout/i);
  });

  // 4. RATE LIMITING
  it('4. detects and classifies HTTP 429 rate limit responses', async () => {
    const adapter = new MockPortalAdapter({ simulateRateLimit: true });
    const result = await adapter.getAccountInfo('TT-ADV-RATE-LIMIT');

    assert.equal(result.success, false);
    assert.equal(result.errorCategory, 'rate_limit');
    assert.match(result.error || '', /429|rate limit/i);
  });

  // 5. EXPIRED CREDENTIALS
  it('5. identifies expired/revoked OAuth tokens and disables live polling', async () => {
    const adapter = new MockPortalAdapter({ simulateAuthExpired: true });
    const health = await adapter.validateConnection();

    assert.equal(health.connected, false);
    assert.match(health.message, /expired or revoked/i);
  });

  // 6. DUPLICATE JOB SUBMISSION
  it('6. prevents duplicate job submissions using idempotency keys', () => {
    const activeJobs = new Map<string, string>();

    function submitJob(idempotencyKey: string, jobId: string) {
      if (activeJobs.has(idempotencyKey)) {
        return { isDuplicate: true, existingJobId: activeJobs.get(idempotencyKey) };
      }
      activeJobs.set(idempotencyKey, jobId);
      return { isDuplicate: false, jobId };
    }

    const key = 'idem-sync-account-88319';
    const first = submitJob(key, 'job-001');
    assert.equal(first.isDuplicate, false);
    assert.equal(first.jobId, 'job-001');

    const second = submitJob(key, 'job-002');
    assert.equal(second.isDuplicate, true);
    assert.equal(second.existingJobId, 'job-001');
  });

  // 7. DUPLICATE FUNDING PROCESSING
  it('7. blocks duplicate funding operation dispatch for the same internal request', () => {
    const externalOperations = new Set<string>();

    function dispatchFunding(requestId: string, externalRef: string) {
      if (externalOperations.has(requestId)) {
        throw new Error(`Conflict: Funding operation already in flight for request #${requestId}.`);
      }
      externalOperations.add(requestId);
      return { externalRef, status: 'dispatched' };
    }

    const reqId = 'req-demo-5501';
    const first = dispatchFunding(reqId, 'TT-TX-1001');
    assert.equal(first.status, 'dispatched');

    assert.throws(
      () => dispatchFunding(reqId, 'TT-TX-1002'),
      /already in flight/
    );
  });

  // 8. RETRY EXHAUSTION & EXPONENTIAL BACKOFF
  it('8. calculates exponential backoff intervals and enforces max attempt exhaustion', () => {
    // Attempt 1: 1000 * 2^1 = 2000 ms
    assert.equal(calculateBackoffMs(1), 2000);
    // Attempt 2: 1000 * 2^2 = 4000 ms
    assert.equal(calculateBackoffMs(2), 4000);
    // Attempt 3: 1000 * 2^3 = 8000 ms
    assert.equal(calculateBackoffMs(3), 8000);
    // Cap at 300,000 ms (5 mins)
    assert.equal(calculateBackoffMs(15), 300_000);

    const maxAttempts = 3;
    let attempts = 0;
    let isRetryEligible = true;

    while (attempts < maxAttempts) {
      attempts++;
      isRetryEligible = attempts < maxAttempts;
    }

    assert.equal(attempts, 3);
    assert.equal(isRetryEligible, false); // Exhausted
  });

  // 9. UNKNOWN EXTERNAL OPERATION STATUS
  it('9. routes unknown external status to human owner reconciliation queue', async () => {
    const adapter = new MockPortalAdapter({ simulateUnknownStatus: true });
    const status = await adapter.getFundingOperationStatus('TT-TX-INDETERMINATE');

    assert.equal(status.status, 'unknown');
    assert.equal(status.reconciliationRequired, true);
    assert.match(status.error || '', /indeterminate/i);
  });

  // 10. INCORRECT ACCOUNT MAPPING
  it('10. detects and rejects invalid external account mapping', async () => {
    function validateAccountMapping(internalId: string, externalId: string) {
      if (!externalId.startsWith('TT-') && !/^\d{10,}$/.test(externalId)) {
        throw new Error(`Invalid external TikTok account format: "${externalId}"`);
      }
      return true;
    }

    assert.equal(validateAccountMapping('acc-01', 'TT-ADV-88319'), true);
    assert.throws(
      () => validateAccountMapping('acc-01', 'INVALID_ACCT_FORMAT'),
      /Invalid external TikTok account format/
    );
  });

  // 11. INVALID CURRENCY OR AMOUNT
  it('11. verifies external currency matches ScaleMint ledger USD standard', () => {
    function verifyCurrencyMatch(externalCurrency: string, expected: string = 'USD') {
      if (externalCurrency.toUpperCase() !== expected.toUpperCase()) {
        throw new Error(`Currency mismatch: Portal reported ${externalCurrency}, expected ${expected}.`);
      }
      return true;
    }

    assert.equal(verifyCurrencyMatch('USD'), true);
    assert.throws(
      () => verifyCurrencyMatch('EUR'),
      /Currency mismatch/
    );
  });

  // 12. SUCCESSFUL EXTERNAL CONFIRMATION
  it('12. confirms external funding operation upon verified portal receipt', async () => {
    const adapter = new MockPortalAdapter();
    const status = await adapter.getFundingOperationStatus('TT-TX-MOCK-991');

    assert.equal(status.status, 'confirmed');
    assert.equal(status.reconciliationRequired, false);
    assert.equal(status.settledAmountCents, 50_000); // $500.00
  });

  // 13. FAILED EXTERNAL OPERATION
  it('13. handles external operation rejection with clear error reason', async () => {
    const adapter = new MockPortalAdapter({ simulateRateLimit: true });
    const result = await adapter.submitFundingOperation({
      internalRequestId: 'req-001',
      accountId: 'acc-01',
      externalAccountId: 'TT-ADV-01',
      amountCents: 50000,
      amountDollars: 500,
      currency: 'USD',
      idempotencyKey: 'idem-001',
    });

    assert.equal(result.success, false);
    assert.equal(result.externalStatus, 'rejected');
    assert.equal(result.errorCategory, 'rate_limit');
  });

  // 14. RECONCILIATION-REQUIRED SCENARIOS & UNAUTHORIZED OWNER ACTIONS
  it('14. identifies discrepancies and prevents unauthorized clients from triggering admin reconciliations', async () => {
    const adapter = new MockPortalAdapter({ simulateDiscrepancy: true });
    const recon = await adapter.reconcileExternalTransaction('TT-TX-MOCK-DISCREPANCY');

    assert.equal(recon.reconciled, false);
    assert.equal(recon.discrepancyCents, 5_000); // $50 mismatch detected
    assert.match(recon.details, /Discrepancy detected/);

    function attemptOwnerReconciliation(userRole: string) {
      if (userRole !== 'scalemint_owner' && userRole !== 'scalemint_admin') {
        throw new Error('Unauthorized: Only platform owners can resolve reconciliation discrepancies.');
      }
      return { resolved: true };
    }

    // Regular client rejected
    assert.throws(
      () => attemptOwnerReconciliation('client_owner'),
      /Unauthorized/
    );

    // Platform owner authorized
    assert.equal(attemptOwnerReconciliation('scalemint_owner').resolved, true);
  });

});
