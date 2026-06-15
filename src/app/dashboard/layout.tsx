import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
import { getSessionProfile, sessionUserForHeader } from "@/lib/serverAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardSessionProvider } from "@/components/dashboard/DashboardSessionContext";
import SessionTimeoutHandler from "@/components/auth/SessionTimeoutHandler";
import { Suspense } from "react";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await getSessionProfile();

  if (!profile) {
    redirect("/auth/login?message=" + encodeURIComponent("Please login to access this page"));
  }

  const authUser = sessionUserForHeader(profile);

  return (
    <DashboardSessionProvider profile={profile} user={authUser} userRole={profile.role}>
      <SessionTimeoutHandler />
      <Suspense fallback={
        <div className="flex-1 min-h-screen flex items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      }>
        <DashboardShell
          user={authUser}
          userRole={profile.role}
        >
          {children}
        </DashboardShell>
      </Suspense>
    </DashboardSessionProvider>
  );
}

