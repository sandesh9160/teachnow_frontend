"use client";

import Link from "next/link";
import { User, LogOut, Settings, ChevronDown, Menu } from "lucide-react";
import { useState } from "react";
import { LogoutSubmitButton } from "@/components/auth/LogoutSubmitButton";

export function DashboardHeader({ 
  user, 
  branding, 
  onMenuToggle 
}: { 
  user: any, 
  branding?: { logo: string | null; name: string; secondary: string; primary: string; url?: string };
  onMenuToggle?: () => void
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const { logo: companyLogo, name: companyName, secondary: brandSecondaryPart, primary: brandPrimaryPart } = branding || {
    logo: null,
    name: "TeachNow",
    secondary: "Teach",
    primary: "Now"
  };

  return (
    <header className="h-16 border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 bg-white/80 backdrop-blur-md transition-all duration-300">
      <div className="flex items-center gap-2 md:gap-8">
        <button 
          onClick={onMenuToggle}
          className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link 
          href={branding?.url || "/"} 
          className="flex items-center gap-3 group transition-all"
        >
          {companyLogo ? (
            <div className="shrink-0 h-8 w-8 md:h-9 md:w-9 flex items-center justify-center rounded-xl overflow-hidden shadow-sm transition-transform group-hover:scale-105">
              <img src={companyLogo} alt={companyName} className="h-full w-full object-contain" />
            </div>
          ) : (
            <div className="shrink-0 h-8 w-8 md:h-9 md:w-9 flex items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <span className="text-base md:text-lg font-bold">{companyName[0] || "T"}</span>
            </div>
          )}
          <span className="font-display text-lg md:text-xl font-bold text-slate-900 tracking-tight leading-none overflow-hidden text-ellipsis whitespace-nowrap max-w-[120px] sm:max-w-none">
            {brandSecondaryPart}
            {brandPrimaryPart && <span className="text-primary ml-1">{brandPrimaryPart}</span>}
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 transition-all duration-300 group"
          >
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md shadow-primary/10 group-hover:scale-105 transition-transform">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="hidden lg:block text-left pr-2">
              <p className="text-[13px] font-semibold text-slate-900 leading-tight">{user?.name || "User Account"}</p>
              <p className="text-[10px] font-medium text-primary uppercase tracking-widest mt-0.5">
                {user?.role === "employer" ? "Institution" : "Job Seeker"}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-500 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 py-1.5 z-50">
              <div className="px-5 py-4 border-b border-slate-50 mb-1.5 bg-slate-50/50">
                <p className="text-[10px] font-bold text-slate-400 tracking-wider mb-1.5">Account verified as</p>
                <p className="text-[14px] font-semibold text-slate-900 truncate leading-relaxed">{user?.email}</p>
              </div>

              <div className="px-2">
                <Link href="/dashboard/jobseeker/profile" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13.5px] font-medium text-slate-600 hover:bg-primary/5 hover:text-primary transition-all duration-200 group">
                  <User className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" /> Profile Settings
                </Link>
                <Link href="/dashboard/employer/settings" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13.5px] font-medium text-slate-600 hover:bg-primary/5 hover:text-primary transition-all duration-200 group">
                  <Settings className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" /> Preferences
                </Link>
              </div>

              <div className="h-px bg-slate-50 my-1.5 mx-5"></div>

              <div className="px-2 pb-1">
                <LogoutSubmitButton className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold text-rose-500 hover:bg-rose-50 transition-all duration-200 text-left group">
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
