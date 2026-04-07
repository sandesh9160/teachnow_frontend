import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/serverAuth";

export default async function DashboardIndexPage() {
  const profile = await getSessionProfile();
  if (!profile) {
    redirect("/auth/login?message=" + encodeURIComponent("Please login to access this page"));
  }
  if (profile.role === "employer") {
    redirect("/dashboard/employer");
  }
  if (profile.role === "recruiter") {
    redirect("/dashboard/recruiter");
  }
  redirect("/dashboard/jobseeker");
}
