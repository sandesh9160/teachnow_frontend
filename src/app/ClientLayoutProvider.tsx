"use client";

import { LayoutDataProvider } from "@/providers/LayoutDataProvider";
import { LayoutWrapper } from "./LayoutWrapper";
import type { NavigationData } from "@/types/homepage";
import type { FooterData, HeroCTAData } from "@/lib/globalLayout/getGlobalLayoutData";

export function ClientLayoutProvider({
  navigationData,
  footerData,
  heroCTA,
  children,
}: {
  navigationData: NavigationData | null;
  footerData: FooterData | null;
  heroCTA: HeroCTAData | null;
  children: React.ReactNode;
}) {
  return (
    <LayoutDataProvider
      navigationData={navigationData}
      footerData={footerData}
      heroCTA={heroCTA}
    >
      <LayoutWrapper
        navigationData={navigationData}
        footerData={footerData}
        heroCTA={heroCTA}
      >
        {children}
      </LayoutWrapper>
    </LayoutDataProvider>
  );
}
