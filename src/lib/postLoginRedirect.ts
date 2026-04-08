/**
 * Maps backend `user_type` (from sign-in / profile) to the post-login dashboard URL.
 */


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
