/**
 * ScaleMint Mock External Portal Adapter
 * 
 * IMPORTANT:
 * - This adapter is used for automated testing, development, and visual sandboxes.
 * - All responses are explicitly flagged with `isSimulated: true`.
 * - It never represents mock operations as real external transactions.
 */

import { 
  PortalAdapter, 
  IntegrationMode, 
  ConnectionHealthResult, 
  AccountSyncResult, 
  FundingOperationPayload, 
  FundingOperationResult, 
  ExternalStatusResult 
} from '../types';

export interface MockAdapterOptions {
  simulateTimeout?: boolean;
  simulateRateLimit?: boolean;
  simulateAuthExpired?: boolean;
  simulateConnectionFailure?: boolean;
  simulateUnknownStatus?: boolean;
  simulateDiscrepancy?: boolean;
}

export class MockPortalAdapter implements PortalAdapter {
  readonly mode: IntegrationMode = 'mock';
  readonly portalName: string = 'TikTok Marketing API (Simulated Sandbox)';

  private options: MockAdapterOptions;

  constructor(options: MockAdapterOptions = {}) {
    this.options = options;
  }

  setOptions(options: MockAdapterOptions) {
    this.options = { ...this.options, ...options };
  }

  async validateConnection(): Promise<ConnectionHealthResult> {
    if (this.options.simulateConnectionFailure) {
      return {
        connected: false,
        mode: 'mock',
        portalName: this.portalName,
        latencyMs: 1250,
        message: 'Connection failed: Unable to reach external portal gateway (Simulated Sandbox).',
        isSimulated: true,
        timestamp: new Date().toISOString(),
      };
    }

    if (this.options.simulateAuthExpired) {
      return {
        connected: false,
        mode: 'mock',
        portalName: this.portalName,
        latencyMs: 140,
        message: 'Authentication failed: OAuth token expired or revoked in Business Center (Simulated Sandbox).',
        isSimulated: true,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      connected: true,
      mode: 'mock',
      portalName: this.portalName,
      latencyMs: 85,
      message: 'Connection active in verified Simulated Sandbox Mode (Ready for live credentials).',
      isSimulated: true,
      timestamp: new Date().toISOString(),
    };
  }

  async getAccountInfo(externalAccountId: string): Promise<AccountSyncResult> {
    if (this.options.simulateTimeout) {
      return {
        success: false,
        accountId: externalAccountId,
        externalAccountId,
        accountName: 'Unknown',
        status: 'paused',
        balanceCents: 0,
        balanceDollars: 0,
        currency: 'USD',
        syncedAt: new Date().toISOString(),
        isSimulated: true,
        error: 'Gateway timeout after 5000ms while polling Business Center (Simulated).',
        errorCategory: 'api_timeout',
      };
    }

    if (this.options.simulateRateLimit) {
      return {
        success: false,
        accountId: externalAccountId,
        externalAccountId,
        accountName: 'Unknown',
        status: 'paused',
        balanceCents: 0,
        balanceDollars: 0,
        currency: 'USD',
        syncedAt: new Date().toISOString(),
        isSimulated: true,
        error: 'HTTP 429 Too Many Requests: Rate limit exceeded (Simulated).',
        errorCategory: 'rate_limit',
      };
    }

    // Default simulated account details
    return {
      success: true,
      accountId: externalAccountId,
      externalAccountId,
      accountName: `TikTok Account (${externalAccountId}) [Simulated]`,
      status: 'active',
      balanceCents: 85_000, // $850.00
      balanceDollars: 850.00,
      currency: 'USD',
      syncedAt: new Date().toISOString(),
      isSimulated: true,
    };
  }

  async getAccountBalance(externalAccountId: string) {
    const info = await this.getAccountInfo(externalAccountId);
    return {
      externalAccountId,
      balanceCents: info.balanceCents,
      balanceDollars: info.balanceDollars,
      currency: info.currency,
      isSimulated: true,
    };
  }

  async submitFundingOperation(payload: FundingOperationPayload): Promise<FundingOperationResult> {
    if (this.options.simulateTimeout) {
      return {
        success: false,
        internalRequestId: payload.internalRequestId,
        externalReference: '',
        externalStatus: 'unknown',
        message: 'Timeout submitting funding operation to external portal (Simulated).',
        isSimulated: true,
        error: 'Timeout waiting for external portal gateway.',
        errorCategory: 'api_timeout',
      };
    }

    if (this.options.simulateRateLimit) {
      return {
        success: false,
        internalRequestId: payload.internalRequestId,
        externalReference: '',
        externalStatus: 'rejected',
        message: 'External API rate limit reached (Simulated).',
        isSimulated: true,
        error: 'Rate limit 600 req/min exceeded.',
        errorCategory: 'rate_limit',
      };
    }

    const mockExternalRef = `TT-TX-MOCK-${Date.now().toString(36).toUpperCase()}`;

    return {
      success: true,
      internalRequestId: payload.internalRequestId,
      externalReference: mockExternalRef,
      externalStatus: 'processing',
      message: `[Simulated Sandbox] Funding operation submitted to TikTok portal. External Ref: ${mockExternalRef}`,
      isSimulated: true,
    };
  }

  async getFundingOperationStatus(externalReference: string): Promise<ExternalStatusResult> {
    if (this.options.simulateUnknownStatus) {
      return {
        externalReference,
        status: 'unknown',
        reconciliationRequired: true,
        isSimulated: true,
        error: 'External portal returned indeterminate execution state (Simulated).',
      };
    }

    return {
      externalReference,
      status: 'confirmed',
      settledAmountCents: 50_000,
      settledCurrency: 'USD',
      confirmedAt: new Date().toISOString(),
      reconciliationRequired: false,
      isSimulated: true,
    };
  }

  async reconcileExternalTransaction(externalReference: string) {
    if (this.options.simulateDiscrepancy) {
      return {
        reconciled: false,
        discrepancyCents: 5_000, // $50 mismatch
        details: 'Discrepancy detected: Settled amount on external portal is $450.00 vs expected $500.00 (Simulated).',
      };
    }

    return {
      reconciled: true,
      discrepancyCents: 0,
      details: `External transaction ${externalReference} perfectly matches internal ledger entry (Simulated).`,
    };
  }
}
