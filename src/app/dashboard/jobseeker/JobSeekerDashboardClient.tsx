"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { Bookmark, Briefcase, Loader2, Star } from "lucide-react";
import Link from "next/link";

function formatAppliedAt(iso: string | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function JobSeekerDashboardClient({ displayName }: { displayName: string }) {
  const { data, loading, error, refetch } = useDashboard();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 drop-shadow-sm">
          Welcome back, {displayName || "Job Seeker"}!
        </h1>
        <p className="text-gray-500 mt-2">Here is what is happening with your job search today.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50/80 px-6 py-5 text-red-800">
          <p className="font-medium">{error}</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-3 text-sm font-semibold text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 border-b border-gray-50 pb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Applied Jobs</p>
                  <h3 className="text-2xl font-bold text-gray-900">{data?.total_applied ?? 0}</h3>
                </div>
              </div>
              <div className="pt-4">
                <p className="text-sm text-gray-500">Track your application status.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 border-b border-gray-50 pb-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Shortlisted</p>
                  <h3 className="text-2xl font-bold text-gray-900">{data?.total_shortlisted ?? 0}</h3>
                </div>
              </div>
              <div className="pt-4">
                <p className="text-sm text-gray-500">Roles where you stand out.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 border-b border-gray-50 pb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Bookmark className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Saved Jobs</p>
                  <h3 className="text-2xl font-bold text-gray-900">{data?.total_bookmarked ?? 0}</h3>
                </div>
              </div>
              <div className="pt-4">
                <p className="text-sm text-gray-500">Jobs you are considering.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent applications</h2>
            {data?.recent_applications?.length ? (
              <ul className="divide-y divide-gray-100">
                {data.recent_applications.map((app) => (
                  <li key={`${app.job_id}-${app.applied_at}`} className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900">{app?.title ?? "—"}</p>
                      <p className="text-sm text-gray-500">{app?.company_name ?? "—"}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700 capitalize">{app?.status ?? "—"}</span>
                      <span className="text-gray-500">{formatAppliedAt(app?.applied_at)}</span>
                      <Link
                        href={`/jobs/${app?.job_id}`}
                        className="text-primary font-semibold hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No recent applications yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
