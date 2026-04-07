"use client";

import { useState } from "react";
import { 
  Users, 
  MapPin, 
  Calendar, 
  Search, 
  FileText,
  Briefcase,
  X,
  Eye,
  Download,
  CheckCircle2,
  Clock,
  Loader2
} from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import { toast } from "sonner";

const STORAGE_BASE_URL = "https://teachnowbackend.jobsvedika.in/";

interface Application {
  id: number;
  job_id: number;
  job_seeker_id: number;
  resume_id: number;
  status: string;
  created_at: string;
  job: {
    id: number;
    title: string;
    job_status: string;
  };
  job_seeker: {
    id: number;
    user_id: number;
    title: string;
    phone: string;
    location: string;
    experience_years: number;
    bio: string;
    profile_photo: string;
    user: {
      id: number;
      name: string;
      email: string;
    }
  };
  resume?: {
    id: number;
    file_name: string;
    file_url: string;
  };
}

interface ApplicantsClientProps {
  initialData?: {
    status: boolean;
    data: {
      data: Application[];
    };
  };
}

const StatusBadge = ({ status }: { status: string }) => {
  const s = status?.toLowerCase() || "";
  
  const styles: Record<string, string> = {
    shortlisted: "bg-indigo-50 text-indigo-600 border-indigo-100",
    interview: "bg-purple-50 text-purple-600 border-purple-100",
    rejected: "bg-rose-50 text-rose-600 border-rose-100",
    contacted: "bg-emerald-50 text-emerald-600 border-emerald-100",
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    default: "bg-slate-50 text-slate-400 border-slate-100"
  };

  const currentStyle = styles[s] || styles.default;
  
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-[9px] font-bold tracking-tight uppercase border shadow-sm",
      currentStyle
    )}>
      {status}
    </span>
  );
};

export default function ApplicantsClient({ initialData }: ApplicantsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'shortlisted' | 'interview' | 'rejected'>('all');
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [showPhone, setShowPhone] = useState(false);

  const [apps, setApps] = useState<Application[]>((initialData as any)?.data?.data || (initialData as any)?.data || []);
  const [loading, setLoading] = useState<number | null>(null); // application id being updated

  const filteredApps = apps.filter((app) => {
    const fullName = (app.job_seeker?.user?.name || "").toLowerCase();
    const jobTitle = (app.job?.title || "").toLowerCase();
    const seekerTitle = (app.job_seeker?.title || "").toLowerCase();
    
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                         jobTitle.includes(searchTerm.toLowerCase()) ||
                         seekerTitle.includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && app.status?.toLowerCase() === activeTab;
  });

  const getCandidateName = (app: Application) => app.job_seeker?.user?.name || "Applicant";

  const getCandidateInitial = (app: Application) => {
    const name = getCandidateName(app);
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0]?.toUpperCase() || "A";
  };

  const getFullUrl = (path: string | undefined) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${STORAGE_BASE_URL}${cleanPath}`;
  };

  const updateStatus = async (appId: number, status: string) => {
    setLoading(appId);
    try {
      const res = await dashboardServerFetch("employer/applications/update-status", {
        method: "POST",
        data: { application_id: appId, status }
      });

      if (res.status) {
        setApps(prev => prev.map(app => 
          app.id === appId ? { ...app, status } : app
        ));
        if (selectedApplicant?.id === appId) {
          setSelectedApplicant(prev => prev ? { ...prev, status } : null);
        }
        toast.success(`Status updated to ${status}`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4 overflow-x-hidden">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Applicants</h1>
          <p className="text-xs text-gray-400 font-medium tracking-tight uppercase">Manage institution candidate pool</p>
        </div>
      </div>

      {/* High-Density Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {[
          { label: "Total Apps", value: apps.length, icon: Users, color: "blue" },
          { label: "Shortlisted", value: apps.filter(a => a.status?.toLowerCase() === 'shortlisted').length, icon: CheckCircle2, color: "emerald" },
          { label: "Interviews", value: apps.filter(a => a.status?.toLowerCase() === 'interview').length, icon: Calendar, color: "indigo" },
        ].map((s, i) => (
          <div key={i} className={cn(
             "bg-white p-3 md:p-4 rounded-xl border shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow",
             i === 2 && "col-span-2 md:col-span-1"
          )}>
            <div className={cn(
               "w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border",
               s.color === 'blue' && "bg-blue-50 text-blue-600 border-blue-100",
               s.color === 'emerald' && "bg-emerald-50 text-emerald-600 border-emerald-100",
               s.color === 'indigo' && "bg-indigo-50 text-indigo-600 border-indigo-100",
            )}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{s.label}</p>
              <h3 className="text-lg font-bold text-slate-900 leading-none">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="bg-white p-2 rounded-xl border shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
         <div className="flex-1 w-full lg:max-w-xs relative scale-[0.98]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by name or job..." 
              className="h-8.5 pl-10 border-transparent bg-gray-50/50 focus:bg-white rounded-lg text-xs font-bold focus:ring-1 focus:ring-primary/10" 
            />
         </div>

         <div className="flex items-center gap-1 bg-gray-50/50 p-1 rounded-xl border border-gray-100 font-bold overflow-x-auto no-scrollbar max-w-full">
            {[
              { id: 'all', label: 'All' },
              { id: 'shortlisted', label: 'Shortlisted' },
              { id: 'interview', label: 'Interview' },
              { id: 'rejected', label: 'Rejected' },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all whitespace-nowrap",
                  activeTab === tab.id 
                  ? "bg-white text-primary shadow-sm border border-gray-100" 
                  : "text-gray-400 hover:text-gray-600"
                )}
              >
                {tab.label} {tab.id === 'all' && `(${apps.length})`}
              </button>
            ))}
         </div>
      </div>

      {/* Applicants List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredApps.length > 0 ? (
          filteredApps.map((app) => (
            <div 
              key={app.id} 
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-3.5 md:p-4 flex flex-col md:flex-row gap-4 relative group overflow-hidden"
            >
              <div className="flex gap-4 items-start flex-1 min-w-0">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0 overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                  {app.job_seeker?.profile_photo ? (
                    <img 
                      src={getFullUrl(app.job_seeker.profile_photo)} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as any).parentNode.innerHTML = `<div class="flex items-center justify-center h-full w-full">${getCandidateInitial(app)}</div>`;
                      }}
                    />
                  ) : getCandidateInitial(app)}
                </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-primary transition-colors truncate uppercase tracking-tight">
                        {getCandidateName(app)}
                        <span className="text-slate-300 font-medium mx-1.5 opacity-50">•</span>
                        <span className="text-[10px] font-bold text-slate-400 italic lowercase tracking-tight">{app.job_seeker?.title || "Teacher"}</span>
                      </h3>
                      {app.status && <StatusBadge status={app.status} />}
                    </div>
                    <p className="text-[11px] font-bold text-gray-500 leading-tight uppercase tracking-tight">
                      Applied for <span className="text-primary">{app.job?.title}</span>
                    </p>
                  
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight"><MapPin className="w-3 h-3 text-slate-300" /> {app.job_seeker?.location || "India"}</span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight"><Briefcase className="w-3 h-3 text-slate-300" /> {app.job_seeker?.experience_years || "0"}y Exp</span>
                    <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight"><Clock className="w-3 h-3 text-slate-300" /> {app.created_at ? formatDistanceToNow(new Date(app.created_at)) : 'Now'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-4">
                <Button 
                   variant="outline" 
                   className="flex-1 md:flex-none h-8.5 px-4 rounded-lg text-[10px] font-bold text-slate-500 border-slate-100 hover:bg-slate-50 flex items-center justify-center gap-2 uppercase tracking-tight"
                   onClick={() => {
                     const resumeUrl = getFullUrl(app.resume?.file_url);
                     if (resumeUrl) window.open(resumeUrl, '_blank');
                   }}
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" /> Resume
                </Button>
                <Button 
                   className="flex-1 md:flex-none h-8.5 px-4 rounded-lg text-[10px] font-bold shadow-sm flex items-center justify-center gap-2 uppercase tracking-tight"
                   onClick={() => {
                     setSelectedApplicant(app);
                   }}
                >
                  <Eye className="w-3.5 h-3.5" /> View Detail
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 py-16 flex flex-col items-center justify-center text-center gap-4">
             <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-200">
                <Users className="w-8 h-8" />
             </div>
             <div className="space-y-1">
                <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">No candidates found</p>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">Try adjusting your filters to find applicants.</p>
             </div>
          </div>
        )}
      </div>

      {/* Responsive Profile Sidebar */}
      <AnimatePresence>
        {selectedApplicant && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApplicant(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-60"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:max-w-xl bg-white shadow-2xl z-70 flex flex-col"
            >
              <div className="sticky top-0 bg-white border-b z-30 px-5 py-4 flex items-center justify-between">
                <div className="flex flex-col">
                    <h2 className="text-[15px] font-bold text-slate-900 leading-none mb-1 uppercase tracking-tight">{getCandidateName(selectedApplicant)}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CANDIDATE DOSSIER</p>
                </div>
                <div className="flex items-center">
                   <button 
                      onClick={() => {
                        setSelectedApplicant(null);
                        setShowPhone(false);
                      }} 
                      className="p-1.5 hover:bg-slate-50 rounded-full transition-colors text-slate-300 hover:text-slate-900"
                   >
                    <X className="w-5 h-5" />
                   </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6 space-y-6 pb-28">
                  {/* AVATAR SECTION */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl shrink-0 overflow-hidden shadow-inner shadow-indigo-100/50">
                      {selectedApplicant.job_seeker?.profile_photo ? (
                        <img src={getFullUrl(selectedApplicant.job_seeker.profile_photo)} alt="Profile" className="w-full h-full object-cover" />
                      ) : getCandidateInitial(selectedApplicant)}
                    </div>
                    <div className="pt-0.5">
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-xl font-bold text-slate-900 leading-none uppercase tracking-tight">{getCandidateName(selectedApplicant)}</h1>
                        {selectedApplicant.status && <StatusBadge status={selectedApplicant.status} />}
                      </div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{selectedApplicant.job_seeker?.title || "FACULTY MEMBER"}</p>
                      <div className="mt-2.5 flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 w-fit">
                         <CheckCircle2 className="w-3.5 h-3.5" />
                         <span className="text-[9px] font-bold uppercase tracking-tight">VERIFIED CANDIDATE</span>
                      </div>
                    </div>
                  </div>

                  {/* STATS GRID */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { label: 'EMAIL ADDRESS', value: selectedApplicant.job_seeker?.user?.email, icon: Mail },
                      { label: 'PROFESSIONAL EXP', value: `${selectedApplicant.job_seeker?.experience_years || 0}y Experience`, icon: Briefcase },
                      { label: 'CONTACT NUMBER', value: selectedApplicant.job_seeker?.phone, isPhone: true, icon: Users },
                      { label: 'CURRENT LOCATION', value: selectedApplicant.job_seeker?.location || 'India', icon: MapPin }
                    ].map((item, id) => (
                      <div key={id} className="p-3.5 rounded-xl bg-slate-50/50 border border-slate-100 space-y-2 group transition-all hover:bg-white hover:shadow-md hover:border-slate-200">
                        <div className="flex items-center justify-between">
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{item.label}</p>
                           {/* @ts-ignore */}
                           {item.icon && <item.icon className="w-3 h-3 text-slate-300" />}
                        </div>
                        {item.isPhone ? (
                          <div className="space-y-1.5">
                             <p className="text-[11px] font-bold text-slate-900 tracking-tight">{showPhone ? item.value : '••••••••••'}</p>
                             {!showPhone ? (
                               <button 
                                 onClick={() => setShowPhone(true)}
                                 className="text-[9px] font-bold text-primary hover:underline uppercase tracking-tight"
                               >
                                 VIEW & CALL
                               </button>
                             ) : (
                               <a 
                                 href={`tel:${item.value}`}
                                 className="text-[9px] font-bold text-emerald-600 hover:underline flex items-center gap-1.5 uppercase tracking-tight"
                               >
                                 CALL NOW →
                               </a>
                             )}
                          </div>
                        ) : (
                          <p className="text-[11px] font-bold text-slate-900 truncate tracking-tight">{item.value}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* SUMMARY SECTION */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                       <div className="w-1 h-5 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]" />
                       <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">Professional Summary</h3>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm min-h-[100px]">
                      <p className="text-[11px] text-slate-500 font-bold leading-relaxed uppercase tracking-tight">
                        {selectedApplicant.job_seeker?.bio || "No career summary provided."}
                      </p>
                    </div>
                  </div>

                  {/* RESUME PREVIEW & DOWNLOAD */}
                  <div className="space-y-4 pt-1">
                    <div className="flex items-center gap-3">
                       <div className="w-1 h-5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.3)]" />
                       <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">Candidate Credentials</h3>
                    </div>
                    
                    <div className="space-y-3">
                       {selectedApplicant.resume?.file_url ? (
                         <>
                           <div className="rounded-2xl border border-slate-100 bg-white p-2 overflow-hidden aspect-4/3 group relative shadow-inner">
                              <iframe 
                                src={`${getFullUrl(selectedApplicant.resume.file_url)}#toolbar=0&view=FitH`} 
                                className="w-full h-full border-none rounded-xl bg-slate-50"
                                title="Resume"
                              />
                           </div>
                           <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                 <div className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center border border-red-100 shrink-0">
                                    <FileText className="w-5 h-5" />
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-slate-900 truncate uppercase tracking-tight">{selectedApplicant.resume?.file_name || "Resume_FileName.pdf"}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight opacity-60">Verified Document • PDF</p>
                                 </div>
                              </div>
                              <Button 
                                onClick={() => {
                                  const url = getFullUrl(selectedApplicant.resume?.file_url);
                                  if (url) window.open(url, "_blank");
                                }}
                                variant="outline" 
                                className="h-8 px-3 rounded-lg text-[9px] font-bold border-slate-200 hover:bg-slate-50 flex items-center gap-2 uppercase tracking-tight"
                              >
                                 <Download className="w-3.5 h-3.5" /> Download
                              </Button>
                           </div>
                         </>
                       ) : (
                         <div className="h-32 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center bg-slate-50/20">
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">No document provided</p>
                         </div>
                       )}
                    </div>
                  </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t flex items-center gap-2 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                    <select 
                      className={cn(
                        "h-10 px-3 flex-1 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-400 uppercase focus:ring-1 focus:ring-primary outline-none cursor-pointer hover:bg-slate-100 transition-colors",
                        loading === selectedApplicant.id && "opacity-50 pointer-events-none"
                      )}
                      value={selectedApplicant.status?.toLowerCase() === 'contacted' || selectedApplicant.status?.toLowerCase() === 'rejected' ? selectedApplicant.status.toLowerCase() : ""}
                      onChange={(e) => updateStatus(selectedApplicant.id, e.target.value)}
                      disabled={loading === selectedApplicant.id}
                    >
                       <option value="">MARK AS...</option>
                       <option value="contacted">CONTACTED</option>
                       <option value="rejected">REJECTED</option>
                    </select>
                    <Button 
                      variant="outline"
                      className="h-10 flex-1 px-4 rounded-xl text-slate-600 border-slate-100 font-bold text-[10px] uppercase shadow-sm flex items-center justify-center gap-2 tracking-tight"
                      onClick={() => updateStatus(selectedApplicant.id, "interview")}
                      disabled={loading === selectedApplicant.id}
                    >
                       {loading === selectedApplicant.id && selectedApplicant.status === 'interview' ? (
                         <Loader2 className="w-3.5 h-3.5 animate-spin" />
                       ) : (
                         <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                       )}
                       Interview
                    </Button>
                    <Button 
                      className="h-10 flex-1 px-6 rounded-xl bg-[#0f172a] text-white font-bold text-[10px] uppercase shadow-lg shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-2 tracking-tight"
                      onClick={() => updateStatus(selectedApplicant.id, "shortlisted")}
                      disabled={loading === selectedApplicant.id}
                    >
                       {loading === selectedApplicant.id && selectedApplicant.status === 'shortlisted' && (
                         <Loader2 className="w-3.5 h-3.5 animate-spin" />
                       )}
                       {selectedApplicant.status?.toLowerCase() === 'shortlisted' ? 'Shortlisted' : 'Shortlist'}
                    </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// @ts-ignore
const Mail = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);
