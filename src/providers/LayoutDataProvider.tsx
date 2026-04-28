"use client";

import { createContext, useContext, ReactNode } from "react";
import type { NavigationData} from "@/types/homepage";
import type { FooterData, HeroCTAData } from "@/lib/globalLayout/getGlobalLayoutData";

interface LayoutContextType {
  navigationData: NavigationData | null;
  footerData: FooterData | null;
  heroCTA: HeroCTAData | null;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutDataProvider({
  children,
  navigationData,
  footerData,
  heroCTA,
}: {
  children: ReactNode;
  navigationData: NavigationData | null;
  footerData: FooterData | null;
  heroCTA: HeroCTAData | null;
}) {
  return (
    <LayoutContext.Provider value={{ navigationData, footerData, heroCTA }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayoutData() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayoutData must be used within a LayoutDataProvider");
  }
  return context;
}
