import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
import { getSessionProfile, sessionUserForHeader } from "@/lib/serverAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardSessionProvider } from "@/components/dashboard/DashboardSessionContext";
import SessionTimeoutHandler from "@/components/auth/SessionTimeoutHandler";

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
      <DashboardShell
        user={authUser}
        userRole={profile.role}
      >
        {children}
      </DashboardShell>
    </DashboardSessionProvider>
  );
}

