"use client";
import Link from "next/link";
import { Institution, Job } from "@/types/homepage";
import { normalizeMediaUrl } from "@/services/api/client";
import {
  MapPin,
  Building,
  Briefcase,
  ChevronRight,
  // ShieldCheck,
  Globe,
  // ArrowRight,
  // Sparkles,
  Mail,
  Phone,
  LocateFixed,
  ExternalLink
} from "lucide-react";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";
import { sanitizeSlug } from "@/lib/utils";
// import JobCard from "@/shared/cards/JobCard/JobCard";

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
  const companyLogo = normalizeMediaUrl(company?.company_logo);
  const logoFallback = (company?.company_name?.[0] || "I").toUpperCase();

  const breadcrumbItems = [
    { label: "Jobs", href: "/jobs" },
    { label: company.company_name || "Institution", isCurrent: true }
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Premium Glass Sticky Breadcrumb */}
      <div className="border-b border-slate-200/60 bg-white/70 backdrop-blur-md sticky top-20 z-40 transition-shadow">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-10">
            {/* Minimalist Institution Identity (IMAGE MATCH) */}
            <div className="flex flex-col sm:flex-row gap-6 sm:items-start pl-2">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-[#F1F5F9] shadow-inner border border-slate-100 p-2">
                  {companyLogo ? (
                    <img src={companyLogo} alt={company.company_name} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-2xl font-black text-slate-400">{logoFallback}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{company.company_name}</h1>
                  
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                      <Building className="h-4 w-4 text-emerald-500" /> {company.industry || "Education"}
                    </p>
                    <p className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                      <MapPin className="h-4 w-4 text-rose-500" /> {company.city || "Major Hub"}
                    </p>
                    {company.website && (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors underline underline-offset-4 decoration-primary/20">
                        <Globe className="h-4 w-4 text-primary/60" /> {company.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                  </div>
                  
                  <p className="mt-2 text-xs font-semibold text-emerald-600 tracking-tight">
                    {companyJobs.length} Positions currently hiring
                  </p>
                </div>
            </div>

            {/* About Section - Minimalist */}
            <div className="pl-2 space-y-4">
               <h2 className="text-xl font-bold text-slate-900 tracking-tight">About the Organization</h2>
               <p className="text-[15px] leading-relaxed text-slate-500 font-medium max-w-3xl">
                  {company.company_description || company.description || `${company.company_name} is a leading educational institution dedicated to academic excellence. We provide modern facilities and a supportive environment for our educators to grow and inspire students.`}
               </p>
            </div>

            <div className="pl-2 space-y-3">
               <h2 className="text-xl font-bold text-slate-900 tracking-tight">Subjects Hiring For</h2>
               <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(companyJobs.map(j => (j.category as any)?.name || j.category || (j.title || "").split(' ')[0]))).slice(0, 8).map((cat, i) => (
                    <span key={i} className={`px-4 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-default ${
                        i % 3 === 0 ? "bg-blue-50 text-blue-600 border-blue-100" : 
                        i % 3 === 1 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                        "bg-rose-50 text-rose-600 border-rose-100"
                    }`}>
                       {cat}
                    </span>
                  ))}
               </div>
            </div>

            {/* Geographical Context / Map (Subtle Integration) */}
            {(company.address || (company.latitude && company.longitude)) && (
                <div className="pl-2 space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">Institution Location</h2>
                    {company.map_link && (
                      <a 
                        href={company.map_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-1.5"
                      >
                        <ExternalLink className="h-3 w-3" /> View in Google Maps
                      </a>
                    )}
                  </div>
                  
                  <div className="relative aspect-video sm:aspect-[21/6.5] w-full rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                    <iframe
                      src={`https://www.google.com/maps?q=${encodeURIComponent(company.address || company.company_name + " " + (company.city || ""))}&output=embed`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="grayscale-[0.05] contrast-[0.95]"
                    />
                  </div>
                </div>
              )}

            {/* Premium Job Listings (IMAGE MATCH) - Compact */}
            <div className="pl-2 space-y-6">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Open Jobs at {company.company_name}</h2>

              <div className="space-y-3">
                {companyJobs.map((job) => (
                  <div 
                    key={job.id}
                    className="group relative flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-300"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-[16px] font-bold text-slate-900 group-hover:text-primary transition-colors truncate mb-0.5">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-x-3 gap-y-1">
                        <div className="flex items-center gap-1 text-[12px] font-medium text-slate-400">
                          <MapPin className="h-3 w-3" /> {job.location}
                        </div>
                        <div className="flex items-center gap-1 text-[12px] font-bold text-slate-600">
                           {(() => {
                              const min = Number(job.salary_min || 0);
                              const max = Number(job.salary_max || 0);
                              if (!min && !max) return "Negotiable";
                              const fmt = (n: number) => n >= 1000 ? `₹${(n/1000).toFixed(0)}k` : `₹${n}`;
                              return `${fmt(min)} - ${fmt(max)}/mo`;
                            })()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="hidden sm:inline-flex rounded-lg bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600 border border-emerald-100/50">
                        {job.job_type === "full_time" ? "Full Time" : "Contract"}
                      </span>
                      <Link 
                        href={`/${sanitizeSlug(job.slug || job.id.toString())}`}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#1e40af] px-5 py-1 text-[13px] font-bold text-white shadow-md hover:bg-blue-900 hover:scale-[1.01] transition-all"
                      >
                         Apply <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}

                {companyJobs.length === 0 && (
                  <div className="rounded-2xl bg-white border border-dashed border-slate-200 p-12 text-center">
                    <p className="text-sm font-bold text-slate-400">Currently no open positions. Check back soon!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Low-Density Why Section */}
            <section className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight lowercase italic">why work with us?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                        { title: "Professional Growth", desc: "Access to continuous learning and leadership development." },
                        { title: "Great Workspace", desc: "Collaborate in a modern environment with premium facilities." }
                    ].map((feature, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
                            <h4 className="font-bold text-slate-900 text-sm mb-1">{feature.title}</h4>
                            <p className="text-[12px] text-slate-400 font-medium leading-normal">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
          </div>

          {/* Compact Refined Sidebar */}
          <aside className="space-y-8">
            {/* High-Density Info Card */}
            <section className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300">
              <h3 className="relative z-10 text-[11px] font-bold text-primary/60 mb-5 tracking-wide">Institutional Overview</h3>
              
              <div className="space-y-3.5">
                {[
                  { icon: Building, color: "text-blue-500", label: "Organization Type", value: (company as any).institution_type || "School/College" },
                  { icon: Briefcase, color: "text-emerald-500", label: "Industry Sector", value: company.industry || "Education Institution" },
                  { icon: Mail, color: "text-rose-500", label: "Official Email", value: company.email || "Official Contact", href: company.email ? `mailto:${company.email}` : undefined },
                  { icon: Phone, color: "text-amber-500", label: "Direct Phone", value: company.phone || "Connect Now", href: company.phone ? `tel:${company.phone}` : undefined },
                  { icon: LocateFixed, color: "text-indigo-500", label: "Headquarters", value: company.city || "Primary Hub" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3.5 group/stat">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 shadow-inner group-hover/stat:bg-primary/5 group-hover/stat:text-primary transition-all">
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold text-slate-400 leading-none mb-1 group-hover/stat:text-slate-500 transition-colors">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-[13px] font-bold text-slate-700 hover:text-primary transition-colors truncate block">{item.value}</a>
                      ) : (
                        <p className="text-[13px] font-bold text-slate-700 truncate">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Similar Connections Card - Compact */}
            <section className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm">
               <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">Institution Network</h3>
               </div>

               <div className="space-y-5">
                  {similarCompanies.map((c) => (
                    <Link
                      key={c.id}
                      href={`/${sanitizeSlug(c.slug || c.id.toString())}`}
                      className="group flex items-center gap-3 transition-all"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-100 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                        {normalizeMediaUrl(c.company_logo) ? (
                          <img src={normalizeMediaUrl(c.company_logo)} alt="L" className="h-full w-full object-contain p-1" />
                        ) : (
                          <span className="text-[12px] font-black text-primary/40">{(c.company_name?.[0] || "I").toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-slate-800 group-hover:text-primary transition-colors truncate">
                          {c.company_name}
                        </p>
                        <p className="text-[11px] font-medium text-slate-400 truncate">
                           {c.city || "Major City"} · {c.jobs_count || 0} Openings
                        </p>
                      </div>
                    </Link>
                  ))}
               </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
