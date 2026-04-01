import { getJobs } from "@/hooks/useJobs";
import JobListingView from "./JobListingView";
import { notFound } from "next/navigation";

interface CityJobsPageProps {
  location: string;
}

export default async function CityJobsPage({ location }: CityJobsPageProps) {
  // Directly calling the jobs API with the location filter as requested
  // Matches backend: /open/jobs?location=Hyderabad
  const jobs = await getJobs({ location: location });

  if (jobs.length === 0) {
    // If no jobs found for this specific city, we can show a 404 or a dedicated empty state
    notFound();
  }

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const formattedLocation = location.split("-").map(capitalize).join(" ");

  return (
    <JobListingView 
      jobs={jobs} 
      pageName={formattedLocation} 
    />
  );
}
