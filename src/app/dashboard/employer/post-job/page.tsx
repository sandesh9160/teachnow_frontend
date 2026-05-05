import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import PostJobClient from "@/app/dashboard/employer/post-job/PostJobClient";
import { getSessionProfile } from "@/lib/serverAuth";

export default async function PostJobPage() {
  const session = await getSessionProfile();
  
  // Fetch metadata from multiple open endpoints
  const [categoriesData, locationsData, profileData, profileFlag] = await Promise.all([
    dashboardServerFetch("open/all-categories"),
    dashboardServerFetch("open/locations"),
    dashboardServerFetch("employer/profile"),
    dashboardServerFetch("profile-flag")
  ]);
  
  return (
    <PostJobClient 
      metadata={{
        categories: categoriesData?.data || [],
        locations: locationsData?.data || []
      }} 
      profile={profileData?.data}
      isProfileComplete={profileFlag?.is_profile_complete === 1}
      session={session}
    />
  );
}
