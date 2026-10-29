'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  Filter, 
  Terminal, 
  X, 
  Lock
} from 'lucide-react';
import { DEMO_AUDIT_LOGS } from '@/lib/supabase/admin-demo-data';
import { AuditLog } from '@/types/admin';

export default function AdminAuditLogsPage() {
  const [logs] = useState<AuditLog[]>(DEMO_AUDIT_LOGS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'funding' | 'client' | 'fee' | 'wallet'>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter(log => {
    const term = search.toLowerCase();
    const matchesSearch = 
      log.id.toLowerCase().includes(term) ||
      (log.actor_email || '').toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      log.entity_id.toLowerCase().includes(term) ||
      (log.reason || '').toLowerCase().includes(term);

    const matchesCategory = 
      categoryFilter === 'all' || 
      log.action.toLowerCase().startsWith(categoryFilter);

    return matchesSearch && matchesCategory;
  });

  const handleExportCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'Actor Email', 'Action', 'Entity Type', 'Entity ID', 'Reason', 'IP Address'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.created_at,
      l.actor_email || 'System',
      l.action,
      l.entity_type,
      l.entity_id,
      `"${(l.reason || '').replace(/"/g, '""')}"`,
      l.ip_address || 'Internal'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `scalemint_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadge = (action: string) => {
    if (action.includes('approved') || action.includes('credit')) {
      return (
        <span className="font-mono text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
          {action}
        </span>
      );
    }
    if (action.includes('rejected') || action.includes('suspended') || action.includes('debit')) {
      return (
        <span className="font-mono text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
          {action}
        </span>
      );
    }
    return (
      <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            <span>Immutable Governance Audit Logs</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident record of all privileged administrative events, approvals, fee revisions, and state adjustments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Security Assurance Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-3">
        <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">PostgreSQL Append-Only Security:</strong> Audit log records are strictly write-once. Row-Level Security policies and database trigger constraints strictly prevent rows in <code className="text-amber-300 font-mono">audit_logs</code> from being edited or deleted by any administrative role.
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by actor, action, entity ID, or rationale..."
            className="w-full bg-[#080d1a] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          {(['all', 'funding', 'client', 'fee', 'wallet'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-[#080d1a] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat === 'all' ? 'All Events' : `${cat} Events`}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-[#080d1a] border border-white/10 overflow-hidden shadow-xl text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0c1326] text-slate-400 border-b border-white/5 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Event ID & Timestamp</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Entity Type & ID</th>
                <th className="py-3.5 px-4">Rationale / Reason</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-5 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No audit records matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-mono font-bold text-white text-[11px]">{log.id}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">{log.actor_email || 'System Daemon'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{log.actor_id || 'root'}</div>
                    </td>
                    <td className="py-4 px-4">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-slate-300 font-mono font-bold uppercase text-[10px]">{log.entity_type}</div>
                      <div className="font-mono text-emerald-400 text-[11px]">{log.entity_id}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-300 max-w-xs truncate">
                      {log.reason || '—'}
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-500 text-[11px]">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#080d1a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Audit Event Record Inspector</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Record UUID</span>
                <span className="font-mono font-bold text-white">{selectedLog.id}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Timestamp (UTC)</span>
                <span className="font-mono text-slate-300">{new Date(selectedLog.created_at).toUTCString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Actor Account</span>
                <span className="font-semibold text-white">{selectedLog.actor_email}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Action Triggered</span>
                <div className="mt-0.5">{getActionBadge(selectedLog.action)}</div>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase mb-1">Administrative Rationale</span>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-200">
                {selectedLog.reason || 'No specific rationale provided.'}
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase mb-1">Contextual Metadata Payload (JSON)</span>
              <pre className="p-3 rounded-xl bg-[#04060c] border border-white/5 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                {JSON.stringify(selectedLog.metadata || {}, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-slate-500 text-[11px]">
              <span>Originating IP: {selectedLog.ip_address || '127.0.0.1'}</span>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
