"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole?: "job_seeker" | "employer";
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { role, loading, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        router.push("/auth/login?message=Please login to access this page");
      } else if (allowedRole && role !== allowedRole) {
        // Redirect to their respective dashboard if role mismatch
        router.push(role === "employer" ? "/employer" : "/dashboard");
      }
    }
  }, [isLoggedIn, loading, role, allowedRole, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || (allowedRole && role !== allowedRole)) {
    return null;
  }

  return <>{children}</>;
}
