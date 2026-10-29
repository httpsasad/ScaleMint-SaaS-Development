/**
 * ScaleMint Application Configuration
 * Provides safe access to environment variables for frontend and server runtime.
 * Never expose service role or admin secrets to the client.
 */

export const envConfig = {
  // Public client-side configuration
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  appEnv: process.env.NODE_ENV || 'development',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://scalemint.io',

  // Verification helper for external integrations
  isFastApiConfigured(): boolean {
    return Boolean(process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== 'http://localhost:8000');
  },

  isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return Boolean(
      url && 
      key && 
      !url.includes('placeholder') && 
      !key.includes('placeholder')
    );
  }
};
