"use client";

import { useAuth } from "@/context/AuthContext";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);
  // Track if user WAS logged in — if they were, this is a logout, not an unauthorized access
  const wasLoggedIn = useRef(false);

  useEffect(() => {
    if (isLoggedIn) {
      wasLoggedIn.current = true;
      hasRedirected.current = false;
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (loading) return;

    if (!isLoggedIn && !hasRedirected.current) {
      hasRedirected.current = true;
      
      if (wasLoggedIn.current) {
        // User was logged in → this is a logout, not an unauthorized access.
        // Don't redirect here — let AuthContext.logout() handle it.
        // Just show blank screen while the logout redirect takes effect.
        return;
      }

      // User was never logged in → unauthorized access attempt
      router.replace("/auth/login?message=Please log in to access the dashboard");
    }
  }, [isLoggedIn, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
     return <div className="h-screen bg-white" />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans antialiased text-gray-900 selection:bg-primary/10 selection:text-primary">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto min-h-full">
            {children}
        </div>
      </main>
    </div>
  );
}
