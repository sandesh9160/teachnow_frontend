import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import PostJobClient from "../../employer/post-job/PostJobClient";

export default async function RecruiterPostJobPage() {
  // Fetch metadata from multiple open endpoints
  const [categoriesData, locationsData] = await Promise.all([
    dashboardServerFetch("open/categories"),
    dashboardServerFetch("open/locations")
  ]);
  
  return (
    <PostJobClient 
      userRole="recruiter"
      metadata={{
        categories: categoriesData?.data || [],
        locations: locationsData?.data || []
      }} 
    />
  );
}
