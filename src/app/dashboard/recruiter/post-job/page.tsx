import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import PostJobClient from "../../employer/post-job/PostJobClient";
import { getSessionProfile } from "@/lib/serverAuth";

export default async function RecruiterPostJobPage() {
  const session = await getSessionProfile();
  
  // Fetch metadata from multiple open endpoints
  const [categoriesData, locationsData, profileData] = await Promise.all([
    dashboardServerFetch("open/all-categories"),
    dashboardServerFetch("open/locations"),
    dashboardServerFetch("recruiter/profile")
  ]);
  
  return (
    <PostJobClient 
      userRole="recruiter"
      metadata={{
        categories: categoriesData?.data || [],
        locations: locationsData?.data || []
      }} 
      profile={profileData?.data}
      session={session}
    />
  );
}
