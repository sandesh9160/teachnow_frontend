"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";
import { getTermsAndConditions } from "@/hooks/useHomepage";

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

export default function TermsAndConditionsPage() {
  const [sections, setSections] = useState<TermsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getTermsAndConditions();
        const activeSections = (data || [])
          .filter((s: any) => s.is_active)
          .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
        
        setSections(activeSections);

        // Find latest updated_at
        if (activeSections.length > 0) {
          const dates = activeSections.map((s: any) => new Date(s.updated_at).getTime());
          const latest = new Date(Math.max(...dates));
          setLastUpdated(latest.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
        }
      } catch (err) {
        // console.error("Failed to load Terms content:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const breadcrumbItems = [{ label: "Terms and Conditions", isCurrent: true }];

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary mb-3" />
        <p className="text-slate-400 font-bold text-[10px] tracking-widest uppercase animate-pulse">Loading Content</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* --- Breadcrumb Bar --- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* --- Page Header --- */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Terms and <span className="text-primary italic">Conditions</span>
          </h1>
          {lastUpdated && (
            <p className="text-sm text-slate-400 uppercase tracking-widest font-bold">
              Last updated: {lastUpdated}
            </p>
          )}
        </motion.div>
      </header>

      {/* --- Main Content Card --- */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 sm:p-12 md:p-16"
        >
          {sections.length === 0 ? (
            <div className="text-center py-12">
               <Sparkles className="w-8 h-8 text-slate-200 mx-auto mb-3" />
               <p className="text-slate-400 font-medium text-sm">Terms and conditions are being updated. Please check back soon.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {sections.map((section, index) => (
                <div key={section.id} className={index > 0 ? "pt-12 border-t border-slate-100 space-y-6" : "space-y-6"}>
                  {/* Section Title */}
                  {section.title && (
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                      {section.title}
                    </h2>
                  )}
                  {/* Section Content */}
                  <div 
                    className="rich-text text-base sm:text-lg leading-relaxed text-slate-600"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                  
                  {/* Children Sections (Recursive if needed, but keeping it simple for now) */}
                  {section.children && section.children.length > 0 && (
                    <div className="pl-6 space-y-8 mt-6 border-l-2 border-slate-50">
                      {section.children
                        .filter(child => child.is_active)
                        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                        .map(child => (
                          <div key={child.id} className="space-y-4">
                            <h3 className="text-xl font-bold text-slate-800">{child.title}</h3>
                            <div 
                              className="rich-text text-base leading-relaxed text-slate-600"
                              dangerouslySetInnerHTML={{ __html: child.content }}
                            />
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
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
