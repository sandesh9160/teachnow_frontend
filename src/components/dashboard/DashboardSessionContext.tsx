"use client";

import { createContext, useContext, ReactNode } from "react";
import type { ServerSessionUser } from "@/lib/serverAuth";

interface DashboardSessionContextType {
  profile: ServerSessionUser | null;
  user: any;
  userRole: string;
}

const DashboardSessionContext = createContext<DashboardSessionContextType | null>(null);

export function DashboardSessionProvider({
  children,
  profile,
  user,
  userRole,
}: {
  children: ReactNode;
  profile: ServerSessionUser | null;
  user: any;
  userRole: string;
}) {
  return (
    <DashboardSessionContext.Provider value={{ profile, user, userRole }}>
      {children}
    </DashboardSessionContext.Provider>
  );
}

export function useDashboardSession() {
  const context = useContext(DashboardSessionContext);
  if (!context) {
    throw new Error("useDashboardSession must be used within a DashboardSessionProvider");
  }
  return context;
}
