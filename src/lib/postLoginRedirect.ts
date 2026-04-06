/**
 * Maps backend `user_type` (from sign-in / profile) to the post-login dashboard URL.
 */
export function dashboardUrlAfterLogin(user: { user_type?: string } | null | undefined): string {
  const t = String(user?.user_type ?? "").toLowerCase();
  if (t.includes("employer") || t.includes("institution") || t.includes("school") || t.includes("recruiter")) {
    return "/dashboard/employer";
  }
  return "/dashboard/jobseeker/profile";
}
