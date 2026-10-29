import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth-server';
import { queueAutomationJob, executeAutomationJob } from '@/lib/automation/orchestrator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, externalAccountId } = body;

    if (!externalAccountId) {
      return NextResponse.json(
        { success: false, error: 'externalAccountId is required.' },
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

    // Queue and immediately trigger execution for instant feedback
    const queueResult = await queueAutomationJob({
      jobType: 'account_sync',
      payload: { externalAccountId },
      relatedAccountId: accountId,
      idempotencyKey: `sync_${externalAccountId}_${Date.now()}`,
    });

    const execResult = await executeAutomationJob(queueResult.jobId);

    return NextResponse.json({
      success: execResult.success,
      jobId: queueResult.jobId,
      message: execResult.message,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
