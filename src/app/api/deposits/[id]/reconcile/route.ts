import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth-server';
import { reconcileAndConfirmDeposit } from '@/lib/services/deposit-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reconciliationNotes, providerReference } = body;

    if (!reconciliationNotes) {
      return NextResponse.json(
        { success: false, error: 'Reconciliation notes are required for compliance tracking.' },
        { status: 400 }
      );
    }

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

    const result = await reconcileAndConfirmDeposit({
      depositId: id,
      actorId: session.userId || 'owner-root-001',
      actorRole: session.role || 'scalemint_owner',
      providerReference,
      reconciliationNotes,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
