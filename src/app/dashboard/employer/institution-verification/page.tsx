import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import DocumentsClient from "./DocumentsClient";

export default async function InstitutionverificationPage() {
  const dashRes = await dashboardServerFetch<any>("employer/dashboard");
  const employer = dashRes?.data?.employer || dashRes?.data?.employer_profile;
  const isVerified = employer?.is_verified === 1;

  return <DocumentsClient isVerified={isVerified} />;
}
