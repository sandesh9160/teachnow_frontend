import { getSessionProfile } from "@/lib/serverAuth";
import EmployerDashboardClient from "./EmployerDashboardClient";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import { redirect } from "next/navigation";

export default async function EmployerDashboardPage() {
  const profile = await getSessionProfile();
  
  // Fetch real dashboard stats and onboarding status
  const [dashboardStats, profileFlag] = await Promise.all([
    dashboardServerFetch("employer/dashboard"),
    dashboardServerFetch("profile-flag"),
    dashboardServerFetch("employer/documents")
  ]);

  if (profileFlag?.is_profile_complete === 0) {
    redirect("/dashboard/employer/company-profile");
  }
  
  return (
    <EmployerDashboardClient 
      welcomeName={profile?.name ?? "Member"} 
      dashboardData={dashboardStats?.data}
      isProfileComplete={profileFlag?.is_profile_complete === 1}
    />
  );
}
