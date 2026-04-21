import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import PostJobClient from "@/app/dashboard/employer/post-job/PostJobClient";

export default async function PostJobPage() {
  // Fetch metadata from multiple open endpoints
  const [categoriesData, locationsData, profileData] = await Promise.all([
    dashboardServerFetch("open/all-categories"),
    dashboardServerFetch("open/locations"),
    dashboardServerFetch("employer/profile")
  ]);
  
  return (
    <PostJobClient 
      metadata={{
        categories: categoriesData?.data || [],
        locations: locationsData?.data || []
      }} 
      profile={profileData?.data}
    />
  );
}
