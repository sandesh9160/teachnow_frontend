import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import PostJobClient from "@/app/dashboard/employer/post-job/PostJobClient";

interface EditJobPageProps {
  params: {
    id: string;
  };
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;

  // Background context sync (Metadata)
  const [categoriesData, locationsData] = await Promise.all([
    dashboardServerFetch("open/categories"),
    dashboardServerFetch("open/locations"),
  ]);

  // Primary Metadata Synchronization: Official Resource Endpoint
  let jobDetails = await dashboardServerFetch(`employer/jobs/${id}`);
  
  // Secondary: Attempt common variants if direct lookup is restricted
  if (jobDetails?.status !== true) {
    jobDetails = await dashboardServerFetch(`employer/jobs/show/${id}`);
  }
  if (jobDetails?.status !== true) {
    jobDetails = await dashboardServerFetch(`employer/jobs/edit/${id}`);
  }

  // Robust field extraction (Direct from data or nested within job)
  let job = jobDetails?.data?.job || jobDetails?.data;
  let questions = jobDetails?.data?.questions || job?.questions || [];

  // Final List-based Fallback for absolute uptime
  if (!job || typeof job !== 'object') {
     const allJobsRes = await dashboardServerFetch("employer/jobs");
     job = allJobsRes?.data?.find((j: any) => j.id.toString() === id);
     questions = job?.questions || [];
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 px-6 text-center">
        <h1 className="text-xl font-bold text-gray-900 leading-tight">Requirement not discovered</h1>
        <p className="text-sm text-gray-500 font-medium tracking-tight">Job ID: {id} could not be synchronized with your active listings.</p>
        <p className="text-xs text-gray-400 font-medium">Please verify the ID or refresh your requirement center.</p>
      </div>
    );
  }

  return (
    <PostJobClient 
      isEdit={true}
      initialData={{ job, questions }}
      metadata={{
        categories: categoriesData?.data || [],
        locations: locationsData?.data || []
      }} 
    />
  );
}
