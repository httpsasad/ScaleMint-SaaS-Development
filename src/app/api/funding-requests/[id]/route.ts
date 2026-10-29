import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DEMO_FUNDING_REQUESTS } from '@/lib/supabase/demo-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const match = DEMO_FUNDING_REQUESTS.find(r => r.id === id);
      if (!match) {
        return NextResponse.json({ success: false, error: 'Funding request not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: match, isDemo: true });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isOwner = profile?.role === 'scalemint_owner' || profile?.role === 'scalemint_admin';

    let query = supabase.from('funding_requests').select('*').eq('id', id);
    if (!isOwner) {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: 'Funding request not found or unauthorized.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
