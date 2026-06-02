"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { 
  Users, 
  MapPin, 
  Search, 
  FileText,
  Briefcase,
  X,
  Eye,
  ExternalLink,
  Download,
  CheckCircle2,
  Clock,
  Loader2,
  ChevronLeft,
  Phone,
  Mail,
  ShieldCheck,
  RefreshCw,
  TrendingUp
} from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import { toast } from "sonner";
import Link from "next/link";

const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || "https://teachnowbackend.jobsvedika.in/";

const safeFormatDistanceToNow = (dateString?: string) => {
  if (!dateString) return "Just Now";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Just Now";
  const distance = formatDistanceToNow(date);
  return distance === "less than a minute" ? "Just Now" : `${distance} ago`;
};

const CustomSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder,
  align = "left"
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: { value: string; label: string }[]; 
  placeholder: string; 
  align?: "left" | "right";
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    if (isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    }
  }, [isOpen]);

  return (
    <div className="relative w-full">
      <button
        ref={btnRef}
        type="button"
        suppressHydrationWarning={true}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 px-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-[12px] font-semibold text-slate-700 flex items-center justify-between transition-all cursor-pointer shadow-2xs focus:border-indigo-500 focus:bg-white outline-none"
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <svg className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0", isOpen && "rotate-180")} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            style={{ position: 'fixed', top: pos.top, left: align === 'right' ? undefined : pos.left, right: align === 'right' ? (window.innerWidth - pos.left - pos.width) : undefined, minWidth: Math.max(pos.width, 220), zIndex: 50 }}
            className="bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 max-h-60 overflow-y-auto divide-y divide-slate-50"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                suppressHydrationWarning={true}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-2.5 text-[12px] font-semibold transition-colors flex items-center justify-between cursor-pointer border-none outline-none",
                  opt.value === value 
                    ? "bg-indigo-50 text-indigo-600" 
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                )}
              >
                <span>{opt.label}</span>
                {opt.value === value && (
                  <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface Application {
  id: number;
  job_id: number;
  job_seeker_id: number;
  resume_id: number;
  status: string;
  contact_status?: string | null;
  created_at: string;
  job: {
    id: number;
    title: string;
    job_status: string;
    slug?: string;
    admin_featured?: number;
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
    name?: string;
    email?: string;
    availability?: string;
    skills?: string[];
    user?: {
      id: number;
      name: string;
      email: string;
    }
    role?: string;
  };
  resume?: {
    id: number;
    file_name: string;
    file_url: string;
  };
  application_answers?: Array<{
    id: number;
    job_application_id: number;
    question_id: number;
    candidate_answer: string;
    question?: {
      id: number;
      question: string;
      recruiter_answer: string;
    }
  }>;
}

interface RecruiterApplicantsClientProps {
  initialData?: {
    status: boolean;
    data: {
      data: Application[];
    } | Application[];
  };
}

const StatusBadge = ({ status, type = 'status' }: { status: string, type?: 'status' | 'contact' }) => {
  const s = status?.toLowerCase().replace(/[\s_-]+/g, "_") || "";
  
  if (type === 'contact') {
     const styles: Record<string, string> = {
        called: "bg-blue-50 text-blue-600 border-blue-100",
        messaged: "bg-sky-50 text-sky-600 border-sky-100",
        not_picked: "bg-orange-50 text-orange-600 border-orange-100",
        not_reached: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100",
        not_reachable: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100",
        default: "bg-slate-50 text-black/40 border-slate-100"
     };
     const label = s === 'not_reachable' ? 'not reached' : status.replace(/[\s_-]+/g, ' ').toLowerCase();
     return (
        <span className={cn(
           "px-2.5 py-0.5 rounded-lg text-[10px] font-medium border whitespace-nowrap capitalize",
           styles[s] || styles.default
        )}>
           {label}
        </span>
     );
  }

  const styles: Record<string, string> = {
    shortlisted: "bg-indigo-50 text-indigo-600 border-indigo-100",
    interview: "bg-purple-50 text-purple-600 border-purple-100",
    rejected: "bg-rose-50 text-rose-600 border-rose-100",
    contacted: "bg-emerald-50 text-emerald-600 border-emerald-100",
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    default: "bg-slate-50 text-black/40 border-slate-100"
  };
  
  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-lg text-[10px] font-medium border whitespace-nowrap capitalize",
      styles[s] || styles.default
    )}>
      {status.toLowerCase()}
    </span>
  );
};

export default function RecruiterApplicantsClient({ initialData }: RecruiterApplicantsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'shortlisted' | 'called' | 'messaged' | 'not_picked' | 'not_reached' | 'rejected'>('all');
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [showPhone, setShowPhone] = useState(false);
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [resumeKey, setResumeKey] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Advanced Filter States
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const getInitialApps = () => {
    if (!initialData) return [];
    if ((initialData as any).status && Array.isArray((initialData as any).data)) return (initialData as any).data;
    if ((initialData as any).status && (initialData as any).data?.data && Array.isArray((initialData as any).data.data)) return (initialData as any).data.data;
    if (Array.isArray(initialData)) return initialData;
    if ((initialData as any).data && Array.isArray((initialData as any).data)) return (initialData as any).data;
    return [];
  };

  const initialApps = getInitialApps();
  const [apps, setApps] = useState<Application[]>(initialApps);
  const [loading, setLoading] = useState<number | null>(null);
  const [selectedApplicantFullData, setSelectedApplicantFullData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    setApps(getInitialApps());
  }, [initialData]);

  const getCandidateName = (app: Application) => app.job_seeker?.user?.name || app.job_seeker?.name || "Applicant";
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

  const downloadResume = (url: string, fileName: string) => {
    if (!url) {
      toast.error("Resume file URL not found");
      return;
    }
    toast.info("Downloading resume...");
    
    // Route the download through our local API proxy to bypass CORS 
    // and force a direct download without opening a new tab
    const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&fileName=${encodeURIComponent(fileName || 'Resume.pdf')}`;
    
    const a = document.createElement("a");
    a.href = proxyUrl;
    a.download = fileName || "Resume.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Dynamic unique locations from candidates
  const locations = useMemo(() => {
    const locs = apps.map(a => a.job_seeker?.location || "India");
    return Array.from(new Set(locs)).filter(Boolean);
  }, [apps]);

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const fullName = getCandidateName(app).toLowerCase();
      const jobTitle = (app.job?.title || "").toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || jobTitle.includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // Status & Contact Status Tabs filter
      let matchesTab = true;
      if (activeTab !== 'all') {
        const isContactTab = ['called', 'messaged', 'not_picked', 'not_reached'].includes(activeTab);
        if (isContactTab) {
           const cleanContactStatus = String(app.contact_status || "").toLowerCase().replace(/[\s_-]+/g, "");
           const cleanActiveTab = activeTab.toLowerCase().replace(/[\s_-]+/g, "");
           
           if (cleanActiveTab === "notreached") {
              matchesTab = (cleanContactStatus === "notreached" || cleanContactStatus === "notreachable");
           } else {
              matchesTab = cleanContactStatus === cleanActiveTab;
           }
        } else {
           const cleanStatus = String(app.status || "").toLowerCase().replace(/[\s_-]+/g, "");
           const cleanActiveTab = activeTab.toLowerCase().replace(/[\s_-]+/g, "");
           matchesTab = cleanStatus === cleanActiveTab;
        }
      }
      if (!matchesTab) return false;

      // Location advanced filter
      if (selectedLocation) {
        const appLoc = (app.job_seeker?.location || "India").toLowerCase();
        if (appLoc !== selectedLocation.toLowerCase()) return false;
      }

      // Experience advanced filter
      if (selectedExperience) {
        const exp = app.job_seeker?.experience_years ?? 0;
        if (selectedExperience === "fresher" && exp !== 0) return false;
        if (selectedExperience === "mid" && (exp < 1 || exp > 3)) return false;
        if (selectedExperience === "senior" && (exp < 3 || exp > 5)) return false;
        if (selectedExperience === "expert" && exp < 5) return false;
      }

      // Applied Time advanced filter
      if (selectedTime) {
        if (!app.created_at) return false;
        const appDate = new Date(app.created_at);
        const now = new Date();
        const diffMs = now.getTime() - appDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        
        if (selectedTime === "today" && diffDays > 1) return false;
        if (selectedTime === "week" && diffDays > 7) return false;
        if (selectedTime === "month" && diffDays > 30) return false;
      }

      return true;
    });
  }, [apps, searchTerm, activeTab, selectedLocation, selectedExperience, selectedTime]);

  const shortlistApplicant = async (appId: number) => {
    setLoading(appId);
    try {
      const res = await dashboardServerFetch(`recruiter/applications/${appId}/shortlist`, { method: "POST" });
      if (res.status) {
        setApps(prev => prev.map(app => app.id === appId ? { ...app, status: 'shortlisted' } : app));
        toast.success(`Applicant shortlisted successfully!`);
      } else {
        toast.error(res.message || "Failed to shortlist");
      }
    } catch (error) { toast.error("An error occurred"); } finally { setLoading(null); }
  };

  const updateContactStatus = async (appId: number, contactStatus: string) => {
    if (!contactStatus) return;
    setLoading(appId);
    try {
      const res = await dashboardServerFetch(`recruiter/applications/contact-status/${appId}`, {
        method: "PATCH",
        data: { contact_status: contactStatus }
      });
      if (res.status) {
        setApps(prev => prev.map(app => app.id === appId ? { ...app, contact_status: contactStatus } : app));
        toast.success(`Contact status updated`);
      } else { toast.error("Failed to update contact status"); }
    } catch (error) { toast.error("An error occurred"); } finally { setLoading(null); }
  };

  const rejectApplication = async (appId: number) => {
    setLoading(appId);
    try {
      const res = await dashboardServerFetch(`recruiter/applications/${appId}/reject`, { method: "POST" });
      if (res.status) {
        setApps(prev => prev.map(app => app.id === appId ? { ...app, status: 'rejected' } : app));
        if (selectedApplicant?.id === appId) {
          setSelectedApplicant(prev => prev ? { ...prev, status: 'rejected' } : null);
        }
        toast.success(`Application rejected`);
      } else { toast.error("Failed to reject application"); }
    } catch (error) { toast.error("An error occurred"); } finally { setLoading(null); }
  };

  const stats = [
    { label: "Total Applications", value: apps.length, icon: Users, bg: "bg-blue-50", text: "text-blue-600" },
    { label: "Shortlisted", value: apps.filter(a => a.status?.toLowerCase() === 'shortlisted').length, icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600" },
    { label: "Interviews", value: apps.filter(a => a.status?.toLowerCase() === 'interview').length, icon: ShieldCheck, bg: "bg-indigo-50", text: "text-indigo-600" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6 font-sans text-black pb-20" suppressHydrationWarning>
      
      {/* Header Pipeline */}
      <div className="bg-white p-5 rounded-[20px] border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all hover:border-indigo-100/10">
        <div className="space-y-3">
           <button 
             onClick={() => window.history.back()} 
             suppressHydrationWarning={true}
             className="flex items-center gap-1.5 text-[11px] font-medium text-black opacity-40 hover:opacity-100 transition-all group mb-0.5"
           >
             <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to job view
           </button>
           <div className="space-y-1">
             <h1 className="text-xl font-medium text-black">Applicants Pipeline</h1>
             <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13px] font-medium text-black opacity-40">Manage your candidate pool for <span className="text-indigo-600 font-semibold">{apps[0]?.job?.title || "Requirement"}</span></p>
                {apps[0]?.job?.admin_featured === 1 && (
                   <span className="bg-amber-500 text-white px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm border border-amber-600">
                      <TrendingUp className="w-2.5 h-2.5" /> Admin Featured Listing
                   </span>
                )}
             </div>
           </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
           <Link href={`/dashboard/recruiter/jobs`}>
             <Button variant="outline" className="h-10 px-5 rounded-xl text-[12px] font-medium text-black/70 border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center gap-2">
               <Briefcase className="w-4 h-4 text-indigo-400" /> Manage All Jobs
             </Button>
           </Link>
        </div>
      </div>

      {/* Pipeline Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:border-slate-200">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-current/10", s.bg, s.text)}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-black mb-1">{s.label}</p>
              <h3 className="text-xl font-bold text-black leading-none">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-[18px] border border-slate-100 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All', count: apps.length },
            { id: 'shortlisted', label: 'Shortlisted' },
            { id: 'called', label: 'Called' },
            { id: 'messaged', label: 'Messaged' },
            { id: 'not_picked', label: 'Not Picked' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button 
              key={tab.id}
              suppressHydrationWarning={true}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-5 py-1.5 rounded-[14px] text-[12.5px] font-medium transition-all whitespace-nowrap",
                activeTab === tab.id 
                ? "bg-[#312E81] text-white shadow-md shadow-indigo-100" 
                : "text-black opacity-40 hover:opacity-100 hover:bg-white"
              )}
            >
              {tab.label} {tab.id === 'all' && `(${tab.count})`}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidate name..." 
            className="h-10 pl-10 bg-white border-slate-100 rounded-xl text-[12.5px] font-medium focus:ring-2 focus:ring-indigo-100 shadow-sm placeholder:text-black/30" 
          />
        </div>
      </div>

      {/* Advanced Filters Bar */}
      <div className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-3">
         <div className="text-[10px] font-bold text-[#312E81] uppercase tracking-wider flex items-center gap-1.5 shrink-0 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[#312E81] animate-pulse" />
            Filters
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full flex-1">
            {/* Location Select */}
            <CustomSelect
               value={selectedLocation}
               onChange={setSelectedLocation}
               options={[
                  { value: "", label: "All Locations" },
                  ...locations.map(loc => ({ value: loc, label: loc }))
               ]}
               placeholder="All Locations"
            />

            {/* Experience Select */}
            <CustomSelect
               value={selectedExperience}
               onChange={setSelectedExperience}
               options={[
                  { value: "", label: "All Experiences" },
                  { value: "fresher", label: "Freshers (0 Years)" },
                  { value: "mid", label: "Mid-level (1-3 Years)" },
                  { value: "senior", label: "Senior (3-5 Years)" },
                  { value: "expert", label: "Director / Lead (5+ Years)" }
               ]}
               placeholder="All Experiences"
            />

            {/* Applied Time Select */}
            <CustomSelect
               value={selectedTime}
               onChange={setSelectedTime}
               options={[
                  { value: "", label: "All Time" },
                  { value: "today", label: "Last 24 Hours" },
                  { value: "week", label: "Last 7 Days" },
                  { value: "month", label: "Last 30 Days" }
               ]}
               placeholder="All Time"
               align="right"
            />
         </div>
         
         <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <span className="text-[11px] text-black/50 font-medium px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 whitespace-nowrap">
               Showing {filteredApps.length} of {apps.length}
            </span>
            {(selectedLocation || selectedExperience || selectedTime) && (
               <button
                  onClick={() => {
                     setSelectedLocation("");
                     setSelectedExperience("");
                     setSelectedTime("");
                  }}
                  className="h-10 px-4 text-[11px] font-bold text-rose-600 hover:text-rose-700 border border-rose-100 bg-rose-50/30 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
               >
                  Clear Filters
               </button>
            )}
         </div>
      </div>

      {/* Applicant High-Density Cards */}
      <div className="space-y-4">
        {filteredApps.length > 0 ? (
          filteredApps.map((app) => (
            <div key={app.id} className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden p-5 group transition-all hover:border-indigo-100/30">
               <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                 
                 <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                      {app.job_seeker?.profile_photo ? (
                        <img 
                          src={getFullUrl(app.job_seeker.profile_photo)} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as any).parentNode.innerHTML = `<div class="flex items-center justify-center h-full w-full bg-indigo-50 text-indigo-600 font-medium">${getCandidateInitial(app)}</div>`; }}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-indigo-50 text-indigo-600 font-medium">{getCandidateInitial(app)}</div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[15px] font-medium text-black truncate">{getCandidateName(app)}</h3>
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={app.status} />
                          {app.contact_status && <StatusBadge status={app.contact_status} type="contact" />}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1.5">
                        <span className="flex items-center gap-1 text-xs font-normal text-slate-900">
                           <MapPin className="w-3.5 h-3.5 text-rose-500" />
                           <strong className="font-semibold">Location:</strong> {app.job_seeker?.location || "India"}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-normal text-slate-900">
                           <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                           <strong className="font-semibold">Experience:</strong> {app.job_seeker?.experience_years ?? 0} Years
                        </span>
                        <span className="flex items-center gap-1 text-xs font-normal text-slate-900">
                           <Clock className="w-3.5 h-3.5 text-violet-500" />
                           <strong className="font-semibold">Applied:</strong> {mounted ? safeFormatDistanceToNow(app.created_at) : "Just Now"}
                        </span>
                      </div>
                    </div>
                 </div>

                  {/* Card Actions — Download + View Detail */}
                   <div className="flex items-center gap-2 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-4">
                      <Button
                         variant="outline"
                         className="flex-1 lg:flex-none h-8 px-4 rounded-lg text-[10px] font-normal text-blue-700 bg-blue-50 border-blue-300 hover:bg-blue-100 flex items-center justify-center gap-2 tracking-tight disabled:opacity-50 transition-colors shadow-xs"
                         disabled={loading === app.id}
                         onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            let resumeUrl = getFullUrl(app.resume?.file_url);
                            let resumeName = app.resume?.file_name || `${getCandidateName(app).replace(/\s+/g, '_')}_Resume.pdf`;

                            if (!resumeUrl) {
                              setLoading(app.id);
                              try {
                                const res = await dashboardServerFetch(`recruiter/applications/${app.id}`);
                                if (res.status) {
                                  const resumeData =
                                    res.data?.resume ||
                                    res.data?.application?.resume ||
                                    res.data?.job_seeker?.resume ||
                                    null;
                                  if (resumeData?.file_url) {
                                    resumeUrl = getFullUrl(resumeData.file_url);
                                    resumeName = resumeData.file_name || resumeName;
                                    setApps(prev => prev.map(a =>
                                      a.id === app.id ? { ...a, resume: resumeData } : a
                                    ));
                                  }
                                }
                              } catch (e) {
                                console.error(e);
                              } finally {
                                setLoading(null);
                              }
                            }

                            if (resumeUrl) {
                              downloadResume(resumeUrl, resumeName);
                            } else {
                              toast.error("No resume uploaded by this candidate");
                            }
                          }}
                      >
                        {loading === app.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-700" />
                        ) : (
                          <Download className="w-3.5 h-3.5 text-blue-700" />
                        )}
                        Resume
                      </Button>

                      <Button
                         className="flex-1 lg:flex-none h-8 px-4 rounded-lg text-[10px] font-normal bg-[#312E81] hover:bg-[#1E1B4B] text-white shadow-md hover:shadow-lg flex items-center justify-center gap-2 tracking-tight transition-all"
                         onClick={() => {
                            setSelectedApplicant(app);
                            setSelectedApplicantFullData(null);
                            setLoadingProfile(true);
                            dashboardServerFetch(`recruiter/applications/${app.id}`).then(res => {
                               if (res.status) setSelectedApplicantFullData(res.data);
                               setLoadingProfile(false);
                            });
                         }}
                      >
                        <Eye className="w-3.5 h-3.5" /> View Detail
                      </Button>
                   </div>

               </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-[20px] border border-dashed border-slate-200 py-16 flex flex-col items-center justify-center text-center gap-5 shadow-sm">
             <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200">
               <Users className="w-10 h-10" />
             </div>
             <div className="space-y-1.5">
               <p className="text-lg font-medium text-black">No candidates match</p>
               <p className="text-[13px] text-black/40 font-medium px-4">Adjust your filters to see more applicants.</p>
             </div>
          </div>
        )}
      </div>

      {/* Modern Profile Drawer */}
      <AnimatePresence>
        {selectedApplicant && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               onClick={() => { setSelectedApplicant(null); setSelectedApplicantFullData(null); }}
               className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 pointer-events-auto cursor-pointer"
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full sm:max-w-xl bg-white shadow-2xl z-50 flex flex-col border-l border-slate-300"
            >
              <div className="sticky top-0 bg-white border-b border-slate-300 z-30 px-5 py-4 flex items-center justify-between">
                <div className="flex flex-col">
                    <h2 className="text-[15px] font-semibold text-slate-900 leading-none mb-1">{getCandidateName(selectedApplicant)}</h2>
                    <p className="text-[10px] font-normal text-slate-900">Candidate Profile</p>
                </div>
                <div className="flex items-center">
                   <button 
                      onClick={() => {
                        setSelectedApplicant(null);
                        setSelectedApplicantFullData(null);
                        setShowPhone(false);
                      }} 
                      className="p-1.5 hover:bg-slate-50 rounded-full transition-colors text-slate-900 hover:text-slate-950"
                   >
                     <X className="w-5 h-5" />
                   </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6 space-y-6 pb-28">
                  {/* AVATAR SECTION */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-normal text-2xl shrink-0 overflow-hidden shadow-inner shadow-indigo-100/50">
                      {selectedApplicant.job_seeker?.profile_photo ? (
                        <img src={getFullUrl(selectedApplicant.job_seeker.profile_photo)} alt="Profile" className="w-full h-full object-cover" />
                      ) : getCandidateInitial(selectedApplicant)}
                    </div>
                    <div className="pt-0.5">
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-xl font-semibold text-slate-900">{selectedApplicantFullData?.job_seeker?.name || selectedApplicantFullData?.job_seeker?.user?.name || getCandidateName(selectedApplicant)}</h1>
                        {selectedApplicant.status && <StatusBadge status={selectedApplicant.status} />}
                      </div>
                      <p className="text-[11px] font-normal text-slate-900">{selectedApplicantFullData?.job_seeker?.title || selectedApplicant.job_seeker?.title || "qualified candidate"}</p>
                      <div className="mt-2.5 flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 w-fit">
                         <CheckCircle2 className="w-3.5 h-3.5" />
                         <span className="text-[9px] font-normal">Verified Candidate</span>
                      </div>
                    </div>
                  </div>

                  {/* STATS GRID */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { label: 'Email Address', value: selectedApplicantFullData?.job_seeker?.email || selectedApplicantFullData?.job_seeker?.user?.email || selectedApplicant.job_seeker?.user?.email || selectedApplicant.job_seeker?.email, icon: Mail },
                      { label: 'Professional Exp', value: `${selectedApplicantFullData?.job_seeker?.experience_years ?? selectedApplicant.job_seeker?.experience_years ?? 0}y Experience`, icon: Briefcase },
                      { label: 'Contact Phone', value: selectedApplicantFullData?.job_seeker?.phone || selectedApplicant.job_seeker?.phone || "Not Provided", isPhone: true, icon: Phone },
                      { label: 'Current Location', value: selectedApplicantFullData?.job_seeker?.location || selectedApplicant.job_seeker?.location || 'India', icon: MapPin }
                    ].map((item, id) => {
                      const cardConfig = [
                        { iconColor: "text-blue-500" },
                        { iconColor: "text-amber-500" },
                        { iconColor: "text-emerald-500" },
                        { iconColor: "text-rose-500" }
                      ];
                      const cfg = cardConfig[id] || { iconColor: "text-slate-900" };
                      return (
                        <div key={id} className="p-3.5 rounded-xl bg-white shadow-sm border border-slate-300 space-y-2 group transition-all hover:shadow-md hover:border-slate-400">
                          <div className="flex items-center justify-between">
                             <p className="text-[9px] font-normal text-slate-500 tracking-tight">{item.label}</p>
                             {/* @ts-ignore */}
                             {item.icon && <item.icon className={cn("w-3 h-3", cfg.iconColor)} />}
                          </div>
                          {item.isPhone ? (
                            <div className="space-y-1.5">
                               <p className="text-[11px] font-normal text-slate-900 tracking-tight">{showPhone ? item.value : '••••••••••'}</p>
                               {!showPhone ? (
                                 <button 
                                   onClick={() => setShowPhone(true)}
                                   className="text-[9px] font-normal text-[#312E81] hover:underline tracking-tight"
                                 >
                                   Reveal Number
                                 </button>
                               ) : (
                                 <a 
                                   href={`tel:${item.value}`}
                                   className="text-[9px] font-normal text-emerald-600 hover:underline flex items-center gap-1.5 tracking-tight"
                                 >
                                   Call Now →
                                 </a>
                               )}
                            </div>
                          ) : (
                            <p className="text-[11px] font-normal text-slate-900 truncate tracking-tight">{item.value}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* SUMMARY SECTION */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                       <div className="w-1 h-5 bg-[#312E81] rounded-full shadow-[0_0_8px_rgba(49,46,129,0.3)]" />
                       <h3 className="text-[13px] font-semibold text-slate-800 tracking-tight">Professional Bio</h3>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-300 shadow-sm min-h-[50px]">
                      <p className="text-[11px] text-slate-900 font-normal leading-relaxed tracking-tight whitespace-pre-wrap">
                        {selectedApplicantFullData?.job_seeker?.bio || selectedApplicant.job_seeker?.bio || "No candidate biography provided."}
                      </p>
                    </div>
                  </div>

                  {/* EXPERIENCES & EDUCATION LOADER OR CONTENT */}
                  {loadingProfile ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin text-[#312E81]" />
                    </div>
                  ) : selectedApplicantFullData && (
                    <div className="space-y-6 pt-2">
                       {/* EXPERIENCES */}
                       {selectedApplicantFullData.job_seeker?.experiences?.length > 0 && (
                          <div className="space-y-3">
                             <div className="flex items-center gap-3">
                                <div className="w-1 h-5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
                                <h3 className="text-[13px] font-semibold text-slate-800 tracking-tight">Work History</h3>
                             </div>
                             <div className="space-y-2.5">
                                {selectedApplicantFullData.job_seeker.experiences.map((exp: any) => (
                                   <div key={exp.id} className="p-4 rounded-xl border border-slate-300 bg-white shadow-sm hover:border-slate-400 transition-colors">
                                      <div className="flex justify-between items-start mb-1">
                                         <h4 className="text-[12px] font-semibold text-slate-800 tracking-tight">{exp.job_title}</h4>
                                         <span className="text-[9px] font-normal text-slate-900 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-300 tracking-tight shrink-0 ml-2">
                                            {exp.start_date ? new Date(exp.start_date).getFullYear() : 'N/A'} - {exp.is_current ? 'Present' : exp.end_date ? new Date(exp.end_date).getFullYear() : 'N/A'}
                                         </span>
                                      </div>
                                      <p className="text-[10px] font-normal text-[#312E81] tracking-tight mb-2">{exp.company_name} {exp.location && <><span className="text-slate-900 mx-1">•</span> {exp.location}</>}</p>
                                      {exp.description && <p className="text-[10px] font-normal text-slate-900 leading-relaxed tracking-tight">{exp.description}</p>}
                                   </div>
                                ))}
                             </div>
                          </div>
                       )}

                       {/* EDUCATION */}
                       {selectedApplicantFullData.job_seeker?.educations?.length > 0 && (
                          <div className="space-y-3">
                             <div className="flex items-center gap-3">
                                <div className="w-1 h-5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                                <h3 className="text-[13px] font-semibold text-slate-800 tracking-tight">Education</h3>
                             </div>
                             <div className="space-y-2.5">
                                {selectedApplicantFullData.job_seeker.educations.map((edu: any) => (
                                   <div key={edu.id} className="p-4 rounded-xl border border-slate-300 bg-white shadow-sm hover:border-slate-400 transition-colors">
                                      <div className="flex justify-between items-start mb-1">
                                         <h4 className="text-[12px] font-semibold text-slate-800 tracking-tight">{edu.degree}{edu.field_of_study && ` in ${edu.field_of_study}`}</h4>
                                         <span className="text-[9px] font-normal text-slate-900 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-300 tracking-tight shrink-0 ml-2">
                                            {edu.start_year} - {edu.is_current ? 'Present' : edu.end_year}
                                         </span>
                                      </div>
                                      <p className="text-[10px] font-normal text-slate-900 tracking-tight">{edu.institution}</p>
                                   </div>
                                ))}
                             </div>
                          </div>
                       )}
                       
                       {/* SKILLS */}
                       {(selectedApplicantFullData.job_seeker?.skills || selectedApplicant.job_seeker?.skills)?.length > 0 && (
                          <div className="space-y-3">
                             <div className="flex items-center gap-3">
                                <div className="w-1 h-5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                                <h3 className="text-[13px] font-semibold text-slate-800 tracking-tight">Core Competencies</h3>
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {(selectedApplicantFullData.job_seeker?.skills || selectedApplicant.job_seeker?.skills).map((skill: any, idx: number) => (
                                   <span key={idx} className="px-2.5 py-1 text-[9px] font-normal tracking-tight bg-slate-50 border border-slate-300 rounded-lg text-slate-900">
                                      {typeof skill === 'string' ? skill : skill.name}
                                   </span>
                                ))}
                             </div>
                          </div>
                       )}
                    </div>
                  )}

                  {/* PRE-SCREENING QUESTIONNAIRE */}
                  {(() => {
                    const answers = selectedApplicantFullData?.application_answers || selectedApplicant.application_answers || [];
                    if (answers.length === 0) return null;
                    
                    return (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-3">
                           <div className="w-1 h-5 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.3)]" />
                           <h3 className="text-[13px] font-semibold text-slate-800 tracking-tight">Screening Responses</h3>
                        </div>
                        <div className="space-y-2.5">
                           {answers.map((ans: any, idx: number) => {
                              const questionText = ans.question?.question || "Requirement Question";
                              const rAnswer = ans.question?.recruiter_answer || "N/A";
                              const cAnswer = ans.candidate_answer || "No response";
                              
                              return (
                                 <div key={idx} className="p-4 rounded-xl border border-slate-300 bg-white shadow-sm flex flex-col gap-3.5 hover:border-slate-400 transition-colors">
                                    <p className="text-[11.5px] font-normal text-slate-900 tracking-tight leading-snug">{String(questionText)}</p>
                                    
                                    <div className="space-y-3 pt-2.5 border-t border-slate-100">
                                       <div className="space-y-1">
                                          <span className="text-[10px] font-normal text-slate-500">Ideal Answer</span>
                                          <div className="p-2.5 rounded-lg bg-[#312E81]/5 border border-[#312E81]/10 text-[10px] font-normal text-slate-900 leading-relaxed">
                                             {String(rAnswer)}
                                          </div>
                                       </div>
                                       
                                       <div className="space-y-1">
                                          <span className="text-[10px] font-normal text-slate-500">Candidate Answer</span>
                                          <div className={cn(
                                            "p-2.5 rounded-lg border text-[10px] font-normal leading-relaxed",
                                            String(rAnswer).toLowerCase() === String(cAnswer).toLowerCase()
                                            ? "bg-emerald-50/40 text-emerald-800 border-emerald-200"
                                            : "bg-rose-50/30 text-rose-800 border-rose-200"
                                          )}>
                                             {String(cAnswer)}
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              )
                           })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* RESUME PREVIEW & DOWNLOAD */}
                  <div className="space-y-4 pt-1">
                    <div className="flex items-center gap-3">
                       <div className="w-1 h-5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.3)]" />
                       <h3 className="text-[13px] font-semibold text-slate-800 tracking-tight">Candidate Resume</h3>
                    </div>
                    
                    <div className="space-y-3">
                        {loadingProfile ? (
                          /* Skeleton while profile details are loading */
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden aspect-3/4 flex flex-col items-center justify-center gap-3 mb-3">
                            <Loader2 className="w-7 h-7 animate-spin text-slate-300" />
                            <p className="text-[10px] font-normal text-slate-400 tracking-tight">Loading resume...</p>
                          </div>
                        ) : (selectedApplicantFullData?.resume?.file_url || selectedApplicant.resume?.file_url) ? (
                           (() => {
                             const resumeUrl = getFullUrl(selectedApplicantFullData?.resume?.file_url || selectedApplicant.resume?.file_url);
                             const resumeName = selectedApplicantFullData?.resume?.file_name || selectedApplicant.resume?.file_name || "Resume.pdf";
                             return (
                               <>
                                 <div className="rounded-2xl border border-slate-300 bg-white p-1 overflow-hidden aspect-3/4 group relative shadow-inner mb-3">
                                    <iframe 
                                      key={resumeKey}
                                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(resumeUrl)}&embedded=true`} 
                                      className="w-full h-full border-none rounded-xl bg-slate-50"
                                      title="Resume Preview"
                                    />
                                    <div className="absolute inset-x-0 bottom-4 px-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                       <button
                                         onClick={() => setResumeKey(k => k + 1)}
                                         className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border shadow-sm text-[10px] font-normal text-slate-700 flex items-center gap-1.5"
                                       >
                                         <RefreshCw className="w-3 h-3" /> Retry
                                       </button>
                                       <a 
                                         href={resumeUrl} 
                                         target="_blank" 
                                         className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border shadow-sm text-[10px] font-normal text-[#312E81] flex items-center gap-2"
                                       >
                                          <ExternalLink className="w-3 h-3" /> Full View
                                       </a>
                                    </div>
                                 </div>
                                 <div className="p-4 rounded-xl border border-slate-300 bg-white shadow-sm flex items-center justify-between gap-4">
                                   <div className="flex items-center gap-3 flex-1 min-w-0">
                                      <div className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center border border-red-100 shrink-0">
                                         <FileText className="w-5 h-5" />
                                      </div>
                                      <div className="min-w-0">
                                         <p className="text-[10px] font-normal text-slate-900 truncate tracking-tight">{resumeName}</p>
                                         <p className="text-[9px] font-normal text-slate-900 tracking-tight opacity-60">Verified Document • PDF</p>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-2">
                                      <Button 
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          if (resumeUrl) {
                                            downloadResume(resumeUrl, resumeName);
                                          }
                                        }}
                                        variant="outline" 
                                        className="h-8 px-3 rounded-lg text-[9px] font-normal border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 flex items-center gap-2 shadow-xs transition-colors"
                                      >
                                         <Download className="w-3.5 h-3.5 text-blue-700" /> Download
                                      </Button>
                                   </div>
                                </div>
                               </>
                             );
                           })()
                        ) : selectedApplicantFullData && !selectedApplicantFullData?.resume?.file_url ? (
                          <div className="h-20 rounded-xl border border-dashed border-slate-300 flex items-center justify-center bg-slate-50/20">
                             <p className="text-[10px] font-normal text-slate-400">No resume document provided</p>
                          </div>
                        ) : null}
                    </div>
                  </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="mt-auto p-5 bg-white border-t flex items-center gap-2 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                    <select 
                      className={cn(
                        "h-8 px-3 w-32 rounded-lg bg-slate-50 border border-slate-300 text-[10px] font-normal text-slate-900 focus:ring-1 focus:ring-[#312E81] outline-none cursor-pointer hover:bg-slate-100 transition-colors",
                        loading === selectedApplicant.id && "opacity-50 pointer-events-none"
                      )}
                      value={(() => {
                         if (!selectedApplicant.contact_status) return "";
                         const s = selectedApplicant.contact_status.toLowerCase().replace(/[\s_-]+/g, "_");
                         if (s === "not_reached") return "not_reachable";
                         return s;
                      })()}
                      onChange={(e) => updateContactStatus(selectedApplicant.id, e.target.value)}
                      disabled={loading === selectedApplicant.id}
                    >
                       <option value="">Mark As</option>
                       <option value="called">Called</option>
                       <option value="messaged">Messaged</option>
                       <option value="not_picked">Not Picked</option>
                       <option value="not_reachable">Not Reached</option>
                    </select>

                    <div className="flex flex-1 justify-end items-center gap-2">
                       <Button 
                          className="h-8 px-4 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 font-normal text-[10px] transition-all flex items-center justify-center gap-1.5 shadow-sm border border-rose-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => rejectApplication(selectedApplicant.id)}
                          disabled={loading === selectedApplicant.id || selectedApplicant.status?.toLowerCase() === 'rejected'}
                       >
                          {loading === selectedApplicant.id && selectedApplicant.status !== 'rejected' ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          {selectedApplicant.status?.toLowerCase() === 'rejected' ? 'Rejected' : 'Reject'}
                       </Button>
 
                       {selectedApplicant.status?.toLowerCase() !== 'rejected' && (
                         <Button 
                           className="h-8 px-5 rounded-lg bg-[#312E81] hover:bg-[#1E1B4B] text-white font-normal text-[10px] shadow-md shadow-indigo-200/50 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                           onClick={() => shortlistApplicant(selectedApplicant.id)}
                           disabled={loading === selectedApplicant.id || selectedApplicant.status?.toLowerCase() === 'shortlisted'}
                         >
                            {loading === selectedApplicant.id && selectedApplicant.status !== 'shortlisted' ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            {selectedApplicant.status?.toLowerCase() === 'shortlisted' ? 'Shortlisted' : 'Shortlist'}
                         </Button>
                       )}
                    </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Full Page Resume Preview Modal - Refined for a premium feel */}
      <AnimatePresence>
        {showResumePreview && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               onClick={() => setShowResumePreview(false)}
               className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[60] cursor-pointer"
            />
            <motion.div 
              initial={{ y: 100, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-2 md:inset-6 bg-white rounded-3xl shadow-2xl z-[70] overflow-hidden flex flex-col border border-white/10"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-inner">
                       <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                       <h3 className="text-[15px] font-bold text-slate-900 leading-tight">Resume Intelligence Preview</h3>
                       <p className="text-[11px] font-medium text-slate-400 truncate max-w-[200px] md:max-w-md">{selectedApplicantFullData?.resume?.file_name || "Resume.pdf"}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <a 
                      href={getFullUrl(selectedApplicantFullData?.resume?.file_url)} 
                      download
                      className="h-10 px-5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-2 transition-all active:scale-95"
                    >
                       <Download className="w-4 h-4" /> Download PDF
                    </a>
                    <button 
                      onClick={() => setShowResumePreview(false)} 
                      className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-all active:scale-95 shadow-sm"
                    >
                      <X className="w-5.5 h-5.5" />
                    </button>
                 </div>
              </div>
              <div className="flex-1 bg-[#525659] relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                     <Loader2 className="w-10 h-10 animate-spin text-white/20" />
                  </div>
                  {selectedApplicantFullData?.resume?.file_url ? (
                    <object 
                      key={selectedApplicantFullData.resume.file_url}
                      data={`${getFullUrl(selectedApplicantFullData.resume.file_url)}#view=FitH`}
                      type="application/pdf"
                      className="w-full h-full relative z-10 bg-white rounded-b-3xl"
                    >
                      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-100/50">
                         <p className="mb-4 text-sm text-slate-500 font-medium">Your browser does not support inline document viewing.</p>
                         <a 
                           href={getFullUrl(selectedApplicantFullData.resume.file_url)} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-xs font-bold shadow-sm"
                         >
                           Open Document Directly
                         </a>
                      </div>
                    </object>
                  ) : (
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-white/40" />
                      <p className="text-white/40 text-xs font-normal">Loading resume...</p>
                    </div>
                  )}
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
