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

} from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";
import Image from "next/image";
import { EmployerProfile } from "@/types/employer";
import { cn } from "@/lib/utils";
import { LocationPicker } from "@/shared/ui/LocationPicker/LocationPicker";
import { toast } from "sonner";

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
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-xs text-gray-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
      {/* Compact Header */}
      <div className="flex flex-col gap-4 border-b pb-4 border-gray-100">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-normal whitespace-nowrap">{profile.company_name || 'Institution Profile'}</h1>
              {profile.is_verified === 1 && (
                <span className="hidden xs:inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-700 rounded-md text-[8px] font-semibold border border-green-100 tracking-normal ">
                  <ShieldCheck className="w-2 h-2" /> Verified
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 font-medium tracking-normal">Manage your branding presence</p>
          </div>
          <div className="xs:hidden">
              {profile.is_verified === 1 && (
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              )}
          </div>
          <div className="hidden sm:block text-[9px] font-bold text-gray-400 tracking-normal bg-gray-50 border px-2 py-1 rounded">
             Draft State
          </div>
        </div>
        
        {/* Compact Nav Tabs */}
        <div className="bg-gray-50 p-1 rounded-xl border flex items-center gap-0.5 overflow-x-auto no-scrollbar max-w-full sm:max-w-none shadow-inner">
          {[
            { id: "identity", label: "Identity", icon: Building2 },
            { id: "contact", label: "Contact", icon: Globe },
            { id: "location", label: "Location", icon: MapPin },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-200 whitespace-nowrap",
                activeTab === tab.id 
                ? "bg-white text-primary shadow-sm border border-gray-200" 
                : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
              )}
            >
              <tab.icon className={cn("w-3.5 h-3.5", activeTab === tab.id ? "text-primary" : "text-gray-400")} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Card (Simple & Compact) */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b bg-gray-50/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
             <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border flex items-center justify-center text-primary">
                {activeTab === "identity" && <Building2 className="w-4 h-4" />}
                {activeTab === "contact" && <Globe className="w-4 h-4" />}
                {activeTab === "location" && <MapPin className="w-4 h-4" />}
             </div>
             <h2 className="text-xs font-bold text-gray-900">
                {activeTab === "identity" && "Branding & Identity"}
                {activeTab === "contact" && "Communication Channels"}
                {activeTab === "location" && "Physical Presence"}
             </h2>
          </div>
          <div className="text-[9px] font-bold text-gray-400 tracking-normal bg-white border px-2 py-1 rounded">
             Draft State
          </div>
        </div>
        
          <div className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {activeTab === "identity" && (
                <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-gray-50/30 p-4 sm:p-6 border rounded-xl">
                  <div 
                    className="relative w-20 h-20 rounded-xl bg-white border shadow-sm overflow-hidden group shrink-0 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => document.getElementById("logo-upload")?.click()}
                  >
                    {logoPreview || profile.company_logo ? (
                      <Image src={logoPreview || getLogoUrl(profile.company_logo)!} alt="Logo" fill className="object-cover" />
                    ) : (
                      <Building2 className="w-8 h-8 text-gray-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="text-white w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-0.5 text-center sm:text-left">
                    <h4 className="text-sm font-bold text-gray-900">Institution Logo</h4>
                    <p className="text-xs text-gray-500 max-w-sm">JPG/PNG recommended. Square aspect ratio.</p>
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
                      className="mt-2 h-8 px-4 rounded-lg text-[10px] font-bold border-gray-200"
                    >
                      Change Logo
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-500 ml-0.5">Institution Name</Label>
                    <Input name="company_name" defaultValue={profile.company_name} className="h-10 rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-500 ml-0.5">Industry / Sector</Label>
                    <Input name="industry" defaultValue={profile.industry || ""} className="h-10 rounded-lg text-sm" />
                  </div>
                   <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-500 ml-0.5">Institution Type</Label>
                    <select 
                      name="institution_type" 
                      defaultValue={profile.institution_type || ""} 
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
                    >
                      <option value="" disabled>Select Type</option>
                      <option value="School">School</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Diploma">Diploma</option>
                      <option value="UG">UG</option>
                      <option value="PG">PG</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-500 ml-0.5">Slug URL</Label>
                    <Input name="slug" defaultValue={profile.slug} disabled className="h-10 rounded-lg bg-gray-50 text-gray-400 text-xs italic" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-[10px] font-bold text-gray-500 ml-0.5">About Section</Label>
                    <textarea 
                      name="company_description" 
                      rows={4} 
                      defaultValue={profile.company_description || ""} 
                      className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none font-medium h-24"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-500 ml-0.5">Website</Label>
                    <div className="relative group">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                      <Input name="website" defaultValue={profile.website || ""} className="h-10 pl-10 rounded-lg text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-500 ml-0.5">Help Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input name="email" defaultValue={profile.email} disabled className="h-10 pl-10 rounded-lg bg-gray-50 text-gray-500 text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-500 ml-0.5">Phone Number</Label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                      <Input name="phone" defaultValue={profile.phone || ""} className="h-10 pl-10 rounded-lg text-sm" />
                    </div>
                  </div>
                </div>


              </div>
            )}

            {activeTab === "location" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5 lg:col-span-1">
                    <Label className="text-[10px] font-bold text-gray-500 ml-0.5">Street Address</Label>
                    <Input name="address" defaultValue={profile.address || ""} className="h-10 rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-500 ml-0.5">City</Label>
                    <Input name="city" defaultValue={profile.city || ""} className="h-10 rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-500 ml-0.5">Country</Label>
                    <Input name="country" defaultValue={profile.country || "INDIA"} className="h-10 rounded-lg text-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-[10px] font-bold text-gray-500">Map Integration</Label>
                    <span className="text-[8px] font-bold text-blue-500 tracking-normaler">Live GIS Pin</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border shadow-sm">
                    <LocationPicker 
                      lat={profile.latitude} 
                      lng={profile.longitude} 
                      onChange={handleMapChange} 
                      className="w-full" 
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[10px] text-gray-400 font-bold tracking-wider">Save required to confirm change</p>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" type="button" onClick={() => window.location.reload()} className="flex-1 sm:flex-initial h-10 px-4 rounded-lg text-[10px] font-bold tracking-normal text-gray-400 border-gray-200  whitespace-nowrap">Discard</Button>
                <Button size="sm" type="submit" disabled={loading} className="flex-1 sm:flex-initial h-10 px-5 rounded-lg text-[11px] font-bold tracking-normal shadow-md  whitespace-nowrap min-w-0 sm:min-w-[160px] flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span className="truncate">Update Profile</span>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
