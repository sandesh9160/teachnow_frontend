import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";
import { getPrivacyPolicy } from "@/hooks/useHomepage";
import { PolicyData } from "@/types/homepage";

// Incremental Static Regeneration (ISR): Cache for 1/2 hour, refresh in background
export const revalidate = 1800;

export default async function PrivacyPolicyPage() {
  const breadcrumbItems = [{ label: "Privacy Policy", isCurrent: true }];
  let sections: PolicyData[] = [];

  try {
    sections = await getPrivacyPolicy();
  } catch (error) {
    console.error("Failed to load privacy policy:", error);
  }

  const lastUpdated = sections.length > 0 
    ? new Date(Math.max(...sections.map(s => new Date(s.updated_at).getTime()))).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : "March 30, 2026";

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Consistent Breadcrumb Bar */}
      <div className="border-b border-border bg-white/80 backdrop-blur-md sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="bg-white border-b border-slate-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-slate-900 md:text-5xl tracking-tight leading-tight">
              Privacy <span className="text-primary italic">Policy</span>
            </h1>
            <p className="mt-5 text-sm text-slate-400 uppercase tracking-widest font-bold">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-4xl space-y-12">
        {sections.length > 0 ? (
          sections.map((s) => (
            <div key={s.id}>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">{s.title}</h2>
              <div 
                className="text-sm leading-relaxed text-muted-foreground prose prose-slate max-w-none prose-p:mb-4 last:prose-p:mb-0"
                dangerouslySetInnerHTML={{ __html: s.content }}
              />
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-500">No privacy policy content available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
