"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { DashboardSidebar } from "./Sidebar";
import { DashboardHeader } from "./Header";
import { normalizeMediaUrl } from "@/services/api/client";
import { useLayoutData } from "@/providers/LayoutDataProvider";

export function DashboardShell({
  children,
  user,
  layoutData,
  userRole,
}: {
  children: React.ReactNode;
  user: any;
  layoutData?: any;
  userRole: string;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const layoutCtx = useLayoutData();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams?.get("message") === "already_auth") {
      setTimeout(() => {
        toast.warning("You are already authenticated.", {
          id: "already-auth-toast",
          description: "Please logout first if you wish to login with another account.",
          duration: 5000,
        });
      }, 100);
      
      // Clean URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete("message");
      router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
    }
  }, [searchParams, pathname, router]);

  // Branding logic shared across header and sidebar
  const navData = layoutData?.navigation ?? layoutCtx?.navigationData;
  const footerData = layoutData?.footer ?? layoutCtx?.footerData;
  
  // Exhaustive search for brand data in navigation and footer responses
  const rawCompany = 
    navData?.companies || 
    navData?.company_logos?.[0] || 
    footerData?.company_logos?.[0] || 
    navData?.company || 
    footerData?.company || 
    navData?.companies?.list?.[0];
  
  const companyName = 
    rawCompany?.company_name || 
    rawCompany?.brand_name || 
    rawCompany?.name || 
    rawCompany?.title || 
    "Teach Now";
  const rawLogo = rawCompany?.company_logo || rawCompany?.logo || rawCompany?.brand_logo;
  const companyLogo = rawLogo ? normalizeMediaUrl(rawLogo) : null;
  
  const brandName = companyName.toLowerCase() === 'teachnow' ? 'Teach Now' : companyName;
  const brandNameParts = brandName.split(" ").filter(Boolean);
  
  const brandSecondaryPart = brandNameParts.length > 1 ? brandNameParts.slice(0, -1).join(" ") : brandNameParts[0] || "Teach";
  const brandPrimaryPart = brandNameParts.length > 1 ? brandNameParts.at(-1) || "" : "";

  const brandingData = {
    logo: companyLogo,
    name: companyName,
    secondary: brandSecondaryPart,
    primary: brandPrimaryPart,
    url: rawCompany?.company_url || "/"
  };

  return (
    <div suppressHydrationWarning className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans antialiased text-indigo-950 selection:bg-primary/10 selection:text-primary">
      <DashboardHeader 
        user={user} 
        branding={brandingData} 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      <div className="flex flex-1 overflow-hidden relative">
        <DashboardSidebar 
          userRole={userRole} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 custom-scrollbar">
          <div className="max-w-6xl mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
