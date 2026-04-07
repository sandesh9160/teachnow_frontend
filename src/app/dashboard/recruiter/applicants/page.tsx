import { requireSessionRole } from "@/lib/serverAuth";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import RecruiterApplicantsClient from "./RecruiterApplicantsClient";

export default async function RecruiterGeneralApplicantsPage() {
  await requireSessionRole("recruiter");
  
  // Fetch all recruiter's applications
  const appsData = await dashboardServerFetch("recruiter/applications");
  
  return <RecruiterApplicantsClient initialData={appsData} />;
}
