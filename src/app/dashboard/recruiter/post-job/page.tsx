import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import PostJobClient from "../../employer/post-job/PostJobClient";

export default async function RecruiterPostJobPage() {
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
    />
  );
}
