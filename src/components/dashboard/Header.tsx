"use client";

import Link from "next/link";
import { LogOut, ChevronDown, Menu, GraduationCap } from "lucide-react";
import { useState } from "react";
import { LogoutSubmitButton } from "@/components/auth/LogoutSubmitButton";
import { normalizeMediaUrl } from "@/services/api/client";

import { NotificationBell } from "./NotificationBell";

export function DashboardHeader({ 
  user, 
  onMenuToggle 
}: { 
  user: any, 
  branding?: any;
  onMenuToggle?: () => void
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40 bg-white/90 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-[#312E81] rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-[#1E1B4B] tracking-tight">TeachNow</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        {["job_seeker", "employer", "recruiter"].includes(user?.role) && <NotificationBell role={user.role} />}
        
        {/* User Profile */}
        <div className="relative ml-2">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 pl-3 pr-1 py-1 rounded-full border border-slate-200 hover:border-slate-300 transition-all bg-white"
          >
            <div className="w-8 h-8 rounded-full bg-[#E8F1FF] text-[#0046B5] flex items-center justify-center font-bold text-[13px] border border-[#BFDBFE]">
              {user?.avatar && (user.avatar.startsWith('http') || user.avatar.includes('/') || user.avatar.includes('storage')) ? (
                <img src={normalizeMediaUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                user?.name?.[0] || user?.email?.[0] || 'U'
              )}
            </div>
            <span className="hidden sm:block text-[13px] font-bold text-[#1E1B4B] whitespace-nowrap">{user?.name || "Member"}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-50">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Signed in as</p>
                <p className="text-[13px] font-bold text-indigo-950 truncate">{user?.email}</p>
              </div>

              <div className="p-1.5">
                <LogoutSubmitButton className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-bold text-rose-500 hover:bg-rose-50 transition-all duration-200 text-left group">
                  <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" /> Sign Out
                </LogoutSubmitButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
