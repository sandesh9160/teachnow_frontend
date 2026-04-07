import { requireSessionRole } from "@/lib/serverAuth";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import RecruiterJobViewClient from "./RecruiterJobViewClient";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireSessionRole("recruiter");

  const { id } = await params;

  // Try to fetch applications for this specific job
  // We'll try the likely endpoints for the applicant list
  const response = await dashboardServerFetch(`recruiter/applications?job_id=${id}`);
  const jobResponse = await dashboardServerFetch(`recruiter/jobs`); 

  // Find the specific job from the inventory
  const job = jobResponse?.data?.find((j: any) => j.id.toString() === id) || {
    id: parseInt(id),
    title: "Job Loading...",
    status: "unknown"
  };

  // If the query param doesn't work, we might need to filter a full list
  // but we'll stick to the standard pattern first.
  const applications = response?.data?.data || response?.data || [];
  const total = response?.total_applications || response?.total || applications.length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <RecruiterJobViewClient 
        job={job}
        applications={applications}
        totalApplications={total}
      />
    </div>
  );
}
