import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import PostJobClient from "@/app/dashboard/employer/post-job/PostJobClient";

export default async function PostJobPage() {
  // Fetch metadata from multiple open endpoints
  const [categoriesData, locationsData] = await Promise.all([
    dashboardServerFetch("open/categories"),
    dashboardServerFetch("open/locations")
  ]);
  
  return (
    <PostJobClient 
      metadata={{
        categories: categoriesData?.data || [],
        locations: locationsData?.data || []
      }} 
    />
  );
}
