"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { NoJSStyles } from "@/shared/ui/NoJS";

interface AboutUsSection {
  id: number;
  parent_id: number | null;
  title: string;
  content: string;
  display_order: number;
  is_active: number | boolean;
  children?: AboutUsSection[];
}

export default function AboutPageClient({ sections }: { sections: AboutUsSection[] }) {
  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <NoJSStyles />

      {/* --- Page Header --- */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight motion-h1"
        >
          About <span className="text-primary">TeachNow</span>
        </motion.h1>
      </header>

      {/* --- Main Content Card --- */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 sm:p-12 md:p-16 motion-div"
        >
          {sections.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-8 h-8 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-medium text-sm">Content is being updated. Please check back soon.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {sections.map((section, index) => (
                <section key={section.id} className={index > 0 ? "pt-10 border-t border-slate-200" : ""}>
                  {/* Section Title */}
                  {section.title && (
                    <h2 className="text-[26px] sm:text-[30px] font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
                      {section.title}
                    </h2>
                  )}

                  {/* Section Content */}
                  <div
                    className="rich-text"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />

                  {/* Render Children (Detail Blocks) */}
                  {section.children && section.children.length > 0 && (
                    <div className="mt-8 space-y-8">
                      {section.children
                        .filter((child) => child.is_active)
                        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                        .map((child) => (
                          <div key={child.id} className="space-y-4">
                            {child.title && (
                              <h3 className="text-[20px] sm:text-[22px] font-bold text-slate-900 tracking-tight">
                                {child.title}
                              </h3>
                            )}
                            <div
                              className="rich-text"
                              dangerouslySetInnerHTML={{ __html: child.content }}
                            />
                          </div>
                        ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* --- Compact Footer CTA --- */}
      <div className="mt-12 text-center px-4">
        <div className="flex items-center justify-center gap-6 text-[13px] font-bold uppercase tracking-wider">
          <a href="/jobs" className="text-slate-400 hover:text-primary transition-colors">Browse Jobs</a>
          <div className="h-4 w-px bg-slate-200" />
          <a href="/auth/login" className="text-slate-400 hover:text-primary transition-colors">Join Now</a>
        </div>
      </div>
    </div>
  );
}
