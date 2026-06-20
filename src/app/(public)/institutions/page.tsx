import { getCompanies } from "@/hooks/useCompanies";
import InstitutionsPageClient from "./InstitutionsPageClient";
import { generateSeoMetadata } from "@/lib/seo";

export const metadata = generateSeoMetadata({
  path: "/institutions",
  pageFallback: {
    title: "Institutions Hiring Teachers | TeachNow",
    description: "Discover top schools, colleges, and edtech companies across India. Search profiles and open vacancies.",
    keywords: "educational institutions, schools hiring, teacher recruitment, teachnow schools"
  }
});

// Incremental Static Regeneration (ISR): Cache for 15 minutes, refresh in background
export const revalidate = 900;

export default async function InstitutionsPage() {
  const initialCompanies = await getCompanies() || [];

  return (
    <InstitutionsPageClient initialCompanies={initialCompanies} />
  );
}
