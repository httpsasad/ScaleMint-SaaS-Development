import { createBrowserClient } from '@supabase/ssr';
import { envConfig } from '../config';

/**
 * Creates a Supabase client for use in Client Components.
 * Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Never exposes service-role keys.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !anonKey) {
    // Return null or client configured with empty values if unconfigured
    return createBrowserClient(
      url || 'https://placeholder.supabase.co',
      anonKey || 'placeholder-anon-key'
    );
  }

  return createBrowserClient(url, anonKey);
}

export function isSupabaseConnected(): boolean {
  return envConfig.isSupabaseConfigured();
}
