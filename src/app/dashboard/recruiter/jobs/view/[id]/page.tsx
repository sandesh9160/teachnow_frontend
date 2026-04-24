import { requireSessionRole } from "@/lib/serverAuth";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import RecruiterJobViewClient from "./RecruiterJobViewClient";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireSessionRole("recruiter");

  const { id } = await params;

  // Primary synchronization attempt via the direct resource endpoint
  let jobDetails = await dashboardServerFetch(`recruiter/jobs/specific-job/${id}`, { silentStatusCodes: [405, 404] });
  console.log("jobDetails", jobDetails);

  // // Secondary: Attempt common variants if direct lookup is restricted or misrouted
  // if (jobDetails?.status !== true) {
  //   jobDetails = await dashboardServerFetch(`recruiter/jobs/show/${id}`, { silentStatusCodes: [404, 405] });
  // }
  // if (jobDetails?.status !== true) {
  //   jobDetails = await dashboardServerFetch(`recruiter/jobs/edit/${id}`, { silentStatusCodes: [404, 405] });
  // }

  // Handle tiered resolution: Prefer direct data, fallback to master list on 404/500
  let job = jobDetails?.data?.job || jobDetails?.data;
  
  // Robust question extraction: find the first non-empty array among all possible keys
  const getFirstPopulated = (...arrays: any[]) => arrays.find(a => Array.isArray(a) && a.length > 0) || [];

  let questions = getFirstPopulated(
    jobDetails?.data?.questions,
    job?.questions,
    jobDetails?.data?.screening_questions,
    job?.screening_questions,
    jobDetails?.data?.job_questions,
    job?.job_questions,
    jobDetails?.data?.job_screening_questions,
    job?.job_screening_questions
  );

  // Reliable fallback if the individual lookup variants fail
  if (!job || jobDetails?.status === false) {
    console.log(`[RecruiterJobPage] Direct lookup failed for ID ${id}, trying fallback to master list...`);
    const allJobsRes = await dashboardServerFetch("recruiter/jobs", { silentStatusCodes: [404] });

    // The recruiter jobs API returns active_jobs and expired_jobs
    const activeJobs = allJobsRes?.active_jobs?.data || [];
    const expiredJobs = allJobsRes?.expired_jobs?.data || [];
    const allJobs = [...activeJobs, ...expiredJobs];

    job = allJobs.find((j: any) => j.id.toString() === id);
    if (job) {
      questions = getFirstPopulated(job.questions, job.screening_questions, job.job_questions);
    }
  }

  // Ensure questions are attached to the job object for the client component
  if (job && questions.length > 0) {
    job.questions = questions;
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