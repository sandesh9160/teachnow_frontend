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
  Bell,
  LogOut,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Verified,
  Users
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

  const seekerLinks = [
    { label: "Dashboard", href: "/dashboard/jobseeker", icon: LayoutGrid },
    { label: "Profile", href: "/dashboard/jobseeker/profile", icon: User },
    { label: "My Applications", href: "/dashboard/jobseeker/applied-jobs", icon: Briefcase },
    { label: "Saved Jobs", href: "/dashboard/jobseeker/saved-jobs", icon: Bookmark },
    { label: "AI Resume Builder", href: "/dashboard/jobseeker/resume", icon: FileText },
    { label: "Resume Manager", href: "/dashboard/jobseeker/resume-manager", icon: ClipboardList },
    { label: "Testimonials", href: "/dashboard/jobseeker/testimonials", icon: MessageSquare },
  ];

  const employerLinks = [
    { label: "Dashboard", href: "/dashboard/employer", icon: LayoutGrid },
    { label: "Institution Verification", href: "/dashboard/employer/institution-verification", icon: Verified },
    { label: "Post a Job", href: "/dashboard/employer/post-job", icon: PlusCircle },
    { label: "Manage Jobs", href: "/dashboard/employer/jobs", icon: Briefcase },
    { label: "Recruiter Management", href: "/dashboard/employer/recruiters", icon: Users },
    { label: "Company Profile", href: "/dashboard/employer/company-profile", icon: Building2 },
    { label: "Billing", href: "/dashboard/employer/purchase-history", icon: CreditCard },
    { label: "Testimonials", href: "/dashboard/employer/testimonials", icon: MessageSquare },
  ];


  const recruiterLinks = [
    { label: "Overview", href: "/dashboard/recruiter", icon: LayoutGrid },
    { label: "Company", href: "/dashboard/recruiter/company-profile", icon: Building2 },
    { label: "New Post", href: "/dashboard/recruiter/post-job", icon: PlusCircle },
    { label: "Job List", href: "/dashboard/recruiter/jobs", icon: ClipboardList },
    { label: "Alerts", href: "/dashboard/recruiter/notifications", icon: Bell },
    { label: "Feedback", href: "/dashboard/recruiter/testimonials", icon: MessageSquare },
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
          className="fixed inset-0 bg-indigo-950/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky inset-y-0 left-0 h-full bg-white border-r border-slate-200 flex flex-col transition-all duration-500 ease-in-out z-50 shadow-sm ${collapsed ? "w-[78px]" : "w-[260px]"} ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Mobile close button */}
        <div className="md:hidden p-4 flex items-center justify-end">
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION */}
        <div className={`mt-4 px-3 flex-1 overflow-y-auto custom-scrollbar ${collapsed ? "px-2" : "px-3"}`}>
          {/* Compact Toggle - Inside Sidebar, above first link */}
          <div className={`mb-2 hidden md:flex ${collapsed ? "justify-center" : "justify-end"}`}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300"
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          </div>

          <div className="space-y-1.5">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all duration-300 group relative ${isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50"
                    : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                    } ${collapsed ? "justify-center" : ""}`}
                >
                  {isActive && (
                    <div className={`absolute left-0 top-2 bottom-2 bg-indigo-600 rounded-r-full transition-all duration-300 ${collapsed ? "w-1" : "w-1.5"}`} />
                  )}
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 transition-all duration-300 ${isActive
                      ? "text-indigo-600 stroke-[2.5]"
                      : "opacity-60 group-hover:opacity-100 group-hover:text-indigo-500"
                      }`}
                  />
                  {!collapsed && (
                    <span className="tracking-tight truncate animate-in fade-in slide-in-from-left-2 duration-300">
                      {link.label}
                    </span>
                  )}
                  
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-2 py-1 bg-indigo-900 text-white text-[10px] rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-[70] whitespace-nowrap translate-x-2 group-hover:translate-x-0">
                      {link.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* BACK TO HOME */}
        <div className={`py-4 ${collapsed ? "px-0 flex justify-center" : "px-6"}`}>
          <Link href="/" className={`flex items-center gap-3 text-slate-400 hover:text-indigo-600 transition-all group ${collapsed ? "justify-center" : ""}`}>
            <LogOut className={`h-4 w-4 rotate-180 transition-transform ${!collapsed ? "group-hover:-translate-x-1" : ""}`} />
            {!collapsed && <span className="text-[10px] font-bold tracking-wider uppercase">Back to Home</span>}
          </Link>
        </div>

        {/* LOGOUT AT BOTTOM */}
        <div className={`p-3 border-t border-slate-50 ${collapsed ? "flex justify-center" : ""}`}>
          <LogoutSubmitButton
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all duration-300 group active:scale-[0.98] text-rose-600 hover:bg-rose-50 ${collapsed ? "justify-center p-0 h-11 w-11 rounded-xl" : ""}`}
          >
            <LogOut className={`h-[16px] w-[16px] shrink-0 transition-transform duration-300 ${!collapsed ? "group-hover:-translate-x-1" : ""}`} />
            {!collapsed && (
              <span className="tracking-tight">
                Sign Out
              </span>
            )}
          </LogoutSubmitButton>
        </div>
      </aside>
    </>
  );
}
