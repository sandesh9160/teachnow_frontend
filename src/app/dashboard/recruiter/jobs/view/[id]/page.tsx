import { requireSessionRole } from "@/lib/serverAuth";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import RecruiterJobViewClient from "./RecruiterJobViewClient";
import { FileText } from "lucide-react";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireSessionRole("recruiter");

  const { id } = await params;

  // Primary synchronization attempt via the direct resource endpoint
  let jobDetails = await dashboardServerFetch(`recruiter/jobs/${id}`, { silentStatusCodes: [405, 404] });
  
  // Secondary: Attempt common variants if direct lookup is restricted or misrouted
  if (jobDetails?.status !== true) {
    jobDetails = await dashboardServerFetch(`recruiter/jobs/show/${id}`, { silentStatusCodes: [404, 405] });
  }
  if (jobDetails?.status !== true) {
    jobDetails = await dashboardServerFetch(`recruiter/jobs/edit/${id}`, { silentStatusCodes: [404, 405] });
  }

  // Handle tiered resolution: Prefer direct data, fallback to master list on 404/500
  let job = jobDetails?.data?.job || jobDetails?.data;
  let questions = jobDetails?.data?.questions || job?.questions || 
                  jobDetails?.data?.screening_questions || job?.screening_questions || 
                  jobDetails?.data?.job_questions || job?.job_questions ||
                  jobDetails?.data?.job_screening_questions || job?.job_screening_questions || [];

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
       console.log(`[RecruiterJobPage] Found job ${id} in master list fallback.`);
       questions = job.questions || job.screening_questions || [];
    }
  }

  // Ensure questions are attached to the job object for the client component
  if (job && !job.questions) {
    job.questions = questions;
  }

  // Fetch applications for this specific job for the count
  const appsResponse = await dashboardServerFetch(`recruiter/applications?job_id=${id}`);
  const totalApplications = appsResponse?.total_applications || appsResponse?.total || 0;

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100 shadow-sm mb-2">
           <FileText className="w-8 h-8 opacity-20" />
        </div>
        <div className="space-y-2">
           <h1 className="text-xl font-bold text-slate-900 tracking-tight">Resource Not Located</h1>
           <p className="text-sm font-medium text-slate-600 leading-relaxed">
              The job listing with ID: <span className="text-indigo-600 font-bold">#{id}</span> could not be located in your recruiter portal.
           </p>
           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Verification failed or listing was removed
           </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
           <button onClick={() => window.history.back()} className="w-full h-10 rounded-xl bg-indigo-600 text-white text-[12px] font-bold shadow-sm hover:bg-indigo-700 transition-all">
              Back to Dashboard
           </button>
           <button onClick={() => window.location.reload()} className="w-full h-10 rounded-xl bg-white border border-slate-200 text-slate-600 text-[12px] font-bold hover:bg-slate-50 transition-all">
              Retry Sync
           </button>
        </div>
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
