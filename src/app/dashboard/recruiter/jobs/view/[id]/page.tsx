import { requireSessionRole } from "@/lib/serverAuth";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import RecruiterJobViewClient from "./RecruiterJobViewClient";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireSessionRole("recruiter");

  const { id } = await params;

  // Primary synchronization attempt via the direct resource endpoint
  const jobDetails = await dashboardServerFetch(`recruiter/jobs/${id}`);
  
  // Handle tiered resolution: Prefer direct data, fallback to master list on 404/500
  let job = jobDetails?.data;
  const questions = jobDetails?.data?.questions || [];

  // Reliable fallback if the individual lookup fails
  if (!job || jobDetails?.status === false) {
    const allJobsRes = await dashboardServerFetch("recruiter/jobs");
    job = allJobsRes?.data?.find((j: any) => j.id.toString() === id);
  }

  // Fetch applications for this specific job for the count
  const appsResponse = await dashboardServerFetch(`recruiter/applications?job_id=${id}`);
  const totalApplications = appsResponse?.total_applications || appsResponse?.total || 0;

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 px-6 text-center text-primary font-bold">
        <h1 className="text-xl leading-tight tracking-tight">Requirement unavailable</h1>
        <p className="text-sm font-medium">Job ID: {id} - Could not be synchronized with active listings.</p>
        <p className="text-xs text-gray-400">Please verify the ID or refresh your requirement center.</p>
      </div>
    );
  }

  return (
    <RecruiterJobViewClient 
      job={job}
      totalApplications={totalApplications}
    />
  );
}
