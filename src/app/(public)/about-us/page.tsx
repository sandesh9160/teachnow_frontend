import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";
import { getAboutUs } from "@/hooks/useHomepage";
import AboutPageClient from "./AboutPageClient";

// Disable caching entirely so updates are immediate
export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  let sections = [];
  try {
    const data = await getAboutUs();
    sections = (data || [])
      .filter((s: any) => s.is_active)
      .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
  } catch (error) {
    // Silently fail, rendering empty sections
  }

  const breadcrumbItems = [{ label: "About Us", isCurrent: true }];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Consistent Breadcrumb Bar */}
      <div className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-1.5">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>
      
      <AboutPageClient sections={sections} />
    </div>
  );
}



