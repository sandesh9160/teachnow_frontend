import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import JobsClient from "@/app/dashboard/employer/jobs/JobsClient";
import { redirect } from "next/navigation";

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
  // AND fetch onboarding status
  const [jobsData, profileFlag, docsRes, dashboardStats] = await Promise.all([
    dashboardServerFetch(endpoint),
    dashboardServerFetch("profile-flag"),
    dashboardServerFetch("employer/documents"),
    dashboardServerFetch("employer/dashboard")
  ]);

  if (profileFlag?.is_profile_complete === 0) {
    redirect("/dashboard/employer/company-profile");
  } else if (Array.isArray(docsRes?.data) && docsRes.data.length === 0) {
    redirect("/dashboard/employer/institution-verification");
  } else if (dashboardStats?.data && !dashboardStats.data.active_subscription && !dashboardStats.data.subscription && (dashboardStats.data.credits_summary?.active_subscriptions_count || 0) === 0) {
    redirect("/pricing-plans");
  }
  console.log(`[JobsPage] Jobs data received:`, {
    status: jobsData?.status,
    total_jobs: jobsData?.total_jobs,
    active_count: jobsData?.active_jobs?.data?.length
  });
  
  return <JobsClient initialData={jobsData} />;
}
