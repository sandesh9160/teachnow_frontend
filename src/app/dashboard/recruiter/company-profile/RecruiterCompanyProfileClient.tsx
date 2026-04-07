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
      <div className="max-w-6xl mx-auto px-4 py-4 space-y-4 font-sans">
         {/* Back Button */}
         <button 
           onClick={() => window.history.back()} 
           className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-primary transition-colors mb-2 group w-fit"
         >
           <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Overview
         </button>

         {/* Unified Profile Container */}
         <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">

            {/* Section 1: Top Identity */}
            <div className="p-5 flex flex-col sm:flex-row items-center gap-5">
               <div className="w-20 h-20 rounded-xl border bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                  {data.company_logo ? (
                     <img src={getLogoUrl(data.company_logo)!} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                     <Building2 className="w-10 h-10 text-gray-200" />
                  )}
               </div>
               <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                     <h1 className="text-xl font-semibold text-primary">{data.company_name}</h1>
                     {data.is_verified === 1 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded text-xs font-semibold border border-green-100  shadow-sm">
                           <ShieldCheck className="w-3 h-3" /> Verified Account
                        </span>
                     )}
                  </div>
                  <p className="text-sm font-semibold text-gray-400 ">{data.industry} • {data.institution_type}</p>
               </div>
            </div>

            {/* Section 2: About Company */}
            <div className="p-6 space-y-3">
               <h3 className="text-xs font-semibold text-blue-600  border-l-2 border-blue-600 pl-3">About Company</h3>
               <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100/50">
                  <p className="text-xs text-gray-600 font-semibold leading-relaxed whitespace-pre-line">
                     {data.company_description || "Detailed profile information is not available for this institution."}
                  </p>
               </div>
               <div className="grid grid-cols-2 gap-3 max-w-sm pt-1">
                  <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100/50">
                     <p className="text-xs font-semibold text-blue-400  mb-0.5">Type</p>
                     <p className="text-sm font-semibold text-blue-800 ">{data.institution_type || "Institution"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50/50 border border-green-100/50">
                     <p className="text-xs font-semibold text-green-400  mb-0.5">Status</p>
                     <p className="text-sm font-semibold text-green-800 ">Active Operation</p>
                  </div>
               </div>
            </div>

            {/* Section 3: Contact & Channels */}
            <div className="p-6 space-y-5">
               <h3 className="text-xs font-semibold text-indigo-600  border-l-2 border-indigo-600 pl-3">Contact Details</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                     { label: "Official Website", value: data.website, icon: Globe, isLink: true },
                     { label: "Direct Phone", value: data.phone, icon: Phone },
                     { label: "Support Email", value: data.email, icon: Mail },
                     { label: "City & Country", value: `${data.city}, ${data.country}`, icon: MapPin }
                  ].map((item, idx) => (
                     <div key={idx} className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 text-gray-400">
                           <item.icon className="w-3.5 h-3.5" />
                           <p className="text-xs font-semibold ">{item.label}</p>
                        </div>
                        {item.isLink ? (
                           <a href={data.website?.startsWith('http') ? data.website : `https://${data.website}`} target="_blank" className="text-sm font-semibold text-primary hover:underline truncate block  pl-0.5">
                              {item.value || "Not Set"}
                           </a>
                        ) : (
                           <p className="text-sm font-semibold text-gray-800  truncate pl-0.5">{item.value || "Not Set"}</p>
                        )}
                     </div>
                  ))}
               </div>
            </div>

            {/* Section 4: Physical Location Map */}
            {data.map_link && (
               <div className="border-t border-gray-50">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-emerald-600 ">Office Location</p>
                            <p className="text-sm font-semibold text-gray-700 ">{data.address}</p>
                        </div>
                        <a 
                            href={data.map_link?.startsWith('http') ? data.map_link : `https://${data.map_link}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-white rounded-lg border text-xs font-mono text-blue-500 hover:text-blue-600 hover:underline shadow-sm shrink-0 transition-all"
                        >
                            View on Google Maps
                        </a>
                    </div>
                  </div>

                  <div className="h-[400px] w-full max-w-4xl mx-auto border-t border-gray-100 relative group overflow-hidden rounded-xl border mt-2">
                     <LocationPicker 
                       lat={data.latitude} 
                       lng={data.longitude} 
                       onChange={() => {}} 
                       className="w-full h-full" 
                       hideControls={true}
                     />
                  </div>
               </div>
            )}
         </div>

         {/* Subtle Footer */}
         <div className="flex items-center justify-center pt-2">
            <p className="text-[8px] font-semibold text-gray-300 ">{data.slug} • Last Updated {new Date(data.updated_at).toLocaleDateString()}</p>
         </div>
      </div>
   );
}
