'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScaleMintLogo } from '@/components/common/Logo';
import { 
  LayoutDashboard, 
  Layers, 
  Wallet, 
  ArrowUpRight, 
  Receipt, 
  History, 
  Bell, 
  Settings, 
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { signOutUser } from '@/actions/auth';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Advertising Accounts', href: '/dashboard/accounts', icon: Layers },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Funding Requests', href: '/dashboard/funding-requests', icon: ArrowUpRight },
    { name: 'Transactions', href: '/dashboard/transactions', icon: Receipt },
    { name: 'Deposit History', href: '/dashboard/deposits', icon: History },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#070b16] border-r border-white/10 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 justify-between">
        <ScaleMintLogo size="sm" asLink={true} />
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Client
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Main Console
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Security Status Box */}
      <div className="p-3 m-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>RLS Enforced</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Client data isolated via PostgreSQL Row-Level Security.
        </p>
      </div>

      {/* Logout Action */}
      <div className="p-3 border-t border-white/10">
        <form action={signOutUser}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
};
