"use client";

import {
   Building2,
   Globe,
   Phone,
   ShieldCheck,
   MapPin,
   Mail,
   ChevronLeft
} from "lucide-react";

import { LocationPicker } from "@/shared/ui/LocationPicker/LocationPicker";

export default function RecruiterCompanyProfileClient({
   data,
}: {
   data: any;
}) {
   const getLogoUrl = (path: string | null) => {
      if (!path) return null;
      if (path.startsWith('http')) return path;
      const baseUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";
      return `${baseUrl}/${path.startsWith('/') ? path.slice(1) : path}`;
   };

   if (!data) return null;

   return (
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4 font-sans pb-10">
         {/* Back Button */}
         <button 
           onClick={() => window.history.back()} 
           className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors mb-2 group w-fit"
         >
           <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Overview
         </button>

         {/* Unified Profile Container */}
         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-slate-50">

            {/* Section 1: Top Identity */}
            <div className="p-4 md:p-6 flex flex-col sm:flex-row items-center gap-4">
               <div className="w-16 h-16 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                  {data.company_logo ? (
                     <img src={getLogoUrl(data.company_logo)!} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                     <Building2 className="w-8 h-8 text-slate-300" />
                  )}
               </div>
               <div className="flex-1 text-center sm:text-left space-y-0.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                     <h1 className="text-xl font-semibold text-slate-900 tracking-tight">{data.company_name}</h1>
                     {data.is_verified === 1 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-medium border border-emerald-100 shadow-sm">
                           <ShieldCheck className="w-2.5 h-2.5" /> Verified
                        </span>
                     )}
                  </div>
                  <p className="text-[11px] font-medium text-slate-500">{data.industry} <span className="opacity-50 mx-1">•</span> {data.institution_type}</p>
               </div>
            </div>

            {/* Section 2: About Company */}
            <div className="p-4 md:p-6 space-y-4">
               <div className="flex items-center gap-2">
                 <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Building2 className="w-3 h-3 text-indigo-600" />
                 </div>
                 <h3 className="text-sm font-semibold text-slate-900 tracking-tight">About Company</h3>
               </div>
               <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[12px] text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                     {data.company_description || "Detailed profile information is not available for this institution."}
                  </p>
               </div>
               <div className="grid grid-cols-2 gap-3 max-w-sm pt-1">
                  <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
                     <p className="text-[10px] font-medium text-blue-500 mb-0.5">Type</p>
                     <p className="text-xs font-semibold text-blue-700">{data.institution_type || "Institution"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
                     <p className="text-[10px] font-medium text-emerald-500 mb-0.5">Status</p>
                     <p className="text-xs font-semibold text-emerald-700">Active Operation</p>
                  </div>
               </div>
            </div>

            {/* Section 3: Contact & Channels */}
            <div className="p-4 md:p-6 space-y-4">
               <div className="flex items-center gap-2">
                 <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Globe className="w-3 h-3 text-indigo-600" />
                 </div>
                 <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Contact Details</h3>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                     { label: "Official Website", value: data.website, icon: Globe, isLink: true },
                     { label: "Direct Phone", value: data.phone, icon: Phone },
                     { label: "Support Email", value: data.email, icon: Mail },
                     { label: "City & Country", value: `${data.city}, ${data.country}`, icon: MapPin }
                  ].map((item, idx) => (
                     <div key={idx} className="space-y-1 min-w-0 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-1.5 text-indigo-400">
                           <item.icon className="w-3 h-3" />
                           <p className="text-[10px] font-medium">{item.label}</p>
                        </div>
                        {item.isLink && item.value ? (
                           <a href={item.value.startsWith('http') ? item.value : `https://${item.value}`} target="_blank" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline truncate block">
                              {item.value || "Not Set"}
                           </a>
                        ) : (
                           <p className="text-xs font-semibold text-slate-800 truncate">{item.value || "Not Set"}</p>
                        )}
                     </div>
                  ))}
               </div>
            </div>

            {/* Section 4: Physical Location Map */}
            {data.map_link && (
               <div className="border-t border-slate-50">
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 p-3 md:p-4 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                               <MapPin className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-medium text-indigo-500">Office Location</p>
                                <p className="text-[13px] font-semibold text-slate-900">{data.address}</p>
                            </div>
                        </div>
                        <a 
                            href={data.map_link?.startsWith('http') ? data.map_link : `https://${data.map_link}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-white rounded-lg border border-slate-200 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-slate-50 shadow-sm shrink-0 transition-all"
                        >
                            View on Maps
                        </a>
                    </div>
                  </div>

                  <div className="h-[300px] w-full px-4 md:px-6 pb-6">
                     <div className="w-full h-full border border-slate-200 relative group overflow-hidden rounded-xl">
                        <LocationPicker 
                          lat={data.latitude} 
                          lng={data.longitude} 
                          onChange={() => {}} 
                          className="w-full h-full" 
                          hideControls={true}
                        />
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* Subtle Footer */}
         <div className="flex items-center justify-center pt-2">
            <p className="text-[10px] font-medium text-slate-400 capitalize">{data.slug} • Updated {new Date(data.updated_at).toLocaleDateString()}</p>
         </div>
      </div>
   );
}
