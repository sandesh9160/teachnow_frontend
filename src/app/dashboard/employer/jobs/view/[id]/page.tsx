import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import JobPreviewClient from "./JobPreviewClient";

interface ViewJobPageProps {
  params: {
    id: string;
  };
}

export default async function ViewJobPage({ params }: ViewJobPageProps) {
  const { id } = await params;

  // Primary synchronization attempt via the direct resource endpoint
  const jobDetails = await dashboardServerFetch(`employer/jobs/${id}`);
  
  // Handle tiered resolution: Prefer direct data, fallback to master list on 404/500
  let job = jobDetails?.data;
  let questions = jobDetails?.data?.questions || [];

  // Reliable fallback if the individual lookup fails
  if (!job || jobDetails?.status === false) {
    const allJobsRes = await dashboardServerFetch("employer/jobs");
    job = allJobsRes?.data?.find((j: any) => j.id.toString() === id);
    questions = job?.questions || [];
  }

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
    <JobPreviewClient 
      data={{ job, questions }} 
    />
  );
}
