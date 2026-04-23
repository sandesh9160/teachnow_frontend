"use client";

import {
   MapPin,
   DollarSign,
   Edit3,
   ChevronLeft,
   Users,
   FileText,
   Briefcase,
   Clock,
   Layers,
   Trash2,
   CheckCircle2,
   ExternalLink,
   Calendar,
   ShieldCheck,
   Target,
   Loader2,
   TrendingUp,
   RefreshCw,
   Star
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { cn } from "@/lib/utils";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import { toast } from "sonner";

interface RecruiterJobViewClientProps {
   job: any;
   applications?: any[];
   totalApplications?: number;
}

export default function RecruiterJobViewClient({ job, totalApplications = 0 }: RecruiterJobViewClientProps) {
   const [loadingAction, setLoadingAction] = useState<string | null>(null);
   const basePath = "/dashboard/recruiter";
   const questions = job.questions || [];

   const formatTerm = (term: string) => {
      if (!term) return "";
      return term.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
   };

   const handleToggleFeatured = async () => {
      setLoadingAction('toggle-feature');
      try {
         const res = await dashboardServerFetch(`recruiter/job/${job.id}/toggle-feature`, {
            method: "POST",
            data: {}
         });
         if (res.status === true) {
            toast.success(res.message || "Featured status updated successfully.", { style: { borderLeft: '4px solid #10b981' } });
            window.location.reload();
         } else {
            toast.error(res.message || "Something went wrong.");
         }
      } catch (error) {
         toast.error("An unexpected error occurred.");
      } finally {
         setLoadingAction(null);
      }
   };

   const handleAction = async (type: 'filled' | 'delete' | 'republish') => {
      const actionLabel =
         type === 'filled' ? 'mark this job as filled' :
            type === 'delete' ? 'permanently delete this job' :
               'republish this job';

      toast(`Are you sure you want to ${actionLabel}?`, {
         action: {
            label: type === 'filled' ? 'Mark Filled' : type === 'republish' ? 'Republish' : 'Delete',
            onClick: async () => {
               const endpoint = type === 'filled'
                  ? `recruiter/jobs/${job.id}/filled`
                  : type === 'republish'
                     ? `recruiter/jobs/${job.id}/republish`
                     : `recruiter/jobs/delete/${job.id}`;

               setLoadingAction(type);
               try {
                  const method = type === 'delete' ? "DELETE" : "PUT";
                  const res = await dashboardServerFetch(endpoint, {
                     method: method,
                     data: {}
                  });

                  if (res.status === true) {
                     toast.success(res.message || `Job ${type === 'filled' ? 'closed' : type === 'republish' ? 'republished' : 'deleted'} successfully.`, { style: { borderLeft: '4px solid #10b981' } });
                     setTimeout(() => {
                        window.location.href = `${basePath}/jobs`;
                     }, 1500);
                  } else {
                     toast.error(res.message || "Something went wrong.");
                  }
               } catch (error) {
                  toast.error("An unexpected error occurred.");
               } finally {
                  setLoadingAction(null);
               }
            }
         }
      });
   };

   const DetailItem = ({ label, value, icon: Icon, colorClass }: any) => (
      <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-50 bg-white shadow-xs transition-all hover:bg-slate-50/50 group">
         <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105",
            colorClass || "bg-indigo-50/50 text-indigo-500 border-indigo-100/50"
         )}>
            <Icon className="w-4.5 h-4.5" />
         </div>
         <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-600 mb-0.5">{label}</p>
            <p className="text-[13px] font-semibold text-slate-900">{value}</p>
         </div>
      </div>
   );

   return (
      <div className="max-w-6xl mx-auto px-4 py-4 space-y-5 pb-20 font-sans text-slate-800">

         {/* Compact Header */}
         <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all hover:border-indigo-100/50">
            <div className="space-y-3">
               <button
                  onClick={() => window.history.back()}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-indigo-600 transition-all active:scale-95"
               >
                  <ChevronLeft className="w-3.5 h-3.5" /> All Jobs
               </button>

               <div className="space-y-2">
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 leading-tight">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-2">
                     <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {job.location}
                     </span>
                     <span className="text-[12px] font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100/50">
                        {formatTerm(job.job_type)}
                     </span>
                     <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-bold border whitespace-nowrap",
                        job.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                           job.status === 'rejected' ? "bg-rose-50 text-rose-600 border-rose-100" :
                              "bg-amber-50 text-amber-600 border-amber-100"
                     )}>
                        {job.status === 'approved' ? "Verified Post" : formatTerm(job.status || "Under Review")}
                     </span>
                     {job.featured === 1 && (
                        <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm border border-indigo-700">
                           <TrendingUp className="w-2.5 h-2.5" /> Featured on Home
                        </span>
                     )}
                     {job.admin_featured === 1 && (
                        <span className="bg-amber-500 text-white px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm border border-amber-600">
                           <TrendingUp className="w-2.5 h-2.5" /> Admin Featured Listing
                        </span>
                     )}
                  </div>
               </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
               <Link href={`${basePath}/jobs/view/${job.id}/applicants`}>
                  <Button variant="outline" className="h-10 px-5 rounded-xl text-xs font-semibold text-slate-700 border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center gap-2">
                     <Users className="w-4 h-4 text-indigo-500" /> View Applicants ({totalApplications})
                  </Button>
               </Link>
               {job.job_status === 'expired' && (
                  <Button
                     onClick={() => handleAction('republish')}
                     disabled={loadingAction === 'republish'}
                     className="h-10 px-5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm"
                  >
                     {loadingAction === 'republish' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                     Republish Job
                  </Button>
               )}
               {job.job_status !== 'filled' && job.job_status !== 'expired' && (
                  <Link href={`${basePath}/jobs/edit/${job.id}`}>
                     <Button variant="outline" className="h-10 px-5 rounded-xl text-xs font-semibold text-slate-700 border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-indigo-500" /> Edit Job
                     </Button>
                  </Link>
               )}
               <Link href={`/jobs/${job.slug}`} target="_blank">
                  <Button className="h-10 px-6 rounded-xl text-xs font-semibold bg-[#312E81] text-white hover:bg-[#1E1B4B] shadow-lg shadow-indigo-100 flex items-center gap-2">
                     Live Preview <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
               </Link>
               <Button
                  variant="outline"
                  onClick={handleToggleFeatured}
                  disabled={!!loadingAction}
                  className={cn(
                     "h-10 px-5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2",
                     job.featured === 1
                        ? "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  )}
               >
                  {loadingAction === 'toggle-feature' ? (
                     <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                     <Star className={cn("w-4 h-4", job.featured === 1 ? "fill-amber-500 text-amber-500" : "text-slate-400")} />
                  )}
                  {job.featured === 1 ? "Featured" : "Feature on Home"}
               </Button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Main Description */}
            <div className="lg:col-span-2 space-y-5">
               <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                  <div className="p-6 space-y-6">
                     <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                           <FileText className="w-4 h-4" />
                        </div>
                        <h2 className="text-sm font-semibold text-slate-900">About the Role</h2>
                     </div>

                     <div
                        className="prose prose-sm max-w-none text-slate-600 leading-relaxed font-medium tiptap-preview px-1"
                        dangerouslySetInnerHTML={{ __html: job.description }}
                     />
                  </div>

                  {questions && questions.length > 0 && (
                     <div className="bg-slate-50/20 p-6 space-y-5 border-t border-slate-50">
                        <div className="flex items-center gap-3">
                           <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                              <Target className="w-4 h-4" />
                           </div>
                           <h2 className="text-sm font-semibold text-slate-900">Candidate Questions</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                           {questions.map((q: any, idx: number) => (
                              <div key={idx} className="p-4 rounded-2xl border border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-indigo-100/50">
                                 <div className="flex items-center gap-4">
                                    <span className="w-6 h-6 rounded-lg flex items-center justify-center bg-slate-50 text-[11px] font-semibold text-slate-400 border border-slate-100 shrink-0">
                                       {idx + 1}
                                    </span>
                                    <p className="text-[13px] font-semibold text-slate-800">
                                       {q.question}
                                    </p>
                                 </div>
                                 <div className="flex items-center gap-5 border-l border-slate-100 pl-5 shrink-0">
                                    <div className="space-y-0.5 text-right">
                                       <p className="text-[9px] font-medium text-slate-400 tracking-wider">Expected Answer</p>
                                       <span className="text-[12px] font-semibold text-indigo-600">{q.recruiter_answer}</span>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                  <DetailItem
                     label="Subject"
                     value={job.category?.name || "General"}
                     icon={Layers}
                     colorClass="bg-blue-50 text-blue-600 border-blue-100/50"
                  />
                  <DetailItem
                     label="Openings"
                     value={`${job.vacancies} Positions`}
                     icon={Users}
                     colorClass="bg-indigo-50 text-indigo-600 border-indigo-100/50"
                  />
                  <DetailItem
                     label="Monthly Salary"
                     value={`₹${(job.salary_min || '0').split('.')[0]} - ₹${(job.salary_max || '0').split('.')[0]}`}
                     icon={DollarSign}
                     colorClass="bg-emerald-50 text-emerald-600 border-emerald-100/50"
                  />
                  <DetailItem
                     label="Experience Required"
                     value={`${job.experience_required}y (${formatTerm(job.experience_type)})`}
                     icon={Briefcase}
                     colorClass="bg-purple-50 text-purple-600 border-purple-100/50"
                  />
                  <DetailItem
                     label="Home Page Featuring"
                     value={job.featured === 1 ? "Active" : "Standard"}
                     icon={TrendingUp}
                     colorClass={job.featured === 1 ? "bg-indigo-50 text-indigo-600 border-indigo-100/50" : "bg-slate-50 text-slate-400 border-slate-100/50"}
                  />
                  <DetailItem
                     label="Featured Deadline"
                     value={job.featured_until ? new Date(job.featured_until).toLocaleDateString('en-GB') : "No Deadline"}
                     icon={Clock}
                     colorClass="bg-rose-50 text-rose-600 border-rose-100/50"
                  />
                  <DetailItem
                     label="Admin Home Status"
                     value={job.admin_featured === 1 ? "Featured" : "Regular"}
                     icon={ShieldCheck}
                     colorClass={job.admin_featured === 1 ? "bg-amber-50 text-amber-600 border-amber-100/50" : "bg-slate-50 text-slate-400 border-slate-100/50"}
                  />
               </div>

               <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
                  <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Key Dates</h3>

                  <div className="space-y-4">
                     {[
                        { label: 'Posted on', value: new Date(job.created_at).toLocaleDateString('en-GB'), icon: Calendar, color: 'indigo' },
                        { label: 'Apply Before', value: job.deadline || job.application_deadline ? new Date(job.deadline || job.application_deadline).toLocaleDateString('en-GB') : "Not Specified", icon: Clock, color: 'rose' },
                        {
                           label: 'Post Status',
                           value: job.status === 'approved'
                              ? "Verified"
                              : job.status === 'rejected'
                                 ? "Rejected"
                                 : "Under Review",
                           color: job.status === 'approved'
                              ? 'emerald'
                              : job.status === 'rejected'
                                 ? 'rose'
                                 : 'amber',
                           icon: ShieldCheck
                        },
                        ...(job.featured === 1 ? [{ label: 'Featured on Home', value: 'Active', icon: TrendingUp, color: 'indigo' }] : []),
                        ...(job.admin_featured === 1 ? [{ label: 'Admin Featured', value: 'Active', icon: ShieldCheck, color: 'emerald' }] : []),
                     ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-4 group/item">
                           <div className="flex items-center gap-2.5">
                              <div className={cn(
                                 "w-7 h-7 rounded-lg flex items-center justify-center border border-transparent group-hover/item:border-current transition-all",
                                 item.color === 'indigo' && "bg-indigo-50 text-indigo-500",
                                 item.color === 'rose' && "bg-rose-50 text-rose-500",
                                 item.color === 'emerald' && "bg-emerald-50 text-emerald-500",
                                 item.color === 'amber' && "bg-amber-50 text-amber-500"
                              )}>
                                 <item.icon className="w-3.5 h-3.5" />
                              </div>
                              <p className="text-[12px] font-medium text-slate-500">{item.label}</p>
                           </div>
                           <p className="text-[12px] font-semibold text-slate-900">{item.value}</p>
                        </div>
                     ))}
                  </div>

                  <div className="pt-5 border-t border-slate-50 space-y-2">
                     {job.job_status !== 'filled' && (
                        <Button
                           onClick={() => handleAction('filled')}
                           disabled={!!loadingAction}
                           variant="outline"
                           className="w-full h-10 rounded-xl text-xs font-semibold text-emerald-600 border-emerald-100 bg-emerald-50/10 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                        >
                           {loadingAction === 'filled' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                           Mark as Filled
                        </Button>
                     )}

                     <Button
                        onClick={() => handleAction('delete')}
                        disabled={!!loadingAction}
                        variant="outline"
                        className="w-full h-10 rounded-xl text-xs font-semibold text-rose-500 border-rose-50 bg-rose-50/10 hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                     >
                        {loadingAction === 'delete' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Delete
                     </Button>
                     <Button
                        onClick={handleToggleFeatured}
                        disabled={!!loadingAction}
                        variant="outline"
                        className={cn(
                           "w-full h-10 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2",
                           job.featured === 1
                              ? "text-amber-600 border-amber-100 bg-amber-50/10 hover:bg-amber-50"
                              : "text-slate-600 border-slate-100 bg-slate-50/10 hover:bg-slate-50"
                        )}
                     >
                        {loadingAction === 'toggle-feature' ? (
                           <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                           <Star className={cn("w-4 h-4", job.featured === 1 ? "fill-amber-500 text-amber-500" : "text-slate-400")} />
                        )}
                        {job.featured === 1 ? "Featured" : "Mark as Featured"}
                     </Button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
