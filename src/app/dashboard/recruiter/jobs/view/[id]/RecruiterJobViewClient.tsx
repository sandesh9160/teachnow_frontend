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
   const now = new Date();

   // Core logic for featuring
   const isActuallyFeatured = job.featured === 1 && job.admin_featured === 1 && (!job.featured_until || new Date(job.featured_until) >= now);
   const isAwaitingFeatured = job.featured === 1 && job.admin_featured !== 1;
   const isExpiredFeatured = job.featured === 1 && job.featured_until && new Date(job.featured_until) < now;

   const formatTerm = (term: string) => {
      if (!term) return "";
      return term.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
   };

   const handleToggleFeatured = async () => {
      setLoadingAction('toggle-feature');
      try {
         const endpoint = `recruiter/job/${job.id}/toggle-feature`;
         const res = await dashboardServerFetch(endpoint, { method: "POST" });
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
      const actionLabel = type === 'filled' ? 'mark this job as filled' : type === 'delete' ? 'permanently delete this job' : 'republish this job';

      toast(`Are you sure you want to ${actionLabel}?`, {
         description: type === 'delete' ? "This action cannot be undone." : "This will update the job's current status.",
         duration: 5000,
         action: {
            label: type === 'filled' ? 'Mark Filled' : type === 'republish' ? 'Republish' : 'Delete Job',
            onClick: async () => {
               const endpoint = type === 'filled' ? `recruiter/jobs/${job.id}/filled` : type === 'republish' ? `recruiter/jobs/${job.id}/republish` : `recruiter/jobs/delete/${job.id}`;
               setLoadingAction(type);
               try {
                  const method = type === 'delete' ? "DELETE" : "PUT";
                  const res = await dashboardServerFetch(endpoint, { method, data: {} });
                  if (res.status === true) {
                     toast.success(res.message || `Job action successful.`, { style: { borderLeft: '4px solid #10b981' } });
                     setTimeout(() => { window.location.href = `${basePath}/jobs`; }, 1500);
                  } else {
                     toast.error(res.message || "Something went wrong.");
                  }
               } catch (error) {
                  toast.error("An unexpected error occurred.");
               } finally {
                  setLoadingAction(null);
               }
            }
         },
         cancel: {
            label: 'Keep it',
            onClick: () => { }
         }
      });
   };

   const DetailItem = ({ label, value, icon: Icon, colorClass }: any) => (
      <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-50 bg-white shadow-xs transition-all hover:shadow-sm group">
         <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105",
            colorClass || "bg-indigo-50/50 text-indigo-500 border-indigo-100/50"
         )}>
            <Icon className="w-4 h-4" />
         </div>
         <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-500 mb-0.5">{label}</p>
            <p className="text-[13px] font-semibold text-slate-900 leading-tight truncate">{value}</p>
         </div>
      </div>
   );

   return (
      <div className="max-w-6xl mx-auto px-4 py-4 space-y-4 pb-20 font-sans text-slate-800">

         {/* Ultra-Compact Professional Header */}
         <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all hover:border-indigo-100/50">
            <div className="space-y-3 flex-1">
               <button onClick={() => window.history.back()} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-all">
                  <ChevronLeft className="w-3.5 h-3.5" /> Back to Directory
               </button>

               <div className="space-y-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-1.5">
                     <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        <MapPin className="w-3 h-3 text-indigo-400" /> {job.location}
                     </span>
                     <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100/30">
                        {formatTerm(job.job_type)}
                     </span>
                  </div>
               </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Link href={`${basePath}/jobs/view/${job.id}/applicants`}>
                  <Button variant="outline" className="h-9 px-4 rounded-xl text-[12px] font-semibold text-indigo-600 bg-white border-indigo-100 hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-xs">
                     <Users className="w-4 h-4" /> View Applicants {totalApplications > 0 && `(${totalApplications})`}
                  </Button>
               </Link>

               {job.status === 'approved' ? (
                  <Link href={`/jobs/${job.slug}`} target="_blank">
                     <Button className="h-9 px-5 rounded-xl text-[12px] font-semibold bg-[#312E81] text-white hover:bg-[#1E1B4B] shadow-sm flex items-center gap-2">
                        Live View <ExternalLink className="w-3.5 h-3.5" />
                     </Button>
                  </Link>
               ) : (
                  <Button 
                     onClick={() => toast.warning("Not Live Yet", {
                        description: "This job is waiting for approval. It will be live soon!",
                        style: { borderLeft: '4px solid #f59e0b' }
                     })}
                     className="h-9 px-5 rounded-xl text-[12px] font-semibold bg-slate-100 text-slate-400 border-slate-200 shadow-none flex items-center gap-2 hover:bg-slate-200 transition-colors"
                  >
                     Live View <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
               )}

               {job.job_status === 'expired' && (
                  <Button
                     onClick={() => handleAction('republish')}
                     disabled={loadingAction === 'republish'}
                     className="h-9 px-5 rounded-xl text-[12px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm"
                  >
                     {loadingAction === 'republish' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                     Republish Job
                  </Button>
               )}

               {job.job_status !== 'filled' && job.job_status !== 'expired' && (
                  <Link href={`${basePath}/jobs/edit/${job.id}`}>
                     <Button variant="outline" className="h-9 px-4 rounded-xl text-[12px] font-semibold text-slate-600 border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-indigo-400" /> Edit
                     </Button>
                  </Link>
               )}
            </div>
         </div>

         {/* User-Friendly Status Hub */}
         <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
               </div>
               <div className="space-y-1 flex-1">
                  <h3 className="text-[15px] font-bold text-slate-900">Requirement Status Hub</h3>
                  <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                     {job.status === 'approved'
                        ? "Your requirement has been verified and is currently live for candidates to apply."
                        : "Your requirement is currently under review by our moderation team to ensure it meets our quality standards."}
                     {isAwaitingFeatured && " Additionally, your promotion request for this requirement is currently awaiting administrative approval."}
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
               <div className={cn(
                  "p-4 rounded-xl border flex items-center gap-4 transition-all",
                  job.status === 'approved' ? "bg-emerald-50/30 border-emerald-100" : "bg-amber-50/30 border-amber-100"
               )}>
                  <div className={cn(
                     "w-9 h-9 rounded-xl flex items-center justify-center border",
                     job.status === 'approved' ? "bg-white text-emerald-600 border-emerald-100" : "bg-white text-amber-600 border-amber-100"
                  )}>
                     <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                     <p className="text-[11px] font-bold text-slate-400 leading-none mb-1">Job Verification</p>
                     <p className={cn("text-[13px] font-bold", job.status === 'approved' ? "text-emerald-700" : "text-amber-700")}>
                        {job.status === 'approved' ? "Verified & Active" : "Pending Review"}
                     </p>
                  </div>
               </div>

               <div className={cn(
                  "p-4 rounded-xl border flex items-center gap-4 transition-all",
                  isActuallyFeatured ? "bg-indigo-50/50 border-indigo-100" : isAwaitingFeatured ? "bg-amber-50/30 border-amber-100" : "bg-slate-50/30 border-slate-100"
               )}>
                  <div className={cn(
                     "w-9 h-9 rounded-xl flex items-center justify-center border bg-white",
                     isActuallyFeatured ? "text-indigo-600 border-indigo-200" : isAwaitingFeatured ? "text-amber-600 border-amber-100" : "text-slate-400 border-slate-100"
                  )}>
                     <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                     <p className="text-[11px] font-bold text-slate-400 leading-none mb-1">Home Featuring</p>
                     <p className={cn("text-[13px] font-bold", isActuallyFeatured ? "text-indigo-700" : isAwaitingFeatured ? "text-amber-700" : "text-slate-500")}>
                        {isActuallyFeatured ? "Active Promotion" : isAwaitingFeatured ? "Awaiting Approval" : "Standard Posting"}
                     </p>
                  </div>
               </div>

               {isActuallyFeatured && job.featured_until && (
                  <div className="p-4 rounded-xl border bg-rose-50/30 border-rose-100 flex items-center gap-4">
                     <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-white text-rose-500 border-rose-100">
                        <Clock className="w-4 h-4" />
                     </div>
                     <div>
                        <p className="text-[11px] font-bold text-slate-400 leading-none mb-1">Promotion Expiry</p>
                        <p className="text-[13px] font-bold text-rose-700">
                           {new Date(job.featured_until).toLocaleDateString('en-GB')}
                        </p>
                     </div>
                  </div>
               )}
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
               <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 space-y-5">
                     <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                           <FileText className="w-4 h-4" />
                        </div>
                        <h2 className="text-[13px] font-bold text-slate-900">Requirement Overview</h2>
                     </div>

                     <div
                        className="prose prose-sm max-w-none text-slate-600 leading-relaxed font-medium tiptap-preview px-1"
                        dangerouslySetInnerHTML={{ __html: job.description }}
                     />
                  </div>

                  {questions && questions.length > 0 && (
                     <div className="bg-slate-50/30 p-6 space-y-4 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                              <Target className="w-4 h-4" />
                           </div>
                           <h2 className="text-[13px] font-bold text-slate-900">Questionnaire</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                           {questions.map((q: any, idx: number) => (
                              <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-indigo-100/50">
                                 <div className="flex items-center gap-3">
                                    <span className="w-5 h-5 rounded-lg flex items-center justify-center bg-slate-50 text-[10px] font-bold text-slate-400 border border-slate-100 shrink-0">
                                       {idx + 1}
                                    </span>
                                    <p className="text-[12.5px] font-semibold text-slate-800">{q.question}</p>
                                 </div>
                                 <div className="flex items-center gap-4 sm:border-l sm:border-slate-100 sm:pl-4 shrink-0">
                                    <div className="text-right">
                                       <p className="text-[9px] font-bold text-slate-400 leading-none mb-1">Answer</p>
                                       <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded-lg border border-indigo-100/30">{q.recruiter_answer}</span>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>

            <div className="space-y-4">
               <div className="grid grid-cols-1 gap-2.5">
                  <DetailItem label="Subject" value={job.category?.name || "General"} icon={Layers} colorClass="bg-blue-50 text-blue-600 border-blue-100/50" />
                  <DetailItem label="Openings" value={`${job.vacancies} Positions`} icon={Users} colorClass="bg-indigo-50 text-indigo-600 border-indigo-100/50" />
                  <DetailItem 
                     label="Monthly Salary" 
                     value={
                        (!job.salary_min || job.salary_min === "null" || job.salary_min === "0") && 
                        (!job.salary_max || job.salary_max === "null" || job.salary_max === "0")
                        ? "Salary Undisclosed" 
                        : `₹${(job.salary_min && job.salary_min !== "null" ? job.salary_min : "0").split('.')[0]} - ₹${(job.salary_max && job.salary_max !== "null" ? job.salary_max : "0").split('.')[0]}`
                     } 
                     icon={DollarSign} 
                     colorClass="bg-emerald-50 text-emerald-600 border-emerald-100/50" 
                  />
                  <DetailItem label="Experience" value={`${job.experience_required}y (${formatTerm(job.experience_type)})`} icon={Briefcase} colorClass="bg-purple-50 text-purple-600 border-purple-100/50" />
                  <DetailItem
                     label="Home Featuring"
                     value={isActuallyFeatured ? "Active" : isAwaitingFeatured ? "Pending" : isExpiredFeatured ? "Expired" : "Standard"}
                     icon={TrendingUp}
                     colorClass={isActuallyFeatured ? "bg-[#312E81] text-white border-indigo-700 shadow-sm" : isAwaitingFeatured ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-slate-50 text-slate-400 border-slate-100/50"}
                  />
                  {job.featured_until && (
                     <DetailItem label="Feature Expiry" value={new Date(job.featured_until).toLocaleDateString('en-GB')} icon={Clock} colorClass="bg-rose-50 text-rose-600 border-rose-100/50" />
                  )}
                  <DetailItem
                     label="Admin Home Status"
                     value={job.admin_featured === 1 ? "Featured" : "Regular"}
                     icon={ShieldCheck}
                     colorClass={job.admin_featured === 1 ? "bg-amber-50 text-amber-600 border-amber-100/50" : "bg-slate-50 text-slate-400 border-slate-100/50"}
                  />
               </div>

               <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                  <h3 className="text-[10px] font-bold text-slate-400 border-b border-slate-50 pb-3">Actions & Timeline</h3>

                  <div className="space-y-3">
                     {[
                        { label: 'Posted on', value: new Date(job.created_at).toLocaleDateString('en-GB'), icon: Calendar, color: 'indigo' },
                        { label: 'Deadline', value: job.deadline || job.application_deadline ? new Date(job.deadline || job.application_deadline).toLocaleDateString('en-GB') : "Not Specified", icon: Clock, color: 'rose' },
                     ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-4">
                           <div className="flex items-center gap-2.5">
                              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center bg-slate-50 text-slate-400 border border-slate-100")}>
                                 <item.icon className="w-3.5 h-3.5" />
                              </div>
                              <p className="text-[11px] font-bold text-slate-500 tracking-tight">{item.label}</p>
                           </div>
                           <p className="text-[12px] font-semibold text-slate-900">{item.value}</p>
                        </div>
                     ))}
                  </div>

                  <div className="pt-4 border-t border-slate-50 space-y-2">
                     {job.job_status !== 'filled' && (
                        <Button
                           onClick={() => handleAction('filled')}
                           disabled={!!loadingAction}
                           variant="outline"
                           className="w-full h-9 rounded-xl text-[11px] font-bold text-emerald-600 border-emerald-100 bg-white hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 shadow-xs"
                        >
                           {loadingAction === 'filled' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                           Mark as Filled
                        </Button>
                     )}

                     <Button
                        onClick={() => handleAction('delete')}
                        disabled={!!loadingAction}
                        variant="outline"
                        className="w-full h-9 rounded-xl text-[11px] font-bold text-rose-500 border-rose-50 bg-white hover:bg-rose-50 transition-all flex items-center justify-center gap-2 shadow-xs"
                     >
                        {loadingAction === 'delete' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        Delete Requirement
                     </Button>

                     <Button
                        onClick={handleToggleFeatured}
                        disabled={loadingAction === 'toggle-feature' || (isActuallyFeatured) || isAwaitingFeatured}
                        variant="outline"
                        className={cn(
                           "w-full h-9 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-2 shadow-xs",
                           isActuallyFeatured ? "text-indigo-600 border-indigo-100 bg-indigo-50/30 cursor-default" :
                              isAwaitingFeatured ? "text-amber-600 border-amber-100 bg-amber-50/30 cursor-default" :
                                 "text-slate-600 border-slate-100 bg-white hover:bg-slate-50"
                        )}
                     >
                        {loadingAction === 'toggle-feature' ? (
                           <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                           <Star className={cn("w-3.5 h-3.5", isActuallyFeatured ? "fill-amber-500 text-amber-500" : "text-slate-400")} />
                        )}
                        {isActuallyFeatured ? "Featured" : isAwaitingFeatured ? "Awaiting Admin" : "Feature on Home"}
                     </Button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
