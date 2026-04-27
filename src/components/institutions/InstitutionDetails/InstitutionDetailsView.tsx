"use client";

import Link from "next/link";
import { Institution, Job } from "@/types/homepage";
import { normalizeMediaUrl } from "@/services/api/client";
import {
  MapPin,
  Building,
  Briefcase,
  ChevronRight,
  Globe,
  Users,
  Calendar,
  Layers,
} from "lucide-react";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";
import { sanitizeSlug } from "@/lib/utils";
import { Button } from "@/shared/ui/Buttons/Buttons";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


interface InstitutionDetailsViewProps {
  readonly company: Institution;
  readonly companyJobs: Job[];
  readonly similarCompanies: Institution[];
}

export default function InstitutionDetailsView({ 
  company, 
  companyJobs, 
  similarCompanies 
}: Readonly<InstitutionDetailsViewProps>) {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  const [mapLoading, setMapLoading] = useState(true);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const companyLogo = normalizeMediaUrl(company?.company_logo);
  const logoFallback = (company?.company_name?.[0] || "I").toUpperCase();

  const breadcrumbItems = [
    { label: "Jobs", href: "/jobs" },
    { label: company.company_name || "Institution", isCurrent: true }
  ];

  const jobsCount = companyJobs.length;

  return (
    <div className={`min-h-screen bg-[#F8FAFC] pb-20 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-1.5 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Header / Identity Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Institution Logo */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#F1F5F9] border border-slate-100 p-2">
                {companyLogo ? (
                  <img src={companyLogo} alt={company.company_name} className="h-full w-full object-contain" />
                ) : (
                  <span className="text-4xl font-black text-slate-300">{logoFallback}</span>
                )}
              </div>

              {/* Institution Title & Meta */}
              <div className="text-center sm:text-left min-w-0 flex-1">
                <h1 className="text-3xl sm:text-4xl font-semibold text-[#1a202c] mb-3 break-words">
                  {company.company_name}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Building className="h-4 w-4 text-slate-400" />
                    <span>{company.institution_type}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{company.city}</span>
                  </div>
                  {company.website && (
                    <a 
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1.5 text-sm text-[#2563eb] hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      <span>{company.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                </div>
                
                <p className="mt-4 text-sm font-semibold text-slate-400">
                  {jobsCount} Teaching {jobsCount === 1 ? 'Job' : 'Jobs'} Available
                </p>
              </div>
            </div>

            {/* Header CTA */}
            <Button
              asChild
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-4 h-auto rounded-xl font-semisemibold shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <Link href="#open-jobs">
                <Briefcase className="h-5 w-5" />
                <span>View Open Jobs</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          {/* Main Content */}
          <div className="min-w-0 space-y-8">
            
            {/* About the Organization */}
            {(company.company_description || company.description) && (
              <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="text-xl font-semisemibold text-[#1a202c] mb-5">About the Organization</h2>
                <p className="text-[15px] leading-relaxed text-slate-500 font-medium whitespace-pre-line">
                  {company.company_description || company.description}
                </p>
              </section>
            )}




            {/* Open Jobs at Institution */}
            <section id="open-jobs" className="space-y-6">
              <h2 className="text-xl font-semibold text-[#1a202c]">Open Jobs at {company.company_name}</h2>
              <div className="space-y-4">
                  {companyJobs.map((job) => (
                    <div 
                      key={job.id}
                      onClick={() => router.push(`/${sanitizeSlug(job.slug || job.id.toString())}`)}
                      className="group cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all duration-300 gap-4 w-full min-w-0"
                    >

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-[#1a202c] group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-400">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-600">
                          {(() => {
                            const min = Number(job.salary_min || 0);
                            const max = Number(job.salary_max || 0);
                            if (!min && !max) return "Negotiable";
                            const fmt = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n.toLocaleString("en-IN");
                            return `₹${fmt(min)} - ₹${fmt(max)}/mo`;
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 self-end sm:self-auto">
                      <span className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 border border-emerald-100/50">
                        {job.job_type === "full_time" ? "Full Time" : "Contract"}
                      </span>
                      <Button
                        asChild
                        className="bg-indigo-900 hover:bg-indigo-950 text-white px-6 py-2 h-auto rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
                      >
                        <Link 
                          href={`/${sanitizeSlug(job.slug || job.id.toString())}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Details <ChevronRight className="h-4 w-4" />
                        </Link>

                      </Button>
                    </div>
                  </div>
                ))}
                {jobsCount === 0 && (
                  <div className="rounded-2xl bg-white border border-dashed border-slate-200 py-12 text-center">
                    <p className="text-slate-400 font-semibold">No current openings available.</p>
                  </div>
                )}
              </div>
            </section>


          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Organization Details */}
            <div className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm">
              <h3 className="text-base font-semibold text-[#1a202c] mb-6 tracking-tight">Organization Details</h3>
              <div className="space-y-6">
                {[
                  { icon: Calendar, label: "FOUNDED", value: company.founded_in },
                  { icon: Users, label: "EMPLOYEES", value: company.employee_count },
                  { icon: Layers, label: "TYPE", value: company.institution_type },
                  { icon: MapPin, label: "LOCATION", value: company.city },
                ].filter(item => item.value).map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8FAFC] text-slate-400">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 tracking-wider mb-0.5">{item.label}</p>
                      <p className="text-sm font-semibold text-slate-800">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar Institutions */}
            <div className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm">
              <h3 className="text-base font-semibold text-[#1a202c] mb-6 tracking-tight">Similar Institutions</h3>
              <div className="space-y-6">
                {similarCompanies.map((c) => (
                  <Link
                    key={c.id}
                    href={`/institutions/${sanitizeSlug(c.slug || c.id.toString())}`}
                    className="group flex items-center gap-4 transition-all"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                      {normalizeMediaUrl(c.company_logo) ? (
                        <img src={normalizeMediaUrl(c.company_logo)} alt="Logo" className="h-full w-full object-contain p-2" />
                      ) : (
                        <span className="text-sm font-black text-slate-300">{(c.company_name?.[0] || "I").toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                        {c.company_name}
                      </p>
                      <p className="text-xs font-medium text-slate-400 truncate">
                         {c.industry} {c.city && `· ${c.city}`}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Institution Location */}
            {(company.address || company.city) && (
              <div className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm">
                <h3 className="text-base font-semibold text-[#1a202c] mb-6 tracking-tight">Institution Location</h3>
                <div className="relative aspect-square w-full rounded-xl border border-slate-100 overflow-hidden bg-slate-50">
                  {mapLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50">
                      <div className="h-10 w-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
                    </div>
                  )}
                  <iframe
                    src={`https://www.google.com/maps?q=${encodeURIComponent(company.address || company.company_name + " " + (company.city || ""))}&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    onLoad={() => setMapLoading(false)}
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="mt-4">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl px-4 h-10 font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <a 
                      href={`https://www.google.com/maps?q=${encodeURIComponent(company.address || company.company_name + " " + (company.city || ""))}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <MapPin className="h-4 w-4" />
                      Open Google Maps
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
