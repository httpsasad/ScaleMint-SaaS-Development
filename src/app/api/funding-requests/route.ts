import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAuthoritativeFundingRequest } from '@/lib/services/funding-service';
import { DEMO_FUNDING_REQUESTS } from '@/lib/supabase/demo-data';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Sandbox development fallback
      return NextResponse.json({
        success: true,
        data: DEMO_FUNDING_REQUESTS,
        isDemo: true,
      });
    }

    // Check user profile role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isOwner = profile?.role === 'scalemint_owner' || profile?.role === 'scalemint_admin';

    let query = supabase.from('funding_requests').select('*');
    if (!isOwner) {
      // Clients only see their own records
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { accountId, accountName, requestedAmountDollars, idempotencyKey } = body;

    if (!accountId || !accountName || requestedAmountDollars === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: accountId, accountName, requestedAmountDollars.' },
        { status: 400 }
      );
    }

    const userId = user ? user.id : 'demo-user-001';

    const result = await createAuthoritativeFundingRequest({
      userId,
      accountId,
      accountName,
      requestedAmountDollars,
      idempotencyKey,
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
