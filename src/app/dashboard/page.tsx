"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function DashboardRedirect() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    // If not logged in, redirect to login
    // Otherwise redirect to the specific dashboard based on role
    if (!isLoggedIn) {
      router.push("/auth/login");
    } else if (user?.role === "employer") {
      router.replace("/dashboard/employer/company-profile");
    } else {
      router.replace("/dashboard/jobseeker/profile");
    }
  }, [isLoggedIn, user, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
