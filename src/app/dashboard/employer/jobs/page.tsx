import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import JobsClient from "@/app/dashboard/employer/jobs/JobsClient";

export default async function JobsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | undefined }> 
}) {
  const params = await searchParams;
  const search = params.search || "";
  const page = params.active_page || "1";

  console.log(`[JobsPage] Fetching jobs - Search: "${search}", Page: ${page}`);
  const endpoint = `employer/jobs?search=${search}&page=${page}`;
  console.log(`[JobsPage] Calling API: ${endpoint}`);

  // Fetch employer's jobs list with search and page parameters
  const jobsData = await dashboardServerFetch(endpoint);
  console.log(`[JobsPage] Jobs data received:`, {
    status: jobsData?.status,
    total_jobs: jobsData?.total_jobs,
    active_count: jobsData?.active_jobs?.data?.length
  });
  
  return <JobsClient initialData={jobsData} />;
}
