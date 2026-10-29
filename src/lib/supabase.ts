import { envConfig } from './config';

/**
 * Supabase Client Initialization Stub
 * Prepared for PostgreSQL data synchronization and authentication.
 * 
 * SECURITY NOTE:
 * Only public NEXT_PUBLIC_SUPABASE_ANON_KEY is accepted in this client module.
 * The SUPABASE_SERVICE_ROLE_KEY must strictly be used on the server or in the FastAPI service.
 */

export interface SupabaseAuthStatus {
  isConfigured: boolean;
  message: string;
}

export function getSupabaseStatus(): SupabaseAuthStatus {
  if (envConfig.isSupabaseConfigured()) {
    return {
      isConfigured: true,
      message: 'Supabase credentials detected'
    };
  }

  return {
    isConfigured: false,
    message: 'Supabase authentication service is currently unconfigured in this environment. Platform access is restricted to approved manual accounts.'
  };
}
