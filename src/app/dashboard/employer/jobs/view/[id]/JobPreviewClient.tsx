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
   Loader2
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { cn } from "@/lib/utils";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import { toast } from "sonner";

interface JobPreviewClientProps {
   data: {
      job: any;
      questions?: any[];
   };
}

export default function JobPreviewClient({ data }: JobPreviewClientProps) {
   const { job, questions = [] } = data;
   const [loadingAction, setLoadingAction] = useState<string | null>(null);

   const handleAction = async (type: 'filled' | 'delete') => {
      const actionLabel = type === 'filled' ? 'mark this job as filled' : 'permanently delete this job';

      toast(`Are you sure you want to ${actionLabel}?`, {
         action: {
            label: type === 'filled' ? 'Mark Filled' : 'Delete',
            onClick: async () => {
               const endpoint = type === 'filled'
                  ? `employer/jobs/${job.id}/filled`
                  : `employer/jobs/delete/${job.id}`;

               setLoadingAction(type);
               try {
                  const res = await dashboardServerFetch(endpoint, {
                     method: type === 'filled' ? "PUT" : "POST",
                     data: {}
                  });

                  if (res.status === true) {
                     toast.success(res.message || `Job ${type === 'filled' ? 'closed' : 'deleted'} successfully.`);
                     setTimeout(() => {
                        window.location.href = "/dashboard/employer/jobs";
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
                     <ChevronLeft className="w-3.5 h-3.5" /> Back to job list
                  </button>

                  <div className="space-y-2">
                     <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 leading-tight">{job.title}</h1>
                     <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                           <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {job.location}
                        </span>
                        <span className="text-[12px] font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100/50">
                           {job.job_type?.replace('_', ' ')}
                        </span>
                        <span className={cn(
                           "px-3 py-1 rounded-lg text-[10px] font-bold border whitespace-nowrap",
                           job.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                        )}>
                           {job.status === 'approved' ? "Approved" : "Pending Approval"}
                        </span>
                        <span className={cn(
                           "px-3 py-1 rounded-lg text-[10px] font-bold border whitespace-nowrap",
                           job.job_status === 'open' ? "bg-indigo-600 text-white border-indigo-700" :
                              job.job_status === 'filled' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                 "bg-slate-50 text-slate-400 border-slate-100"
                        )}>
                           {job.job_status === 'open' ? "Live" : job.job_status}
                        </span>
                     </div>
                  </div>
               </div>

               <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/dashboard/employer/jobs/view/${job.id}/applicants`}>
                     <Button variant="outline" className="h-10 px-5 rounded-xl text-xs font-semibold text-slate-700 border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-500" /> View Applicants
                     </Button>
                  </Link>
                  {job.job_status !== 'filled' && (
                     <Link href={`/dashboard/employer/jobs/edit/${job.id}`}>
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
                           <h2 className="text-sm font-semibold text-slate-900">Job Description</h2>
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
                              <h2 className="text-sm font-semibold text-slate-900">Screening Questions</h2>
                           </div>
                           <div className="grid grid-cols-1 gap-3">
                              {questions.map((q, idx) => (
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
                                          <p className="text-[9px] font-medium text-slate-400 tracking-wider">Ideal answer</p>
                                          <span className="text-[12px] font-semibold text-indigo-600 capitalize">{q.recruiter_answer}</span>
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
                        label="Category"
                        value={job.category?.name || "General"}
                        icon={Layers}
                        colorClass="bg-blue-50 text-blue-600 border-blue-100/50"
                     />
                     <DetailItem
                        label="Available Positions"
                        value={`${job.vacancies} Vacancies`}
                        icon={Users}
                        colorClass="bg-indigo-50 text-indigo-600 border-indigo-100/50"
                     />
                     <DetailItem
                        label="Offered Salary"
                        value={`₹${(job.salary_min || '0').split('.')[0]} - ₹${(job.salary_max || '0').split('.')[0]}`}
                        icon={DollarSign}
                        colorClass="bg-emerald-50 text-emerald-600 border-emerald-100/50"
                     />
                     <DetailItem
                        label="Required Experience"
                        value={`${job.experience_required}y (${job.experience_type})`}
                        icon={Briefcase}
                        colorClass="bg-purple-50 text-purple-600 border-purple-100/50"
                     />
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
                     <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Job Milestones</h3>

                     <div className="space-y-4">
                        {[
                           { label: 'Posted Date', value: new Date(job.created_at).toLocaleDateString('en-GB'), icon: Calendar, color: 'indigo' },
                           { label: 'Application Deadline', value: job.deadline || job.application_deadline ? new Date(job.deadline || job.application_deadline).toLocaleDateString('en-GB') : "Not Specified", icon: Clock, color: 'rose' },
                           { label: 'Platform Approval', value: job.status === 'approved' ? "Verified" : "Under Review", icon: ShieldCheck, color: job.status === 'approved' ? 'emerald' : 'amber' },
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
                              Mark Position Filled
                           </Button>
                        )}

                        <Button
                           onClick={() => handleAction('delete')}
                           disabled={!!loadingAction}
                           variant="outline"
                           className="w-full h-10 rounded-xl text-xs font-semibold text-rose-500 border-rose-50 bg-rose-50/10 hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                        >
                           {loadingAction === 'delete' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                           Delete Listing
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         );
}
