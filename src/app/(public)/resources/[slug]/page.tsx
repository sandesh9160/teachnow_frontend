"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";
import { Badge } from "@/shared/ui/Badge/Badge";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { useClientSession } from "@/hooks/useClientSession";
import { normalizeMediaUrl } from "@/services/api/client";
import {
  FileText,
  Download,
  BookOpen,
  Lightbulb,
  CheckCircle2,
  User,
  Clock,
  Calendar,
  ChevronRight,
  Share2
} from "lucide-react";
import { toast } from "sonner";
import QuickAuthModal from "@/components/auth/QuickAuthModal";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";

import { ResourceData } from "@/types/homepage";
import { useResource } from "@/hooks/useResource";
import { motion } from "framer-motion";

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

/* -------------------- COMPONENT -------------------- */

export default function ResourceDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const router = useRouter();
  const { resource, related, loading: resourceLoading, error } = useResource(slug);
  const { isLoggedIn, loading: sessionLoading } = useClientSession();

  const [showAuth, setShowAuth] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const performDownload = async (resourceId: number, pdfUrl: string) => {
    try {
      setIsDownloading(true);
      const res = await dashboardServerFetch<any>(`jobseeker/resources/${resourceId}/download`, {
        method: "GET"
      });

      const downloadUrl = res?.data?.download_url || res?.download_url || pdfUrl;

      if (downloadUrl) {
        window.open(normalizeMediaUrl(downloadUrl), "_blank", "noopener,noreferrer");
        toast.success("Download started!");
      } else {
        toast.error("Download link not available.");
      }
    } catch (err) {
      window.open(normalizeMediaUrl(pdfUrl), "_blank", "noopener,noreferrer");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownload = async () => {
    if (!isLoggedIn) {
      setShowAuth(true);
      return;
    }

    if (resource?.id && resource?.pdf) {
      void performDownload(resource.id, resource.pdf);
    } else {
      toast.error("Resource file not found.");
    }
  };

  if (resourceLoading || sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-slate-500 font-medium tracking-tight">Preparing your resource...</p>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-200 p-8 rounded-2xl max-w-sm shadow-xl shadow-slate-200/50"
        >
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Oops!</h2>
          <p className="text-slate-500 mb-6">{error || "Resource unavailable."}</p>
          <Button variant="outline" className="w-full" onClick={() => router.push('/resources')}>
            Browse All Resources
          </Button>
        </motion.div>
      </div>
    );
  }

  const category = inferCategory(resource);
  const coverImage = resource.resource_photo ? normalizeMediaUrl(resource.resource_photo) : null;

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* --- Breadcrumb (Minimal) --- */}
      <div className="container mx-auto px-4 md:px-8 py-6">
        <Breadcrumb
          items={[
            { label: "Resources", href: "/resources" },
            { label: resource.title, isCurrent: true }
          ]}
        />
      </div>

      {/* --- Modern Hero Section --- */}
      <div className="bg-white border-y border-slate-100">
        <div className="px-4 md:px-12 lg:px-20 py-5 md:py-8 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8 lg:items-center">
            <div className="flex-1 max-w-xl space-y-4">
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

              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2">
                <div className="flex items-center gap-3">
                  {resource.author_photo ? (
                    <img src={normalizeMediaUrl(resource.author_photo)} alt={resource.author_name || "Author"} className="w-9 h-9 rounded-full object-cover border border-slate-100" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Created by</p>
                    <p className="font-semibold text-slate-700 text-sm leading-none">{resource.author_name || "Expert Educator"}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Status</p>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-semibold text-slate-600">Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Image Card - Pushed to right end */}
            <div className="lg:w-[500px] lg:ml-auto shrink-0">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative"
              >
                <div className="relative aspect-[16/10] bg-white rounded-xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 p-1.5">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt="Resource cover"
                      className="w-full h-full object-cover rounded-lg bg-slate-50"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center
                     rounded-lg">
                      <FileText className="w-12 h-12 text-slate-200" />
                    </div>
                  )}
                </div>
              </motion.div>
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
                className="rich-text prose prose-slate prose-sm max-w-none 
                prose-headings:text-slate-900 prose-headings:font-semibold 
                prose-p:text-slate-500 prose-p:leading-relaxed 
                prose-li:text-slate-500 prose-li:leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: resource.description || "<p>Explore the comprehensive details of this resource below.</p>",
                }}
              />
            </div>

            <div className="lg:hidden">
              <Button
                className="w-full h-12 rounded-lg font-semibold shadow-lg shadow-primary/20"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? "Processing..." : "Download Now"}
              </Button>
            </div>
          </main>

          <aside className="w-full lg:w-[320px] space-y-6">
            <div className="sticky top-6 space-y-6">
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

                <Button
                  className="w-full h-12 rounded-lg font-semibold shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all"
                  onClick={handleDownload}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    "Processing..."
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download Free
                    </>
                  )}
                </Button>

                {!isLoggedIn && (
                  <p className="mt-3 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    Sign in required
                  </p>
                )}
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

      <QuickAuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        title="Access Resource"
        submitText="Sign in to Download"
        onSuccess={() => {
          if (resource?.id && resource?.pdf) {
            void performDownload(resource.id, resource.pdf);
          }
        }}
      />
    </div>
  );
}
