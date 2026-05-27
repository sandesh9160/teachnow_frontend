"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Briefcase, MapPin, Calendar, Clock, Eye, Pencil, X, User, Mail, Key, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";

interface Job {
  id: number;
  title: string;
  location: string;
  job_status: string;
  created_at: string;
  expires_at: string;
  applicants_count?: number;
  user?: {
    id: number;
    name: string;
    email: string;
  }
}

interface RecruiterJobsClientProps {
  initialData: {
    status: boolean;
    data?: {
      jobs?: {
        data: Job[];
        total: number;
        current_page: number;
        last_page: number;
      };
      recruiter?: {
        id: number;
        name: string;
        email: string;
        is_available?: boolean;
        is_active?: number | string | boolean;
      };
    } | any;
  };
  // recruiterId: string;
}

export default function RecruiterJobsClient({ initialData }: RecruiterJobsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  console.log("[RecruiterJobsClient] Initializing with data:", initialData);
  const jobsData = initialData?.data?.jobs;
  const jobs: Job[] = Array.isArray(initialData?.data) 
    ? initialData.data 
    : (jobsData?.data || []);
  
  // Robust recruiter mapping to handle both nested and early-return response layouts
  const recruiter = initialData?.data?.recruiter ?? (initialData?.data?.name ? initialData.data : null);

  const [isActive, setIsActive] = useState<boolean>(() => {
    if (!recruiter) return false;
    if (recruiter.is_available !== undefined) return !!recruiter.is_available;
    return recruiter.is_active === 1 || recruiter.is_active === true || recruiter.is_active === "1";
  });
  const [toggling, setToggling] = useState(false);

  // Edit Recruiter States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(recruiter?.name || "");
  const [editEmail, setEditEmail] = useState(recruiter?.email || "");
  const [editPassword, setEditPassword] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const handleEditRecruiter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recruiter) return;
    setEditLoading(true);
    setEditErrors({});

    const newErrors: Record<string, string> = {};
    if (!editName.trim()) {
      newErrors.name = "Full name is required";
    }
    if (!editEmail.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(editEmail)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      toast.error(Object.values(newErrors)[0]);
      setEditLoading(false);
      return;
    }

    const payload: any = {
      name: editName.trim(),
      email: editEmail.trim(),
    };
    if (editPassword) {
      payload.password = editPassword;
    }

    try {
      const res = await dashboardServerFetch(
        `employer/recruiter/${recruiter.id}/update`,
        {
          method: "PATCH",
          data: payload,
        }
      );

      if (res.status === true) {
        toast.success("Recruiter details updated successfully!");
        setShowEditModal(false);
        setEditPassword("");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to update recruiter.");
      }
    } catch (error) {
      toast.error("Error occurred while updating recruiter.");
    } finally {
      setEditLoading(false);
    }
  };

  // Dynamic Browser-Console Logging
  console.log("[RecruiterJobsClient]  Recruiter parsed from response data:", recruiter);
  console.log("[RecruiterJobsClient]  Evaluated Active Status (isActive):", isActive);

  const handleToggleStatus = async () => {
    if (!recruiter) return;
    setToggling(true);
    const nextStatus = isActive ? 0 : 1;

    try {
      const res = await dashboardServerFetch(
        `employer/recruiter/${recruiter.id}/toggle`,
        {
          method: "PATCH",
          data: { is_active: nextStatus }
        }
      );

      if (res.status === true) {
        setIsActive(nextStatus === 1);
        toast.success(
          nextStatus === 1
            ? "Recruiter enabled successfully"
            : "Recruiter disabled successfully"
        );
        router.refresh();
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch (error) {
      toast.error("An error occurred while updating status");
    } finally {
      setToggling(false);
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams || "");
    params.set('active_page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Recruiter Info Card - Compact */}
      {recruiter && (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-lg shadow-inner shrink-0">
              {recruiter.name[0]}
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-bold text-slate-900 leading-tight truncate">{recruiter.name}</h2>
              <p className="text-[11px] font-medium text-slate-400 truncate">{recruiter.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Dynamic Status Toggle */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-50/50 rounded-xl border border-slate-100">
              <button
                onClick={handleToggleStatus}
                disabled={toggling}
                suppressHydrationWarning={true}
                className={cn(
                  "relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50",
                  isActive ? "bg-emerald-500" : "bg-slate-300"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    isActive ? "translate-x-3.5" : "translate-x-0"
                  )}
                />
              </button>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-tight",
                isActive ? "text-emerald-600" : "text-slate-400"
              )}>
                {toggling ? "Updating..." : (isActive ? "Active" : "Inactive")}
              </span>
            </div>

            {/* Edit Recruiter Button */}
            <button
              onClick={() => {
                setEditName(recruiter.name);
                setEditEmail(recruiter.email);
                setEditPassword("");
                setShowEditModal(true);
              }}
              className="h-9 w-9 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors flex items-center justify-center text-slate-500 hover:text-indigo-600 shadow-xs"
              title="Edit Profile"
            >
              <Pencil className="w-4 h-4" />
            </button>

            {/* Postings count */}
            <div className="flex items-center gap-4 px-4 py-2 bg-slate-50/50 rounded-xl border border-slate-100">
              <div className="text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Postings</p>
                <p className="text-sm font-bold text-slate-900">{jobs.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Jobs List - Compact */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Posted Jobs</h3>
        </div>
        
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl border border-slate-100 shadow-xs p-3.5 group transition-all hover:shadow-sm hover:border-indigo-100/50">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1.5">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{job.title}</h3>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter",
                      job.job_status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {job.job_status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                      <MapPin className="w-3 h-3 text-indigo-400" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                      <Calendar className="w-3 h-3 text-indigo-400" /> Expires: {job.expires_at && !isNaN(new Date(job.expires_at).getTime()) ? new Date(job.expires_at).toLocaleDateString('en-GB') : "Not Specified"}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                      <Clock className="w-3 h-3 text-indigo-400" /> Posted: {job.created_at && !isNaN(new Date(job.created_at).getTime()) ? new Date(job.created_at).toLocaleDateString('en-GB') : "Recently"}
                    </span>
                  </div>
                </div>

                <Link href={`/dashboard/employer/jobs/view/${job.id}`}>
                  <button className="h-8 px-4 rounded-lg text-[11px] font-bold text-indigo-600 bg-white border border-indigo-50 hover:bg-indigo-50 hover:border-indigo-100 transition-all flex items-center gap-1.5 shrink-0">
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-12 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-200">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-slate-900">No jobs posted yet</p>
              <p className="text-[11px] text-slate-400 font-medium">No active listings from this member.</p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Section - Compact */}
      {(jobsData?.last_page || 0) > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 border-t border-slate-50">
          <Button
            variant="outline"
            size="sm"
            disabled={jobsData?.current_page === 1}
            onClick={() => handlePageChange((jobsData?.current_page || 1) - 1)}
            className="h-8 px-3 rounded-lg text-[11px] font-bold text-slate-500 border-slate-100 hover:bg-slate-50 disabled:opacity-50"
          >
            Prev
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: jobsData?.last_page || 0 }, (_, i) => i + 1).map((pg) => (
              <Button
                key={pg}
                size="sm"
                onClick={() => handlePageChange(pg)}
                className={cn(
                  "w-8 h-8 rounded-lg text-[11px] font-bold transition-all",
                  jobsData?.current_page === pg
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30"
                )}
              >
                {pg}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={jobsData?.current_page === jobsData?.last_page}
            onClick={() => handlePageChange((jobsData?.current_page || 0) + 1)}
            className="h-8 px-3 rounded-lg text-[11px] font-bold text-slate-500 border-slate-100 hover:bg-slate-50 disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit Recruiter Modal */}
      {showEditModal && recruiter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-primary/10 shadow-2xl overflow-hidden max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between bg-primary/5 p-4 border-b border-primary/10">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-slate-900 leading-none">Edit Recruiter Details</h3>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditRecruiter} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 ml-0.5">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Name"
                    className={cn(
                      "w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all",
                      editErrors.name ? "border-red-500 bg-red-50/50" : ""
                    )}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 ml-0.5">Work Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="email@institution.com"
                    className={cn(
                      "w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all",
                      editErrors.email ? "border-red-500 bg-red-50/50" : ""
                    )}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 ml-0.5">New Password (optional)</label>
                <div className="relative group">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-50 mt-5">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setShowEditModal(false)}
                  className="h-10 px-5 rounded-xl text-xs font-medium hover:bg-slate-100 text-slate-500"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={editLoading}
                  className="h-10 px-8 rounded-xl text-xs font-semibold shadow-md shadow-primary/20 hover:scale-[1.01]"
                >
                  {editLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
