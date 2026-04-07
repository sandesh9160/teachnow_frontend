
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import ApplicantsClient from "./ApplicantsClient";

export default async function EmployerApplicantsPage() {
  // Fetch employer's applications list
  const appsData = await dashboardServerFetch("employer/applications");
  
  return <ApplicantsClient initialData={appsData} />;
}
