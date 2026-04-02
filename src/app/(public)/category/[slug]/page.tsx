import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryJobs } from "@/lib/jobs/api";
import JobListingView from "@/components/jobs/JobListings/JobListingView";

export const revalidate = 300;

type Props = {
  readonly params: Promise<{ slug: string }>;
  readonly searchParams: Promise<{ name?: string }>;
};

export async function generateMetadata({ searchParams, params }: Props): Promise<Metadata> {
  const { name } = await searchParams;
  const { slug } = await params;
  
  // Try to generate a nice name from the slug if 'name' is missing
  const categoryName = name 
    ? decodeURIComponent(name) 
    : slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

  return {
    title: `${categoryName} Jobs | TeachNow`,
    description: `Browse the latest ${categoryName} jobs on TeachNow. Apply online for the best opportunities.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { name } = await searchParams;
  
  // Try to generate a nice name from the slug if 'name' is missing
  const categoryName = name 
    ? decodeURIComponent(name) 
    : slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

  const categoryResult = await getCategoryJobs(slug);
  const jobs = Array.isArray(categoryResult)
    ? categoryResult
    : Array.isArray(categoryResult?.jobs)
      ? categoryResult.jobs
      : [];

  if (jobs.length === 0) {
    notFound();
  }

  return <JobListingView jobs={jobs} pageName={categoryName} />;
}
