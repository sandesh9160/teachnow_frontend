"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApplications } from "@/hooks/useApplications";
import { 
  Loader2, 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  Building2, 
  Calendar,
  CheckCircle2,
  FileText,
  User,
  AlertCircle
} from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { toast } from "sonner";
import { normalizeMediaUrl } from "@/services/api/client";
import Link from "next/link";

export default function ApplicationDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { getApplications } = useApplications();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await getApplications();
      const list = Array.isArray(data) ? data : [];
      const found = list.find((a: any) => String(a.id) === String(id));
      
      if (found) {
        setApplication(found);
      } else {
        toast.error("Application details not found.");
      }
    } catch (error) {
      toast.error("Failed to load application details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary/20" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Details...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-6">
        <div className="bg-rose-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
           <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Application Not Found</h2>
        <Button onClick={() => router.back()} variant="outline" className="rounded-xl">Go Back</Button>
      </div>
    );
  }

  const job = application.job;

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'accepted' || s === 'hired') return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === 'shortlisted') return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === 'rejected' || s === 'declined') return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 px-4 md:px-0 pt-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
           <h1 className="text-xl font-bold text-slate-800">Application Details</h1>
           <p className="text-[11px] font-bold text-slate-400 uppercase">Submission ID: #{application.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Overview Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex gap-5">
              <div className="h-16 w-16 shrink-0 bg-white border border-slate-100 rounded-2xl flex items-center justify-center p-2 shadow-sm">
                 {job?.employer?.company_logo ? (
                   <img src={normalizeMediaUrl(job.employer.company_logo)} alt="" className="h-full w-full object-contain" />
                 ) : (
                   <Building2 className="w-8 h-8 text-slate-200" />
                 )}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 leading-tight">{job?.title}</h2>
                <p className="font-bold text-primary">{job?.employer?.company_name}</p>
                <div className="flex items-center gap-4 pt-1">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <MapPin className="w-4 h-4 text-slate-300" />
                    {job?.location}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <Briefcase className="w-4 h-4 text-slate-300" />
                    {job?.job_type}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Description Preview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-4">Job Description</h3>
            <div 
              className="text-slate-600 text-sm leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: job?.description }}
            />
          </div>

          {/* Answers Section (Questionnaire) */}
          {(() => {
            const answers = application.answers || application.application_answers || application.responses || [];
            if (answers.length === 0) return null;

            return (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                     <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Recruiter Questionnaire</h3>
                </div>
                <div className="space-y-8">
                   {answers.map((ans: any, idx: number) => (
                     <div key={idx} className="relative pl-6 space-y-3 group">
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-100 group-hover:bg-primary/20 transition-colors rounded-full" />
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Question {idx + 1}</p>
                          <p className="text-sm font-bold text-slate-700 leading-relaxed">
                            {ans.question?.question_text || ans.question_text || "Requirement Question"}
                          </p>
                       </div>
                       <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-100">
                          <p className="text-[10px] font-bold text-indigo-400 uppercase mb-2">Your Response</p>
                          <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-line">
                            {ans.candidate_answer || ans.answer || "No response provided."}
                          </p>
                       </div>
                     </div>
                   ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Sidebar Info (1/3) */}
        <div className="space-y-6">
          {/* Status Tracker */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Status</h3>
            <div className={`p-4 rounded-2xl border-2 flex items-center gap-4 ${getStatusBadge(application.status)}`}>
               <div className="h-10 w-10 rounded-full bg-white/50 flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-xs font-bold opacity-70 uppercase tracking-wider">Current Status</p>
                  <p className="text-sm font-black uppercase">{application.status || "Applied"}</p>
               </div>
            </div>
            
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                 <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-slate-400" />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Submission Date</p>
                    <p className="text-xs font-bold text-slate-700">{new Date(application.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                 </div>
              </div>

               <div className="flex items-center gap-3">
                 <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-slate-400" />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Resume Attached</p>
                    <p className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{application.resume?.file_name || "AI Generated Resume"}</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100 space-y-4">
             <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5" />
             </div>
             <div className="space-y-1">
                <h4 className="text-sm font-bold">Contact Recruiter</h4>
                <p className="text-xs text-indigo-100 opacity-80 leading-relaxed font-medium">Once a recruiter reviews your application, they may reach out via the portal or your registered email.</p>
             </div>
             <Link href="/jobs" className="block">
                <button className="w-full h-10 bg-white text-indigo-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                   Browse Similar Roles
                </button>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
