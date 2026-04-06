import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import JobsClient from "@/app/dashboard/employer/jobs/JobsClient";

export default async function JobsPage() {
  // Fetch employer's jobs list
  const jobsData = await dashboardServerFetch("employer/jobs");
  
  return <JobsClient initialData={jobsData} />;
}
