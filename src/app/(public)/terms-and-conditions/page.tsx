import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";
import { getTermsAndConditions } from "@/hooks/useHomepage";
import TermsPageClient from "./TermsPageClient";

export default async function TermsAndConditionsPage() {
  let sections: any[] = [];
  let lastUpdated: string | null = null;

  try {
    const data = await getTermsAndConditions();
    sections = (data || [])
      .filter((s: any) => s.is_active)
      .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));

    if (sections.length > 0) {
      const dates = sections.map((s: any) => new Date(s.updated_at).getTime());
      const latest = new Date(Math.max(...dates));
      lastUpdated = latest.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  } catch (error) {
    // Silently fail
  }

  const breadcrumbItems = [{ label: "Terms and Conditions", isCurrent: true }];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Consistent Breadcrumb Bar */}
      <div className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-1.5">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <TermsPageClient sections={sections} lastUpdated={lastUpdated} />
    </div>
  );
}

