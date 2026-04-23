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

  ExternalLink,
  Flag,
  Layers,
  Award,
  X,
  ChevronLeft
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";
import Image from "next/image";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { toast } from "sonner";

// High-Fidelity Optimization: Dynamically load heavy Map components
const LocationPicker = dynamic(
  () => import("@/shared/ui/LocationPicker/LocationPicker").then((mod) => mod.LocationPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full bg-slate-50 animate-pulse rounded-xl flex items-center justify-center text-[10px] font-medium text-slate-500">
        Initializing map engine...
      </div>
    )
  }
);

type TabType = "identity" | "contact" | "location";

export default function RecruiterCompanyProfileClient({
  data: initialData,
}: {
  data: any | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any | null>(initialData);
  const [activeTab, setActiveTab] = useState<TabType>("identity");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (formData: FormData) => {
    const newErrors: Record<string, string> = {};
    const requiredFields = [
      { key: "company_name", label: "Institution Name" },
      { key: "industry", label: "Industry / Sector" },
      { key: "institution_type", label: "Institution Type" },
      { key: "company_description", label: "Detailed introduction" },
      { key: "email", label: "Official Email" },
      { key: "phone", label: "Phone Number" },
      { key: "address", label: "Physical Address" },
      { key: "city", label: "Settlement / City" },
      { key: "country", label: "Nation / Country" },
    ];

    requiredFields.forEach(field => {
      const value = formData.get(field.key);
      if (!value || String(value).trim() === "") {
        newErrors[field.key] = `${field.label} is required`;
      } else if (field.key === "company_description" && String(value).trim().length < 50) {
        newErrors[field.key] = `${field.label} must be at least 50 characters`;
      }
    });

    const firstKey = Object.keys(newErrors)[0];
    setErrors(firstKey ? { [firstKey]: newErrors[firstKey] } : {});
    return newErrors;
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Sequential high-fidelity validation
    const validationErrors = validateForm(formData);
    const errorKeys = Object.keys(validationErrors);
    
    if (errorKeys.length > 0) {
      toast.error(validationErrors[errorKeys[0]], {
        style: { borderLeft: '4px solid #ef4444' },
        duration: 3000
      });
      return;
    }

    formData.append("_method", "PUT");
    if (logoFile) {
      formData.append("company_logo", logoFile);
    }

    // Format for backend: lattitude (double t), longitude, mapLink (CamelCase)
    formData.append("lattitude", profile.latitude || "");
    formData.append("longitude", profile.longitude || "");
    formData.append("mapLink", profile.map_link || "");
    
    console.log("Saving Recruiter Profile Data (Institution):", Object.fromEntries(formData.entries()));

    try {
      const { uploadFile } = await import("@/actions/FileUpload");
      const endpoint = "employer/Update-Company";
      console.log(`Calling recruiter profile update endpoint: ${endpoint}`);
      const result = await uploadFile(endpoint, {
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });
      console.log("Recruiter profile update response:", result);

      if (result.status === true) {
        toast.success("Institution profile updated!", { style: { borderLeft: '4px solid #10b981' } });
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to update profile.");
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
        <p className="text-xs text-slate-600 font-medium">Loading institution data...</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-3 space-y-4 font-sans text-black pb-16">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 hover:bg-slate-50 transition-all text-slate-400 hover:text-rose-500 active:scale-95 shadow-sm bg-white shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
              <h1 className="text-lg sm:text-xl font-medium text-black tracking-tight truncate">Edit Institution</h1>
            </div>
            <p className="text-[11px] sm:text-[12px] text-black ml-10.5 truncate leading-tight">Update branding & public presence.</p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-2xl border border-slate-100 overflow-x-auto no-scrollbar">
            {[
              { id: "identity", label: "Identity", icon: Building2 },
              { id: "contact", label: "Contact", icon: Globe },
              { id: "location", label: "Location", icon: MapPin },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-[11.5px] font-medium transition-all whitespace-nowrap flex items-center gap-2",
                  activeTab === tab.id
                    ? "bg-[#312E81] text-white shadow-md shadow-indigo-100"
                    : "text-black opacity-60 hover:opacity-100 hover:bg-white transition-all"
                )}
              >
                <tab.icon className={cn("w-3.5 h-3.5", activeTab === tab.id ? "text-indigo-200" : "text-indigo-400")} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#312E81]">
                {activeTab === "identity" && <Building2 className="w-4 h-4" />}
                {activeTab === "contact" && <Globe className="w-4 h-4" />}
                {activeTab === "location" && <MapPin className="w-4 h-4" />}
              </div>
              <div>
                <h2 className="text-[13px] font-medium text-black">
                  {activeTab === "identity" && "Branding & Identity"}
                  {activeTab === "contact" && "Communication Channels"}
                  {activeTab === "location" && "Physical Presence"}
                </h2>
                <p className="text-[9px] text-black opacity-60">Updates reflect instantly on public profile</p>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className={cn("space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300", activeTab !== "identity" && "hidden")}>
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50/30 p-4 border border-slate-100 rounded-[20px]">
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
                        errors.company_name && "border-red-500 bg-red-50/50 focus:border-red-600 focus:ring-red-200 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]"
                      )} 
                    />
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
                        errors.industry && "border-red-500 bg-red-50/50 focus:border-red-600 focus:ring-red-200 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]"
                      )} 
                    />
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
                          errors.institution_type && "border-red-500 bg-red-50/50 focus:border-red-600 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]"
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
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className={cn("text-[10px] font-bold px-1 capitalize transition-colors", errors.company_description ? "text-red-500" : "text-slate-500")}>
                      Detailed introduction <span className="text-red-500 ml-0.5">*</span>
                    </Label>
                    <textarea
                      name="company_description"
                      rows={4}
                      placeholder="Describe the institution..."
                      defaultValue={profile.company_description || ""}
                      className={cn(
                        "w-full text-[13px] font-semibold p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all resize-none bg-white text-black min-h-[120px] scrollbar-thin shadow-xs-soft",
                        errors.company_description && "border-red-500 bg-red-50/50 focus:border-red-600 focus:ring-red-200 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]"
                      )}
                    />
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
                  </div>
                  <div className="space-y-1.5">
                    <Label className={cn("text-[10px] font-bold px-1 capitalize transition-colors", errors.country ? "text-red-500" : "text-slate-500")}>
                      Nation / Country <span className="text-red-500 ml-0.5">*</span>
                    </Label>
                    <Input 
                      name="country" 
                      defaultValue={profile.country || "INDIA"} 
                      className={cn(
                        "h-10 rounded-xl text-[13px] font-semibold border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white text-black shadow-xs-soft",
                        errors.country && "border-red-500 bg-red-50/50 focus:border-red-600 focus:ring-red-200 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]"
                      )} 
                    />
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
                  <p className="text-[10px] text-black opacity-60 font-medium">Unsaved changes will be discarded on exit</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="w-full sm:w-auto h-11 px-5 rounded-xl text-[11px] font-medium text-black opacity-70 border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto h-11 px-6 rounded-xl text-[11px] font-medium bg-[#312E81] hover:bg-[#1E1B4B] shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 text-white"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BadgeCheck className="w-3.5 h-3.5" />}
                    Save Institution Profile
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Profile View Mode
  return (
    <div className="max-w-5xl mx-auto px-4 py-3 space-y-4 font-sans text-black pb-16">

      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 text-[10px] font-medium text-black opacity-50 hover:opacity-100 transition-all group mb-1"
          >
            <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
          </button>
          <h1 className="text-lg font-medium text-black tracking-tight">Institution Profile</h1>
          <p className="text-[12px] text-black opacity-60">General identity and public presence of the institution.</p>
        </div>
      </div>

      {/* Hero Banner Section */}
      <div className="relative bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden group">
        <div className="h-32 sm:h-40 w-full bg-gradient-to-r from-indigo-600 via-[#312E81] to-indigo-800 relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {profile.is_verified === 1 && (
              <div className="bg-white/95 backdrop-blur-md border border-white text-emerald-600 px-3 py-1 rounded-full text-[10px] font-medium flex items-center gap-1.5 shadow-lg">
                <BadgeCheck className="w-3.5 h-3.5" /> Verified
              </div>
            )}
            {profile.website && (
              <a
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 backdrop-blur-md border border-white/30 text-white p-2 rounded-full hover:bg-white/40 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-10 sm:-mt-12 mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[20px] bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden shrink-0 transform transition-transform group-hover:scale-105">
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

            <div className="flex-1 space-y-1 mb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-medium text-black tracking-tight leading-tight">{profile.company_name}</h2>
                <div className="inline-flex items-center justify-center w-5 h-5 bg-indigo-50 rounded-full text-indigo-600 border border-indigo-100 shrink-0">
                  <BadgeCheck className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-[11px] font-medium text-black opacity-60 flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-indigo-500" /> {profile.institution_type || 'Institution'}
                </span>
                {profile.industry && (
                  <span className="text-[11px] font-medium text-black opacity-60 flex items-center gap-1.5 border-l border-slate-200 pl-4">
                    <Flag className="w-3 h-3 text-indigo-500" /> {profile.industry}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-y-4 gap-x-6 border-t border-slate-50 pt-5">
            {[
              { label: 'Primary Location', value: profile.city || 'Not Set', icon: MapPin },
              { label: 'Website', value: profile.website?.replace(/^https?:\/\//, '') || 'Not Set', icon: Globe },
              { label: 'Official Email', value: profile.email, icon: Mail },
              { label: 'Contact', value: profile.phone || 'Not Set', icon: Phone },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-1.5 text-black opacity-40">
                  <item.icon className="w-2.5 h-2.5 text-indigo-400" />
                  <span className="text-[9px] font-medium">{item.label}</span>
                </div>
                <p className="text-[12px] font-medium text-black truncate">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Details */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white rounded-[24px] border border-slate-100 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-base font-medium text-black tracking-tight">About Institution</h3>
            </div>
            <p className="text-[13px] font-medium text-black opacity-70 leading-relaxed">
              {profile.company_description || "No description provided for this institution."}
            </p>
          </div>

          <div className="bg-white rounded-[24px] border border-slate-100 p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Globe className="w-4 h-4" />
              </div>
              <h3 className="text-base font-medium text-black tracking-tight">Connectivity</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Official Website', value: profile.website || 'Not Set', icon: Globe, link: profile.website },
                { label: 'Official Email', value: profile.email, icon: Mail, link: `mailto:${profile.email}` },
                { label: 'Direct Phone', value: profile.phone || 'Not Set', icon: Phone, link: `tel:${profile.phone}` },
              ].map((contact, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-[16px] border border-slate-100/50 group hover:border-indigo-100 transition-all">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-indigo-500 border border-slate-100 group-hover:scale-110 transition-transform">
                    <contact.icon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-medium text-black opacity-40 leading-none mb-1">{contact.label}</span>
                    {contact.link && contact.value !== 'Not Set' ? (
                      <a href={contact.link.startsWith('http') || contact.link.startsWith('mailto') || contact.link.startsWith('tel') ? contact.link : `https://${contact.link}`} target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-medium text-black break-all hover:text-indigo-600 leading-tight">
                        {contact.value}
                      </a>
                    ) : (
                      <span className="text-[12.5px] font-medium text-black opacity-30 italic">{contact.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[24px] border border-slate-100 p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="text-base font-medium text-black tracking-tight">Registered Location</h3>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1 px-1">
                <span className="text-[10px] font-medium text-black opacity-40">Address</span>
                <p className="text-[13px] font-medium text-black leading-relaxed">
                  {profile.address || "Address not provided."}, {profile.city && `${profile.city}, `} {profile.country || "INDIA"}
                </p>
              </div>

              <div className="rounded-[20px] overflow-hidden border border-slate-100 shadow-inner bg-slate-50 relative group h-80">
                {profile.latitude && profile.longitude ? (
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${profile.latitude},${profile.longitude}&zoom=15`}
                    className="grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                  />
                ) : (
                    <LocationPicker
                      lat={profile.latitude}
                      lng={profile.longitude}
                      onChange={() => { }}
                      hideControls={true}
                      className="w-full h-64 grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                    />
                )}

                <div className="absolute top-4 right-4 z-10">
                  <a
                    href={profile.map_link || `https://www.google.com/maps?q=${profile.latitude},${profile.longitude}`}
                    target="_blank"
                    className="px-4 py-2 bg-white text-indigo-600 rounded-xl text-[11px] font-bold shadow-xl flex items-center gap-2 hover:-translate-y-1 transition-all active:scale-95 border border-indigo-100"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Stats */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-[24px] border border-slate-100 p-6 space-y-5 shadow-sm group">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-base font-medium text-black tracking-tight">Status Info</h3>
            </div>

            <div className="space-y-4 pt-1">
              {[
                { label: 'Institutional Type', value: profile.institution_type || 'Institution', icon: Flag },
                { label: 'Active Sector', value: profile.industry || 'Education', icon: Layers },
                { label: 'Hiring City', value: profile.city || 'Not Set', icon: MapPin },
                { label: 'Country', value: profile.country || 'INDIA', icon: Globe },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between group/item">
                  <span className="text-[12px] font-medium text-black opacity-50 flex items-center gap-2">
                    <stat.icon className="w-3.5 h-3.5 text-indigo-400 group-hover/item:scale-110 transition-transform" /> {stat.label}
                  </span>
                  <span className="text-[12.5px] font-medium text-black">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={cn(
            "rounded-[24px] p-6 border transition-all duration-500",
            profile.is_verified === 1
              ? "bg-emerald-50 border-emerald-100 text-emerald-900 shadow-sm"
              : "bg-slate-50 border-slate-200 text-slate-700"
          )}>
            <div className="flex items-center gap-3.5 mb-3">
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-sm",
                profile.is_verified === 1 ? "bg-white border-emerald-200 text-emerald-500" : "bg-white border-slate-200 text-slate-400"
              )}>
                <BadgeCheck className="w-5 h-5 transition-transform hover:scale-110" />
              </div>
              <h3 className="text-sm font-medium">
                {profile.is_verified === 1 ? "Certified Institution" : "Standard Profile"}
              </h3>
            </div>

            <p className="text-[11.5px] font-medium opacity-70 leading-relaxed mb-4">
              {profile.is_verified === 1
                ? "This institution has undergone background validation and is recognized as a trusted hiring partner on TeachNow."
                : "Your profile is undergoing verification. Ensure all details are accurate to expedite the process."}
            </p>

            <div className={cn(
              "flex items-center gap-2 text-[10px] font-medium px-3 py-1.5 rounded-lg border w-fit",
              profile.is_verified === 1
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 shadow-sm"
                : "bg-amber-500/10 border-amber-500/20 text-amber-600"
            )}>
              <BadgeCheck className="w-3.5 h-3.5" />
              {profile.is_verified === 1 ? "Certified" : "Pending"}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[24px] p-5 space-y-4 shadow-sm text-black">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={cn("w-2 h-2 rounded-full", profile.is_profile_verified === 1 ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                <span className="text-[11px] font-medium opacity-60">Visibility status</span>
              </div>
              <span className={cn(
                "text-[10px] font-medium px-2 py-0.5 rounded-md border",
                profile.is_profile_verified === 1 ? "bg-indigo-50 border-indigo-100 text-indigo-600" : "bg-slate-50 border-slate-100 text-slate-500"
              )}>
                {profile.is_profile_verified === 1 ? "Public" : "Private"}
              </span>
            </div>
            <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] font-medium opacity-40">
              <span>Last Sync</span>
              <span className="opacity-100">{new Date(profile.updated_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
