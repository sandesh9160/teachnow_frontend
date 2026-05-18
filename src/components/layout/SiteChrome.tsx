import { Suspense } from "react";
import { SiteChromeGate } from "./SiteChromeGate";
import { HeaderShell } from "./HeaderShell";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

export function SiteChrome({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SiteChromeGate
      header={
        <Suspense fallback={<HeaderShell />}>
          <SiteHeader />
        </Suspense>
      }
      footer={
        <Suspense fallback={null}>
          <SiteFooter />
        </Suspense>
      }
    >
      {children}
    </SiteChromeGate>
  );
}
