import { requireSessionRole } from "@/lib/serverAuth";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import RecruiterApplicantsClient from "../../../../applicants/RecruiterApplicantsClient";

export default async function JobApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSessionRole("recruiter");
  const { id } = await params;
  
  // Fetch specific job's applications
  const appsData = await dashboardServerFetch(`recruiter/jobs/${id}/applications`);
  
  return <RecruiterApplicantsClient initialData={appsData} />;
}
