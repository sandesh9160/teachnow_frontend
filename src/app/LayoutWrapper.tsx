"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense, useState, useMemo } from "react";
import Header from "@/shared/layout/Header/Header";
import Footer from "@/shared/layout/Footer/Footer";

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
}: {
  children: React.ReactNode;
  navigationData: any;
  footerData: any;
  heroCTA: any;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Define routes where global header/footer should be hidden
  const isDashboard = useMemo(() => pathname?.startsWith("/dashboard"), [pathname]);

  // Prevent hydration mismatch by rendering a consistent layout during initial hydration
  const showDashboard = mounted && isDashboard;

  if (showDashboard) {
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
      <Header navigationData={navigationData} footerData={footerData} authUser={null} />
      <main className="pt-20 min-h-screen flex flex-col">{children}</main>
      <Footer footerData={footerData} heroCTA={heroCTA} navigationData={navigationData} />
    </>
  );
}

