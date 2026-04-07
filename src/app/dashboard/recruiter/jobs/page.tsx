import { requireSessionRole } from "@/lib/serverAuth";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import RecruiterJobsClient from "./RecruiterJobsClient";

export default async function RecruiterJobsPage() {
  await requireSessionRole("recruiter");

  const response = await dashboardServerFetch("recruiter/jobs");

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <RecruiterJobsClient 
        jobs={response?.data || []} 
        totalJobs={response?.total_jobs || 0}
      />
    </div>
  );
}
