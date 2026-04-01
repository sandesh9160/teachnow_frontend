"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useApplications } from "@/hooks/useApplications";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useTestimonials } from "@/hooks/useTestimonials";
import { Bookmark, Briefcase, FileText, Loader2, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function JobSeekerDashboard() {
  const { user } = useAuth();
  const { getApplications } = useApplications();
  const { getBookmarks } = useBookmarks();
  const { getTestimonials } = useTestimonials();

  const [stats, setStats] = useState({ applications: 0, savedJobs: 0, profileViews: 0, testimonials: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [apps, bookmarks, testimonials] = await Promise.all([
          getApplications().catch(() => []),
          getBookmarks().catch(() => []),
          getTestimonials().catch(() => [])
        ]);
        
        setStats({
          applications: Array.isArray(apps) ? apps.length : 0,
          savedJobs: Array.isArray(bookmarks) ? bookmarks.length : 0,
          profileViews: 0, // Placeholder until backend supports it
          testimonials: Array.isArray(testimonials) ? testimonials.length : 0
        });
      } catch (error) {
        console.error("Dashboard loaded error", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadDashboard();
  }, [getApplications, getBookmarks, getTestimonials]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 drop-shadow-sm">Welcome back, {user?.name || "Job Seeker"}!</h1>
        <p className="text-gray-500 mt-2">Here is what is happening with your job search today.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 border-b border-gray-50 pb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-500 font-medium">Applied Jobs</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.applications}</h3>
              </div>
            </div>
            <div className="pt-4">
              <p className="text-sm text-gray-500">Track your application status.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 border-b border-gray-50 pb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Bookmark className="w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-500 font-medium">Saved Jobs</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.savedJobs}</h3>
              </div>
            </div>
            <div className="pt-4">
              <p className="text-sm text-gray-500">Jobs you are considering.</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 border-b border-gray-50 pb-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-500 font-medium">Profile Views</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.profileViews}</h3>
              </div>
            </div>
            <div className="pt-4">
              <p className="text-sm text-gray-500">Times employers viewed you.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 border-b border-gray-50 pb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-500 font-medium">Testimonials</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.testimonials}</h3>
              </div>
            </div>
            <div className="pt-4">
              <Link href="/dashboard/jobseeker/testimonials" className="text-sm text-primary font-semibold hover:underline">
                Manage testimonials →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}