import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import CompanyProfileClient from "./CompanyProfileClient";

export default async function EmployerCompanyProfilePage() {
  const [response, profileFlagRes] = await Promise.all([
    dashboardServerFetch<any>("employer/profile"),
    dashboardServerFetch<any>("profile-flag")
  ]);
  
  // Robust data extraction tailored to the actual API structure: { status: true, data: { employer: {...} } }
  const profile = response?.status === true 
    ? (response.data?.employer || response.data) 
    : (response?.id || response?.company_name ? response : null);
    
  const isProfileComplete = profileFlagRes?.is_profile_complete === 1;
  
  return (
    <CompanyProfileClient
      initialData={profile}
      isProfileComplete={isProfileComplete}
    />
  );
}
