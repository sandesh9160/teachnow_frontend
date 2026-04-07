import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import ApplicantsClient from "../../../../applicants/ApplicantsClient";

export default async function JobApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Fetch specific job's applications
  const appsData = await dashboardServerFetch(`employer/jobs/applications/${id}`);
  
  return <ApplicantsClient initialData={appsData} />;
}
