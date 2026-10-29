/**
 * ScaleMint Portal Adapter Registry & Factory
 */

import { PortalAdapter, IntegrationMode } from '../types';
import { MockPortalAdapter } from './mock-adapter';
import { TikTokMarketingApiAdapter } from './tiktok-adapter';

let sharedMockAdapter: MockPortalAdapter | null = null;
let sharedLiveAdapter: TikTokMarketingApiAdapter | null = null;

export function getPortalAdapter(modeOverride?: IntegrationMode): PortalAdapter {
  const configuredMode = (process.env.INTEGRATION_MODE as IntegrationMode) || 'mock';
  const effectiveMode = modeOverride || configuredMode;

  if (effectiveMode === 'live') {
    if (!sharedLiveAdapter) {
      sharedLiveAdapter = new TikTokMarketingApiAdapter();
    }
    return sharedLiveAdapter;
  }

  if (!sharedMockAdapter) {
    sharedMockAdapter = new MockPortalAdapter();
  }
  return sharedMockAdapter;
}

export { MockPortalAdapter, TikTokMarketingApiAdapter };
