"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense, useMemo } from "react";
import Header from "@/shared/layout/Header/Header";
import Footer from "@/shared/layout/Footer/Footer";

function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleScroll = () => {
      try {
        window.scrollTo({ top: 0, behavior: "instant" });
      } catch (error) {
        window.scrollTo(0, 0);
      }
    };
    const rafId = requestAnimationFrame(handleScroll);
    return () => cancelAnimationFrame(rafId);
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

  // Define routes where global header/footer should be hidden
  const isDashboard = useMemo(() => pathname?.startsWith("/dashboard"), [pathname]);

  const showDashboard = !!isDashboard;

  if (showDashboard) {
    return (
      <>
        <Suspense fallback={null}>
          <ScrollToTop />
        </Suspense>
        {children}
      </>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <ScrollToTop />
      </Suspense>
      <Header navigationData={navigationData} footerData={footerData} authUser={null} />
      {/* Cache Invalidation Touch to resolve stale Turbopack hydration mismatch */}
      <main className="pt-16 min-h-screen flex flex-col">{children}</main>
      <Footer footerData={footerData} heroCTA={heroCTA} navigationData={navigationData} />
    </>
  );
}

