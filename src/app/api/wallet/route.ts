import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getAuthoritativeWalletSummary } from '@/lib/services/wallet-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check optional query param for target user (if owner is inspecting another client's wallet)
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');

    let effectiveUserId = user ? user.id : 'demo-client-001';

    if (targetUserId && user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'scalemint_owner' || profile?.role === 'scalemint_admin') {
        effectiveUserId = targetUserId;
      } else if (targetUserId !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Cannot view another client’s wallet.' },
          { status: 403 }
        );
      }
    }

    const summary = await getAuthoritativeWalletSummary(effectiveUserId);
    return NextResponse.json({ success: true, data: summary });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
