import { createServerSupabaseClient } from '@/lib/supabase/server';
import { envConfig } from '@/lib/config';
import { UserRole } from '@/types/dashboard';

export interface ServerAuthSession {
  isAuthenticated: boolean;
  userId: string | null;
  userEmail: string | null;
  role: UserRole | null;
  isOwner: boolean;
  isDemoFallback: boolean;
}

/**
 * Validates and retrieves the caller's server session and database role.
 * In production or whenever Supabase is configured, strict token and profile verification is enforced.
 */
export async function getServerAuthSession(): Promise<ServerAuthSession> {
  const isProd = process.env.NODE_ENV === 'production';
  const isConfigured = envConfig.isSupabaseConfigured();

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Query authoritative role from database
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', user.id)
        .maybeSingle();

      const role = (profile?.role as UserRole) || 'client_member';
      const isOwner = role === 'scalemint_owner' || role === 'scalemint_admin';

      return {
        isAuthenticated: true,
        userId: user.id,
        userEmail: user.email || profile?.email || null,
        role,
        isOwner,
        isDemoFallback: false,
      };
    }

    // If no user is logged in:
    // In production OR when Supabase is properly configured, reject as unauthenticated
    if (isProd || isConfigured) {
      return {
        isAuthenticated: false,
        userId: null,
        userEmail: null,
        role: null,
        isOwner: false,
        isDemoFallback: false,
      };
    }

    // Local sandbox development fallback only (unconfigured local dev)
    return {
      isAuthenticated: true,
      userId: 'demo-user-001',
      userEmail: 'demo@scalemint.io',
      role: 'scalemint_owner',
      isOwner: true,
      isDemoFallback: true,
    };
  } catch (err) {
    console.error('[ScaleMint Auth] Error resolving server session:', err);
    return {
      isAuthenticated: false,
      userId: null,
      userEmail: null,
      role: null,
      isOwner: false,
      isDemoFallback: false,
    };
  }
}
