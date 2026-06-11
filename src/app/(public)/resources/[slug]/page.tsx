import Link from "next/link";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";
import { Badge } from "@/shared/ui/Badge/Badge";
import { getResourceBySlug, getResources } from "@/hooks/useHomepage";
import { normalizeMediaUrl } from "@/services/api/client";
import {
  FileText,
  BookOpen,
  Lightbulb,
  CheckCircle2,
  User,
  Clock,
  Calendar,
  ChevronRight,
  Share2
} from "lucide-react";
import { ResourceData } from "@/types/homepage";
import ResourceDetailClient from "./ResourceDetailClient";

// Incremental Static Regeneration (ISR): Cache for 15 minutes, refresh in background
export const revalidate = 900;

/* -------------------- HELPERS -------------------- */

function inferCategory(item: ResourceData): string {
  const keywords = item.meta_keywords?.toLowerCase() || "";
  if (keywords.includes("template")) return "Templates";
  if (keywords.includes("worksheet")) return "Worksheets";
  return "Guides";
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

interface ResourcePageProps {
  readonly params: Promise<{ slug: string }>;
}

export default async function ResourceDetailPage({ params }: ResourcePageProps) {
  const { slug } = await params;
  
  let resource: ResourceData | null = null;
  let related: ResourceData[] = [];
  let error: string | null = null;

  try {
    const found = await getResourceBySlug(slug);
    if (!found?.resource) {
      error = "Resource not found.";
    } else {
      resource = found.resource;
      if (found.similar_resources?.length) {
        related = found.similar_resources.slice(0, 3);
      } else {
        const allResources = await getResources();
        related = (allResources?.data || [])
          .filter((item: ResourceData) => item.slug !== slug)
          .slice(0, 3);
      }
    }
  } catch (err) {
    error = "Failed to load this resource.";
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center bg-slate-50/50">
        <div className="bg-white border border-slate-200 p-8 rounded-2xl max-w-sm shadow-xl shadow-slate-200/50 animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Oops!</h2>
          <p className="text-slate-500 mb-6">{error || "Resource unavailable."}</p>
          <Link href="/resources" className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 font-semibold text-slate-700 hover:bg-slate-50 w-full transition-all">
            Browse All Resources
          </Link>
        </div>
      </div>
    );
  }

  const category = inferCategory(resource);
  const coverImage = resource.resource_photo ? normalizeMediaUrl(resource.resource_photo) : null;

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Consistent Breadcrumb Bar */}
      <div className="border-b border-slate-100 bg-white sticky top-16 z-40">
        <div className="px-4 md:px-12 lg:px-20 py-1.5 w-full max-w-[1600px] mx-auto">
          <Breadcrumb
            items={[
              { label: "Resources", href: "/resources" },
              { label: resource.title, isCurrent: true }
            ]}
          />
        </div>
      </div>

      {/* --- Modern Hero Section --- */}
      <div className="bg-white border-y border-slate-100">
        <div className="px-4 md:px-12 lg:px-20 py-5 md:py-8 w-full max-w-[1600px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 lg:items-center justify-between">
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold">
                  {category}
                </Badge>
                {resource.created_at && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(resource.created_at)}
                  </div>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight tracking-tight">
                {resource.title}
              </h1>

              <p className="text-sm md:text-base text-slate-500 leading-relaxed">
                {resource.meta_description || "Expertly curated teaching material designed to enhance classroom engagement and learning outcomes."}
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
                <div className="flex items-center gap-3">
                  {resource.author_photo ? (
                    <img src={normalizeMediaUrl(resource.author_photo)} alt={resource.author_name || "Author"} className="w-9 h-9 rounded-full object-cover border border-slate-100" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Created by:</p>
                    <p className="font-semibold text-slate-700 text-sm">{resource.author_name || "Expert Educator"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Status:</p>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Image Card - Pushed to right end */}
            <div className="lg:w-[480px] shrink-0">
              <div className="relative animate-in fade-in slide-in-from-right duration-500">
                <div className="relative aspect-[16/10] bg-white rounded-xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 p-1.5">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt="Resource cover"
                      className="w-full h-full object-cover rounded-lg bg-slate-50"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center rounded-lg">
                      <FileText className="w-12 h-12 text-slate-200" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          <main className="flex-1 space-y-6">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Description
                </h2>
                <button className="text-slate-300 hover:text-primary transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              <div
                className="rich-text prose prose-slate prose-sm max-w-none prose-headings:text-slate-900 prose-headings:font-semibold prose-p:text-slate-500 prose-p:leading-relaxed prose-li:text-slate-500 prose-li:leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: resource.description || "<p>Explore the comprehensive details of this resource below.</p>",
                }}
              />
            </div>

            <div className="lg:hidden">
              <ResourceDetailClient resource={resource} isMobileButton={true} />
            </div>
          </main>

          <aside className="w-full lg:w-[320px] space-y-6">
            <div className="sticky top-36 space-y-6 z-10">
              <div className="bg-white rounded-xl border border-slate-100 shadow-lg shadow-slate-200/30 p-5">
                <h3 className="font-bold text-slate-900 mb-5 text-sm uppercase tracking-wider">Specifications</h3>

                <div className="space-y-3 mb-6">
                  {[
                    { label: resource.total_pages ? `${resource.total_pages} Pages` : null, sub: "Length", icon: <FileText className="w-3.5 h-3.5" />, color: "text-blue-500 bg-blue-50" },
                    { label: resource.read_time ? `${resource.read_time} Min` : null, sub: "Read time", icon: <Clock className="w-3.5 h-3.5" />, color: "text-amber-500 bg-amber-50" },
                    { label: "PDF Format", sub: "Instant Access", icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-emerald-500 bg-emerald-50" },
                  ]
                    .filter((item) => item.label)
                    .map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/50 border border-slate-50">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${item.color}`}>
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 leading-none truncate">{item.label}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">{item.sub}</p>
                        </div>
                      </div>
                    ))}
                </div>

                <ResourceDetailClient resource={resource} />
              </div>

              {related.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider flex items-center justify-between">
                    Related
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  </h3>

                  <div className="space-y-3">
                    {related.map((r) => {
                      const rImage = r.resource_photo ? normalizeMediaUrl(r.resource_photo) : null;
                      return (
                        <Link
                          key={r.id}
                          href={`/resources/${r.slug}`}
                          className="group flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-50 transition-all"
                        >
                          <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                            {rImage ? (
                              <img src={rImage} alt={r.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-200">
                                <FileText className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-slate-700 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                              {r.title}
                            </h4>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                              {inferCategory(r)}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
