"use client";
import Link from "next/link";
import { Institution, Job } from "@/types/homepage";
import { normalizeMediaUrl } from "@/services/api/client";
import {
  MapPin,
  Building,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  Globe,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";
import { sanitizeSlug } from "@/lib/utils";
import JobCard from "@/shared/cards/JobCard/JobCard";

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
    <div className="min-h-screen bg-[#F1F5F9] pb-20">
      {/* Premium Glass Sticky Breadcrumb */}
      <div className="border-b border-slate-200/60 bg-white/70 backdrop-blur-md sticky top-20 z-40 transition-shadow">
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-12">
            {/* Professional Institution Header Card */}
            <section className="overflow-hidden rounded-xl border border-white bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/50">
              <div className="relative h-24 bg-linear-to-br from-primary/5 to-primary/10 border-b border-primary/10" />
              
              <div className="relative -mt-12 px-6 sm:px-10 flex flex-col sm:flex-row gap-6 sm:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-xl ring-8 ring-white border border-slate-100">
                  {companyLogo ? (
                    <img src={companyLogo} alt={company.company_name} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-3xl font-black text-primary/80">{logoFallback}</span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2 pt-1 transition-all">
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200/50">
                      <ShieldCheck className="h-3 w-3" /> Verified Profile
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-primary/5 px-2.5 py-0.5 text-[10px] font-medium text-primary/70 ring-1 ring-primary/10">
                      <Sparkles className="h-3 w-3" /> Premier Partner
                    </span>
                  </div>
                  
                  <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl transition-all">{company.company_name}</h1>
                  
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {company.city || "India"}
                    </p>
                    <p className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                      <Building className="h-3.5 w-3.5 text-slate-400" />
                      {company.industry || "Education Institution"}
                    </p>
                    {company.website && (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-semibold text-primary/80 hover:text-primary transition-colors">
                        <Globe className="h-3.5 w-3.5" /> Visit Website
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 pb-1 shrink-0">
                  <div className="text-center px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 hidden sm:block">
                    <p className="text-[10px] font-medium text-slate-400 leading-none">Openings</p>
                    <p className="mt-1.5 text-xl font-bold text-primary leading-none">{companyJobs.length}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-10 sm:px-10 border-t border-slate-50 mt-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-6 w-1 rounded-full bg-primary/40" />
                  <h2 className="text-xl font-bold text-slate-900">About {company.company_name}</h2>
                </div>
                <div className="prose prose-slate max-w-none">
                  <p className="text-[15px] leading-relaxed text-slate-600 font-medium whitespace-pre-line">
                    {company.company_description || company.description || `Join ${company.company_name}, a leading educational institution dedicated to academic excellence. We provide modern facilities and a supportive environment for our educators to grow and inspire students.`}
                  </p>
                </div>
              </div>
            </section>

            {/* Modern Job Listings Board */}
            <section className="space-y-8">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-bold text-slate-900">Active Opportunities</h2>
                <div className="h-1 flex-1 mx-6 bg-slate-100/50 rounded-full hidden sm:block" />
                <p className="text-xs font-bold text-slate-400">{companyJobs.length} Results Found</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {companyJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    id={job.id}
                    title={job.title}
                    company={company.company_name}
                    location={job.location}
                    type={job.job_type}
                    salary={(() => {
                      const min = Number(job.salary_min || 0);
                      const max = Number(job.salary_max || 0);
                      if (!min && !max) return "Not disclosed";
                      const fmt = (n: number) => n >= 100000 ? `${(n/100000).toFixed(1)}L` : n.toLocaleString("en-IN");
                      return `${fmt(min)} - ${fmt(max)}`;
                    })()}
                    tags={[job.job_type, `${job.experience_required}y Exp`]}
                    posted={new Date(job.created_at || Date.now()).toLocaleDateString('en-GB')}
                    slug={job.slug}
                    logo={company.company_logo}
                  />
                ))}
                
                {companyJobs.length === 0 && (
                  <div className="rounded-xl border-2 border-dashed border-slate-200 p-12 text-center bg-white shadow-sm">
                    <p className="text-sm font-bold text-slate-400">No active positions at the moment.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Compact Refined Sidebar */}
          <aside className="space-y-8">
            {/* High-Density Info Card */}
            <section className="rounded-xl border border-white bg-white p-6 shadow-xl shadow-slate-200/60 ring-1 ring-slate-200/50">
              <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wide">Key Statistics</h3>
              
              <div className="space-y-5">
                {[
                  { icon: Building, label: "Institution Type", value: (company as any).institution_type || "School/College" },
                  { icon: Briefcase, label: "Business Sector", value: company.industry || "Education Institution" },
                  { icon: MapPin, label: "Principal City", value: company.city || "Main Hub" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4 group/stat">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 shadow-inner group-hover/stat:bg-primary/5 group-hover/stat:text-primary transition-all">
                      <item.icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 leading-none mb-1 group-hover/stat:text-slate-500 transition-colors uppercase tracking-tight">{item.label}</p>
                      <p className="text-[13px] font-bold text-slate-700 truncate">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Similar Connections Card */}
            <section className="rounded-xl border border-white bg-white px-6 py-7 shadow-xl shadow-slate-200/60 ring-1 ring-slate-200/50">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Network</h3>
                  <Sparkles className="h-4 w-4 text-primary/40" />
               </div>

               <div className="space-y-4">
                  {similarCompanies.map((c) => (
                    <Link
                      key={c.id}
                      href={`/${sanitizeSlug(c.slug || c.id.toString())}`}
                      className="group flex items-center gap-4 rounded-xl p-2.5 transition-all hover:bg-slate-50"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden group-hover:shadow-md transition-all">
                        {normalizeMediaUrl(c.company_logo) ? (
                          <img src={normalizeMediaUrl(c.company_logo)} alt="L" className="h-full w-full object-contain p-1.5" />
                        ) : (
                          <span className="text-sm font-black text-primary/70">{(c.company_name?.[0] || "I").toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors truncate">
                          {c.company_name}
                        </p>
                        <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {c.city || "India"}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                    </Link>
                  ))}
               </div>
               
               <Link href="/jobs" className="mt-8 flex items-center justify-center gap-2 text-xs font-bold text-primary/60 hover:text-primary transition-colors border-t border-slate-50 pt-6">
                  Explore More <ArrowRight className="h-3.5 w-3.5" />
               </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
