import React from 'react';
import { AlertCircle, Database } from 'lucide-react';
import { envConfig } from '@/lib/config';

export const SandboxBanner: React.FC = () => {
  const isSupabaseLive = envConfig.isSupabaseConfigured();

  if (isSupabaseLive) {
    return null;
  }

  return (
    <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong className="text-white">Sandbox Preview Mode:</strong> Displaying labeled demo telemetry for visual development. Live PostgreSQL operations activate when <code className="bg-black/30 px-1 py-0.5 rounded text-[11px] text-amber-300">NEXT_PUBLIC_SUPABASE_URL</code> is connected.
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-amber-300/80">
        <Database className="w-3.5 h-3.5" />
        <span>RLS Schemas Ready in supabase/migrations/</span>
      </div>
    </div>
  );
};
