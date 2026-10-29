'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Wallet, 
  Layers, 
  Clock, 
  Receipt, 
  ArrowUpRight, 
  AlertCircle, 
  RefreshCw, 
  ChevronRight, 
  TrendingUp 
} from 'lucide-react';
import { 
  DEMO_WALLET, 
  DEMO_ACCOUNTS, 
  DEMO_FUNDING_REQUESTS, 
  DEMO_TRANSACTIONS 
} from '@/lib/supabase/demo-data';

export default function DashboardOverviewPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterState] = useState<'all' | 'empty' | 'error'>('all');

  const wallet = DEMO_WALLET;
  const accounts = DEMO_ACCOUNTS;
  const fundingRequests = DEMO_FUNDING_REQUESTS;
  const transactions = DEMO_TRANSACTIONS;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const pendingRequestsCount = fundingRequests.filter(r => r.status === 'pending_review' || r.status === 'processing').length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Agency Overview
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time liquidity, account synchronization, and ad spend allocation status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5"
            title="Refresh Account Balances"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Sync Balances</span>
          </button>

          <Link
            href="/dashboard/funding-requests"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-300 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>New Funding Request</span>
          </Link>
        </div>
      </div>

      {/* State View Notice for testing empty/error */}
      {filterState === 'error' && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Error retrieving live TikTok Business Center telemetry. Retrying with fallback proxy...</span>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Available Wallet Balance */}
        <div className="p-5 rounded-2xl bg-[#090f1d] border border-white/10 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Available Treasury Balance</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            ${wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Multi-Currency Rails</span>
            </span>
            <span className="text-slate-400 font-mono text-[10px]">
              {wallet.currency}
            </span>
          </div>
        </div>

        {/* Card 2: Total Assigned Accounts */}
        <div className="p-5 rounded-2xl bg-[#090f1d] border border-white/10 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Assigned Ad Accounts</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {accounts.length} Accounts
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Active: {accounts.filter(a => a.status === 'active').length}</span>
            <span className="text-amber-400">Review: {accounts.filter(a => a.status === 'under_review').length}</span>
          </div>
        </div>

        {/* Card 3: Pending Funding Requests */}
        <div className="p-5 rounded-2xl bg-[#090f1d] border border-white/10 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Pending Funding Requests</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {pendingRequestsCount} Staged
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-emerald-400">7.5% Server Recalculated</span>
            <Link href="/dashboard/funding-requests" className="hover:underline text-slate-300">
              View All &rarr;
            </Link>
          </div>
        </div>

        {/* Card 4: Recent Transactions */}
        <div className="p-5 rounded-2xl bg-[#090f1d] border border-white/10 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Recent Activity Volume</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {transactions.length} Ledger Events
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-emerald-400 font-mono">Audit Synced</span>
            <Link href="/dashboard/transactions" className="hover:underline text-slate-300">
              Ledger &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Assigned Ad Accounts Quick Grid */}
      <div className="rounded-2xl bg-[#090f1d] border border-white/10 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Assigned TikTok Advertising Accounts</h2>
          </div>
          <Link
            href="/dashboard/accounts"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            <span>Manage All ({accounts.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0c1326] text-slate-400 border-b border-white/5 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Account ID & Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Current Ad Balance</th>
                <th className="py-3 px-4">Last Synced</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{acc.account_name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{acc.account_id}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        acc.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : acc.status === 'under_review'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        acc.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'
                      }`} />
                      {acc.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} {acc.currency}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{new Date(acc.last_synced_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/dashboard/funding-requests?accountId=${acc.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/30 transition-all font-semibold text-[11px]"
                    >
                      <span>Top Up</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Grid: Funding Requests & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Funding Requests with Status Indicators */}
        <div className="lg:col-span-7 rounded-2xl bg-[#090f1d] border border-white/10 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Funding Requests</h2>
            </div>
            <Link
              href="/dashboard/funding-requests"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-white/5 text-xs">
            {fundingRequests.map((req) => (
              <div key={req.id} className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{req.account_name}</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        req.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : req.status === 'processing'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {req.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <span>Requested: ${req.requested_amount.toFixed(2)}</span>
                    <span>&bull;</span>
                    <span>7.5% Fee: ${req.fee_amount.toFixed(2)}</span>
                    <span>&bull;</span>
                    <span className="text-emerald-300 font-medium">Net: ${req.net_amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400">
                  <div>{new Date(req.created_at).toLocaleDateString()}</div>
                  <div className="text-[10px] text-slate-500">ID: {req.id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Ledger Activity */}
        <div className="lg:col-span-5 rounded-2xl bg-[#090f1d] border border-white/10 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Recent Ledger Events</h2>
            </div>
            <Link
              href="/dashboard/transactions"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              Full Ledger &rarr;
            </Link>
          </div>

          <div className="divide-y divide-white/5 text-xs">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">{tx.description}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{tx.id}</div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-mono font-bold ${
                      tx.amount > 0 ? 'text-emerald-400' : 'text-slate-300'
                    }`}
                  >
                    {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize">{tx.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
