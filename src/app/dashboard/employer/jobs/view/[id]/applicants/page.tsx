import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import ApplicantsClient from "../../../../applicants/ApplicantsClient";
import { redirect } from "next/navigation";

export default async function JobApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Fetch specific job's applications AND onboarding status
  const [appsData, profileFlag, docsRes, dashboardStats] = await Promise.all([
    dashboardServerFetch(`employer/jobs/applications/${id}`),
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
  
  return <ApplicantsClient initialData={appsData} />;
}
