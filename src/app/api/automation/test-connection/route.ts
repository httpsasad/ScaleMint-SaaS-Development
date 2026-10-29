import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth-server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getPortalAdapter } from '@/lib/automation/adapters';

export async function POST() {
  try {
    const session = await getServerAuthSession();
    if (!session.isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    if (!session.isOwner) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Scalemint Owner or Administrator privileges required.' },
        { status: 403 }
      );
    }

    if (session.userId && !session.isDemoFallback) {
      const supabase = await createServerSupabaseClient();
      // Record audit log
      await supabase.from('audit_logs').insert({
        actor_id: session.userId,
        action: 'integration.test_connection',
        entity_type: 'integration_config',
        entity_id: 'tiktok_marketing_api',
        reason: 'Manual connection diagnostic test initiated from Owner Console',
      });
    }

    const adapter = getPortalAdapter();
    const health = await adapter.validateConnection();

    return NextResponse.json({
      success: true,
      data: health,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
