'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  X, 
  Layers, 
  ArrowUpRight,
  Receipt
} from 'lucide-react';
import { DEMO_CLIENTS } from '@/lib/supabase/admin-demo-data';
import { DEMO_ACCOUNTS, DEMO_FUNDING_REQUESTS, DEMO_TRANSACTIONS } from '@/lib/supabase/demo-data';
import { ClientWithMetrics } from '@/types/admin';
import { updateClientStatus } from '@/actions/admin';

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientWithMetrics[]>(DEMO_CLIENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending_kyc' | 'suspended'>('all');

  // Client Details & Status Dialog State
  const [selectedClient, setSelectedClient] = useState<ClientWithMetrics | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState<'active' | 'suspended' | 'pending_kyc'>('active');
  const [statusReason, setStatusReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredClients = clients.filter((c) => {
    const matchesSearch = 
      c.company_name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenStatusModal = (client: ClientWithMetrics, newStatus: 'active' | 'suspended' | 'pending_kyc') => {
    setSelectedClient(client);
    setTargetStatus(newStatus);
    setStatusReason('');
    setShowStatusModal(true);
  };

  const handleConfirmStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    setIsUpdating(true);
    setActionNotice(null);

    try {
      const res = await updateClientStatus(selectedClient.id, targetStatus, statusReason);
      if (res.success) {
        setClients(clients.map(c => c.id === selectedClient.id ? { ...c, status: targetStatus } : c));
        setActionNotice(res.message);
        setShowStatusModal(false);
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error updating client status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const clientAccounts = DEMO_ACCOUNTS.filter(a => a.user_id === selectedClient?.id);
  const clientRequests = DEMO_FUNDING_REQUESTS.filter(r => r.user_id === selectedClient?.id);
  const clientTransactions = DEMO_TRANSACTIONS.filter(t => t.user_id === selectedClient?.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Client Organization Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review registered agency partners, inspect assigned account fleets, manage KYC verification, and enforce access suspensions.
          </p>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, contact, or email..."
            className="w-full bg-[#080d1a] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-semibold">
          {(['all', 'active', 'pending_kyc', 'suspended'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {s === 'all' ? 'All Clients' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Table */}
      <div className="rounded-2xl bg-[#080d1a] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0c1326] text-slate-400 border-b border-white/5 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Organization & Contact</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Ad Accounts</th>
                <th className="py-3.5 px-4">Treasury Balance</th>
                <th className="py-3.5 px-4">Allocated Spend</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-5 text-right">Owner Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-bold text-white text-sm">{client.company_name}</div>
                    <div className="text-[11px] text-slate-400">
                      {client.contact_name} &bull; <span className="font-mono text-slate-400">{client.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        client.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : client.status === 'pending_kyc'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {client.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-white">{client.accounts_count} Accounts</span>
                    <span className="text-[10px] text-emerald-400 block">({client.active_accounts_count} active)</span>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-white">
                    ${client.wallet?.balance.toFixed(2) || '0.00'}
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-300">
                    ${client.total_spend_allocated.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                    {new Date(client.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-5 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedClient(client)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition-colors"
                    >
                      Inspect
                    </button>
                    {client.status === 'active' ? (
                      <button
                        type="button"
                        onClick={() => handleOpenStatusModal(client, 'suspended')}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenStatusModal(client, 'active')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors"
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Client Drawer / Modal */}
      {selectedClient && !showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#080d1a] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h2 className="text-base font-bold text-white">{selectedClient.company_name}</h2>
                <p className="text-[11px] text-slate-400">UUID: {selectedClient.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-slate-400">Contact</div>
                <div className="font-semibold text-white mt-0.5">{selectedClient.contact_name}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-slate-400">Email</div>
                <div className="font-semibold text-white mt-0.5 truncate">{selectedClient.email}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-slate-400">Wallet Liquidity</div>
                <div className="font-mono font-bold text-emerald-400 mt-0.5">
                  ${selectedClient.wallet?.balance.toFixed(2) || '0.00'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-slate-400">Account Access</div>
                <div className="font-bold text-white mt-0.5 capitalize">{selectedClient.status}</div>
              </div>
            </div>

            {/* Assigned Ad Accounts */}
            <div>
              <h3 className="font-bold text-white mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Assigned Advertising Accounts ({clientAccounts.length})</span>
              </h3>
              <div className="rounded-xl border border-white/5 divide-y divide-white/5 overflow-hidden">
                {clientAccounts.length === 0 ? (
                  <div className="p-4 text-slate-400 text-center">No ad accounts currently provisioned to this client.</div>
                ) : (
                  clientAccounts.map((a) => (
                    <div key={a.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">{a.account_name}</div>
                        <div className="font-mono text-[10px] text-slate-400">{a.account_id} &bull; Proxy: {a.proxy_cluster_id}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-white">${a.balance.toFixed(2)}</div>
                        <div className="text-[10px] text-emerald-400 capitalize">{a.status}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Funding History Snapshot */}
            <div>
              <h3 className="font-bold text-white mb-2 flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
                <span>Recent Funding Requests ({clientRequests.length})</span>
              </h3>
              <div className="rounded-xl border border-white/5 divide-y divide-white/5 overflow-hidden">
                {clientRequests.length === 0 ? (
                  <div className="p-4 text-slate-400 text-center">No funding requests submitted yet.</div>
                ) : (
                  clientRequests.map((r) => (
                    <div key={r.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">{r.account_name}</div>
                        <div className="text-[10px] text-slate-400">Requested: ${r.requested_amount.toFixed(2)} &bull; Net: ${r.net_amount.toFixed(2)}</div>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
                        {r.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Wallet & Transaction Records */}
            <div>
              <h3 className="font-bold text-white mb-2 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>Recent Ledger Transactions ({clientTransactions.length})</span>
              </h3>
              <div className="rounded-xl border border-white/5 divide-y divide-white/5 overflow-hidden">
                {clientTransactions.length === 0 ? (
                  <div className="p-4 text-slate-400 text-center">No transactions recorded for this client.</div>
                ) : (
                  clientTransactions.map((t) => (
                    <div key={t.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white capitalize">{t.description || t.type}</div>
                        <div className="text-[10px] text-slate-400">{new Date(t.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-white">${t.amount.toFixed(2)}</div>
                        <div className="text-[10px] text-emerald-400 capitalize">{t.status}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Transition Confirmation Modal */}
      {showStatusModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#080d1a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-bold text-white">
                {targetStatus === 'suspended' ? 'Suspend Client Access' : 'Activate Client Access'}
              </h2>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300">
              You are about to change the status of <strong>{selectedClient.company_name}</strong> to <strong className="uppercase text-amber-400">{targetStatus}</strong>.
            </p>

            <form onSubmit={handleConfirmStatusChange} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Operational Audit Reason (Required) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="State the compliance, billing, or security reason for this status change..."
                  className="w-full bg-[#0d1424] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className={`px-4 py-2 rounded-xl font-bold ${
                    targetStatus === 'suspended'
                      ? 'bg-rose-500 text-white hover:bg-rose-400'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  }`}
                >
                  {isUpdating ? 'Saving...' : 'Confirm Status Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
