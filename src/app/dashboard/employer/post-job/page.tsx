import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import PostJobClient from "@/app/dashboard/employer/post-job/PostJobClient";
import { getSessionProfile } from "@/lib/serverAuth";
import { redirect } from "next/navigation";

export default async function PostJobPage() {
  const session = await getSessionProfile();

  // Fetch metadata and onboarding status
  const [categoriesData, locationsData, profileData, profileFlag, docsRes, dashboardStats] = await Promise.all([
    dashboardServerFetch("open/all-categories"),
    dashboardServerFetch("open/locations"),
    dashboardServerFetch("employer/profile"),
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

  return (
    <PostJobClient
      metadata={{
        categories: categoriesData?.data || [],
        locations: locationsData?.data || [],
      }}
      profile={profileData?.data}
      session={session}
    />
  );
}
