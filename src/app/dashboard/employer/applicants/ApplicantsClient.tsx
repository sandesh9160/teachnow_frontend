"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  Loader2,
  ExternalLink,
  Phone,
  MessageSquare,
  PhoneOff,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import { toast } from "sonner";

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
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-9 px-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center justify-between transition-all cursor-pointer shadow-2xs focus:border-indigo-500 focus:bg-white outline-none"
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <svg className={cn("w-3 h-3 text-slate-400 transition-transform duration-200 shrink-0", isOpen && "rotate-180")} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            style={{ position: 'fixed', top: pos.top, left: align === 'right' ? undefined : pos.left, right: align === 'right' ? (window.innerWidth - pos.left - pos.width) : undefined, minWidth: Math.max(pos.width, 220), zIndex: 50 }}
            className="bg-white border border-slate-300 rounded-lg shadow-lg py-1 max-h-60 overflow-y-auto divide-y divide-slate-50"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3.5 py-2.5 text-[11px] font-semibold transition-colors flex items-center justify-between cursor-pointer border-none outline-none",
                  opt.value === value 
                    ? "bg-indigo-50 text-indigo-600" 
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <span>{opt.label}</span>
                {opt.value === value && (
                  <svg className="w-3.5 h-3.5 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
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
    shortlisted: "bg-indigo-50 text-indigo-600 border-indigo-300",
    interview: "bg-purple-50 text-purple-600 border-purple-300",
    rejected: "bg-rose-50 text-rose-600 border-rose-300",
    contacted: "bg-emerald-50 text-emerald-600 border-emerald-300",
    pending: "bg-amber-50 text-amber-600 border-amber-300",
    default: "bg-slate-50 text-slate-900 border-slate-300"
  };

  const currentStyle = styles[s] || styles.default;
  
  const displayStatus = s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
  
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-[9px] font-normal tracking-tight border shadow-xs",
      currentStyle
    )}>
      {displayStatus}
    </span>
  );
};

const ContactStatusBadge = ({ status }: { status: string | null | undefined }) => {
  if (!status) return null;
  const s = status.toLowerCase().replace(/[\s_-]+/g, "_");
  
  const styles: Record<string, { bg: string, icon: any }> = {
    called: { bg: "bg-violet-50 text-violet-600 border-violet-300", icon: Phone },
    messaged: { bg: "bg-sky-50 text-sky-600 border-sky-300", icon: MessageSquare },
    not_picked: { bg: "bg-orange-50 text-orange-600 border-orange-300", icon: PhoneOff },
    not_reached: { bg: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-300", icon: AlertCircle },
    not_reachable: { bg: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-300", icon: AlertCircle },
    default: { bg: "bg-slate-50 text-slate-900 border-slate-300", icon: AlertCircle }
  };

  const config = styles[s] || styles.default;
  const Icon = config.icon;
  
  const labels: Record<string, string> = {
    called: "Called",
    messaged: "Messaged",
    not_picked: "Not Picked",
    not_reached: "Not Reached",
    not_reachable: "Not Reached"
  };
  const label = labels[s] || s.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <span className={cn(
      "px-2.5 py-1 rounded-lg text-[10px] font-normal tracking-tight border shadow-xs flex items-center gap-1.5",
      config.bg
    )}>
      <Icon className="w-3 h-3 opacity-70" />
      {label}
    </span>
  );
};

export default function ApplicantsClient({ initialData }: ApplicantsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'shortlisted' | 'called' | 'messaged' | 'not_picked' | 'not_reached' | 'rejected'>('all');
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [showPhone, setShowPhone] = useState(false);

  // Sync state if initialData changes
  const getInitialApps = () => {
    if (!initialData) return [];
    
    if ((initialData as any).status && Array.isArray((initialData as any).data)) {
        return (initialData as any).data;
    }
    
    if ((initialData as any).status && (initialData as any).data?.data && Array.isArray((initialData as any).data.data)) {
        return (initialData as any).data.data;
    }

    if (Array.isArray(initialData)) {
        return initialData;
    }

    if ((initialData as any).data && Array.isArray((initialData as any).data)) {
        return (initialData as any).data;
    }

    if ((initialData as any).status && (initialData as any).data && !Array.isArray((initialData as any).data)) {
        const item = (initialData as any).data;
        if (item.id || item.application_id || item.job_seeker_id) {
            return [item];
        }
    }

    return [];
  };

  const initialApps = getInitialApps();
  const [apps, setApps] = useState<Application[]>(initialApps);

  useEffect(() => {
    setApps(getInitialApps());
  }, [initialData]);

  const [loading, setLoading] = useState<number | null>(null); // application id being updated
  const [selectedApplicantFullData, setSelectedApplicantFullData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Advanced Filter States
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const getCandidateName = (app: Application) => app.job_seeker?.user?.name || app.job_seeker?.name || "Applicant";

  // Dynamic unique locations from candidates
  const locations = useMemo(() => {
    const locs = apps.map(a => a.job_seeker?.location || "India");
    return Array.from(new Set(locs)).filter(Boolean);
  }, [apps]);

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const fullName = getCandidateName(app).toLowerCase();
      const jobTitle = (app.job?.title || "").toLowerCase();
      const seekerTitle = (app.job_seeker?.title || "").toLowerCase();
      
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                           jobTitle.includes(searchTerm.toLowerCase()) ||
                           seekerTitle.includes(searchTerm.toLowerCase());
      
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

  const shortlistApplicant = async (appId: number) => {
    setLoading(appId);
    try {
      const res = await dashboardServerFetch(`employer/shortlist/${appId}`, {
        method: "PATCH"
      });

      if (res.status) {
        setApps(prev => prev.map(app => 
          app.id === appId ? { ...app, status: 'shortlisted' } : app
        ));
        if (selectedApplicant?.id === appId) {
          setSelectedApplicant(prev => prev ? { ...prev, status: 'shortlisted' } : null);
        }
        toast.success(`Applicant shortlisted successfully!`);
      } else {
        toast.error(res.message || "Failed to shortlist applicant");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong during shortlisting");
    } finally {
      setLoading(null);
    }
  };

  const updateStatus = async (appId: number, status: string) => {
    if (status === 'shortlisted') {
      return shortlistApplicant(appId);
    }
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

  const updateContactStatus = async (appId: number, contactStatus: string) => {
    if (!contactStatus) return;
    setLoading(appId);
    try {
      const res = await dashboardServerFetch(`employer/applications/contact-status/${appId}`, {
        method: "PATCH",
        data: { contact_status: contactStatus }
      });

      if (res.status) {
        setApps(prev => prev.map(app => 
          app.id === appId ? { ...app, contact_status: contactStatus } : app
        ));
        if (selectedApplicant?.id === appId) {
          setSelectedApplicant(prev => prev ? { ...prev, contact_status: contactStatus } : null);
        }
        toast.success(`Contact status updated`);
      } else {
        toast.error("Failed to update contact status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  const rejectApplication = async (appId: number) => {
    setLoading(appId);
    try {
      const res = await dashboardServerFetch(`employer/reject/${appId}`, {
        method: "PATCH"
      });

      if (res.status) {
        setApps(prev => prev.map(app => 
          app.id === appId ? { ...app, status: 'rejected' } : app
        ));
        if (selectedApplicant?.id === appId) {
          setSelectedApplicant(prev => prev ? { ...prev, status: 'rejected' } : null);
        }
        toast.success(`Application rejected`);
      } else {
        toast.error("Failed to reject application");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Applicants</h1>
          <div className="flex flex-wrap items-center gap-2">
             <p className="text-xs text-gray-900 font-normal">Manage institution candidate pool</p>
             {apps[0]?.job?.admin_featured === 1 && (
                <span className="bg-amber-500 text-white px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm border border-amber-600">
                   <TrendingUp className="w-2.5 h-2.5" /> Admin Featured Listing
                </span>
             )}
          </div>
        </div>
      </div>

      {/* High-Density Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {[
          { label: "Total Applications", value: apps.length, icon: Users, color: "blue" },
          { label: "Shortlisted", value: apps.filter(a => a.status?.toLowerCase() === 'shortlisted').length, icon: CheckCircle2, color: "emerald" },
          { label: "Interviews", value: apps.filter(a => a.status?.toLowerCase() === 'interview').length, icon: Calendar, color: "indigo" },
        ].map((s, i) => (
          <div key={i} className={cn(
             "bg-white p-3 md:p-4 rounded-xl border border-slate-300 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow",
             i === 2 && "col-span-2 md:col-span-1"
          )}>
            <div className={cn(
               "w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-slate-300",
               s.color === 'blue' && "bg-blue-50 text-blue-600 border-blue-300",
               s.color === 'emerald' && "bg-emerald-50 text-emerald-600 border-emerald-300",
               s.color === 'indigo' && "bg-indigo-50 text-indigo-600 border-indigo-300",
            )}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-900 tracking-tight">{s.label}</p>
              <h3 className="text-lg font-bold text-slate-900 leading-none">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-300 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
         <div className="flex-1 w-full lg:max-w-xs relative scale-[0.98]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-900" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by name or job..." 
              className="h-8.5 pl-10 border-slate-300 bg-gray-50/50 focus:bg-white rounded-lg text-xs font-normal focus:ring-1 focus:ring-primary/10 border" 
            />
         </div>

          <div className="flex items-center gap-1 bg-gray-50/50 p-1 rounded-xl border border-slate-300 font-normal overflow-x-auto no-scrollbar max-w-full">
            {[
              { id: 'all', label: 'All', activeClass: "bg-blue-50 text-blue-600 border-blue-300 border shadow-sm font-normal" },
              { id: 'shortlisted', label: 'Shortlisted', activeClass: "bg-indigo-50 text-indigo-600 border-indigo-300 border shadow-sm font-normal" },
              { id: 'called', label: 'Called', activeClass: "bg-violet-50 text-violet-600 border-violet-300 border shadow-sm font-normal" },
              { id: 'messaged', label: 'Messaged', activeClass: "bg-sky-50 text-sky-600 border-sky-300 border shadow-sm font-normal" },
              { id: 'not_picked', label: 'Not Picked', activeClass: "bg-orange-50 text-orange-600 border-orange-300 border shadow-sm font-normal" },
              { id: 'not_reached', label: 'Not Reached', activeClass: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-300 border shadow-sm font-normal" },
              { id: 'rejected', label: 'Rejected', activeClass: "bg-rose-50 text-rose-600 border-rose-300 border shadow-sm font-normal" },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] transition-all whitespace-nowrap",
                  activeTab === tab.id 
                  ? tab.activeClass 
                  : "text-slate-900 hover:text-slate-950 font-normal border border-transparent"
                )}
              >
                {tab.label} {tab.id === 'all' && `(${apps.length})`}
              </button>
            ))}
         </div>
      </div>

      {/* Advanced Filters Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-300 shadow-sm flex flex-col md:flex-row items-center gap-3">
         <div className="text-[10px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 shrink-0 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            Filters
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full flex-1">
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
            <span className="text-[10px] text-slate-500 font-semibold px-2 py-1 rounded bg-slate-50 border border-slate-300 shadow-2xs whitespace-nowrap">
               Showing {filteredApps.length} of {apps.length}
            </span>
            {(selectedLocation || selectedExperience || selectedTime) && (
               <button
                  onClick={() => {
                     setSelectedLocation("");
                     setSelectedExperience("");
                     setSelectedTime("");
                  }}
                  className="h-8.5 px-3 text-[10px] font-semibold text-rose-600 hover:text-rose-700 border border-rose-300 bg-rose-50/50 hover:bg-rose-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
               >
                  Clear Filters
               </button>
            )}
         </div>
      </div>

      {/* Applicants List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredApps.length > 0 ? (
          filteredApps.map((app) => (
            <div 
              key={app.id} 
              className="bg-white rounded-xl border border-slate-300 shadow-sm hover:shadow-md transition-all p-3.5 md:p-4 flex flex-col md:flex-row gap-4 relative group overflow-hidden"
            >
              <div className="flex gap-4 items-start flex-1 min-w-0">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-normal text-sm shrink-0 overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
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
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-primary transition-colors">
                        {getCandidateName(app)}
                        <span className="text-slate-900 font-normal mx-1.5 opacity-50">•</span>
                        <span className="text-[10px] font-normal text-slate-900">{app.job_seeker?.title || "Teacher"}</span>
                      </h3>
                      {app.status && <StatusBadge status={app.status} />}
                      {app.contact_status && <ContactStatusBadge status={app.contact_status} />}
                    </div>
                    {app.job?.title && (
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-normal bg-blue-50 text-blue-600 border border-blue-300 shadow-xs">
                          {app.job.title}
                        </span>
                      </div>
                    )}
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1.5">
                    <span className="flex items-center gap-1 text-xs font-normal text-slate-900">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <strong className="font-semibold">Location:</strong> {app.job_seeker?.location || "India"}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-normal text-slate-900">
                      <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                      <strong className="font-semibold">Experience:</strong> {app.job_seeker?.experience_years ?? 0} Years
                    </span>
                    <span className="hidden sm:flex items-center gap-1 text-xs font-normal text-slate-900">
                      <Clock className="w-3.5 h-3.5 text-violet-500" />
                      <strong className="font-semibold">Applied:</strong> {safeFormatDistanceToNow(app.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-slate-300 md:pl-4">
                <Button 
                   variant="outline" 
                   className="flex-1 md:flex-none h-8.5 px-4 rounded-lg text-xs font-normal text-blue-700 bg-blue-50 border-blue-300 hover:bg-blue-100 flex items-center justify-center gap-2 tracking-tight disabled:opacity-50 transition-colors shadow-xs"
                   disabled={loading === app.id}
                   onClick={async () => {
                      let resumeUrl = getFullUrl(app.resume?.file_url);
                      let resumeName = app.resume?.file_name || `${getCandidateName(app).replace(/\s+/g, '_')}_Resume.pdf`;
                      
                      if (!resumeUrl) {
                        setLoading(app.id);
                        try {
                           const res = await dashboardServerFetch(`employer/profile/${app.id}`);
                           if (res.status && res.data?.resume?.file_url) {
                              resumeUrl = getFullUrl(res.data.resume.file_url);
                              resumeName = res.data.resume.file_name || resumeName;
                              setApps(prev => prev.map(a => a.id === app.id ? { ...a, resume: res.data.resume } : a));
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
                        toast.error("Resume file not found");
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
                   className="flex-1 md:flex-none h-8.5 px-4 rounded-lg text-[10px] font-normal bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg flex items-center justify-center gap-2 tracking-tight transition-all"
                   onClick={async () => {
                     setSelectedApplicant(app);
                     setSelectedApplicantFullData(null);
                     setLoadingProfile(true);
                     try {
                        const res = await dashboardServerFetch(`employer/profile/${app.id}`);
                        if (res.status && res.data) {
                           setSelectedApplicantFullData(res.data);
                        }
                     } catch (e) {
                        console.error(e);
                     } finally {
                        setLoadingProfile(false);
                     }
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
                <p className="text-sm font-bold text-gray-900">No candidates found</p>
                <p className="text-[11px] text-slate-900 font-normal">Try adjusting your filters to find applicants.</p>
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
              onClick={() => {
                setSelectedApplicant(null);
                setSelectedApplicantFullData(null);
              }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-60"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:max-w-xl bg-white shadow-2xl z-70 flex flex-col"
            >              <div className="sticky top-0 bg-white border-b border-slate-300 z-30 px-5 py-4 flex items-center justify-between">
                <div className="flex flex-col">
                    <h2 className="text-[15px] font-bold text-slate-900 leading-none mb-1">{getCandidateName(selectedApplicant)}</h2>
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
                        <h1 className="text-xl font-bold text-slate-900">{selectedApplicantFullData?.job_seeker?.name || selectedApplicantFullData?.job_seeker?.user?.name || getCandidateName(selectedApplicant)}</h1>
                        {selectedApplicant.status && <StatusBadge status={selectedApplicant.status} />}
                      </div>
                      <p className="text-[11px] font-normal text-slate-900">{selectedApplicantFullData?.job_seeker?.title || selectedApplicant.job_seeker?.title || "Faculty Member"}</p>
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
                      { label: 'Contact Number', value: selectedApplicantFullData?.job_seeker?.phone || selectedApplicant.job_seeker?.phone || "Not Provided", isPhone: true, icon: Users },
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
                             <p className="text-[9px] font-bold text-slate-900 tracking-tight">{item.label}</p>
                             {/* @ts-ignore */}
                             {item.icon && <item.icon className={cn("w-3 h-3", cfg.iconColor)} />}
                          </div>
                          {item.isPhone ? (
                            <div className="space-y-1.5">
                               <p className="text-[11px] font-normal text-slate-900 tracking-tight">{showPhone ? item.value : '••••••••••'}</p>
                               {!showPhone ? (
                                 <button 
                                   onClick={() => setShowPhone(true)}
                                   className="text-[9px] font-normal text-primary hover:underline tracking-tight"
                                 >
                                   View & Call
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
                       <div className="w-1 h-5 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]" />
                       <h3 className="text-[13px] font-bold text-slate-900 tracking-tight">Professional Summary</h3>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-300 shadow-sm min-h-[50px]">
                      <p className="text-[11px] text-slate-900 font-normal leading-relaxed tracking-tight whitespace-pre-wrap">
                        {selectedApplicantFullData?.job_seeker?.bio || selectedApplicant.job_seeker?.bio || "No career summary provided."}
                      </p>
                    </div>
                  </div>

                  {/* EXPERIENCES & EDUCATION LOADER OR CONTENT */}
                  {loadingProfile ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : selectedApplicantFullData && (
                    <div className="space-y-6 pt-2">
                       {/* EXPERIENCES */}
                       {selectedApplicantFullData.job_seeker?.experiences?.length > 0 && (
                          <div className="space-y-3">
                             <div className="flex items-center gap-3">
                                <div className="w-1 h-5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
                                <h3 className="text-[13px] font-bold text-slate-900 tracking-tight">Experience</h3>
                             </div>
                             <div className="space-y-2.5">
                                {selectedApplicantFullData.job_seeker.experiences.map((exp: any) => (
                                   <div key={exp.id} className="p-4 rounded-xl border border-slate-300 bg-white shadow-sm hover:border-slate-400 transition-colors">
                                      <div className="flex justify-between items-start mb-1">
                                         <h4 className="text-[12px] font-bold text-slate-900 tracking-tight">{exp.job_title}</h4>
                                         <span className="text-[9px] font-normal text-slate-900 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-300 tracking-tight shrink-0 ml-2">
                                            {new Date(exp.start_date).getFullYear()} - {exp.is_current ? 'Present' : exp.end_date ? new Date(exp.end_date).getFullYear() : 'Present'}
                                         </span>
                                      </div>
                                      <p className="text-[10px] font-normal text-primary tracking-tight mb-2">{exp.company_name} <span className="text-slate-900 mx-1">•</span> {exp.location}</p>
                                      <p className="text-[10px] font-normal text-slate-900 leading-relaxed tracking-tight">{exp.description}</p>
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
                                <h3 className="text-[13px] font-bold text-slate-900 tracking-tight">Education</h3>
                             </div>
                             <div className="space-y-2.5">
                                {selectedApplicantFullData.job_seeker.educations.map((edu: any) => (
                                   <div key={edu.id} className="p-4 rounded-xl border border-slate-300 bg-white shadow-sm hover:border-slate-400 transition-colors">
                                      <div className="flex justify-between items-start mb-1">
                                         <h4 className="text-[12px] font-bold text-slate-900 tracking-tight">{edu.degree} in {edu.field_of_study}</h4>
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
                       {selectedApplicantFullData.job_seeker?.skills?.length > 0 && (
                          <div className="space-y-3">
                             <div className="flex items-center gap-3">
                                <div className="w-1 h-5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                                <h3 className="text-[13px] font-bold text-slate-900 tracking-tight">Skills</h3>
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {selectedApplicantFullData.job_seeker.skills.map((skill: any, idx: number) => (
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
                  {selectedApplicantFullData?.answers?.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-3">
                         <div className="w-1 h-5 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.3)]" />
                         <h3 className="text-[13px] font-bold text-slate-900 tracking-tight">Questionnaire</h3>
                      </div>
                      <div className="space-y-2.5">
                         {selectedApplicantFullData.answers.map((ans: any, idx: number) => {
                            const questionText = typeof ans === 'string' ? ans : (typeof ans.question === 'object' ? ans.question.question : ans.question);
                            const rAnswer = ans.expected_answer || ans.question?.expected_answer || (typeof ans.recruiter_answer === 'object' ? JSON.stringify(ans.recruiter_answer) : (ans.recruiter_answer || ans.question?.recruiter_answer || "N/A"));
                            const cAnswer = typeof ans.candidate_answer === 'object' ? JSON.stringify(ans.candidate_answer) : (ans.candidate_answer || ans.answer || "No response");
                            
                            return (
                               <div key={idx} className="p-4 rounded-xl border border-slate-300 bg-white shadow-sm flex flex-col gap-3.5 hover:border-slate-400 transition-colors">
                                  <p className="text-[11.5px] font-bold text-slate-900 tracking-tight leading-snug">{String(questionText || "Question")}</p>
                                  
                                  <div className="space-y-3 pt-2.5 border-t border-slate-100">
                                     <div className="space-y-1">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Ideal Answer</span>
                                        <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-[10px] font-normal text-slate-900 leading-relaxed">
                                           {String(rAnswer)}
                                        </div>
                                     </div>
                                     
                                     <div className="space-y-1">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Candidate Answer</span>
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
                  )}

                  {/* RESUME PREVIEW & DOWNLOAD */}
                  <div className="space-y-4 pt-1">
                    <div className="flex items-center gap-3">
                       <div className="w-1 h-5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.3)]" />
                       <h3 className="text-[13px] font-bold text-slate-900 tracking-tight">Resume</h3>
                    </div>
                    
                    <div className="space-y-3">
                       {(selectedApplicantFullData?.resume?.file_url || selectedApplicant.resume?.file_url) ? (
                         <>
                           <div className="rounded-2xl border border-slate-300 bg-white p-1 overflow-hidden aspect-3/4 group relative shadow-inner">
                              <iframe 
                                src={`https://docs.google.com/viewer?url=${encodeURIComponent(getFullUrl(selectedApplicantFullData?.resume?.file_url || selectedApplicant.resume?.file_url))}&embedded=true`} 
                                className="w-full h-full border-none rounded-xl bg-slate-50"
                                title="Resume Preview"
                              />
                              <div className="absolute inset-x-0 bottom-4 px-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <a 
                                   href={getFullUrl(selectedApplicantFullData?.resume?.file_url || selectedApplicant.resume?.file_url)} 
                                   target="_blank" 
                                   className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border shadow-sm text-[10px] font-normal text-primary flex items-center gap-2"
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
                                    <p className="text-[10px] font-normal text-slate-900 truncate tracking-tight">{selectedApplicantFullData?.resume?.file_name || selectedApplicant.resume?.file_name || "Resume_FileName.pdf"}</p>
                                    <p className="text-[9px] font-normal text-slate-900 tracking-tight opacity-60">Verified Document • PDF</p>
                                 </div>
                              </div>
                              <Button 
                                onClick={() => {
                                  const url = getFullUrl(selectedApplicantFullData?.resume?.file_url || selectedApplicant.resume?.file_url);
                                  const fileName = selectedApplicantFullData?.resume?.file_name || selectedApplicant.resume?.file_name || `${getCandidateName(selectedApplicant).replace(/\s+/g, '_')}_Resume.pdf`;
                                  if (url) downloadResume(url, fileName);
                                }}
                                variant="outline" 
                                className="h-8 px-3 rounded-lg text-[9px] font-normal border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 flex items-center gap-2 shadow-xs transition-colors">
                    
                                 <Download className="w-3.5 h-3.5 text-blue-700" /> Download
                              </Button>
                           </div>
                         </>
                       ) : (
                         <div className="h-32 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center bg-slate-50/20">
                            <p className="text-[10px] font-normal text-slate-300">No document provided</p>
                         </div>
                       )}
                    </div>
                  </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="mt-auto p-5 bg-white border-t flex items-center gap-2 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                    <select 
                      className={cn(
                        "h-8 px-3 w-32 rounded-lg bg-slate-50 border border-slate-300 text-[10px] font-normal text-slate-900 focus:ring-1 focus:ring-primary outline-none cursor-pointer hover:bg-slate-100 transition-colors",
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
                           className="h-8 px-5 rounded-lg bg-emerald-600 text-white font-normal text-[10px] shadow-md shadow-emerald-200/50 hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-emerald-700/50"
                           onClick={() => updateStatus(selectedApplicant.id, "shortlisted")}
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
    </div>
  );
}

// @ts-ignore
const Mail = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);
