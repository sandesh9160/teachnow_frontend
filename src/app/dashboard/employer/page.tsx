import { getSessionProfile } from "@/lib/serverAuth";
import EmployerDashboardClient from "./EmployerDashboardClient";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";

export default async function EmployerDashboardPage() {
  const profile = await getSessionProfile();
  
  // Fetch real dashboard stats
  const [dashboardStats, profileFlag] = await Promise.all([
    dashboardServerFetch("employer/dashboard"),
    dashboardServerFetch("profile-flag")
  ]);
  
  return (
    <EmployerDashboardClient 
      welcomeName={profile?.name ?? "Member"} 
      dashboardData={dashboardStats?.data}
      isProfileComplete={profileFlag?.is_profile_complete === 1}
    />
  );
}
