"use client";

import { 
  Building2, 
  MapPin, 
  Globe, 
  Phone, 
  Loader2, 
  Edit2, 
  Upload 
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";

export default function CompanyProfileClient({
  initialName,
  initialEmail,
}: {
  initialName: string;
  initialEmail: string;
}) {
  const [loading] = useState(false);
  const [profileData] = useState({
    name: initialName || "Company Name",
    email: initialEmail || "Email",
    phone: "",
    address: "",
    website: "",
    size: "1-10",
    description: "",
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 drop-shadow-sm">Company Profile</h1>
          <p className="text-gray-500 mt-2">Manage your institution's public profile and contact details.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Globe className="w-4 h-4 mr-2" /> View Public Profile
          </Button>
          <Button variant="default" size="sm">
            Save Changes
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Banner Placeholder */}
        <div className="h-32 bg-linear-to-br from-primary/10 to-secondary/10 relative group border-b border-gray-100">
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="outline" className="bg-white/80 backdrop-blur-sm">
                <Edit2 className="w-4 h-4 mr-2" /> Edit Banner
            </Button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-8 pt-0 mt-[-40px]">
          <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
            <div className="w-32 h-32 rounded-3xl bg-white border-4 border-white shadow-xl flex items-center justify-center relative group overflow-hidden">
              <Building2 className="w-16 h-16 text-gray-200" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Upload className="text-white w-8 h-8" />
              </div>
            </div>
            
            <div className="flex-1 pb-2">
              <h2 className="text-2xl font-bold text-gray-900">{profileData.name}</h2>
              <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                <Building2 className="w-4 h-4" />
                <span>Private Institution</span>
              </div>
            </div>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Official Company Name</Label>
                <Input defaultValue={profileData.name} />
              </div>

               <div className="space-y-2">
                <Label>Registered Email</Label>
                <Input defaultValue={profileData.email} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>

               <div className="space-y-2">
                <Label>Contact Number</Label>
                <div className="relative">
                  <Input placeholder="+1 234 567 890" className="pl-10" />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

               <div className="space-y-2">
                <Label>Official Website</Label>
                <div className="relative">
                  <Input placeholder="https://www.example.com" className="pl-10" />
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location / Address</Label>
                <div className="relative">
                  <Input placeholder="Delhi, India" className="pl-10" />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Company Size</Label>
                <select className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors">
                  <option>1-10 Employees</option>
                  <option>10-50 Employees</option>
                  <option>50-200 Employees</option>
                  <option>200+ Employees</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Institution Bio / About</Label>
                <textarea
                  rows={5}
                  className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  placeholder="Tell potential candidates about your institution's mission and culture..."
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" size="lg" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Private Profile
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
