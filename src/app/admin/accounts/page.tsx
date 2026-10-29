'use client';

import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  Clock, 
  Network, 
  Edit, 
  X, 
  CheckCircle2 
} from 'lucide-react';
import { DEMO_ACCOUNTS } from '@/lib/supabase/demo-data';
import { DEMO_CLIENTS } from '@/lib/supabase/admin-demo-data';
import { AdvertisingAccount, AccountStatus } from '@/types/dashboard';
import { saveAdvertisingAccount } from '@/actions/admin';

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<AdvertisingAccount[]>(DEMO_ACCOUNTS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | AccountStatus>('all');

  // Modal State for Create / Edit
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AdvertisingAccount | null>(null);
  const [formAccountName, setFormAccountName] = useState('');
  const [formAccountId, setFormAccountId] = useState('');
  const [formUserId, setFormUserId] = useState(DEMO_CLIENTS[0]?.id || '');
  const [formStatus, setFormStatus] = useState<AccountStatus>('active');
  const [formProxy, setFormProxy] = useState('US-EAST-RES-12');
  const [formNotes, setFormNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingAccount(null);
    setFormAccountName('');
    setFormAccountId(`TT-ADV-${Math.floor(10000 + Math.random() * 90000)}`);
    setFormUserId(DEMO_CLIENTS[0]?.id || '');
    setFormStatus('active');
    setFormProxy('US-EAST-RES-12');
    setFormNotes('');
    setShowModal(true);
  };

  const openEditModal = (acc: AdvertisingAccount) => {
    setEditingAccount(acc);
    setFormAccountName(acc.account_name);
    setFormAccountId(acc.account_id);
    setFormUserId(acc.user_id);
    setFormStatus(acc.status);
    setFormProxy(acc.proxy_cluster_id || 'Isolated');
    setFormNotes('');
    setShowModal(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotice(null);

    try {
      const res = await saveAdvertisingAccount({
        id: editingAccount?.id,
        accountName: formAccountName,
        accountId: formAccountId,
        userId: formUserId,
        status: formStatus,
        proxyClusterId: formProxy,
        notes: formNotes
      });

      if (res.success) {
        if (editingAccount) {
          setAccounts(accounts.map(a => a.id === editingAccount.id ? {
            ...a,
            account_name: formAccountName,
            account_id: formAccountId,
            user_id: formUserId,
            status: formStatus,
            proxy_cluster_id: formProxy
          } : a));
        } else {
          const newAcc: AdvertisingAccount = {
            id: `acc-created-${Date.now().toString(36)}`,
            account_name: formAccountName,
            account_id: formAccountId,
            user_id: formUserId,
            platform: 'tiktok',
            status: formStatus,
            balance: 0.00,
            currency: 'USD',
            proxy_cluster_id: formProxy,
            last_synced_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setAccounts([newAcc, ...accounts]);
        }

        setNotice(res.message);
        setShowModal(false);
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error saving advertising account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = accounts.filter((acc) => {
    const matchesSearch = 
      acc.account_name.toLowerCase().includes(search.toLowerCase()) ||
      acc.account_id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || acc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-400" />
            <span>Advertising Account Fleet Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Provision, assign, and audit TikTok ad accounts across all client agencies with isolated residential proxy tracking.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-300 transition-all shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Ad Account</span>
        </button>
      </div>

      {notice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search account name, code, or proxy..."
            className="w-full bg-[#080d1a] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-semibold">
          {(['all', 'active', 'under_review', 'paused', 'suspended'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition-colors ${
                filterStatus === s
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {s === 'all' ? 'All Accounts' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Accounts Table */}
      <div className="rounded-2xl bg-[#080d1a] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0c1326] text-slate-400 border-b border-white/5 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Account Name & Code</th>
                <th className="py-3.5 px-4">Assigned Client</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Verified Ad Balance</th>
                <th className="py-3.5 px-4">Last Sync Timestamp</th>
                <th className="py-3.5 px-4">Proxy Subnet</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((acc) => {
                const assignedClient = DEMO_CLIENTS.find(c => c.id === acc.user_id);
                return (
                  <tr key={acc.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-white text-sm">{acc.account_name}</div>
                      <div className="font-mono text-emerald-400 text-xs">{acc.account_id}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">{assignedClient?.company_name || 'Unassigned'}</div>
                      <div className="text-[11px] text-slate-400">{assignedClient?.contact_name}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          acc.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : acc.status === 'under_review'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {acc.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-white">
                      ${acc.balance.toFixed(2)} {acc.currency}
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(acc.last_synced_at).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px] text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Network className="w-3 h-3 text-emerald-400/80" />
                        <span>{acc.proxy_cluster_id || 'Isolated'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => openEditModal(acc)}
                        className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Account Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#080d1a] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-bold text-white">
                {editingAccount ? 'Edit Advertising Account' : 'Provision New Advertising Account'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Account Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={formAccountName}
                  onChange={(e) => setFormAccountName(e.target.value)}
                  placeholder="US-Ecom-Scaling-Batch-02"
                  className="w-full bg-[#0d1424] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    External TikTok Account ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formAccountId}
                    onChange={(e) => setFormAccountId(e.target.value)}
                    placeholder="TT-ADV-99214"
                    className="w-full bg-[#0d1424] border border-white/10 rounded-lg p-2.5 font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Assign to Client Organization *
                  </label>
                  <select
                    value={formUserId}
                    onChange={(e) => setFormUserId(e.target.value)}
                    className="w-full bg-[#0d1424] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    {DEMO_CLIENTS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company_name} ({c.contact_name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Account Status *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as AccountStatus)}
                    className="w-full bg-[#0d1424] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="active">Active (Verified)</option>
                    <option value="under_review">Under Review</option>
                    <option value="paused">Paused</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Dedicated Proxy Subnet Fingerprint
                  </label>
                  <input
                    type="text"
                    value={formProxy}
                    onChange={(e) => setFormProxy(e.target.value)}
                    placeholder="US-EAST-RES-12"
                    className="w-full bg-[#0d1424] border border-white/10 rounded-lg p-2.5 font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Internal Governance Notes
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Record provisioning notes, target verticals, or compliance history..."
                  className="w-full bg-[#0d1424] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  {isSubmitting ? 'Saving Account...' : 'Save & Assign Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
