import { getCompanies } from "@/hooks/useCompanies";
import InstitutionsPageClient from "./InstitutionsPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Institutions Hiring Teachers",
  description: "Discover top schools, colleges, and edtech companies across India",
};

export default async function InstitutionsPage() {
  const initialCompanies = await getCompanies() || [];

  return (
    <InstitutionsPageClient initialCompanies={initialCompanies} />
  );
}
