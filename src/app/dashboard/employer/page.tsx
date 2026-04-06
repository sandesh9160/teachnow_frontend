import { getSessionProfile } from "@/lib/serverAuth";
import EmployerDashboardClient from "./EmployerDashboardClient";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";

export default async function EmployerDashboardPage() {
  const profile = await getSessionProfile();
  
  // Fetch real dashboard stats
  const dashboardStats = await dashboardServerFetch("employer/dashboard");
  
  return (
    <EmployerDashboardClient 
      welcomeName={profile?.name ?? "Member"} 
      dashboardData={dashboardStats?.data}
    />
  );
}
