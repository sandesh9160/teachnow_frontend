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
        className={`fixed md:relative inset-y-0 left-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-50 shadow-[2px_0_10px_-4px_rgba(0,0,0,0.05)] ${
          collapsed ? "w-[72px]" : "w-60"
        } ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Branding on Mobile */}
        {branding && (
          <div className="flex md:hidden items-center gap-3 p-5 border-b border-gray-100">
            {branding.logo ? (
              <div className="h-8 w-8 rounded-lg overflow-hidden shrink-0 shadow-sm border border-gray-50">
                <img src={branding.logo} alt={branding.name} className="h-full w-full object-contain" />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                {branding.name[0]}
              </div>
            )}
            <span className="font-display text-lg font-extrabold text-gray-900 tracking-tight leading-none truncate">
              {branding.secondary}
              <span className="text-primary ml-0.5">{branding.primary}</span>
            </span>
          </div>
        )}

        {/* Nav Content */}
        <nav className="flex-1 overflow-y-auto pt-6 px-3 space-y-1.5 custom-scrollbar">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 group ${isActive
                    ? "bg-primary/5 text-primary"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <div className={`flex items-center justify-center h-8 w-8 rounded-md transition-colors ${isActive ? "bg-primary text-white" : "text-gray-400 group-hover:text-primary group-hover:bg-primary/5"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {!collapsed && <span className="tracking-tight">{link.label}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1 h-4 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-gray-100 space-y-0.5 bg-gray-50/50">
          <LogoutSubmitButton
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all group"
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-md text-gray-400 group-hover:text-red-500 group-hover:bg-red-100/50 transition-colors">
              <LogOut className="h-4 w-4 " />
            </div>
            {!collapsed && <span>Log Out</span>}
          </LogoutSubmitButton>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full mt-2 flex items-center justify-center h-8 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 text-gray-400 transition-all duration-200"
          >
            {collapsed ? <ChevronRight size={16} /> : (
              <div className="flex items-center gap-2">
                <ChevronLeft size={16} />
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Minimize</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
