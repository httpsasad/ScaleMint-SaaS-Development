'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScaleMintLogo } from '@/components/common/Logo';
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  ArrowUpRight, 
  Wallet, 
  Receipt, 
  History, 
  Percent, 
  Cpu, 
  RefreshCw, 
  FileText, 
  Settings, 
  LogOut,
  ShieldAlert,
  ChevronLeft
} from 'lucide-react';
import { signOutUser } from '@/actions/auth';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname();

  const sections = [
    {
      category: 'Command & Core',
      items: [
        { name: 'Overview', href: '/admin', icon: LayoutDashboard },
        { name: 'Clients', href: '/admin/clients', icon: Users },
        { name: 'Advertising Accounts', href: '/admin/accounts', icon: Layers },
        { name: 'Funding Requests', href: '/admin/funding-requests', icon: ArrowUpRight },
      ]
    },
    {
      category: 'Financial Operations',
      items: [
        { name: 'Wallets', href: '/admin/wallets', icon: Wallet },
        { name: 'Transactions', href: '/admin/transactions', icon: Receipt },
        { name: 'Deposits', href: '/admin/deposits', icon: History },
        { name: 'Fee Settings', href: '/admin/fee-settings', icon: Percent },
      ]
    },
    {
      category: 'Telemetry & Governance',
      items: [
        { name: 'Automation Status', href: '/admin/automation-status', icon: Cpu },
        { name: 'Synchronization Logs', href: '/admin/sync-logs', icon: RefreshCw },
        { name: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#050811] border-r border-white/10 flex flex-col h-full select-none text-xs">
      {/* Brand & Owner Badge */}
      <div className="h-16 flex items-center px-5 border-b border-white/10 justify-between">
        <ScaleMintLogo size="sm" asLink={true} />
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold flex items-center gap-1">
          <ShieldAlert className="w-2.5 h-2.5" />
          <span>OWNER</span>
        </span>
      </div>

      {/* Switch to Client Dashboard button */}
      <div className="px-3 pt-3">
        <Link
          href="/dashboard"
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5 text-[11px]"
        >
          <span className="flex items-center gap-1.5">
            <ChevronLeft className="w-3 h-3 text-emerald-400" />
            <span>Switch to Client Console</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500">&rarr;</span>
        </Link>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {sections.map((sec) => (
          <div key={sec.category}>
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {sec.category}
            </div>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Security notice & Logout */}
      <div className="p-3 border-t border-white/10 space-y-2">
        <div className="px-3 py-1.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-[10px] text-amber-300/80 leading-tight">
          Privileged console: All administrative state changes are recorded in immutable audit logs.
        </div>

        <form action={signOutUser}>
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </form>
      </div>
    </aside>
  );
};
