'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Menu, 
  Bell, 
  User, 
  ChevronDown, 
  Shield, 
  LogOut, 
  Settings, 
  Layers
} from 'lucide-react';
import { signOutUser } from '@/actions/auth';

interface TopNavProps {
  onOpenMobileMenu: () => void;
  userEmail?: string;
  companyName?: string;
  isSandbox?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenMobileMenu,
  userEmail = 'alex.vance@demo.scalemint.io',
  companyName = 'Acme Media Labs (Demo Sandbox)',
  isSandbox = true
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-[#070b16]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Context */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-semibold text-white">{companyName}</span>
          {isSandbox && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Demo Sandbox
            </span>
          )}
        </div>
      </div>

      {/* Right: Actions, Notifications, User Profile */}
      <div className="flex items-center gap-3">
        {/* Quick link to ad accounts */}
        <Link
          href="/dashboard/funding-requests"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors shadow-sm"
        >
          <span>Request Funding</span>
        </Link>

        {/* Notifications Icon */}
        <Link
          href="/dashboard/notifications"
          className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </Link>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            aria-expanded={profileDropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden md:block text-left text-xs">
              <div className="font-semibold text-white leading-tight">
                {userEmail.split('@')[0]}
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                Client Owner
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#090f1d] border border-white/10 shadow-2xl p-2 text-xs text-slate-300 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-white/5">
                <p className="font-semibold text-white">{companyName}</p>
                <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>
              </div>

              <div className="py-1">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Profile & Security</span>
                </Link>

                <Link
                  href="/dashboard/accounts"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Assigned Accounts</span>
                </Link>

                <div className="px-3 py-1.5 text-[10px] text-slate-400 flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span>Audit Logs Active</span>
                </div>
              </div>

              <div className="pt-1 border-t border-white/5">
                <form action={signOutUser}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
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
