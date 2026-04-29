"use client";

import { useRouter } from "next/navigation";
import { 
  Building2,
  Globe, 
  Phone, 
  Loader2, 
  Upload,
  Mail,
  BadgeCheck,
  MapPin,
  Clock,
  Edit3,
  ExternalLink,
  Flag,
  Layers,
  Award,

  ArrowRight,
  ChevronLeft,
  X
} from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";
import Image from "next/image";
import { EmployerProfile } from "@/types/employer";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { toast } from "sonner";

// High-Fidelity Optimization: Dynamically load heavy Map components to keep TTI (Time to Interactive) low.
const LocationPicker = dynamic(
  () => import("@/shared/ui/LocationPicker/LocationPicker").then((mod) => mod.LocationPicker),
  { 
    ssr: false,
    loading: () => (
      <div className="h-64 w-full bg-gray-50 animate-pulse rounded-xl flex items-center justify-center text-[10px] font-semibold text-gray-500">
        Initializing map engine...
      </div>
    )
  }
);

type TabType = "identity" | "contact" | "location";

export default function CompanyProfileClient({
  initialData,
}: {
  initialData: EmployerProfile | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<EmployerProfile | null>(initialData);
  const [activeTab, setActiveTab] = useState<TabType>("identity");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [description, setDescription] = useState(initialData?.company_description || "");
  const formRef = useRef<HTMLFormElement>(null);

  const validateForm = (formData: FormData, tab?: TabType) => {
    const newErrors: Record<string, string> = {};
    
    const allFields = [
      { key: "company_name", label: "Institution Name", tab: "identity" as TabType },
      { key: "industry", label: "Industry / Sector", tab: "identity" as TabType },
      { key: "institution_type", label: "Institution Type", tab: "identity" as TabType },
      { key: "company_description", label: "Detailed introduction", tab: "identity" as TabType },
      { key: "email", label: "Official Email", tab: "contact" as TabType },
      { key: "phone", label: "Phone Number", tab: "contact" as TabType },
      { key: "address", label: "Physical Address", tab: "location" as TabType },
      { key: "city", label: "Settlement / City", tab: "location" as TabType },
      { key: "country", label: "Nation / Country", tab: "location" as TabType },
    ];

    const fieldsToValidate = tab ? allFields.filter(f => f.tab === tab) : allFields;

    fieldsToValidate.forEach(field => {
      const value = formData.get(field.key);
      const valStr = value ? String(value).trim() : "";

      if (!valStr) {
        newErrors[field.key] = `${field.label} is required`;
      } else if (field.key === "company_name") {
        if (valStr.length < 3) {
          newErrors[field.key] = "Institution Name must be at least 3 characters";
        } else if (valStr.length > 100) {
          newErrors[field.key] = "Institution Name cannot exceed 100 characters";
        }
      } else if (field.key === "company_description") {
        if (valStr.length < 50) {
          newErrors[field.key] = `${field.label} must be at least 50 characters`;
        } else if (valStr.length > 1000) {
          newErrors[field.key] = `${field.label} cannot exceed 1000 characters`;
        }
      } else if (field.key === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(valStr)) {
          newErrors[field.key] = "Please enter a valid official email address";
        }
      } else if (field.key === "phone") {
        if (!/^\d{10}$/.test(valStr)) {
          newErrors[field.key] = "Phone number must be exactly 10 digits";
        }
      }
    });

    setErrors(prev => {
      if (tab) {
        // Clear errors for the current tab first, then merge new ones
        const cleanedErrors = { ...prev };
        allFields.filter(f => f.tab === tab).forEach(f => delete cleanedErrors[f.key]);
        return { ...cleanedErrors, ...newErrors };
      }
      return newErrors;
    });
    
    return newErrors;
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 2MB Limit check
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        toast("File Too Large", {
          description: "Please upload a logo smaller than 2MB.",
          style: {
            background: '#FFFBEB',
            border: '1px solid #FCD34D',
            color: '#92400E',
          },
          duration: 4000,
        });
        e.target.value = ""; // Reset input
        return;
      }

      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleMapChange = (lat: number, lng: number) => {
    if (profile) {
      setProfile({ 
        ...profile, 
        latitude: String(lat), 
        longitude: String(lng),
        map_link: `https://www.google.com/maps?q=${lat},${lng}`
      });
    }
  };

  const getLogoUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";
    return `${baseUrl}/${path.startsWith('/') ? path.slice(1) : path}`;
  };

  const handleNext = () => {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    const stepErrors = validateForm(formData, activeTab);
    
    if (Object.keys(stepErrors).length > 0) {
      const firstError = Object.values(stepErrors)[0];
      toast.error(firstError, {
        style: { borderLeft: '4px solid #ef4444' }
      });
      return;
    }

    lastStepChange.current = Date.now();
    if (activeTab === "identity") setActiveTab("contact");
    else if (activeTab === "contact") setActiveTab("location");
  };

  const handleBack = () => {
    if (activeTab === "location") setActiveTab("contact");
    else if (activeTab === "contact") setActiveTab("identity");
  };

  const lastStepChange = useRef<number>(0);

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement> | React.MouseEvent) => {
    if (e) e.preventDefault();
    
    // Prevent submission if a step change just occurred (within 500ms)
    // This prevents accidental saves from double-clicks or Enter key bleed-through
    if (Date.now() - lastStepChange.current < 500) return;

    // Crucial: Prevent submission if not on the final step. 
    // This handles "Enter" key presses on intermediate steps.
    if (activeTab !== "location") {
      handleNext();
      return;
    }

    if (!profile) return;
    const formElement = formRef.current;
    if (!formElement) return;
    const formData = new FormData(formElement);
    
    // Strict Validation Check for ALL fields before final save
    const validationErrors = validateForm(formData);
    const errorKeys = Object.keys(validationErrors);
    if (errorKeys.length > 0) {
      toast.error(validationErrors[errorKeys[0]], {
        style: { borderLeft: '4px solid #ef4444' },
        duration: 3000
      });
      return;
    }

    setLoading(true);
    formData.append("_method", "PUT");
    if (logoFile) {
      formData.append("company_logo", logoFile);
    }
    
    // backend expects latitude (single t) and map_link (snake_case)
    formData.append("latitude", profile.latitude || "");
    formData.append("longitude", profile.longitude || "");
    formData.append("map_link", profile.map_link || "");

    // Log the data being sent
    console.log("Saving Profile Data:", {
      latitude: formData.get("latitude"),
      longitude: formData.get("longitude"),
      map_link: formData.get("map_link"),
      company_name: formData.get("company_name"),
      industry: formData.get("industry")
    });

    try {
      const { uploadFile } = await import("@/actions/FileUpload");
      const endpoint = "employer/Update-Company";
      console.log(`Calling profile update endpoint: ${endpoint} via uploadFile`);
      const result = await uploadFile(endpoint, {
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });
      console.log("Profile update response:", result);

      if (result.status === true) {
        toast.success("Profile Updated Successfully", {
          style: {
            background: '#F0FFF4',
            color: '#22543D',
            border: '1px solid #9AE6B4',
            fontWeight: '600',
            fontSize: '13px'
          }
        });
        
        // Update local state with the returned data to ensure UI reflects changes immediately
        if (result.data) {
          setProfile(result.data);
        }
        
        setLogoFile(null);
        setLogoPreview(null);
        setErrors({});
        setIsEditing(false);
        router.refresh();
      } else {
        toast.warning(result.message || "Something went wrong during update.", {
          style: {
            background: '#FFFAF0',
            color: '#744210',
            border: '1px solid #FBD38D',
            fontWeight: '600',
            fontSize: '13px'
          }
        });
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-slate-600 font-medium capitalize">Loading profile data...</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-3 space-y-4 font-sans text-slate-800 pb-16">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
           <div className="space-y-0.5 min-w-0">
             <div className="flex items-center gap-2.5">
               <button 
                 onClick={() => setIsEditing(false)}
                 className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 hover:bg-slate-50 transition-all text-slate-400 hover:text-rose-500 active:scale-90 shadow-xs bg-white shrink-0"
               >
                 <X className="w-4 h-4" />
               </button>
               <h1 className="text-lg sm:text-xl font-semibold text-black tracking-tight truncate">Edit Profile</h1>
             </div>
             <p className="text-[11px] sm:text-[12px] font-medium text-slate-500 ml-10.5 truncate leading-tight">Update branding & public presence.</p>
           </div>
          
           <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-2xl border border-slate-100 overflow-x-auto no-scrollbar">
             {[
               { id: "identity", label: "Identity", icon: Building2 },
               { id: "contact", label: "Contact", icon: Globe },
               { id: "location", label: "Location", icon: MapPin },
             ].map((tab) => (
               <button
                 key={tab.id}
                  onClick={() => {
                    if (isEditing) {
                      // Prevent jumping ahead if current tab is invalid
                      if (activeTab === "identity" && tab.id !== "identity") {
                         const formData = new FormData(formRef.current!);
                         const stepErrors = validateForm(formData, "identity");
                         if (Object.keys(stepErrors).length > 0) {
                           toast.error("Please complete Identity details first");
                           return;
                         }
                      }
                      if (activeTab === "contact" && tab.id === "location") {
                         const formData = new FormData(formRef.current!);
                         const stepErrors = validateForm(formData, "contact");
                         if (Object.keys(stepErrors).length > 0) {
                           toast.error("Please complete Contact details first");
                           return;
                         }
                      }
                    }
                    setActiveTab(tab.id as TabType);
                  }}
                 className={cn(
                   "px-4 py-1.5 rounded-xl text-[11.5px] font-semibold transition-all whitespace-nowrap flex items-center gap-2",
                   activeTab === tab.id 
                   ? "bg-[#312E81] text-white shadow-md shadow-indigo-100" 
                   : "text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors"
                 )}
               >
                 <tab.icon className={cn("w-3.5 h-3.5", activeTab === tab.id ? "text-indigo-200" : "text-indigo-400")} />
                 {tab.label}
               </button>
             ))}
           </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 shadow-inner flex items-center justify-center text-[#312E81]">
                  {activeTab === "identity" && <Building2 className="w-4 h-4" />}
                  {activeTab === "contact" && <Globe className="w-4 h-4" />}
                  {activeTab === "location" && <MapPin className="w-4 h-4" />}
              </div>
              <div>
                <h2 className="text-[13px] font-semibold text-black">
                    {activeTab === "identity" && "Branding & Identity"}
                    {activeTab === "contact" && "Communication Channels"}
                    {activeTab === "location" && "Physical Presence"}
                </h2>
                <p className="text-[9px] font-semibold text-slate-500">Updates reflect instantly on public profile</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 sm:p-6">
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                <div className={cn("space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300", activeTab !== "identity" && "hidden")}>
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50/30 p-4 border border-slate-100 rounded-xl">
                    <div 
                      className="relative w-16 h-16 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden group shrink-0 cursor-pointer hover:border-indigo-300 transition-all active:scale-95"
                      onClick={() => document.getElementById("logo-upload")?.click()}
                    >
                      {logoPreview || profile.company_logo ? (
                        <Image 
                          src={logoPreview || getLogoUrl(profile.company_logo)!} 
                          alt="Logo" 
                          fill 
                          sizes="(max-width: 768px) 64px, 64px"
                          className="object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-300">
                          <Building2 className="w-6 h-6" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                        <Upload className="text-white w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="space-y-0.5 text-center sm:text-left">
                      <h4 className="text-[12.5px] font-semibold text-black">Institution Logo</h4>
                      <p className="text-[11px] font-medium text-slate-500 max-w-sm leading-tight">Recommended: PNG/JPG, Square (1:1)</p>
                      <input 
                        id="logo-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleLogoChange}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        type="button" 
                        onClick={() => document.getElementById("logo-upload")?.click()}
                        className="h-7 mt-1.5 px-3 rounded-lg text-[10px] font-semibold text-indigo-600 border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 transition-all"
                      >
                        Upload New Logo
                      </Button>
                    </div>
                  </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                       <Label className={cn("text-[10px] font-bold px-1 capitalize transition-colors", errors.company_name ? "text-red-500" : "text-slate-500")}>
                         Institution Name <span className="text-red-500 ml-0.5">*</span>
                       </Label>
                       <Input 
                         name="company_name" 
                         defaultValue={profile.company_name} 
                         className={cn(
                           "h-10 rounded-xl text-[13px] font-semibold border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 bg-white text-black shadow-xs-soft transition-all",
                           errors.company_name && "border-red-500 bg-red-50/50 focus:border-red-600 ring-2 ring-red-500/20 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]"
                         )} 
                       />
                       {errors.company_name && <p className="text-[10px] font-bold text-red-500 mt-1 px-1">{errors.company_name}</p>}
                     </div>
                     <div className="space-y-1.5">
                       <Label className={cn("text-[10px] font-bold px-1 capitalize transition-colors", errors.industry ? "text-red-500" : "text-slate-500")}>
                         Industry / Sector <span className="text-red-500 ml-0.5">*</span>
                       </Label>
                       <Input 
                         name="industry" 
                         defaultValue={profile.industry || ""} 
                         className={cn(
                           "h-10 rounded-xl text-[13px] font-semibold border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 bg-white text-black shadow-xs-soft transition-all",
                           errors.industry && "border-red-500 bg-red-50/50 focus:border-red-600 ring-2 ring-red-500/20 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]"
                         )} 
                       />
                       {errors.industry && <p className="text-[10px] font-bold text-red-500 mt-1 px-1">{errors.industry}</p>}
                     </div>
                     <div className="space-y-1.5">
                       <Label className={cn("text-[10px] font-bold px-1 capitalize transition-colors", errors.institution_type ? "text-red-500" : "text-slate-500")}>
                         Institution Type <span className="text-red-500 ml-0.5">*</span>
                       </Label>
                       <div className="relative">
                         <select 
                           name="institution_type" 
                           defaultValue={profile.institution_type || ""} 
                           className={cn(
                             "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-semibold text-black focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all appearance-none cursor-pointer shadow-xs-soft",
                             errors.institution_type && "border-red-500 bg-red-50/50 focus:border-red-600 ring-2 ring-red-500/20 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]"
                           )}
                         >
                           <option value="" disabled>Select Type</option>
                           <option value="School">School</option>
                           <option value="Intermediate">Intermediate</option>
                           <option value="Diploma">Diploma</option>
                           <option value="UG">UG</option>
                           <option value="PG">PG</option>
                         </select>
                         <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                           <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                         </div>
                       </div>
                       {errors.institution_type && <p className="text-[10px] font-bold text-red-500 mt-1 px-1">{errors.institution_type}</p>}
                     </div>
                     <div className="space-y-2.0 sm:col-span-2">
                       <Label className={cn("text-[10px] font-bold px-1 capitalize transition-colors", errors.company_description ? "text-red-500" : "text-slate-500")}>
                         Detailed introduction <span className="text-red-500 ml-0.5">*</span>
                       </Label>
                       <textarea 
                         name="company_description" 
                         rows={4} 
                         placeholder="Describe your institution..."
                         value={description}
                          onChange={(e) => setDescription(e.target.value)} 
                         className={cn(
                           "w-full text-[13px] font-semibold p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all resize-none bg-white text-black min-h-[120px] scrollbar-thin shadow-xs-soft",
                           errors.company_description && "border-red-500 bg-red-50/50 focus:border-red-600 ring-2 ring-red-500/20 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]"
                         )}
                       />
                       <div className="flex items-center justify-between mt-1 px-1">
                          {errors.company_description ? (
                            <p className="text-[10px] font-bold text-red-500">{errors.company_description}</p>
                          ) : (
                            <div />
                          )}
                          <span className={cn(
                            "text-[10px] font-bold transition-colors",
                            description.length > 1000 ? "text-red-500" : "text-slate-400"
                          )}>
                            {description.length}/1000
                          </span>
                        </div>
                     </div>
                   </div>
                </div>

                <div className={cn("space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300", activeTab !== "contact" && "hidden")}>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                     <div className="space-y-1.5">
                       <Label className="text-[10px] font-bold text-slate-500 px-1 capitalize">Official Website</Label>
                       <div className="relative group">
                         <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-400 group-focus-within:scale-110 transition-all" />
                         <Input 
                           name="website" 
                           defaultValue={profile.website || ""} 
                           className="h-10 pl-9 rounded-xl text-[13px] font-semibold border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 bg-white text-black shadow-xs-soft"
                         />
                       </div>
                     </div>
                     <div className="space-y-1.5">
                       <Label className={cn("text-[10px] font-bold px-1 capitalize transition-colors", errors.email ? "text-red-500" : "text-slate-500")}>
                         Official Email <span className="text-red-500 ml-0.5">*</span>
                       </Label>
                       <div className="relative">
                         <Mail className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5", errors.email ? "text-red-400" : "text-indigo-400")} />
                         <Input 
                           name="email" 
                           defaultValue={profile.email} 
                           className={cn(
                             "h-10 pl-9 rounded-xl text-[13px] font-semibold border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 bg-white text-black shadow-xs-soft",
                             errors.email && "border-red-500 bg-red-50/50 focus:border-red-600 focus:ring-red-200 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]"
                           )} 
                         />
                         {errors.email && <p className="text-[10px] font-bold text-red-500 mt-1 px-1">{errors.email}</p>}
                       </div>
                     </div>
                     <div className="space-y-1.5">
                       <Label className={cn("text-[10px] font-bold px-1 capitalize transition-colors", errors.phone ? "text-red-500" : "text-slate-500")}>
                         Phone Number <span className="text-red-500 ml-0.5">*</span>
                       </Label>
                       <div className="relative group">
                         <Phone className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-all", errors.phone ? "text-red-400" : "text-indigo-400")} />
                         <Input 
                           name="phone" 
                           defaultValue={profile.phone || ""} 
                           className={cn(
                             "h-10 pl-9 rounded-xl text-[13px] font-semibold border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 bg-white text-black shadow-xs-soft",
                             errors.phone && "border-red-500 bg-red-50/50 focus:border-red-600 focus:ring-red-200 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]"
                           )} 
                         />
                         {errors.phone && <p className="text-[10px] font-bold text-red-500 mt-1 px-1">{errors.phone}</p>}
                       </div>
                     </div>
                   </div>
                </div>

                <div className={cn("space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300", activeTab !== "location" && "hidden")}>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                     <div className="space-y-1.5">
                       <Label className={cn("text-[10px] font-bold px-1 capitalize transition-colors", errors.address ? "text-red-500" : "text-slate-500")}>
                         Physical Address <span className="text-red-500 ml-0.5">*</span>
                       </Label>
                       <Input 
                         name="address" 
                         defaultValue={profile.address || ""} 
                         className={cn(
                           "h-10 rounded-xl text-[13px] font-semibold border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white text-black shadow-xs-soft",
                           errors.address && "border-red-500 bg-red-50/50 focus:border-red-600 focus:ring-red-200 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]"
                         )} 
                       />
                       {errors.address && <p className="text-[10px] font-bold text-red-500 mt-1 px-1">{errors.address}</p>}
                     </div>
                     <div className="space-y-1.5">
                       <Label className={cn("text-[10px] font-bold px-1 capitalize transition-colors", errors.city ? "text-red-500" : "text-slate-500")}>
                         Settlement / City <span className="text-red-500 ml-0.5">*</span>
                       </Label>
                       <Input 
                         name="city" 
                         defaultValue={profile.city || ""} 
                         className={cn(
                           "h-10 rounded-xl text-[13px] font-semibold border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white text-black shadow-xs-soft",
                           errors.city && "border-red-500 bg-red-50/50 focus:border-red-600 focus:ring-red-200 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]"
                         )} 
                       />
                       {errors.city && <p className="text-[10px] font-bold text-red-500 mt-1 px-1">{errors.city}</p>}
                     </div>
                     <div className="space-y-1.5">
                       <Label className={cn("text-[10px] font-bold px-1 capitalize transition-colors", errors.country ? "text-red-500" : "text-slate-500")}>
                         Nation / Country <span className="text-red-500 ml-0.5">*</span>
                       </Label>
                       <Input 
                         name="country" 
                         defaultValue={profile.country || ""} 
                         placeholder="e.g. INDIA"
                         className={cn(
                           "h-10 rounded-xl text-[13px] font-semibold border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white text-black shadow-xs-soft",
                           errors.country && "border-red-500 bg-red-50/50 focus:border-red-600 focus:ring-red-200 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]"
                         )} 
                       />
                       {errors.country && <p className="text-[10px] font-bold text-red-500 mt-1 px-1">{errors.country}</p>}
                     </div>
                   </div>

                   {activeTab === "location" && (
                     <div className="space-y-2.5 animate-in fade-in duration-500">
                       <div className="flex items-center justify-between">
                         <Label className="text-[10px] font-bold text-slate-500 px-1 capitalize">Geospatial Intelligence</Label>
                         <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 whitespace-nowrap shadow-xs">Live Engine</span>
                       </div>
                       <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner p-1">
                        <LocationPicker 
                          lat={profile.latitude} 
                          lng={profile.longitude} 
                          onChange={handleMapChange} 
                          className="w-full h-64" 
                        />
                      </div>
                    </div>
                   )}
                </div>

                 <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <p className="text-[10px] text-slate-500 font-medium">Unsaved changes will be discarded on exit</p>
                  </div>
                  
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
                     <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          type="button" 
                          onClick={() => setIsEditing(false)} 
                          className="flex-1 sm:flex-none h-11 px-5 rounded-xl text-[11px] font-semibold text-slate-600 border-slate-200 hover:bg-slate-50 transition-all"
                        >
                          Cancel
                        </Button>
                        
                        {activeTab !== "identity" && (
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            className="flex-1 sm:flex-none h-11 px-5 rounded-xl text-[11px] font-semibold text-indigo-600 border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Back
                          </Button>
                        )}
                     </div>
                     
                     {activeTab !== "location" ? (
                       <Button 
                         type="button"
                         onClick={handleNext}
                         className="w-full sm:w-auto h-11 px-6 rounded-xl text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 text-white"
                       >
                         Next Step
                         <ArrowRight className="w-3.5 h-3.5" />
                       </Button>
                     ) : (
                       <Button 
                          size="sm" 
                          type="button" 
                          disabled={loading} 
                          onClick={handleSubmit}
                          className="w-full sm:w-auto h-11 px-6 rounded-xl text-[11px] font-semibold bg-[#312E81] hover:bg-[#1E1B4B] shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 text-white"
                        >
                          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BadgeCheck className="w-3.5 h-3.5" />}
                          Save Profile
                        </Button>
                     )}
                   </div>
                </div>
              </form>
          </div>
        </div>
      </div>
    );
  }

  // Profile View (High-Fidelity Premium Mode)
  return (
    <div className="max-w-5xl mx-auto px-4 py-3 space-y-4 font-sans text-slate-800 pb-16">
      
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h1 className="text-lg font-semibold text-black tracking-tight">Institution Profile</h1>
          <p className="text-[12px] font-medium text-slate-500">Manage your public presence and contact details.</p>
        </div>
        <Button 
          onClick={() => setIsEditing(true)}
          className="h-9 px-4 rounded-xl font-semibold text-xs bg-[#312E81] hover:bg-[#1E1B4B] shadow-sm shadow-indigo-100 transition-all flex items-center gap-2 active:scale-95 shrink-0 text-white"
        >
          <Edit3 className="w-3.5 h-3.5" /> Edit Profile
        </Button>
      </div>

      {/* Hero Card / Banner Section */}
      <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group">
        {/* Banner with Gradient Background */}
        <div className="h-32 sm:h-36 w-full bg-gradient-to-r from-indigo-600 via-[#312E81] to-indigo-800 relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          <div className="absolute top-3 right-3 flex items-center gap-2">
             {profile.is_verified === 1 && (
                <div className="bg-white/95 backdrop-blur-md border border-white text-emerald-600 px-3 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1.5 shadow-lg">
                  <BadgeCheck className="w-3.5 h-3.5" /> Verified Profile
                </div>
             )}
             {profile.website && (
                <a 
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/20 backdrop-blur-md border border-white/30 text-white p-1.5 rounded-full hover:bg-white/40 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
             )}
          </div>
        </div>

        {/* Profile Info Overlay Area */}
        <div className="px-5 pb-5 pt-0 relative">
           <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-8 sm:-mt-10 mb-4">
              {/* Logo Circle */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden shrink-0 transform transition-transform group-hover:scale-105">
                 {profile.company_logo ? (
                    <Image 
                      src={getLogoUrl(profile.company_logo)!} 
                      alt={profile.company_name} 
                      width={96} 
                      height={96}
                      className="w-full h-full object-cover"
                    />
                 ) : (
                    <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center text-slate-300">
                       <Building2 className="w-8 h-8 sm:w-10 h-10" />
                    </div>
                 )}
              </div>

              {/* Company Identity */}
              <div className="flex-1 space-y-0.5 mb-1">
                  <div className="flex flex-wrap items-center gap-2">
                     <h2 className="text-lg sm:text-2xl font-semibold text-black tracking-tight leading-tight">{profile.company_name}</h2>
                     <div className="inline-flex items-center justify-center w-5 h-5 bg-indigo-50 rounded-full text-indigo-600 shadow-xs border border-indigo-100 shrink-0">
                        <BadgeCheck className="w-3.5 h-3.5" />
                     </div>
                  </div>
                 <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1.5 capitalize">
                       <Layers className="w-3 h-3 text-indigo-500" /> {profile.institution_type || 'Institution'}
                    </span>
                    {profile.industry && (
                      <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1.5 capitalize border-l border-slate-200 pl-4">
                        <Flag className="w-3 h-3 text-indigo-500" /> {profile.industry}
                      </span>
                    )}
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-4 gap-y-4 gap-x-6 border-t border-slate-50 pt-4">
              {[
                { label: 'Primary Location', value: profile.city || '', icon: MapPin },
                { label: 'Official Website', value: profile.website?.replace(/^https?:\/\//, '') || '', icon: Globe },
                { label: 'Professional Email', value: profile.email, icon: Mail },
                { label: 'Contact Number', value: profile.phone || '', icon: Phone },
              ].map((item, idx) => (
                item.value && (
                  <div key={idx} className="flex flex-col gap-0.5 min-w-0 font-sans">
                     <div className="flex items-center gap-1.5 text-slate-500">
                        <item.icon className="w-2.5 h-2.5 text-indigo-400" />
                        <span className="text-[9px] font-semibold capitalize">{item.label}</span>
                     </div>
                     <p className="text-[11.5px] font-semibold text-slate-800 leading-tight">{item.value}</p>
                  </div>
                )
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
         {/* Left Column: Extensive Details */}
         <div className="lg:col-span-8 space-y-5">
            {/* About Institution */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 space-y-3.5 shadow-sm">
               <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                     <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-semibold text-black tracking-tight">About Institution</h3>
               </div>
               <p className="text-[13px] font-medium text-slate-600 leading-relaxed text-justify">
                  {profile.company_description || "No description provided for this institution."}
               </p>
            </div>

            {/* Contact Details Section */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 space-y-4 shadow-sm">
               <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                     <Globe className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-semibold text-black tracking-tight">Contact & Connectivity</h3>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Official Website', value: profile.website || 'Not Set', icon: Globe, link: profile.website },
                    { label: 'Helpdesk Email', value: profile.email, icon: Mail, link: `mailto:${profile.email}` },
                    { label: 'Primary Phone', value: profile.phone || 'Not Set', icon: Phone, link: `tel:${profile.phone}` },
                  ].map((contact, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100/50 group hover:border-indigo-100 transition-all">
                       <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-indigo-500 border border-slate-100 group-hover:scale-110 transition-transform">
                          <contact.icon className="w-4 h-4" />
                       </div>
                       <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-semibold text-slate-500 capitalize leading-none mb-1">{contact.label}</span>
                          {contact.link && contact.value !== 'Not Set' ? (
                            <a href={contact.link.startsWith('http') || contact.link.startsWith('mailto') || contact.link.startsWith('tel') ? contact.link : `https://${contact.link}`} target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-black break-all hover:text-indigo-600 leading-tight">
                               {contact.value}
                            </a>
                          ) : (
                            <span className="text-[12.5px] font-medium text-slate-400 italic">{contact.value}</span>
                          )}
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Physical Location & Map View */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 space-y-4 shadow-sm">
               <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                     <MapPin className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-semibold text-black tracking-tight">Institutional Location</h3>
               </div>
               
               <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-slate-500 capitalize px-1">Registered Address</span>
                    <p className="text-[13px] font-semibold text-slate-800 leading-relaxed px-1">
                      {[profile.address, profile.city, profile.country].filter(Boolean).join(", ") || "Location details not specified"}
                    </p>
                  </div>

                  {profile.latitude && profile.longitude && parseFloat(profile.latitude) !== 0 && parseFloat(profile.longitude) !== 0 ? (
                    <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50 relative group">
                      <LocationPicker 
                        lat={profile.latitude} 
                        lng={profile.longitude} 
                        onChange={() => {}} 
                        hideControls={true}
                        className="w-full h-64 grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" 
                      />
                      <div className="absolute inset-0 bg-transparent pointer-events-none" />
                    </div>
                  ) : (
                    <div className="h-32 flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl gap-2">
                      <MapPin className="w-6 h-6 text-slate-300" />
                      <p className="text-[11px] font-medium text-slate-400">Map coordinates not set for this institution</p>
                    </div>
                  )}
               </div>
            </div>
         </div>

         {/* Right Column: Key Details & Actions */}
         <div className="lg:col-span-4 space-y-5">
            {/* Quick Info Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm group">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                     <Award className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-semibold text-black tracking-tight">Institutional Info</h3>
               </div>
               
               <div className="space-y-3.5 pt-1">
                  {[
                    { label: 'Entity Type', value: profile.institution_type, icon: Flag },
                    { label: 'Primary Sector', value: profile.industry, icon: Layers },
                    { label: 'Hiring City', value: profile.city, icon: MapPin },
                    { label: 'Region', value: profile.country, icon: Globe },
                  ].map((stat, i) => (
                    stat.value && (
                      <div key={i} className="flex items-center justify-between group/item">
                         <span className="text-[12px] font-medium text-slate-500 flex items-center gap-2 capitalize">
                            <stat.icon className="w-3 h-3 text-indigo-400 group-hover/item:scale-110 transition-transform" /> {stat.label}
                         </span>
                         <span className="text-[12.5px] font-semibold text-black">{stat.value}</span>
                      </div>
                    )
                  ))}
               </div>
            </div>

            {/* Trust & Verification Dynamic Card */}
            <div className={cn(
              "rounded-2xl p-5 border transition-all duration-500",
              profile.is_verified === 1 
                ? "bg-emerald-50 border-emerald-100 text-emerald-900 shadow-sm shadow-emerald-50" 
                : "bg-slate-50 border-slate-200 text-slate-700"
            )}>
               <div className="flex items-center gap-3.5 mb-3">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-sm",
                    profile.is_verified === 1 ? "bg-white border-emerald-200 text-emerald-500" : "bg-white border-slate-200 text-slate-400"
                  )}>
                     <BadgeCheck className="w-5 h-5 transition-transform hover:scale-110" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight">
                      {profile.is_verified === 1 ? "Certified Institution" : "Standard Profile"}
                    </h3>
                  </div>
               </div>
               
               <p className="text-[11.5px] font-medium leading-relaxed mb-4">
                  {profile.is_verified === 1 
                    ? "This institution has undergone background validation and is recognized as a trusted hiring partner on TeachNow."
                    : "Your profile is currently undergoing verification. Please ensure all contact and location details are accurate to expedite the process."}
               </p>

               <div className={cn(
                 "flex items-center gap-2 text-[10px] font-semibold px-3 py-1.5 rounded-lg border w-fit",
                 profile.is_verified === 1 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 shadow-xs" 
                  : "bg-amber-500/10 border-amber-500/20 text-amber-600"
               )}>
                 <BadgeCheck className="w-3.5 h-3.5" /> 
                 {profile.is_verified === 1 ? "Profile Certified" : "Pending Verification"}
               </div>
            </div>

            {/* System Status & Visibility */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3 shadow-sm">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("w-2 h-2 rounded-full", profile.is_profile_verified === 1 ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                    <span className="text-[11px] font-semibold text-slate-500 capitalize">Visibility Status</span>
                  </div>
                  <span className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-md border",
                    profile.is_profile_verified === 1 ? "bg-indigo-50 border-indigo-100 text-indigo-600" : "bg-slate-50 border-slate-100 text-slate-500"
                  )}>
                    {profile.is_profile_verified === 1 ? "Visible to Candidates" : "Internal Only"}
                  </span>
               </div>
               <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[10px] font-medium text-slate-400">
                  <span>Last Sync</span>
                  <span className="text-slate-600">{new Date(profile.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
