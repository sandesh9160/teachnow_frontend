"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutSubmitButton } from "@/components/auth/LogoutSubmitButton";
import {
  LayoutDashboard,
  User,
  Briefcase,
  Bookmark,
  FileText,
  MessageSquare,
  PlusCircle,
  ClipboardList,
  Building2,
  CheckCircle,
  Settings,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import { useState } from "react";

export function DashboardSidebar({ 
  userRole, 
  isOpen, 
  onClose,
  branding
}: { 
  userRole: string; 
  isOpen?: boolean; 
  onClose?: () => void;
  branding?: { logo: string | null; name: string; secondary: string; primary: string };
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const seekerLinks = [
    { label: "Overview", href: "/dashboard/jobseeker", icon: LayoutDashboard },
    { label: "My Profile", href: "/dashboard/jobseeker/profile", icon: User },
    { label: "My Applications", href: "/dashboard/jobseeker/applied-jobs", icon: Briefcase },
    { label: "Saved Jobs", href: "/dashboard/jobseeker/saved-jobs", icon: Bookmark },
    { label: "Resume Builder", href: "/dashboard/jobseeker/resume", icon: FileText },
    { label: "Testimonials", href: "/dashboard/jobseeker/testimonials", icon: MessageSquare },
  ];

  const employerLinks = [
    { label: "Overview", href: "/dashboard/employer", icon: LayoutDashboard },
    { label: "Company Profile", href: "/dashboard/employer/company-profile", icon: Building2 },
    { label: "Post a Job", href: "/dashboard/employer/post-job", icon: PlusCircle },
    { label: "My Job Postings", href: "/dashboard/employer/jobs", icon: ClipboardList },
    { label: "Manage Applicants", href: "/dashboard/employer/applicants", icon: User },
    { label: "Recruiters", href: "/dashboard/employer/recruiters", icon: Users },
    { label: "Institution Verif.", href: "/dashboard/employer/institution-verification", icon: CheckCircle },
    { label: "Subscription", href: "/dashboard/employer/purchase-history", icon: CreditCard },
    { label: "Settings", href: "/dashboard/employer/settings", icon: Settings },
  ];

  const links = userRole === "employer" ? employerLinks : seekerLinks;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 md:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:relative inset-y-0 left-0 bg-white border-r border-slate-100 flex flex-col transition-all duration-300 z-50 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] ${
          collapsed ? "w-[80px]" : "w-64"
        } ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Branding on Mobile */}
        {branding && (
          <div className="flex md:hidden items-center gap-3 p-6 border-b border-slate-50">
            {branding.logo ? (
              <div className="h-9 w-9 rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-100">
                <img src={branding.logo} alt={branding.name} className="h-full w-full object-contain" />
              </div>
            ) : (
              <div className="h-9 w-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                {branding.name[0]}
              </div>
            )}
            <span className="font-display text-lg font-bold text-slate-900 tracking-tight leading-none truncate">
              {branding.secondary}
              <span className="text-primary ml-0.5">{branding.primary}</span>
            </span>
          </div>
        )}

        {/* Nav Content */}
        <nav className="flex-1 overflow-y-auto pt-6 px-4 space-y-1 custom-scrollbar">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-300 group relative ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon 
                  className={`h-[18px] w-[18px] transition-colors duration-300 ${
                    isActive ? "text-primary" : "text-slate-400 group-hover:text-primary"
                  }`} 
                />
                {!collapsed && <span className="tracking-tight">{link.label}</span>}
                {isActive && !collapsed && (
                  <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-50 space-y-2">
          <LogoutSubmitButton
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 group"
          >
            <LogOut className="h-[18px] w-[18px] text-slate-400 group-hover:text-rose-500" />
            {!collapsed && <span>Log Out</span>}
          </LogoutSubmitButton>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full mt-2 flex items-center justify-center p-2 rounded-xl bg-slate-50/50 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 text-slate-400 transition-all duration-300 group"
          >
            {collapsed ? <ChevronRight size={18} className="group-hover:text-primary" /> : (
              <div className="flex items-center gap-2">
                <ChevronLeft size={18} className="group-hover:text-primary" />
                <span className="text-[10px] uppercase font-semibold tracking-widest opacity-50 group-hover:opacity-100 transition-opacity">Collapse Sidebar</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
