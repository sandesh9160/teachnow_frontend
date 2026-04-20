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
  Users,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Verified,
  Settings,
  HelpCircle
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
    { label: "Company Profile", href: "/dashboard/employer/company-profile", icon: Building2 },
    { label: "Billing", href: "/dashboard/employer/purchase-history", icon: CreditCard },
  ];

  const bottomLinks = [
    { label: "Help Center", href: "/help", icon: HelpCircle },
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
        className={`fixed md:sticky inset-y-0 left-0 h-full bg-white border-r border-slate-200 flex flex-col transition-all duration-500 ease-in-out z-50 shadow-sm ${
          collapsed ? "w-[72px]" : "w-[260px]"
        } ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* TOP COLLAPSE TOGGLE */}
        <div className={`p-4 flex items-center justify-end border-b border-slate-50 min-h-[64px] transition-all duration-500`}>
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className={`p-2 rounded-xl text-slate-400 hover:text-indigo-600 transition-all duration-300 hidden md:flex ${collapsed ? 'mx-auto' : ''}`}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>

          {/* Mobile close button */}
          <button 
            onClick={onClose}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-rose-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION */}
        <div className={`mt-6 px-3 flex-1 overflow-y-auto custom-scrollbar transition-all duration-500`}>
          <div className="space-y-1">
             {links.map((link) => {
               const isActive = pathname === link.href;
               const Icon = link.icon;

               return (
                 <Link
                   key={link.href}
                   href={link.href}
                   onClick={onClose}
                   className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 group relative ${
                     isActive
                       ? "bg-[#E8F1FF] text-[#0046B5]"
                       : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                   }`}
                 >
                   <Icon 
                     className={`h-[18px] w-[18px] shrink-0 transition-transform duration-300 ${
                       isActive ? "text-[#0046B5] stroke-[2.5]" : "opacity-50 group-hover:opacity-100"
                     }`} 
                   />
                   {!collapsed && (
                     <span className="tracking-tight truncate">
                       {link.label}
                     </span>
                   )}
                 </Link>
               );
             })}
          </div>

          {userRole === "employer" && (
            <div className="mt-8 pt-8 border-t border-slate-50 space-y-1">
              {bottomLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-300 group"
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0 opacity-50 group-hover:opacity-100 transition-all" />
                    {!collapsed && <span className="tracking-tight truncate">{link.label}</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* BACK TO HOME */}
        {!collapsed && (
          <div className="px-6 py-4">
            <Link href="/" className="flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-colors group">
              <LogOut className="w-4 h-4 rotate-180" />
              <span className="text-xs font-semibold">Back to Home</span>
            </Link>
          </div>
        )}

        {/* LOGOUT AT BOTTOM */}
        <div className={`p-4 border-t border-slate-50 transition-all duration-500 ${collapsed ? 'px-2' : 'px-4'}`}>
           <LogoutSubmitButton
             className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[12px] font-medium transition-all duration-300 group active:scale-[0.98] ${
               collapsed 
               ? "justify-center text-rose-600" 
               : "text-rose-600 hover:bg-rose-50"
             }`}
           >
             <LogOut className={`h-[16px] w-[16px] transition-transform duration-300 ${collapsed ? 'scale-110' : 'group-hover:-translate-x-1'}`} />
             {!collapsed && (
               <span className="tracking-tight text-xs animate-in fade-in duration-300 whitespace-nowrap">
                 Sign Out
               </span>
             )}
           </LogoutSubmitButton>
        </div>
      </aside>
    </>
  );
}
