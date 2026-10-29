import { NextResponse } from 'next/server';
import { envConfig } from '@/lib/config';
import { getPortalAdapter } from '@/lib/automation/adapters';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const startTime = Date.now();
  const adapter = getPortalAdapter();

  let dbStatus = 'unconfigured';
  let dbLatencyMs: number | null = null;

  if (envConfig.isSupabaseConfigured()) {
    try {
      const dbStart = Date.now();
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.from('profiles').select('id').limit(1);
      dbLatencyMs = Date.now() - dbStart;
      dbStatus = error ? 'degraded' : 'connected';
    } catch {
      dbStatus = 'unreachable';
    }
  } else {
    dbStatus = 'mock_sandbox';
  }

  const isHealthy = dbStatus === 'connected' || dbStatus === 'mock_sandbox';

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      durationMs: Date.now() - startTime,
      services: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
          mode: envConfig.isSupabaseConfigured() ? 'live_supabase' : 'mock_sandbox',
        },
        integration: {
          mode: adapter.mode,
          name: adapter.portalName,
          isSimulated: adapter.mode === 'mock',
        },
        financialLedger: {
          precision: 'integer_minor_units_cents',
          feeCalculation: 'exact_half_up_bankers_rounding',
          defaultFeeRateBps: 750,
        },
      },
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
