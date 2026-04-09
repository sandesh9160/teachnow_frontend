import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import CompanyProfileClient from "./CompanyProfileClient";

export default async function EmployerCompanyProfilePage() {
  const response = await dashboardServerFetch<any>("employer/profile");
  
  // Robust data extraction tailored to the actual API structure: { status: true, data: { employer: {...} } }
  const profile = response?.status === true 
    ? (response.data?.employer || response.data) 
    : (response?.id || response?.company_name ? response : null);
  
  return (
    <CompanyProfileClient
      initialData={profile}
    />
  );
}
