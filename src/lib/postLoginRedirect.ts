/**
 * Maps backend `user_type` (from sign-in / profile) to the post-login dashboard URL.
 */
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";


export function dashboardUrlAfterLogin(user: { user_type?: string } | null | undefined): string {
  const t = String(user?.user_type ?? "").toLowerCase();
  console.log("t is ", t);
  if (t.includes("employer") || t.includes("institution") || t.includes("school")) {
    return "/dashboard/employer";
  }
  if (t.includes("recruiter")) {
    return "/dashboard/recruiter";
  }
  if (t.includes("jobseeker") || t.includes("job_seeker") || t.includes("candidate")) {
    return "/dashboard/jobseeker";
  }
  return "/auth/login?message=" + encodeURIComponent("Please login to access this page");
}

/**
 * Checks employer onboarding status and returns the appropriate redirect URL.
 */
export async function getEmployerRedirectUrl(): Promise<string> {
  try {
    const [profileFlag, dashRes, docsRes] = await Promise.all([
      dashboardServerFetch<any>("profile-flag"),
      dashboardServerFetch<any>("employer/dashboard"),
      dashboardServerFetch<any>("employer/documents")
    ]);

    if (profileFlag?.is_profile_complete === 0) {
      return "/dashboard/employer/company-profile";
    } else if (Array.isArray(docsRes?.data) && docsRes.data.length === 0) {
      return "/dashboard/employer/institution-verification";
    } else if (dashRes?.data && !dashRes.data.active_subscription && !dashRes.data.subscription && (dashRes.data.credits_summary?.active_subscriptions_count || 0) === 0) {
      return "/pricing-plans";
    }
  } catch (err) {
    console.error("Onboarding check failed:", err);
  }
  return "/dashboard/employer";
}
