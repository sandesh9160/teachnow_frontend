import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import CompanyProfileClient from "./CompanyProfileClient";
import { EmployerProfileResponse } from "@/types/employer";

export default async function EmployerCompanyProfilePage() {
  const response = await dashboardServerFetch<EmployerProfileResponse>("employer/profile");
  
  const profile = response.status ? response.data : null;

  return (
    <CompanyProfileClient
      initialData={profile}
    />
  );
}
