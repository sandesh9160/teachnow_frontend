import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
// import RecruiterJobsClient from "@/app/dashboard/employer/recruiters/[id]/RecruiterJobsClient";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function RecruiterDetailsPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const { id } = await params;
  const { active_page = "1" } = await searchParams;
  
  // Fetch recruiter's posted jobs with pagination
  console.log(`[RecruiterDetailsPage] Fetching recruiter details for ID: ${id}, Page: ${active_page}`);
  const data = await dashboardServerFetch(`employer/recruiter/${id}?page=${active_page}`);
  console.log(`[RecruiterDetailsPage] Received response:`, data);
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/employer/recruiters">
          <button className="h-9 w-9 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-slate-500" />
          </button>
        </Link>
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-none">Recruiter Profile</h1>
          <p className="text-[11px] text-slate-400 font-semibold mt-1 uppercase tracking-tight">Viewing jobs posted by {data?.data?.recruiter?.name || "team member"}</p>
        </div>
      </div>

      {/* <RecruiterJobsClient initialData={data} recruiterId={id} /> */}
    </div>
  );
}
