import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import ApplicantsClient from "../../employer/applicants/ApplicantsClient";

export default async function RecruiterApplicantsPage() {
  // Fetch employer's applications list (recruiters usually see the same)
  const appsData = await dashboardServerFetch("employer/applications");
  
  return <ApplicantsClient initialData={appsData} />;
}
