import { redirect } from "next/navigation";
import { getSessionProfile, sessionUserForHeader } from "@/lib/serverAuth";
import { getGlobalLayoutData } from "@/lib/globalLayout/getGlobalLayoutData";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [profile, layoutData] = await Promise.all([
    getSessionProfile(),
    getGlobalLayoutData(),
  ]);

  if (!profile) {
    redirect("/auth/login?message=" + encodeURIComponent("Please login to access this page"));
  }

  const authUser = sessionUserForHeader(profile);

  return (
    <DashboardShell 
      user={authUser} 
      layoutData={layoutData} 
      userRole={profile.role}
    >
      {children}
    </DashboardShell>
  );
}
