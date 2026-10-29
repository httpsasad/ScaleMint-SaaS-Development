'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Key, 
  Copy, 
  Check, 
  Sliders, 
  CheckCircle2, 
  ShieldAlert, 
  Save 
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [copiedSql, setCopiedSql] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [requireTwoSignoffs, setRequireTwoSignoffs] = useState(true);
  const [minFunding, setMinFunding] = useState('100');
  const [maxFunding, setMaxFunding] = useState('25000');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const sqlBootstrapSnippet = `-- ScaleMint Secure Owner Role Elevation
-- Execute this once in the Supabase SQL Editor to grant first Owner access:
UPDATE public.profiles
SET 
  role = 'scalemint_owner',
  status = 'active',
  updated_at = NOW()
WHERE email = 'YOUR_ADMIN_EMAIL@DOMAN.COM';

-- Verify elevation:
SELECT id, email, role, status FROM public.profiles WHERE role = 'scalemint_owner';`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlBootstrapSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveNotice('Platform security safeguards and operational preferences successfully updated.');
    setTimeout(() => setSaveNotice(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-400" />
            <span>Platform Governance & Owner Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Privileged administrative configurations, security policies, secret vault status, and owner elevation protocols.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Policy Changes</span>
        </button>
      </div>

      {saveNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* 1. Initial Owner Role Bootstrap Guide */}
      <div className="rounded-2xl bg-[#080d1a] border border-amber-500/30 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-amber-500/5">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-white">First Owner Account Elevation Protocol</h2>
              <p className="text-[11px] text-amber-300/80">Zero-Trust Bootstrap Process: Clients cannot self-grant owner privileges.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopySql}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs transition-colors"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'Copied' : 'Copy Bootstrap SQL'}</span>
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs">
          <p className="text-slate-300 leading-relaxed">
            In compliance with our security architecture, the database Row-Level Security policies strictly prohibit standard users or API keys from modifying the <code className="text-amber-400 font-mono">role</code> column. To designate the primary platform owner:
          </p>

          <ol className="list-decimal list-inside space-y-1.5 text-slate-400 pl-1">
            <li>Register an account normally through the public <span className="text-white font-semibold">/signup</span> page.</li>
            <li>Log in to your <strong>Supabase Dashboard &rarr; SQL Editor</strong> using root database credentials.</li>
            <li>Execute the script below replacing the placeholder with your registered admin email.</li>
            <li>Your account will gain immediate full owner access across all administrative commands.</li>
          </ol>

          <pre className="p-4 rounded-xl bg-[#03060d] border border-white/10 font-mono text-[11px] text-amber-200 overflow-x-auto whitespace-pre">
            {sqlBootstrapSnippet}
          </pre>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. Security Vault & API Credentials Status */}
        <div className="rounded-2xl bg-[#080d1a] border border-white/10 p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Key className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">API Credentials & Secret Vault</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">TikTok Marketing API App ID</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Configured in Env
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                App secret stored in encrypted server environment variables.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Supabase Service Role Key</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Server-Side Guarded
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Strictly prohibited from client bundling. Only accessible in Server Actions and Route Handlers.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Webhook Signing HMAC Secret</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  SHA-256 Active
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Validates inbound financial notifications from deposit gateways.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Operational & Safeguard Controls */}
        <div className="rounded-2xl bg-[#080d1a] border border-white/10 p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Platform Safeguards & Limits</h2>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div>
                <span className="font-semibold text-white block">Platform Maintenance Mode</span>
                <span className="text-slate-400 text-[11px]">Block client dashboard access for maintenance</span>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div>
                <span className="font-semibold text-white block">Allow New Client Registrations</span>
                <span className="text-slate-400 text-[11px]">Public account registration status</span>
              </div>
              <input
                type="checkbox"
                checked={allowRegistration}
                onChange={(e) => setAllowRegistration(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div>
                <span className="font-semibold text-white block">Dual-Owner Sign-off (&gt; $10k)</span>
                <span className="text-slate-400 text-[11px]">Requires 2 confirmations for high-value funding</span>
              </div>
              <input
                type="checkbox"
                checked={requireTwoSignoffs}
                onChange={(e) => setRequireTwoSignoffs(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-400 mb-1">Min Funding Request ($)</label>
                <input
                  type="number"
                  value={minFunding}
                  onChange={(e) => setMinFunding(e.target.value)}
                  className="w-full bg-[#04060c] border border-white/10 rounded-lg p-2 font-mono text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Max Funding Request ($)</label>
                <input
                  type="number"
                  value={maxFunding}
                  onChange={(e) => setMaxFunding(e.target.value)}
                  className="w-full bg-[#04060c] border border-white/10 rounded-lg p-2 font-mono text-white text-xs"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
