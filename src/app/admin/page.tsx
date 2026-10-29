'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Layers, 
  Clock, 
  Receipt, 
  ArrowUpRight, 
  RefreshCw, 
  AlertTriangle, 
  ChevronRight,
  Cpu
} from 'lucide-react';
import { 
  DEMO_CLIENTS, 
  DEMO_ADMIN_STATS, 
  DEMO_SYNC_LOGS, 
  DEMO_AUTOMATION_HEALTH 
} from '@/lib/supabase/admin-demo-data';
import { DEMO_FUNDING_REQUESTS } from '@/lib/supabase/demo-data';

export default function AdminOverviewPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const stats = DEMO_ADMIN_STATS;
  const clients = DEMO_CLIENTS;
  const pendingRequests = DEMO_FUNDING_REQUESTS.filter(r => r.status === 'pending_review' || r.status === 'processing');
  const syncLogs = DEMO_SYNC_LOGS;
  const automationHealth = DEMO_AUTOMATION_HEALTH;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const unresolvedSyncErrors = syncLogs.filter(s => s.status === 'failed' || s.status === 'warning');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Owner Command Center
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Platform Master
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time cross-client liquidity, ad account fleet telemetry, and pending compliance queues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5"
            title="Poll Automation Workers"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">Poll System State</span>
          </button>

          <Link
            href="/admin/funding-requests"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-xs hover:from-amber-400 hover:to-amber-300 transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Review Requests ({pendingRequests.length})</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered Clients */}
        <div className="p-5 rounded-2xl bg-[#080d1a] border border-white/10 relative group hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Registered Clients</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {stats.totalClients} Organizations
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-emerald-400">{stats.activeClients} Active</span>
            <Link href="/admin/clients" className="hover:underline text-slate-300">
              Manage &rarr;
            </Link>
          </div>
        </div>

        {/* Total Assigned Accounts */}
        <div className="p-5 rounded-2xl bg-[#080d1a] border border-white/10 relative group hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Assigned TikTok Accounts</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {stats.totalAssignedAccounts} Fleet Containers
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Residential Subnets: 14</span>
            <Link href="/admin/accounts" className="hover:underline text-slate-300">
              Fleet &rarr;
            </Link>
          </div>
        </div>

        {/* Pending Funding Requests */}
        <div className="p-5 rounded-2xl bg-[#080d1a] border border-white/10 relative group hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Pending Funding Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-300 tracking-tight">
            {stats.pendingFundingRequests} Requests Pending
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-emerald-400 font-mono">Fee Rate: 7.50%</span>
            <Link href="/admin/funding-requests" className="hover:underline text-amber-400">
              Process &rarr;
            </Link>
          </div>
        </div>

        {/* Total Recorded Transactions */}
        <div className="p-5 rounded-2xl bg-[#080d1a] border border-white/10 relative group hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Recorded Transactions</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {stats.totalRecordedTransactions} Events
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-emerald-400 font-mono">Audit Synced</span>
            <Link href="/admin/transactions" className="hover:underline text-slate-300">
              Ledger &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Unresolved Telemetry / Sync Warnings Alert */}
      {unresolvedSyncErrors.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Synchronization Notice: </span>
              {unresolvedSyncErrors.length} accounts require manual proxy or TikTok Business Center verification.
            </div>
          </div>
          <Link
            href="/admin/sync-logs"
            className="text-amber-400 font-semibold hover:underline shrink-0"
          >
            Review Sync Logs &rarr;
          </Link>
        </div>
      )}

      {/* Two Column Grid: Pending Funding Requests & Client Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Pending Funding Requests */}
        <div className="lg:col-span-7 rounded-2xl bg-[#080d1a] border border-white/10 overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Pending Funding Queue ({pendingRequests.length})</h2>
            </div>
            <Link
              href="/admin/funding-requests"
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <span>Full Queue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-white/5 text-xs">
            {pendingRequests.map((req) => (
              <div key={req.id} className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{req.account_name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase font-bold">
                      {req.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <span>Requested: <strong className="text-white">${req.requested_amount.toFixed(2)}</strong></span>
                    <span>&bull;</span>
                    <span className="text-amber-300">Fee (7.5%): ${req.fee_amount.toFixed(2)}</span>
                    <span>&bull;</span>
                    <span className="text-emerald-400">Net: ${req.net_amount.toFixed(2)}</span>
                  </div>
                  {req.reference_notes && (
                    <div className="text-[10px] text-slate-400 mt-1 italic">
                      Note: &ldquo;{req.reference_notes}&rdquo;
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/funding-requests?reviewId=${req.id}`}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                  >
                    Review Action
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Client Directory Quick View */}
        <div className="lg:col-span-5 rounded-2xl bg-[#080d1a] border border-white/10 overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Client Portfolio Overview</h2>
            </div>
            <Link
              href="/admin/clients"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              All Clients ({clients.length}) &rarr;
            </Link>
          </div>

          <div className="divide-y divide-white/5 text-xs">
            {clients.map((c) => (
              <div key={c.id} className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">{c.company_name}</div>
                  <div className="text-[11px] text-slate-400">{c.contact_name} &bull; {c.accounts_count} accounts</div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      c.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : c.status === 'pending_kyc'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {c.status.replace('_', ' ')}
                  </span>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    Balance: ${c.wallet?.balance.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Automation Subsystem Status Strip */}
      <div className="rounded-2xl bg-[#080d1a] border border-white/10 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Automation Engine Health</h2>
          </div>
          <Link
            href="/admin/automation-status"
            className="text-xs text-emerald-400 hover:underline font-semibold"
          >
            Detailed Diagnostics &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {automationHealth.map((srv) => (
            <div key={srv.id} className="p-3.5 rounded-xl bg-[#0d1424] border border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white truncate max-w-[150px]">{srv.display_name}</span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                    srv.status === 'operational'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : srv.status === 'simulated_dev'
                      ? 'bg-teal-500/10 text-teal-300'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {srv.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                {srv.details}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
