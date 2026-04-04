import { getSessionProfile } from "@/lib/serverAuth";
import JobSeekerDashboardClient from "./JobSeekerDashboardClient";

export default async function JobSeekerDashboardPage() {
  const profile = await getSessionProfile();
  return <JobSeekerDashboardClient displayName={profile?.name ?? "Job Seeker"} />;
}
