"use client";

import { Sparkles } from "lucide-react";

interface TermsSection {
  id: number;
  parent_id: number | null;
  title: string;
  content: string;
  display_order: number;
  is_active: number | boolean;
  updated_at: string;
  children?: TermsSection[];
}

export default function TermsPageClient({ sections, lastUpdated }: { sections: TermsSection[], lastUpdated: string | null }) {
  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* --- Page Header --- */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Terms and Conditions
          </h1>
          {lastUpdated && (
            <p className="text-sm text-slate-400 uppercase tracking-widest font-bold">
              Last updated: {lastUpdated}
            </p>
          )}
        </div>
      </header>

      {/* --- Main Content Card --- */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 sm:p-12 md:p-16 motion-div">
          {sections.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-8 h-8 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-medium text-sm">Terms and conditions are being updated. Please check back soon.</p>
            </div>
          ) : (
            <div className="rich-text">
              {sections.map((section) => (
                <div key={section.id}>
                  {/* Section Title */}
                  {section.title && (
                    <h2>{section.title}</h2>
                  )}

                  {/* Section Content */}
                  <div dangerouslySetInnerHTML={{ __html: section.content }} />

                  {/* Render Children (Detail Blocks) */}
                  {section.children && section.children.length > 0 && (
                    <>
                      {section.children
                        .filter((child) => child.is_active)
                        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                        .map((child) => (
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
        <div className="flex items-center justify-center gap-6 text-[13px] font-bold uppercase tracking-wider">
          <a href="/privacy-policy" className="text-slate-400 hover:text-primary transition-colors">Privacy Policy</a>
          <div className="h-4 w-px bg-slate-200" />
          <a href="/contact-us" className="text-slate-400 hover:text-primary transition-colors">Contact Support</a>
        </div>
      </div>
    </div>
  );
}
