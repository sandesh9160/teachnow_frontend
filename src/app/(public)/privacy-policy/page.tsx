// import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";
import { getPrivacyPolicy } from "@/hooks/useHomepage";
import { PolicyData } from "@/types/homepage";

// Incremental Static Regeneration (ISR): Cache for 1/2 hour, refresh in background
// export const revalidate = 120;

export default async function PrivacyPolicyPage() {
  // const breadcrumbItems = [{ label: "Privacy Policy", isCurrent: true }];
  let sections: PolicyData[] = [];

  try {
    sections = await getPrivacyPolicy();
  } catch (error) {
    console.error("Failed to load privacy policy:", error);
  }

  const lastUpdated = (sections.length > 0
    ? new Date(Math.max(...sections.map(s => new Date(s.updated_at).getTime()))).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
    : null) || "May 6, 2026";

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* --- Page Header --- */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
            Privacy Policy
          </h1>
          {lastUpdated && (
            <p className="text-sm text-slate-600  tracking-widest  font-bold">
              Last updated: {lastUpdated}
            </p>
          )}
        </div>
      </header>

      {/* --- Main Content Card --- */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 sm:p-12 md:p-16">
          {sections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 font-medium text-sm">Privacy policy is being updated. Please check back soon.</p>
            </div>
          ) : (
            <div className="rich-text privacy-policy-headings">
              {sections.map((section) => (
                <div key={section.id}>
                  {/* Section Title */}
                  {section.title && (
                    <h2>{section.title}</h2>
                  )}

                  {/* Section Content */}
                  <div dangerouslySetInnerHTML={{ __html: section.content }} />

                  {/* Render Children (Detail Blocks) */}
                  {(section as any).children && (section as any).children.length > 0 && (
                    <>
                      {(section as any).children
                        .filter((child: any) => child.is_active)
                        .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
                        .map((child: any) => (
                          <div key={child.id}>
                            {child.title && (
                              <h3>{child.title}</h3>
                            )}
                            <div dangerouslySetInnerHTML={{ __html: child.content }} />
                          </div>
                        ))}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* --- Compact Footer CTA --- */}
      <div className="mt-12 text-center px-4">
        <div className="flex items-center justify-center gap-6 text-[15px] font-bold  tracking-wider">
          <a href="/terms-and-conditions" className="text-slate-600 hover:text-primary transition-colors">Terms of Service</a>
          <div className="h-4 w-px bg-slate-200" />
          <a href="/contact-us" className="text-slate-600 hover:text-primary transition-colors">Contact Support</a>
        </div>
      </div>
    </div>
  );
}
