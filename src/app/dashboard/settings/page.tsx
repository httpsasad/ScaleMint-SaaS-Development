'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  ShieldCheck, 
  Webhook, 
  CheckCircle2, 
  Copy, 
  Check 
} from 'lucide-react';
import { DEMO_PROFILE } from '@/lib/supabase/demo-data';

export default function SettingsPage() {
  const [profile, setProfile] = useState(DEMO_PROFILE);
  const [companyName, setCompanyName] = useState(profile.company_name);
  const [contactName, setContactName] = useState(profile.contact_name);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Webhook settings
  const [webhookUrl, setWebhookUrl] = useState('https://agency-erp.internal/webhooks/scalemint');
  const [webhookSecret] = useState('sm_sec_9941a8b27c3d4e5f6a7b8c9d0');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({
      ...profile,
      company_name: companyName,
      contact_name: contactName,
      updated_at: new Date().toISOString()
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          <span>Agency Settings & Profile</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your organization profile, security policies, and technical integration parameters.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Profile configuration saved to PostgreSQL vault.</span>
        </div>
      )}

      {/* Organization & Profile Form */}
      <div className="rounded-2xl bg-[#090f1d] border border-white/10 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Organization Profile</span>
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5">
            Role: {profile.role.replace('_', ' ')}
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Company / Agency Name
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-[#0d1424] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Primary Contact Person
              </label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full bg-[#0d1424] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Registered Work Email (Immutable)
              </label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full bg-black/40 border border-white/5 rounded-lg p-2.5 text-slate-500 cursor-not-allowed font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Contact compliance desk to modify master authentication email.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Client Organization Identifier (UUID)
              </label>
              <input
                type="text"
                disabled
                value={profile.id}
                className="w-full bg-black/40 border border-white/5 rounded-lg p-2.5 text-slate-500 cursor-not-allowed font-mono text-[11px]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* Security & Access Policies */}
      <div className="rounded-2xl bg-[#090f1d] border border-white/10 p-6 sm:p-8 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>PostgreSQL Row-Level Security Status</span>
        </h2>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-[#0d1424] border border-white/5 flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Client Tenancy Isolation</div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Enabled via <code className="text-emerald-400 font-mono">auth.uid() = user_id</code> policies across all 7 operational tables.
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0d1424] border border-white/5 flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Financial Mutation Block</div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Client UPDATE and DELETE permissions revoked on wallets and ledger tables.
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Restricted
            </span>
          </div>
        </div>
      </div>

      {/* Webhook & Telemetry Integration */}
      <div className="rounded-2xl bg-[#090f1d] border border-white/10 p-6 sm:p-8 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
          <Webhook className="w-4 h-4 text-emerald-400" />
          <span>Real-time Event Webhooks</span>
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Stream funding approval events, spend alerts, and ad balance notifications directly to your internal ERP or Slack webhook.
        </p>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Destination Webhook Endpoint (HTTPS)
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full bg-[#0d1424] border border-white/10 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-300">
                Webhook Signing Secret
              </label>
              <button
                type="button"
                onClick={() => copyToClipboard(webhookSecret, 'webhook')}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px]"
              >
                {copiedKey === 'webhook' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'webhook' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="font-mono text-[11px] text-slate-400 bg-black/40 p-2.5 rounded-lg border border-white/5 truncate">
              {webhookSecret}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
