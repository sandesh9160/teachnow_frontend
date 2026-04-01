import { notFound, redirect } from "next/navigation";
import { getCompanyBySlugWithJobs, getCompanies } from "@/hooks/useCompanies";
import InstitutionDetailsView from "@/components/institutions/InstitutionDetails/InstitutionDetailsView";
import { Institution } from "@/types/homepage";

export const dynamic = "force-dynamic";

/**
 * Modern Institution Detail Page wrapper.
 * This route (/institutions/[slug]) is now synced with the root slug route.
 */
export default async function InstitutionDetailPage({ 
  params 
}: Readonly<{ 
  params: Promise<{ slug: string }> 
}>) {
  const { slug } = await params;
  
  // 1. Fetch company profile and jobs in one go (Consolidated API call)
  const result = await getCompanyBySlugWithJobs(slug);
  
  if (!result?.company) {
    notFound();
  }

  const { company, jobs } = result;

  // 1.5 Exact Slug Redirect: If the current URL doesn't match the preferred slug, redirect.
  const currentSlug = decodeURIComponent(slug);
  if (company.slug && currentSlug !== company.slug) {
    redirect(`/institutions/${company.slug}`);
  }

  // 2. Fetch similar companies for the sidebar (featured companies fallback)
  let similarCompanies: Institution[] = [];
  try {
    const all = await getCompanies();
    similarCompanies = all.filter(c => c.id !== company.id).slice(0, 4);
  } catch (err) {
    console.error("Error fetching similar companies:", err);
  }

  // 3. Render using the premium view component
  return (
    <InstitutionDetailsView 
      company={company}
      companyJobs={jobs}
      similarCompanies={similarCompanies}
    />
  );
}
