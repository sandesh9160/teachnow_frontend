import { getSessionProfile } from "@/lib/serverAuth";
import RecruiterDashboardClient from "../RecruiterDashboardClient";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";

export default async function RecruiterDashboardPage() {
  const profile = await getSessionProfile();
  
  // Fetch recruiter specific dashboard data
  const dashboardRes = await dashboardServerFetch("recruiter/dashboard");
  
  return (
    <RecruiterDashboardClient 
      welcomeName={profile?.name || "Member"} 
      dashboardData={dashboardRes?.data}
    />
    
  );
}

