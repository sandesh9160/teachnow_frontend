import { getSessionProfile } from "@/lib/serverAuth";
import CompanyProfileClient from "./CompanyProfileClient";

export default async function EmployerCompanyProfilePage() {
  const profile = await getSessionProfile();
  return (
    <CompanyProfileClient
      initialName={profile?.name ?? ""}
      initialEmail={profile?.email ?? ""}
    />
  );
}
