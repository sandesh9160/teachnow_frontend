import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import PostJobClient from "@/app/dashboard/employer/post-job/PostJobClient";

interface EditJobPageProps {
  params: {
    id: string;
  };
}

export default async function RecruiterEditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;

  // Metadata retrieval
  const [categoriesData, locationsData] = await Promise.all([
    dashboardServerFetch("open/categories"),
    dashboardServerFetch("open/locations"),
  ]);

  // Primary Fetch: Attempt standard recruiter endpoint
  let jobDetails = await dashboardServerFetch(`recruiter/jobs/${id}`, { silentStatusCodes: [405, 404] });
  
  // Fallbacks for different API response patterns
  if (jobDetails?.status !== true) {
    jobDetails = await dashboardServerFetch(`recruiter/jobs/show/${id}`, { silentStatusCodes: [405, 404] });
  }
  if (jobDetails?.status !== true) {
    jobDetails = await dashboardServerFetch(`recruiter/jobs/edit/${id}`, { silentStatusCodes: [405, 404] });
  }

  // Extract job and questions
  let job = jobDetails?.data?.job || jobDetails?.data;
  let questions = jobDetails?.data?.questions || job?.questions || [];

  // Final fallback: list search
  if (!job || typeof job !== 'object') {
     const allJobsRes = await dashboardServerFetch("recruiter/jobs", { silentStatusCodes: [404, 401] });
     job = allJobsRes?.data?.find((j: any) => j.id.toString() === id);
     questions = job?.questions || [];
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 px-6 text-center">
        <h1 className="text-xl font-bold text-slate-900">Job Listing Not Found</h1>
        <p className="text-sm text-slate-500 font-medium ">The job listing with ID: {id} could not be located in your recruiter portal.</p>
        <p className="text-xs text-slate-400 font-medium whitespace-pre-line">Please verify the URL or return to your job list to try again.</p>
      </div>
    );
  }

  return (
    <PostJobClient 
      isEdit={true}
      userRole="recruiter"
      initialData={{ job, questions }}
      metadata={{
        categories: categoriesData?.data || [],
        locations: locationsData?.data || []
      }} 
    />
  );
}
