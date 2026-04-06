"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";

import { Button } from "@/shared/ui/Buttons/Buttons";
import { useClientSession, getSharedClientSession } from "@/hooks/useClientSession";
import { normalizeMediaUrl } from "@/services/api/client";
import {
  FileText,
  Download,
  BookOpen,
  Lightbulb,
  GraduationCap,
  CheckCircle2,
  LogIn,
  User,
  Clock,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import QuickAuthModal from "@/components/auth/QuickAuthModal";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";

import { ResourceData } from "@/types/homepage";
import { useResource } from "@/hooks/useResource";

/* -------------------- HELPERS -------------------- */

function inferCategory(item: ResourceData): string {
  const keywords = item.meta_keywords?.toLowerCase() || "";
  if (keywords.includes("template")) return "Templates";
  if (keywords.includes("worksheet")) return "Worksheets";
  return "Guides";
}

function getResourceIcon(category: string) {
  if (category === "Templates") return FileText;
  if (category === "Worksheets") return BookOpen;
  if (category === "Activities") return Lightbulb;
  return GraduationCap;
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
      <div className="min-h-screen flex items-center justify-center p-8 text-center text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="animate-pulse font-medium">Loading amazing resources...</p>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center text-muted-foreground">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-sm">
          <Lightbulb className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <h2 className="text-xl font-bold mb-1">Oops!</h2>
          <p>{error || "Resource unavailable."}</p>
          <Button variant="outline" className="mt-4 w-full bg-white bg-opacity-80 border-red-200 hover:bg-white text-red-700" onClick={() => router.push('/resources')}>Browse All Resources</Button>
        </div>
      </div>
    );
  }

  const category = inferCategory(resource);
  const coverImage = resource.resource_photo ? normalizeMediaUrl(resource.resource_photo) : null;

  return (
    <div className="min-h-screen pb-12 bg-slate-50">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <Breadcrumb
          items={[
            { label: "Resources", href: "/resources" },
            { label: resource.title, isCurrent: true }
          ]}
        />
      </div>

      {/* Banner / Header */}
      <div className="relative w-full overflow-hidden bg-slate-950 flex justify-center items-center min-h-[300px]">
        {coverImage ? (
          <img
            src={coverImage}
            alt="Resource cover"
            className="w-full h-auto max-h-[60vh] object-contain"
          />
        ) : (
          <div className="w-full h-full absolute inset-0 bg-linear-to-br from-primary/80 to-blue-900" />
        )}

        {/* Elegant Black Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-black/40 bg-linear-to-t from-slate-900/95 via-slate-900/50 to-transparent pointer-events-none" />

        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container mx-auto px-4 md:px-8 pb-8 md:pb-12 text-white">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 max-w-3xl drop-shadow-md leading-tight">
              {resource.title}
            </h1>

            <p className="text-base md:text-lg text-white/90 max-w-2xl font-light drop-shadow">
              {resource.meta_description || "Detailed study material and downloadable files tailored for amazing outcomes."}
            </p>
          </div>
        </div>
      </div>

      {/* Category / Date Bar */}
      <div className="container mx-auto px-4 md:px-8 pt-8 pb-4 relative z-10 flex flex-wrap items-center gap-3">
        <span className="text-xs md:text-sm bg-primary/10 text-primary font-medium px-3 py-1.5 rounded-full border border-primary/20">
          {category}
        </span>
        {resource.created_at && (
          <span className="text-sm text-slate-500 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(resource.created_at)}
          </span>
        )}
      </div>

      {/* Main Layout Area */}
      <div className="container mx-auto px-4 md:px-8 pb-8 flex flex-col lg:flex-row gap-8 relative z-10">

        <main className="flex-1">
          {/* Main Description Block */}
          <div className="rounded-2xl bg-white shadow-xl shadow-slate-200/50 p-6 md:p-10 border border-slate-100 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/60">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-600 flex items-center gap-2 mb-6">
              <Lightbulb className="text-primary w-6 h-6" /> About this resource
            </h2>

            <div className="bg-slate-50 rounded-xl p-1 mb-6 border border-slate-100">
              <div
                className="prose prose-slate prose-img:rounded-xl prose-a:text-primary max-w-none p-4 md:p-6 bg-white rounded-lg shadow-sm"
                dangerouslySetInnerHTML={{
                  __html:
                    resource.description ||
                    "<p>No detailed content available.</p>",
                }}
              />
            </div>
          </div>
        </main>

        <aside className="w-full lg:w-[340px] space-y-6">

          {/* Author Card */}
          <div className="rounded-2xl bg-white shadow-xl shadow-slate-200/50 p-6 border border-slate-100">
            <div className="flex items-center gap-4">
              {resource.author_photo ? (
                <img src={normalizeMediaUrl(resource.author_photo)} alt={resource.author_name || "Author"} className="w-14 h-14 rounded-full object-cover shadow-md border-2 border-white ring-2 ring-slate-50" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <User className="w-6 h-6" />
                </div>
              )}
              <div>
                <p className="text-sm text-slate-500 font-medium leading-none mb-1">Created by</p>
                <p className="font-bold text-slate-900 text-lg">{resource.author_name || "Expert Educator"}</p>
              </div>
            </div>
          </div>

          {/* Action / Info Card */}
          <div className="rounded-2xl bg-white shadow-xl shadow-slate-200/50 p-6 border border-slate-100 sticky top-24">
            <h3 className="font-bold text-slate-900 mb-4 text-lg">What's Included</h3>

            <ul className="space-y-3 mb-8">
              {[
                { label: resource.total_pages ? `${resource.total_pages} comprehensive pages` : null, icon: <FileText className="h-4 w-4 text-primary" /> },
                { label: resource.read_time ? `${resource.read_time} min approx. read time` : null, icon: <Clock className="h-4 w-4 text-amber-500" /> },
                { label: resource.pdf ? "High-Quality Downloadable PDF" : null, icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> },
              ]
                .filter((item) => item.label)
                .map((item, idx) => (
                  <li
                    key={item.label || idx}
                    className="flex items-start gap-3 text-sm text-slate-700 bg-slate-50 rounded-lg p-2.5 border border-slate-100"
                  >
                    <div className="mt-0.5 bg-white p-1 rounded shadow-sm">{item.icon}</div>
                    <span className="font-medium pt-0.5">{item.label}</span>
                  </li>
                ))}
            </ul>

            <Button
              className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all mt-2"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </div>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Download Free
                </>
              )}
            </Button>

            {!isLoggedIn && (
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500 text-center font-medium">
                <LogIn className="w-3.5 h-3.5" /> Login required to download
              </div>
            )}
          </div>

          {/* Related Resources */}
          {related.length > 0 && (
            <div className="rounded-2xl bg-white shadow-xl shadow-slate-200/50 p-6 border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-5 text-lg flex items-center gap-2">
                Similar Resources
              </h3>

              <div className="space-y-3">
                {related.map((r) => {
                  const RelatedIcon = getResourceIcon(inferCategory(r));
                  const rImage = r.resource_photo ? normalizeMediaUrl(r.resource_photo) : null;

                  return (
                    <Link
                      key={r.id}
                      href={`/resources/${r.slug}`}
                      className="group flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all"
                    >
                      {rImage ? (
                        <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0 shadow-sm border border-slate-100 relative">
                          <img src={rImage} alt={r.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                      ) : (
                        <div className="h-12 w-12 shrink-0 flex items-center justify-center bg-primary/10 text-primary rounded-lg shadow-sm">
                          <RelatedIcon className="h-5 w-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-primary transition-colors">{r.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {r.read_time ? `${r.read_time} min read` : "Resource"}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Unified Authentication Popup */}
      <QuickAuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        title="Login to Download Resource"
        submitText="Login to Download"
        onSuccess={() => {
          if (resource?.id && resource?.pdf) {
            void performDownload(resource.id, resource.pdf);
          }
        }}
      />
    </div>
  );
}