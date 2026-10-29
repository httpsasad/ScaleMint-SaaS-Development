import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getPortalAdapter } from '@/lib/automation/adapters';
import { DEMO_AUTOMATION_HEALTH } from '@/lib/supabase/admin-demo-data';

export async function GET() {
  try {
    const adapter = getPortalAdapter();
    const connection = await adapter.validateConnection();

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Sandbox development mode
    if (!user) {
      return NextResponse.json({
        success: true,
        mode: adapter.mode,
        portalName: adapter.portalName,
        connection,
        isSimulated: true,
        services: DEMO_AUTOMATION_HEALTH,
        queueSummary: {
          pending: 1,
          running: 0,
          completed: 14,
          failed: 1,
          requiresReconciliation: 0,
        },
      });
    }

    // Live Supabase query
    const { data: services } = await supabase.from('automation_health').select('*');

    const { count: pendingCount } = await supabase
      .from('automation_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: runningCount } = await supabase
      .from('automation_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'running');

    const { count: completedCount } = await supabase
      .from('automation_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    const { count: failedCount } = await supabase
      .from('automation_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed');

    const { count: reconCount } = await supabase
      .from('automation_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'requires_reconciliation');

    return NextResponse.json({
      success: true,
      mode: adapter.mode,
      portalName: adapter.portalName,
      connection,
      isSimulated: adapter.mode === 'mock',
      services: services || [],
      queueSummary: {
        pending: pendingCount || 0,
        running: runningCount || 0,
        completed: completedCount || 0,
        failed: failedCount || 0,
        requiresReconciliation: reconCount || 0,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
