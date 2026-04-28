"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import Header from "@/shared/layout/Header/Header";
import Footer from "@/shared/layout/Footer/Footer";
import { useMemo } from "react";

function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (error) {
      window.scrollTo(0, 0);
    }
  }, [pathname, searchParams]);

  return null;
}

export function LayoutWrapper({
  children,
  navigationData,
  footerData,
  heroCTA,
  authUser,
}: {
  children: React.ReactNode;
  navigationData: any;
  footerData: any;
  heroCTA: any;
  authUser: any;
}) {
  const pathname = usePathname();

  // Define routes where global header/footer should be hidden
  const isDashboard = useMemo(() => pathname?.startsWith("/dashboard"), [pathname]);

  if (isDashboard) {
    return (
      <>
        <Suspense fallback={null}>
          <ScrollToTop />
        </Suspense>
        <main>{children}</main>
      </>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <ScrollToTop />
      </Suspense>
      <Header navigationData={navigationData} footerData={footerData} authUser={authUser} />
      <main className="pt-20 min-h-screen flex flex-col">{children}</main>
      <Footer footerData={footerData} heroCTA={heroCTA} navigationData={navigationData} />
    </>
  );

}
