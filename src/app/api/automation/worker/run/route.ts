import { NextRequest, NextResponse } from 'next/server';
import { runWorkerHeartbeat } from '@/lib/automation/worker';
import { getServerAuthSession } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const bearerToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    const configuredSecret = process.env.WORKER_AUTH_TOKEN;

    let isAuthorized = false;

    // 1. Check if valid worker secret token
    if (configuredSecret && bearerToken && bearerToken === configuredSecret) {
      isAuthorized = true;
    } else {
      // 2. Otherwise verify if user is authenticated owner
      const session = await getServerAuthSession();
      if (session.isAuthenticated && session.isOwner) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Valid worker bearer token or owner session required.' },
        { status: 401 }
      );
    }

    const summary = await runWorkerHeartbeat();
    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

