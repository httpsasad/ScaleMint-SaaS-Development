'use client';

import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Download, 
  ArrowDownLeft, 
  ArrowUpRight 
} from 'lucide-react';
import { DEMO_TRANSACTIONS } from '@/lib/supabase/demo-data';
import { DEMO_CLIENTS } from '@/lib/supabase/admin-demo-data';
import { TransactionType } from '@/types/dashboard';

export default function AdminTransactionsPage() {
  const [transactions] = useState(DEMO_TRANSACTIONS);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');

  const filtered = transactions.filter(t => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch = 
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      (t.reference_id && t.reference_id.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-400" />
            <span>Master Financial Transaction Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global immutable ledger of all inbound deposits, ad account allocations, and fee retentions across the platform.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Full platform audit ledger exported to CSV.')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-semibold text-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Master CSV</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transaction ID, description, or ref..."
            className="w-full bg-[#080d1a] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-semibold">
          {(['all', 'deposit', 'funding_allocation', 'fee_deduction', 'adjustment'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition-colors ${
                filterType === t
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {t === 'all' ? 'All Ledger Types' : t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-2xl bg-[#080d1a] border border-white/10 overflow-hidden shadow-xl text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono">
            <thead className="bg-[#0c1326] text-slate-400 border-b border-white/5 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Event ID</th>
                <th className="py-3.5 px-4 font-sans">Client Org</th>
                <th className="py-3.5 px-4 font-sans">Type</th>
                <th className="py-3.5 px-4 font-sans">Description</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4 font-sans">Status</th>
                <th className="py-3.5 px-5 text-right font-sans">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((tx) => {
                const client = DEMO_CLIENTS.find(c => c.id === tx.user_id);
                return (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-5 text-amber-400 font-bold">
                      {tx.id}
                    </td>
                    <td className="py-4 px-4 font-sans text-white font-semibold">
                      {client?.company_name || 'Client Agency'}
                    </td>
                    <td className="py-4 px-4 font-sans capitalize">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.type === 'deposit'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : tx.type === 'funding_allocation'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {tx.type === 'deposit' ? (
                          <ArrowDownLeft className="w-3 h-3" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                        <span>{tx.type.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 font-sans text-slate-200">
                      {tx.description}
                    </td>
                    <td
                      className={`py-4 px-4 font-bold text-sm ${
                        tx.amount > 0 ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`} {tx.currency}
                    </td>
                    <td className="py-4 px-4 font-sans">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="capitalize">{tx.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right font-sans text-slate-400 text-[11px]">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
