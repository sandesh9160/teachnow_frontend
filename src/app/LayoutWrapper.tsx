"use client";

import { usePathname } from "next/navigation";
import Header from "@/shared/layout/Header/Header";
import Footer from "@/shared/layout/Footer/Footer";
import { useMemo } from "react";

export function LayoutWrapper({
  children,
  navigationData,
  footerData,
  authUser,
}: {
  children: React.ReactNode;
  navigationData: any;
  footerData: any;
  authUser: any;
}) {
  const pathname = usePathname();
  
  // Define routes where global header/footer should be hidden
  const isDashboard = useMemo(() => pathname?.startsWith("/dashboard"), [pathname]);

  if (isDashboard) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Header navigationData={navigationData} footerData={footerData} authUser={authUser} />
      <main className="pt-20 min-h-screen flex flex-col">{children}</main>
      <Footer footerData={footerData} />
    </>
  );
}
