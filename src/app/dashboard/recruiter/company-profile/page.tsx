import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import RecruiterCompanyProfileClient from "./RecruiterCompanyProfileClient";

export default async function RecruiterCompanyProfilePage() {
  const response = await dashboardServerFetch<any>("recruiter/company-profile");
  
  const profile = response.status ? response.data : null;

  return (
    <RecruiterCompanyProfileClient
      data={profile}
    />
  );
}
