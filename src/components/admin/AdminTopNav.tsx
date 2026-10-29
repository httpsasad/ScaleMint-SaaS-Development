'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Menu, 
  ShieldAlert, 
  Percent, 
  ChevronDown, 
  LogOut, 
  Settings, 
  Users, 
  Cpu 
} from 'lucide-react';
import { signOutUser } from '@/actions/auth';

interface AdminTopNavProps {
  onOpenMobileMenu: () => void;
  adminEmail?: string;
}

export const AdminTopNav: React.FC<AdminTopNavProps> = ({
  onOpenMobileMenu,
  adminEmail = 'owner@scalemint.io'
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-[#050811]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Open navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white tracking-wide">
            ScaleMint Owner Operating System
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Root Authority</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Fee Badge */}
        <Link
          href="/admin/fee-settings"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
        >
          <Percent className="w-3.5 h-3.5 text-amber-400" />
          <span>Active Fee: 7.50%</span>
        </Link>

        {/* Automation Status quick indicator */}
        <Link
          href="/admin/automation-status"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Automation: Active</span>
        </Link>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            aria-expanded={dropdownOpen}
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="hidden md:block text-left text-xs">
              <div className="font-semibold text-white leading-tight">
                Super Admin
              </div>
              <div className="text-[10px] text-amber-400/90 leading-tight font-mono">
                {adminEmail}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#080d1a] border border-white/10 shadow-2xl p-2 text-xs text-slate-300 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-white/5">
                <p className="font-bold text-white">Platform Owner</p>
                <p className="text-[11px] text-slate-400 font-mono truncate">{adminEmail}</p>
              </div>

              <div className="py-1">
                <Link
                  href="/admin/clients"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Client Directory</span>
                </Link>

                <Link
                  href="/admin/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Master Settings</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-white/5">
                <form action={signOutUser}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out Root</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
