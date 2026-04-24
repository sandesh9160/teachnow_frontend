"use client";

import { useEffect, useState } from "react";
import { Target, Heart, Shield, Loader2, Sparkles } from "lucide-react";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";
import { getAboutUs } from "@/hooks/useHomepage";

interface AboutUsSection {
  id: number;
  parent_id: number | null;
  title: string;
  content: string;
  display_order: number;
  is_active: number | boolean;
  children?: AboutUsSection[];
}

export default function AboutPage() {
  const [sections, setSections] = useState<AboutUsSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getAboutUs();
        // Filter only active sections and their active children
        const activeSections = (data || [])
          .filter((s: any) => s.is_active)
          .map((s: any) => ({
            ...s,
            children: s.children?.filter((c: any) => c.is_active) || []
          }))
          .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
        
        setSections(activeSections);
      } catch (err) {
        //console.error("Failed to load About Us content:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const breadcrumbItems = [{ label: "About Us", isCurrent: true }];

  const getIcon = (title: string, index: number) => {
    const t = title.toLowerCase();
    if (t.includes("mission") || t.includes("target")) return Target;
    if (t.includes("vision") || t.includes("heart") || t.includes("dream")) return Heart;
    if (t.includes("values") || t.includes("shield") || t.includes("trust")) return Shield;
    
    const icons = [Target, Heart, Shield, Sparkles];
    return icons[index % icons.length];
  };

  if (loading) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-slate-400 font-bold text-[10px]  animate-pulse">Loading Story...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      {/* Consistent Breadcrumb Bar */}
      <div className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-16 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-12 py-2">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Dynamic Hero Section - Takes content from the first backend section */}
      <section className="bg-white py-16 sm:py-24 border-b border-slate-100">
        <div className="w-full px-4 sm:px-6 lg:px-12 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold
             text-slate-900 sm:text-6xl">
              {sections[0]?.title?.includes("TeachNow") 
                ? sections[0].title.split("TeachNow")[0] 
                : (sections[0]?.title || "About")}{" "}
              <span className="">TeachNow</span>
            </h1>
            {sections[0]?.content && (
              <div 
                className="mt-6 text-lg text-slate-600  lmax-w-2xl mx-auto"
                dangerouslySetInnerHTML={{ __html: sections[0].content }}
              />
            )}
          </div>
        </div>
      </section>

      <div className="w-full px-4 py-12 sm:px-6 lg:px-12 space-y-20">
        {sections.length === 0 && !loading && (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium text-lg">Content is being updated. Please check back soon.</p>
          </div>
        )}

        {/* Render remaining sections or child blocks */}
        {sections.map((section, sIndex) => (
          <div key={section.id} className="space-y-6 animate-in fade-in duration-1000 slide-in-from-bottom-8">
            {/* Child Blocks Grid (Mission, Vision, etc.) - Stylized as per screenshot */}
            {section.children && section.children.length > 0 && (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                {section.children.map((child, index) => {
                  const Icon = getIcon(child.title, index);
                  return (
                    <div key={child.id} className="group relative rounded-[1.5rem] border border-slate-200/60 bg-white p-8 sm:p-12 text-center shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500">
                      <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">{child.title}</h3>
                      <div 
                        className="text-[15px] text-slate-500 leading-relaxed font-medium"
                        dangerouslySetInnerHTML={{ __html: child.content }}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Additional Primary Sections (if any) */}
            {sIndex > 0 && (section.title || section.content) && (
              <div className="max-w-2xl mx-auto text-center space-y-3 pt-4 border-t border-slate-30">
                {section.title && (
                  <h2 className="text-2xl font-semibold text-slate-900 ">{section.title}</h2>
                )}
                {section.content && (
                  <div 
                    className="text-lg text-slate-600 leading-relaxed font-medium prose prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                )}
              </div>
            )}
          </div>
        ))}

        {/* Impact / Stats Section - Refined Styling */}
        {/* <div className="pt-20 border-t border-slate-100 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
            {[
              { icon: GraduationCap, value: "10,000+", label: "Teaching Jobs" },
              { icon: Building2, value: "5,000+", label: "Institutes" },
              { icon: Users, value: "50,000+", label: "Teachers" },
              { icon: MapPin, value: "200+", label: "Cities" },
            ].map((stat) => (
              <div key={stat.label} className="group text-center p-4">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="h-10 w-10" strokeWidth={1.5} />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 leading-none">{stat.value}</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3">{stat.label}</div>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
}


