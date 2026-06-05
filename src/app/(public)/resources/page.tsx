import { AlertCircle } from "lucide-react";
import { getResources } from "@/hooks/useHomepage";
import { ResourceData } from "@/types/homepage";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";
import ResourcesClient from "./ResourcesClient";

// Incremental Static Regeneration (ISR): Cache for 15 minutes, refresh in background
export const revalidate = 0;

export default async function ResourcesPage() {
  let allResources: ResourceData[] = [];
  let error: string | null = null;

  try {
    const { data } = await getResources(1, 100);
    allResources = (data || []).filter((item) => item?.slug && item?.is_visible !== 0);
  } catch (err) {
    error = "Failed to load resources";
  }

  const breadcrumbItems = [
    { label: "Teaching Resources", isCurrent: true },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Consistent Breadcrumb Bar */}
      <div className="border-b border-border bg-white/80 backdrop-blur-md sticky top-16 z-40">
        <div className="w-full px-4 py-2 sm:px-6 lg:px-12">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Consistent Header Section */}
      <section className="bg-white border-b border-slate-100 py-4 sm:py-5">
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl tracking-tight mb-2">
            Teaching Resources
          </h1>
          <p className="text-base text-slate-500 max-w-2xl font-medium leading-relaxed">
            Explore our curated collection of free templates, worksheets, and guides designed specifically for educators and teaching professionals.
          </p>
        </div>
      </section>

      {error ? (
        <div className="w-full px-4 py-20 sm:px-6 lg:px-12">
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm text-slate-500">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive/50 mb-4" />
            <p className="text-lg font-medium">{error}</p>
          </div>
        </div>
      ) : (
        <ResourcesClient initialResources={allResources} />
      )}
    </div>
  );
}
