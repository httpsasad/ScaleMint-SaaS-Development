'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  Search, 
  Clock, 
  ArrowUpRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  PauseCircle, 
  XCircle,
  Network
} from 'lucide-react';
import { DEMO_ACCOUNTS } from '@/lib/supabase/demo-data';
import { AccountStatus } from '@/types/dashboard';

export default function AdvertisingAccountsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AccountStatus>('all');

  const accounts = DEMO_ACCOUNTS;

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch = 
      acc.account_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.account_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || acc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Active</span>
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-3 h-3" />
            <span>Under Review</span>
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-300 border border-slate-500/20">
            <PauseCircle className="w-3 h-3" />
            <span>Paused</span>
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            <span>Suspended</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-400" />
            <span>Assigned Advertising Accounts</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Accounts assigned directly to your organization with isolated proxy configurations and live balance telemetry.
          </p>
        </div>

        <Link
          href="/dashboard/funding-requests"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-300 transition-all shadow-md shadow-emerald-500/20"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Allocate Funds</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search account name or ID..."
            className="w-full bg-[#090f1d] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['all', 'active', 'under_review', 'paused', 'suspended'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {status === 'all' ? 'All Accounts' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Accounts List Table */}
      <div className="rounded-2xl bg-[#090f1d] border border-white/10 overflow-hidden shadow-xl">
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto text-slate-500">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No Matching Accounts</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No advertising accounts match the selected search criteria or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0c1326] text-slate-400 border-b border-white/5 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Account Name & Platform</th>
                  <th className="py-3.5 px-4">Account ID</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Current Ad Balance</th>
                  <th className="py-3.5 px-4">Last Sync</th>
                  <th className="py-3.5 px-4">Proxy Cluster</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-white text-sm">{acc.account_name}</div>
                      <div className="text-[11px] text-slate-400 capitalize">Platform: {acc.platform} Ad Center</div>
                    </td>
                    <td className="py-4 px-4 font-mono text-emerald-400 font-semibold">
                      {acc.account_id}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(acc.status)}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-white text-sm">
                      ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} {acc.currency}
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(acc.last_synced_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Network className="w-3 h-3 text-emerald-500/70" />
                        <span>{acc.proxy_cluster_id || 'Isolated'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Link
                        href={`/dashboard/funding-requests?accountId=${acc.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all font-bold text-xs"
                      >
                        <span>Request Funds</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <span>
          <strong>Authorization Guard:</strong> Clients are strictly limited by PostgreSQL Row-Level Security policies to only view and request funding for accounts provisioned to their client organization.
        </span>
      </div>
    </div>
  );
}
