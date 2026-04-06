"use client";

import { 
  Building2,
  Globe, 
  Phone, 
  Loader2, 
  Upload,
  Mail,
  ShieldCheck,
  MapPin,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Layers
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";
import Image from "next/image";
import { EmployerProfile } from "@/types/employer";
import { cn } from "@/lib/utils";
import { LocationPicker } from "@/shared/ui/LocationPicker/LocationPicker";

type TabType = "identity" | "contact" | "location";

export default function CompanyProfileClient({
  initialData,
}: {
  initialData: EmployerProfile | null;
}) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<EmployerProfile | null>(initialData);
  const [activeTab, setActiveTab] = useState<TabType>("identity");
  const [mapLink, setMapLink] = useState(initialData?.map_link || "");

  const handleMapChange = (newValue: string) => {
    setMapLink(newValue);
    if (profile) setProfile({ ...profile, map_link: newValue });
  };

  const getLogoUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";
    return `${baseUrl}/${path.startsWith('/') ? path.slice(1) : path}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      company_name: formData.get("company_name"),
      industry: formData.get("industry"),
      institution_type: formData.get("institution_type"),
      company_description: formData.get("company_description"),
      website: formData.get("website"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      city: formData.get("city"),
      country: formData.get("country"),
      map_link: mapLink,
    };

    try {
      const { dashboardServerFetch } = await import("@/actions/dashboardServerFetch");
      const result = await dashboardServerFetch("employer/Update-Company", {
        method: "PUT",
        data,
      });

      if (result.status === true) {
        alert("Profile updated successfully!");
      } else {
        alert(result.message || "Failed to update profile.");
      }
    } catch (error) {
      alert("An unexpected error occurred.");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Institution Profile</h1>
            {profile.is_verified === 1 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-md text-[9px] font-bold border border-green-100 tracking-wider">
                <ShieldCheck className="w-2.5 h-2.5" /> Verified
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 font-medium">Manage your branding and digital presence.</p>
        </div>
        
        {/* Compact Nav Tabs */}
        <div className="bg-gray-50 p-1 rounded-xl border flex items-center gap-0.5">
          {[
            { id: "identity", label: "Identity", icon: Building2 },
            { id: "contact", label: "Contact", icon: Globe },
            { id: "location", label: "Location", icon: MapPin },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200",
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
        <div className="px-6 py-4 border-b bg-gray-50/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
             <div className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center text-primary">
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
          <div className="text-[9px] font-bold text-gray-400 tracking-widest bg-white border px-2 py-1 rounded">
             Draft State
          </div>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {activeTab === "identity" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row items-center gap-6 bg-gray-50/30 p-6 border rounded-xl">
                  <div className="relative w-20 h-20 rounded-xl bg-white border shadow-sm overflow-hidden group shrink-0">
                    {profile.company_logo ? (
                      <Image src={getLogoUrl(profile.company_logo)!} alt="Logo" fill className="object-cover" />
                    ) : (
                      <Building2 className="w-8 h-8 text-gray-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <Upload className="text-white w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-0.5 text-center sm:text-left">
                    <h4 className="text-sm font-bold text-gray-900">Institution Logo</h4>
                    <p className="text-xs text-gray-500 max-w-sm">JPG/PNG recommended. Square aspect ratio.</p>
                    <Button variant="outline" size="sm" type="button" className="mt-2 h-8 px-4 rounded-lg text-[10px] font-bold border-gray-200">Change Logo</Button>
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

                <div className="bg-gray-50/50 p-6 border rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-900 border-l-2 border-primary pl-2 tracking-wide">Social Ecosystem</h3>
                    <span className="text-[10px] font-bold text-gray-400 tracking-widest">Connect Soon</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 opacity-60">
                    {[
                      { icon: Linkedin, color: "text-blue-700" },
                      { icon: Twitter, color: "text-sky-500" },
                      { icon: Facebook, color: "text-indigo-600" },
                      { icon: Instagram, color: "text-pink-600" }
                    ].map((s, idx) => (
                      <div key={idx} className="bg-white px-3 py-2.5 rounded-lg flex items-center justify-center border shadow-sm">
                        <s.icon className={cn("w-5 h-5", s.color)} />
                      </div>
                    ))}
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
                    <span className="text-[8px] font-bold text-blue-500 tracking-tighter">Live GIS Pin</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border shadow-sm">
                    <LocationPicker value={mapLink} onChange={handleMapChange} className="w-full" />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[10px] text-gray-400 font-bold tracking-wider">Save required to confirm change</p>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" type="button" onClick={() => window.location.reload()} className="flex-1 sm:flex-initial h-10 px-6 rounded-lg text-[10px] font-bold tracking-widest text-gray-400 border-gray-200">Discard</Button>
                <Button size="sm" type="submit" disabled={loading} className="flex-1 sm:flex-initial h-10 px-8 rounded-lg text-[11px] font-bold tracking-widest shadow-md min-w-[160px]">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Update Profile
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
