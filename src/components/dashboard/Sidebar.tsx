"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutSubmitButton } from "@/components/auth/LogoutSubmitButton";
import type { DashboardRole } from "@/types/session";
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
  GraduationCap
} from "lucide-react";
import { useState } from "react";

export function DashboardSidebar({ userRole }: { userRole: DashboardRole }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const role = userRole;

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

  const links = role === "employer" ? employerLinks : seekerLinks;

  return (
    <aside
      className={`relative h-full bg-white border-r border-gray-100 flex flex-col transition-all duration-300 shadow-sm ${collapsed ? "w-20" : "w-64"
        }`}
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-3">
          <div className="shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          {!collapsed && (
            <span className="font-display text-xl font-bold text-gray-900 tracking-tight">TeachNow</span>
          )}
        </Link>
      </div>

      {/* Nav Content */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-primary transition-colors"}`} />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-100 space-y-1">
        <LogoutSubmitButton
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all group"
        >
          <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
          {!collapsed && <span>Log Out</span>}
        </LogoutSubmitButton>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full mt-2 flex items-center justify-center h-10 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : (
            <div className="flex items-center gap-2">
              <ChevronLeft size={20} />
              <span className="text-xs">Collapse Sidebar</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
