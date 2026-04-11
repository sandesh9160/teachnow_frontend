"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApplications } from "@/hooks/useApplications";
import { useProfile } from "@/hooks/useProfile";
import { 
  Loader2, 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  Building2, 
  // Calendar,
  // CheckCircle2,
  FileText,
  User,
  AlertCircle,
  GraduationCap,
  Clock,
  Eye
} from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { toast } from "sonner";
import { normalizeMediaUrl } from "@/services/api/client";
import Link from "next/link";

export default function ApplicationDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { getApplications, getApplication, withdrawApplication } = useApplications();
  const { getProfile } = useProfile();
  const [application, setApplication] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      
      // Step 1: Try specific GET (Future-proof)
      try {
        const detail = await getApplication(id as string);
        if (detail) {
          setApplication(detail);
          // Fetch profile separately
          try {
            const res = await getProfile();
            setProfileData(res?.data || res);
          } catch (e) {}
          setLoading(false);
          return;
        }
      } catch (err) {
        console.log("Specific GET failed, using fallback...");
      }

      // Step 2: Fallback to list filtering
      const data = await getApplications();
      const list = Array.isArray(data) ? data : (data as any)?.data || [];
      const found = list.find((a: any) => String(a.id) === String(id));
      
      if (found) {
        setApplication(found);
        try {
          const res = await getProfile();
          setProfileData(res?.data || res);
        } catch (e) {}
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

  const getStatusBadge = (status: any) => {
    const s = String(status || '').toLowerCase();
    if (s === 'accepted' || s === 'hired') return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === 'shortlisted') return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === 'rejected' || s === 'declined') return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4 md:px-0 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-600" />
          </button>
          <div>
             <h1 className="text-xl font-bold text-slate-800 tracking-tight">Application Review</h1>
             <p className="text-[11px] font-medium text-indigo-500">Tracking Reference: #{application.id}</p>
          </div>
        </div>
        <div className={`px-4 py-1.5 rounded-full border text-[11px] font-semibold shadow-sm ${getStatusBadge(application.status)}`}>
           {application.status || "Applied"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Overview Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />
            <div className="relative z-10 flex gap-5">
              <div className="h-16 w-16 shrink-0 bg-white border border-slate-100 rounded-2xl flex items-center justify-center p-2 shadow-sm">
                 {job?.employer?.company_logo ? (
                   <img src={normalizeMediaUrl(job.employer.company_logo)} alt="" className="h-full w-full object-contain" />
                 ) : (
                   <Building2 className="w-8 h-8 text-indigo-200" />
                 )}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-indigo-950 leading-tight">{job?.title}</h2>
                <p className="font-semibold text-indigo-600 text-sm tracking-wide">{job?.employer?.company_name}</p>
                <div className="flex items-center gap-4 pt-1">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    {job?.location}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                    {job?.job_type}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Description Preview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-indigo-50 pb-3">
               <div className="w-1 h-4 bg-indigo-600 rounded-full" />
               <h3 className="text-sm font-semibold text-slate-800">Role Requirements</h3>
            </div>
            <div 
              className="text-slate-700 text-sm leading-relaxed whitespace-pre-line rich-text font-normal"
              dangerouslySetInnerHTML={{ __html: job?.description }}
            />
          </div>

          {/* Candidate Info Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
             <div className="flex items-center gap-3 border-b border-indigo-50 pb-4">
                <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                   <User className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">Professional Submission</h3>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Job Title", value: application.job_title || profileData?.title || profileData?.headline || "—", color: "indigo" },
                  { label: "Experience", value: (application.experience || profileData?.experience_years || profileData?.years_of_experience) ? `${application.experience || profileData?.experience_years || profileData?.years_of_experience} Years` : "—", color: "emerald" },
                  { label: "Phone", value: application.phone || profileData?.phone || "—", color: "blue" },
                  { label: "Location", value: application.location || profileData?.location || "—", color: "slate" },
                  { label: "Email", value: application.email || profileData?.user?.email || "—", color: "slate", colSpan: 2 },
                  { label: "Portfolio", value: profileData?.portfolio_website || profileData?.portfolio_url || "—", color: "indigo", isLink: true, colSpan: 2 },
                ].map((item) => (
                  <div key={item.label} className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md active:scale-[0.98] flex flex-col justify-between shadow-sm
                    ${item.colSpan === 2 ? 'col-span-2' : ''}
                    ${item.color === 'indigo' ? 'bg-indigo-50/20 border-indigo-100 hover:border-indigo-200' : 
                      item.color === 'emerald' ? 'bg-emerald-50/20 border-emerald-100 hover:border-emerald-200' : 
                      item.color === 'blue' ? 'bg-blue-50/20 border-blue-100 hover:border-blue-200' : 
                      'bg-slate-50 border-slate-100 hover:border-slate-200'}`}>
                    <span className={`text-[10px] font-semibold mb-1 
                      ${item.color === 'indigo' ? 'text-indigo-600' : 
                        item.color === 'emerald' ? 'text-emerald-700' : 
                        item.color === 'blue' ? 'text-blue-600' : 
                        'text-slate-500'}`}>
                      {item.label}
                    </span>
                    {item.isLink && item.value !== "—" ? (
                      <a href={item.value.startsWith('http') ? item.value : `https://${item.value}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-indigo-700 hover:underline truncate block underline-offset-2">
                        {item.value || "Not Provided"}
                      </a>
                    ) : (
                      <p className={`text-xs font-semibold truncate
                        ${item.color === 'indigo' ? 'text-indigo-950' : 
                          item.color === 'emerald' ? 'text-emerald-950' : 
                          item.color === 'blue' ? 'text-blue-950' : 
                          'text-slate-900'}`}>
                        {item.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {(application.bio || profileData?.bio) && (
                <div className="pt-6 mt-4 border-t border-indigo-50 space-y-3">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-3 bg-indigo-600 rounded-full" />
                      <span className="block text-[11px] font-semibold text-slate-800">Personal Statement</span>
                   </div>
                   <p className="text-xs text-slate-600 leading-relaxed font-medium bg-indigo-50/30 p-4 rounded-xl border border-indigo-100 italic">
                     "{application.bio || profileData?.bio}"
                   </p>
                </div>
              )}
            </div>

            {/* Answers Section (Questionnaire) */}
            {(() => {
              const answers = application.answers || application.application_answers || application.applicationAnswers || application.candidate_answers || application.responses || [];
              const hasCoverLetter = application.cover_letter || application.letter;
              const displayAnswers = [...answers];
              if (hasCoverLetter && !displayAnswers.some(a => a.question_text?.toLowerCase().includes('cover letter'))) {
                displayAnswers.unshift({ question_text: "Cover Letter / Statement of Purpose", candidate_answer: hasCoverLetter });
              }

              if (displayAnswers.length === 0) return null;

              return (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-indigo-50 pb-4">
                    <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                       <FileText className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-semibold text-slate-800">Submitted Responses</h2>
                  </div>
                  <div className="space-y-6">
                     {displayAnswers.map((ans: any, idx: number) => (
                       <div key={idx} className="relative pl-6 space-y-3 group">
                         <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-100 group-hover:bg-amber-500/30 transition-colors rounded-full" />
                         <div className="space-y-1">
                            <p className="text-[10px] font-medium text-slate-400">Requirement {idx + 1}</p>
                            <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                              {ans.question?.question || ans.question?.question_text || ans.question_text || ans.question || "Requirement Detail"}
                            </p>
                         </div>
                         <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 shadow-inner">
                            <p className="text-[9px] font-bold text-amber-600 mb-1">Response</p>
                            <p className="text-xs font-medium text-slate-700 leading-relaxed whitespace-pre-line">
                              {ans.candidate_answer || ans.answer || ans.response || "No response provided."}
                            </p>
                         </div>
                       </div>
                     ))}
                  </div>
                </div>
              );
            })()}

          {/* Background & History */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-8">
             <div className="flex items-center gap-3 border-b border-indigo-50 pb-4">
                <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                   <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">Professional History</h3>
             </div>

             {/* Skills */}
             {((application.skills?.length > 0) || (profileData?.skills?.length > 0)) && (
               <div className="space-y-3">
                  <span className="block text-[11px] font-semibold text-slate-500">Skills Expertise</span>
                  <div className="flex flex-wrap gap-2">
                    {(application.skills?.length > 0 ? application.skills : (profileData?.skills || [])).map((skill: any, idx: number) => (
                      <span key={idx} className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-100">
                        {typeof skill === "object" ? (skill.name || skill.title) : skill}
                      </span>
                    ))}
                  </div>
               </div>
             )}

             {/* Combined History */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-indigo-50">
                {/* Education */}
                <div className="space-y-4">
                   <span className="block text-[11px] font-semibold text-slate-500">Education</span>
                   <div className="space-y-3">
                     {(application.educations?.length > 0 ? application.educations : (profileData?.educations || [])).slice(0, 3).map((edu: any, idx: number) => (
                       <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 shadow-sm relative overflow-hidden group">
                         <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-full" />
                         <p className="text-xs font-semibold text-slate-900 leading-tight">{edu.degree}</p>
                         <p className="text-[10px] font-medium text-emerald-700 mt-0.5">{edu.institution}</p>
                         <p className="text-[9px] text-slate-500 font-medium mt-1">{edu.start_year || "—"} - {edu.end_year || "Present"}</p>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Experience */}
                <div className="space-y-4">
                   <span className="block text-[11px] font-semibold text-slate-500">Work Experience</span>
                   <div className="space-y-3">
                     {(application.experiences?.length > 0 ? application.experiences : (profileData?.experiences || [])).slice(0, 3).map((exp: any, idx: number) => (
                       <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 shadow-sm relative overflow-hidden group">
                         <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-full" />
                         <p className="text-xs font-semibold text-slate-900 leading-tight">{exp.job_title}</p>
                         <p className="text-[10px] font-medium text-blue-700 mt-0.5">{exp.company_name}</p>
                         <p className="text-[9px] text-slate-500 font-medium mt-1">{exp.start_date ? new Date(exp.start_date).getFullYear() : "—"} - {exp.is_current ? "Present" : "Completed"}</p>
                       </div>
                     ))}
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Info (1/3) */}
        <div className="space-y-6">
          {/* Status Tracker */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-6">
            <h3 className="text-sm font-semibold text-slate-800 border-b border-indigo-50 pb-3">Status Monitor</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-indigo-50/20 rounded-xl border border-indigo-50 shadow-inner">
                 <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                       <Clock className="w-4 h-4" />
                    </div>
                    <div>
                       <p className="text-[10px] font-medium text-indigo-500">Submission Date</p>
                       <p className="text-xs font-semibold text-indigo-950">{new Date(application.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                    </div>
                 </div>
              </div>

              {job?.application_deadline && (
                <div className="flex items-center justify-between p-4 bg-rose-50/30 rounded-xl border border-rose-50 shadow-inner">
                   <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center text-rose-600 shadow-sm">
                         <AlertCircle className="w-4 h-4" />
                      </div>
                      <div>
                         <p className="text-[10px] font-medium text-rose-500">Final Deadline</p>
                         <p className="text-xs font-semibold text-rose-950">{new Date(job.application_deadline).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                      </div>
                   </div>
                </div>
              )}

              {/* Resume Card */}
              <div className="pt-2">
                 <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-600/20 space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700" />
                    <div className="relative z-10 flex items-center gap-4">
                       <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white">
                          <FileText className="w-5 h-5" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium text-indigo-100">Submitted Resume</p>
                          <p className="text-xs font-semibold text-white truncate">
                            {application.resume?.file_name || application.resume_name || "Official_Document.pdf"}
                          </p>
                       </div>
                    </div>
                    
                    {(application.resume?.url || application.resume?.pdf_path || profileData?.resume?.url) && (
                      <a 
                        href={normalizeMediaUrl(application.resume?.url || application.resume?.pdf_path || profileData?.resume?.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full h-9 bg-white rounded-lg text-xs font-semibold text-indigo-700 hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Access Document
                      </a>
                    )}
                 </div>
              </div>
            </div>
          </div>

          {/* Critical Actions */}
          <div className="space-y-3">
             <Link href="/jobs" className="block">
                <button className="w-full h-11 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 hover:bg-indigo-50 hover:border-indigo-300 transition-all active:scale-95 shadow-sm">
                   Explore Similar Roles
                </button>
             </Link>
             
             <button 
                onClick={() => {
                  toast("Withdraw this application?", {
                    action: {
                      label: "Withdraw",
                      onClick: () => {
                        withdrawApplication(id as string)
                          .then(() => {
                            toast.success("Application Withdrawn");
                            router.push('/dashboard/jobseeker/applied-jobs');
                          })
                          .catch(() => toast.error("Failed to withdraw application"));
                      }
                    }
                  });
                }}
                className="w-full h-11 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-100 hover:border-rose-300 transition-all active:scale-95 shadow-sm"
             >
                Withdraw Submission
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
