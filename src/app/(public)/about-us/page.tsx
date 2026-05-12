import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";
import { getAboutUs } from "@/hooks/useHomepage";
import AboutPageClient from "./AboutPageClient";

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
      {/* --- Breadcrumb Bar --- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      
      <AboutPageClient sections={sections} />
    </div>
  );
}



