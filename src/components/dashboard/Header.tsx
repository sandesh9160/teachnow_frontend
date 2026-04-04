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
    <header className="h-20 border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 bg-white/95 backdrop-blur-sm shadow-sm transition-all duration-300">
      <div className="flex items-center gap-2 md:gap-6">
        <button 
          onClick={onMenuToggle}
          className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        <Link 
          href={branding?.url || "/"} 
          className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity"
        >
          {companyLogo ? (
            <div className="shrink-0 h-9 w-9 md:h-10 md:w-10 flex items-center justify-center rounded-xl overflow-hidden shadow-sm transition-transform group-hover:scale-105">
              <img src={companyLogo} alt={companyName} className="h-full w-full object-contain" />
            </div>
          ) : (
            <div className="shrink-0 h-9 w-9 md:h-10 md:w-10 flex items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/10 transition-transform group-hover:scale-105">
              <span className="text-lg md:text-xl font-bold">{companyName[0] || "T"}</span>
            </div>
          )}
          <span className="font-display text-lg md:text-xl font-extrabold text-gray-900 tracking-tight leading-none overflow-hidden text-ellipsis whitespace-nowrap max-w-[120px] sm:max-w-none">
            {brandSecondaryPart}
            {brandPrimaryPart && <span className="text-primary ml-1">{brandPrimaryPart}</span>}
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-gray-50 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md shadow-primary/10 group-hover:scale-105 transition-transform">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="hidden lg:block text-left">
            <p className="text-[13px] font-bold text-gray-900 leading-tight">{user?.name || "User Account"}</p>
            <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
              {user?.role === "employer" ? "Institution" : "Job Seeker"}
            </p>
          </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-gray-200/80 border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 py-1">
              <div className="px-4 py-3 border-b border-gray-50 mb-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Account Info</p>
                <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
              </div>

              <Link href="/dashboard/jobseeker/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-primary/5 hover:text-primary transition-all">
                <User className="w-4 h-4" /> Profile Details
              </Link>
              <Link href="/dashboard/employer/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-primary/5 hover:text-primary transition-all">
                <Settings className="w-4 h-4" /> Preferences
              </Link>

              <div className="h-px bg-gray-50 my-1 mx-4"></div>

              <LogoutSubmitButton className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-all text-left">
                <LogOut className="w-4 h-4" /> Sign Out
              </LogoutSubmitButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
