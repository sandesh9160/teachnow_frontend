"use client";

import Link from "next/link";
import { LogOut,  Menu, GraduationCap } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { LogoutSubmitButton } from "@/components/auth/LogoutSubmitButton";
import { normalizeMediaUrl } from "@/services/api/client";

import { NotificationBell } from "./NotificationBell";

export function DashboardHeader({ 
  user, 
  branding,
  onMenuToggle 
}: { 
  user: any, 
  branding?: any;
  onMenuToggle?: () => void
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <header suppressHydrationWarning className="h-[60px] border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          suppressHydrationWarning
          className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
 
        <Link href="/" className="flex items-center gap-2.5 group">
          {branding?.logo ? (
            <img 
              src={normalizeMediaUrl(branding.logo)} 
              alt={branding?.name || "Brand Logo"} 
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105" 
            />
          ) : (
            <div className="w-8 h-8 bg-indigo-900 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <GraduationCap className="w-5 h-5" />
            </div>
          )}
          <span className="text-[17px] font-bold text-indigo-950 tracking-tight hidden md:inline">
            {branding?.secondary || branding?.name || "Teach"}
            {branding?.primary && (
               <span className="text-indigo-600">{branding?.primary}</span>
            )}
            {!branding?.primary && !branding?.name && (
               <span className="text-indigo-600">Now</span>
            )}
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        {["job_seeker", "employer", "recruiter"].includes(user?.role) && <NotificationBell role={user.role} />}
        
        {/* User Profile - Circle with Photo */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            suppressHydrationWarning
            className="w-9 h-9 rounded-full overflow-hidden bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold text-[14px] border border-blue-50 hover:ring-2 hover:ring-blue-100 transition-all shadow-sm"
          >
            {user?.avatar ? (
              <img 
                src={normalizeMediaUrl(user.avatar)} 
                alt={user.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              user?.name?.[0] || user?.email?.[0] || 'U'
            )}
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/30">
                <p className="text-[10px] font-semibold text-slate-400 tracking-wider mb-0.5">Signed in as</p>
                <p className="text-[13px] font-semibold text-indigo-950 truncate">{user?.name || user?.email}</p>
              </div>

              <div className="p-1.5">
                <LogoutSubmitButton className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-semibold text-rose-500 hover:bg-rose-50 transition-all text-left">
                  <LogOut className="w-4 h-4" /> Sign Out
                </LogoutSubmitButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
