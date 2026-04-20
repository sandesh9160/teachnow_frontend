"use client";

import { useRouter } from "next/navigation";
import { 
  Building2,
  Globe, 
  Phone, 
  Loader2, 
  Upload,
  Mail,
  ShieldCheck,
  MapPin,
  Clock,
  Check,
} from "lucide-react";
import { useState } from "react";
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
      <div className="h-64 w-full bg-gray-50 animate-pulse rounded-xl flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        Initializing Map Engine...
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
    formData.append("_method", "PUT");
    if (logoFile) {
      formData.append("company_logo", logoFile);
    }
    
    // User requested format for backend: lattitude (double t), longitude, mapLink (CamelCase)
    formData.append("lattitude", profile.latitude || "");
    formData.append("longitude", profile.longitude || "");
    formData.append("mapLink", profile.map_link || "");

    // Log the data being sent
    console.log("Saving Profile Data:", {
      lattitude: formData.get("lattitude"),
      longitude: formData.get("longitude"),
      mapLink: formData.get("mapLink"),
      company_name: formData.get("company_name"),
      industry: formData.get("industry")
    });

    try {
      const { uploadFile } = await import("@/actions/FileUpload");
      const result = await uploadFile("employer/Update-Company", {
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });

      if (result.status === true) {
        toast.success("Profile updated successfully!");
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
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6 font-sans text-slate-800 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">{profile.company_name || 'Institution Profile'}</h1>
            {profile.is_verified === 1 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-100">
                <Check className="w-2.5 h-2.5" /> Verified
              </span>
            )}
          </div>
          <p className="text-[13px] font-medium text-slate-900">Manage your institution's branding and public presence.</p>
        </div>
        
        {/* Nav Tabs - Modern Pill Style */}
        <div className="flex items-center gap-1 p-1 bg-slate-50/50 rounded-2xl border border-slate-100 overflow-x-auto no-scrollbar">
          {[
            { id: "identity", label: "Identity", icon: Building2 },
            { id: "contact", label: "Contact", icon: Globe },
            { id: "location", label: "Location", icon: MapPin },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "px-4 py-1.5 rounded-xl text-[12.5px] font-semibold transition-all whitespace-nowrap flex items-center gap-2",
                activeTab === tab.id 
                ? "bg-[#312E81] text-white shadow-sm" 
                : "text-slate-900 hover:bg-white/50"
              )}
            >
              <tab.icon className={cn("w-3.5 h-3.5", activeTab === tab.id ? "text-white" : "text-indigo-400")} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden transition-all hover:border-indigo-100/50">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 shadow-inner flex items-center justify-center text-indigo-600">
                {activeTab === "identity" && <Building2 className="w-4.5 h-4.5" />}
                {activeTab === "contact" && <Globe className="w-4.5 h-4.5" />}
                {activeTab === "location" && <MapPin className="w-4.5 h-4.5" />}
             </div>
             <div>
               <h2 className="text-[14px] font-semibold text-slate-900">
                  {activeTab === "identity" && "Branding & Identity"}
                  {activeTab === "contact" && "Communication Channels"}
                  {activeTab === "location" && "Physical Presence"}
               </h2>
               <p className="text-[10px] font-medium text-slate-500">All fields are visible to candidates.</p>
             </div>
          </div>
        </div>
        
        <div className="p-5 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {activeTab === "identity" && (
                <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-slate-50/30 p-5 sm:p-6 border border-slate-100 rounded-2xl transition-all hover:bg-slate-50/50">
                  <div 
                    className="relative w-24 h-24 rounded-2xl bg-white border border-slate-100 shadow-inner overflow-hidden group shrink-0 cursor-pointer hover:border-indigo-300 transition-all duration-300 active:scale-95"
                    onClick={() => document.getElementById("logo-upload")?.click()}
                  >
                    {logoPreview || profile.company_logo ? (
                      <Image src={logoPreview || getLogoUrl(profile.company_logo)!} alt="Logo" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-300">
                        <Building2 className="w-8 h-8 mb-1" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">No Logo</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                      <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                        <Upload className="text-white w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-center sm:text-left">
                    <h4 className="text-sm font-semibold text-slate-900">Institution Logo</h4>
                    <p className="text-[12px] font-medium text-slate-500 max-w-sm leading-relaxed">JPG or PNG recommended. Square aspect ratio provides the best visibility across our platform.</p>
                    <input 
                      id="logo-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleLogoChange}
                    />
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        type="button" 
                        onClick={() => document.getElementById("logo-upload")?.click()}
                        className="h-8 px-4 rounded-xl text-[11px] font-semibold text-slate-600 border-slate-200 bg-white hover:bg-slate-50 transition-all"
                      >
                        Change Logo
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-400 px-1 uppercase tracking-wider">Institution Name</Label>
                    <Input name="company_name" defaultValue={profile.company_name} className="h-11 rounded-xl text-[14px] font-medium border-slate-100 focus:ring-1 focus:ring-indigo-100 bg-slate-50/30" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-400 px-1 uppercase tracking-wider">Industry / Sector</Label>
                    <Input name="industry" defaultValue={profile.industry || ""} className="h-11 rounded-xl text-[14px] font-medium border-slate-100 focus:ring-1 focus:ring-indigo-100 bg-slate-50/30" />
                  </div>
                   <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-400 px-1 uppercase tracking-wider">Institution Type</Label>
                    <div className="relative">
                      <select 
                        name="institution_type" 
                        defaultValue={profile.institution_type || ""} 
                        className="h-11 w-full rounded-xl border border-slate-100 bg-slate-50/30 px-4 text-[14px] font-medium text-slate-900 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select Type</option>
                        <option value="School">School</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Diploma">Diploma</option>
                        <option value="UG">UG</option>
                        <option value="PG">PG</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-400 px-1 uppercase tracking-wider">Slug URL</Label>
                    <Input name="slug" defaultValue={profile.slug} disabled className="h-11 rounded-xl bg-slate-50 border-slate-100 text-slate-400 text-[13px] font-medium cursor-not-allowed opacity-70" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-[11px] font-bold text-slate-400 px-1 uppercase tracking-wider">About Section</Label>
                    <textarea 
                      name="company_description" 
                      rows={4} 
                      placeholder="Describe your institution..."
                      defaultValue={profile.company_description || ""} 
                      className="w-full text-[14px] font-medium p-4 rounded-xl border border-slate-100 focus:ring-1 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all resize-none bg-slate-50/30 min-h-24 scrollbar-thin"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-400 px-1 uppercase tracking-wider">Official Website</Label>
                    <div className="relative group">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 group-focus-within:scale-110 transition-all" />
                      <Input name="website" defaultValue={profile.website || ""} className="h-11 pl-11 rounded-xl text-[14px] font-medium border-slate-100 focus:ring-1 focus:ring-indigo-100 bg-slate-50/30" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-400 px-1 uppercase tracking-wider">Help desk Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                      <Input name="email" defaultValue={profile.email} disabled className="h-11 pl-11 rounded-xl bg-slate-50 border-slate-100 text-slate-500 text-[14px] font-medium opacity-70" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-400 px-1 uppercase tracking-wider">Phone Number</Label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 group-focus-within:scale-110 transition-all" />
                      <Input name="phone" defaultValue={profile.phone || ""} className="h-11 pl-11 rounded-xl text-[14px] font-medium border-slate-100 focus:ring-1 focus:ring-indigo-100 bg-slate-50/30" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "location" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="space-y-1.5 lg:col-span-1">
                    <Label className="text-[11px] font-bold text-slate-400 px-1 uppercase tracking-wider">Street Address</Label>
                    <Input name="address" defaultValue={profile.address || ""} className="h-11 rounded-xl text-[14px] font-medium border-slate-100 focus:ring-1 focus:ring-indigo-100 bg-slate-50/30" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-400 px-1 uppercase tracking-wider">City</Label>
                    <Input name="city" defaultValue={profile.city || ""} className="h-11 rounded-xl text-[14px] font-medium border-slate-100 focus:ring-1 focus:ring-indigo-100 bg-slate-50/30" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-400 px-1 uppercase tracking-wider">Country</Label>
                    <Input name="country" defaultValue={profile.country || "INDIA"} className="h-11 rounded-xl text-[14px] font-medium border-slate-100 focus:ring-1 focus:ring-indigo-100 bg-slate-50/30" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-[11px] font-bold text-slate-400 px-1 uppercase tracking-wider">Map Integration</Label>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">Live GIS Data</span>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50">
                    <LocationPicker 
                      lat={profile.latitude} 
                      lng={profile.longitude} 
                      onChange={handleMapChange} 
                      className="w-full opacity-0 animate-in fade-in fill-mode-forwards duration-1000 delay-300" 
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-8 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
                   <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Save required to confirm changes</p>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  type="button" 
                  onClick={() => window.location.reload()} 
                  className="flex-1 sm:flex-initial h-10 px-6 rounded-xl text-[12px] font-bold text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all"
                >
                  Discard Changes
                </Button>
                <Button 
                  size="sm" 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 sm:flex-initial h-10 px-8 rounded-xl text-[12px] font-bold bg-[#312E81] hover:bg-[#1E1B4B] shadow-lg shadow-indigo-100/50 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Save Profile
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
