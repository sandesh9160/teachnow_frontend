import { requireSessionRole } from "@/lib/serverAuth";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import RecruiterJobsClient from "./RecruiterJobsClient";

export default async function RecruiterJobsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  await requireSessionRole("recruiter");

  const { search = "", active_page = "1" } = await searchParams;
  console.log(`[RecruiterJobsPage] Fetching recruiter jobs. Search: "${search}", Page: ${active_page}`);

  const response = await dashboardServerFetch(`recruiter/jobs?search=${search}&page=${active_page}`);
  console.log(`[RecruiterJobsPage] API Response:`, response);

  return (
    <RecruiterJobsClient 
      initialData={response}
    />
  );
}
