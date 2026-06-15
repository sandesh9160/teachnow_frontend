import { requireSessionRole } from "@/lib/serverAuth";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import RecruiterJobsClient from "./RecruiterJobsClient";
import { Suspense } from "react";

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
    <Suspense fallback={
      <div className="flex h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    }>
      <RecruiterJobsClient 
        initialData={response}
      />
    </Suspense>
  );
}
