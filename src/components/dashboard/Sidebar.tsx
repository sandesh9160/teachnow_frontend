"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutSubmitButton } from "@/components/auth/LogoutSubmitButton";
import { 
  LayoutGrid,
  User,
  Briefcase,
  Bookmark,
  FileText,
  MessageSquare,
  PlusCircle,
  ClipboardList,
  Building2,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

export function DashboardSidebar({ 
  userRole, 
  isOpen, 
  onClose,
}: { 
  userRole: string; 
  isOpen?: boolean; 
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // ... (links definitions remain unchanged)
  const seekerLinks = [
    { label: "Overview", href: "/dashboard/jobseeker", icon: LayoutGrid },
    { label: "My Profile", href: "/dashboard/jobseeker/profile", icon: User },
    { label: "My Applications", href: "/dashboard/jobseeker/applied-jobs", icon: Briefcase },
    { label: "Saved Jobs", href: "/dashboard/jobseeker/saved-jobs", icon: Bookmark },
    { label: "Resume Builder", href: "/dashboard/jobseeker/resume", icon: FileText },
    { label: "Testimonials", href: "/dashboard/jobseeker/testimonials", icon: MessageSquare },
  ];

  const employerLinks = [
    { label: "Overview", href: "/dashboard/employer", icon: LayoutGrid },
    { label: "Company Profile", href: "/dashboard/employer/company-profile", icon: Building2 },
    { label: "Post a Job", href: "/dashboard/employer/post-job", icon: PlusCircle },
    { label: "My Job Postings", href: "/dashboard/employer/jobs", icon: ClipboardList },
    { label: "Recruiters", href: "/dashboard/employer/recruiters", icon: Users },
    { label: "Documents", href: "/dashboard/employer/institution-verification", icon: FileText },
    { label: "Testimonials", href: "/dashboard/employer/testimonials", icon: MessageSquare },
    { label: "Subscription", href: "/dashboard/employer/purchase-history", icon: CreditCard },
  ];

  const recruiterLinks = [
    { label: "Overview", href: "/dashboard/recruiter", icon: LayoutGrid },
    { label: "Company Profile", href: "/dashboard/recruiter/company-profile", icon: Building2 },
    { label: "Post a Job", href: "/dashboard/recruiter/post-job", icon: PlusCircle },
    { label: "My Job Postings", href: "/dashboard/recruiter/jobs", icon: ClipboardList },
    { label: "Testimonials", href: "/dashboard/recruiter/testimonials", icon: MessageSquare },
  ];

  const links = 
    userRole === "employer" ? employerLinks : 
    userRole === "recruiter" ? recruiterLinks : 
    seekerLinks;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky inset-y-0 left-0 h-screen bg-white border-r border-slate-100 flex flex-col transition-all duration-300 z-50 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] ${
          collapsed ? "w-[80px]" : "w-64"
        } ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Header - Mobile Only Close Button */}
        <div className="flex items-center justify-end p-4 md:hidden border-b border-slate-50 min-h-[64px]">
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Nav Content */}
        <nav className="flex-1 overflow-y-auto pt-6 px-4 space-y-1.5 custom-scrollbar">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all duration-300 group relative ${
                  isActive
                    ? "bg-primary/5 text-primary shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.1)]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon 
                  className={`h-[18px] w-[18px] shrink-0 transition-all duration-300 ${
                    isActive ? "text-primary scale-110" : "text-slate-400 group-hover:text-primary group-hover:scale-110"
                  }`} 
                />
                {!collapsed && <span className="tracking-tight truncate">{link.label}</span>}
                
                {isActive && !collapsed && (
                  <div className="absolute left-0 w-1.5 h-6 bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-50 space-y-2">
          <LogoutSubmitButton
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 group"
          >
            <LogOut className="h-[18px] w-[18px] text-slate-400 group-hover:text-rose-500 group-hover:scale-110 transition-transform" />
            {!collapsed && <span>Log Out</span>}
          </LogoutSubmitButton>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full mt-2 flex items-center justify-center p-2 rounded-xl bg-slate-50/50 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 text-slate-400 transition-all duration-300 group"
          >
            {collapsed ? <ChevronRight size={18} className="group-hover:text-primary" /> : (
              <div className="flex items-center gap-2">
                <ChevronLeft size={18} className="group-hover:text-primary transition-transform group-hover:-translate-x-0.5" />
                <span className="text-xs font-semibold text-slate-400 group-hover:text-primary transition-colors">Collapse Sidebar</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
