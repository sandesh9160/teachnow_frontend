"use client";

import { useEffect, useState } from "react";
import { useResumes } from "@/hooks/useResumes";
import { useCV } from "@/hooks/useCV";
import {
  Loader2,
  FileText,
  Trash2,
  CheckCircle2,
  Download,
  Eye,
  FileCheck,
  Clock,
  X,
  Layout,
  Briefcase,
  Zap,
  Sparkles,
} from "lucide-react";
// import { Button } from "@/shared/ui/Buttons/Buttons";
// import { Badge } from "@/shared/ui/Badge/Badge";
import { toast } from "sonner";
import { normalizeMediaUrl } from "@/lib/utils";

export default function ResumeManagementPage() {
  const {
    loading,
    fetchResumes,
    removeGenerated,
    generatedResumes = []
  } = useResumes();
  const {
    templates,
    loading: cvLoading,
    fetchTemplates,
    generateCV,
  } = useCV();

  const [selectedTemplate, setSelectedTemplate] = useState<number | string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);
  const [lastGeneratedCV, setLastGeneratedCV] = useState<string | null>(null);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  const handleGenerate = async (templateId: number | string) => {
    try {
      setSelectedTemplate(templateId);
      const res = await generateCV({ template_id: templateId });
      const url = res?.data?.file_url || res?.file_url || res?.data?.url || res?.url;
      if (url) {
        setLastGeneratedCV(normalizeMediaUrl(url));
        toast.success("CV Generated and added to history!");
      } else {
        toast.success("CV is being generated and will appear below.");
      }
      // Explicitly refresh both master and generated lists
      await fetchResumes();
    } catch {
      toast.error("Failed to generate CV.");
    }
  };

  const handleDownload = (url: string) => {
    if (!url) return;
    const fullUrl = normalizeMediaUrl(url);
    const link = document.createElement("a");
    link.href = fullUrl;
    link.setAttribute("download", `Teacher_Resume_${Date.now()}.pdf`);
    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteGenerated = async (id: number | string) => {
    toast("Delete this document?", {
      id: "confirm-delete-gen",
      duration: Infinity,
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await removeGenerated(id);
            toast.success("Generated CV deleted.");
          } catch {
            toast.error("Failed to delete generated CV.");
          }
        }
      },
      cancel: {
        label: "Keep",
        onClick: () => { }
      },
      classNames: {
        actionButton: "!bg-rose-600 !text-white hover:!bg-rose-700",
        cancelButton: "!bg-slate-100 !text-slate-600 hover:!bg-slate-200",
      }
    });
  };

  if (loading && generatedResumes.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 pb-32 px-4 md:px-8 mt-10 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="h-9 w-64 bg-slate-100 rounded-xl" />
            <div className="h-4 w-96 bg-slate-50 rounded-lg shrink-0" />
            <div className="h-3 w-32 bg-slate-50 rounded-md" />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          <div className="xl:col-span-12 space-y-10">
             {/* Template Grid Skeleton */}
             <div className="space-y-6">
                <div className="h-6 w-48 bg-slate-100 rounded-lg" />
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                   {[1,2,3,4,5,6].map(i => (
                     <div key={i} className="aspect-[3/4] bg-white border border-slate-100 rounded-2xl shadow-sm" />
                   ))}
                </div>
             </div>
             
             {/* History Skeleton */}
             <div className="space-y-6">
                <div className="h-6 w-40 bg-slate-100 rounded-lg" />
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                   {[1,2,3].map(i => (
                     <div key={i} className="aspect-[4/5] bg-white border border-slate-100 rounded-2xl shadow-sm" />
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 px-4 md:px-8 mt-4 lg:mt-6 relative">
      {/* Generation Overlay */}
      {cvLoading && selectedTemplate && (
        <div className="fixed inset-0 bg-slate-900/10 z-50 flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center space-y-5 max-w-xs w-full mx-4 border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-700" />
            </div>
            <div className="text-center">
              <h3 className="text-black font-semibold text-base">Generating CV</h3>
              <p className="text-slate-500 text-[11px] mt-1 font-medium italic">Architecting your professional layout...</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-black tracking-tight">
            AI Resume Builder
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-xs md:text-sm">Generate professional CVs tailored for specific job roles.</p>
          <div className="flex items-center gap-2 mt-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            <p className="text-slate-400 font-semibold text-[11px] md:text-[13px] uppercase tracking-wider">High Fidelity Templates</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-12 space-y-12">

          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700">
                <FileCheck className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-black tracking-tight">Select a Template</h2>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-4 md:p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className={`group relative flex flex-col bg-white border rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${selectedTemplate === tpl.id ? 'border-indigo-600 ring-2 ring-indigo-50 shadow-xl' : 'border-slate-100 hover:border-indigo-200 hover:shadow-lg'}`}
                    onClick={() => setPreviewTemplate(tpl)}
                  >
                    <div className="aspect-[4/5] bg-indigo-50/50 relative overflow-hidden flex items-center justify-center p-2 border-b border-indigo-50/50">
                      {(tpl.preview_image || tpl.preview_url) ? (
                        <img
                          src={normalizeMediaUrl(tpl.preview_image || tpl.preview_url || "")}
                          alt={tpl.name}
                          className="w-full h-full object-cover rounded shadow-sm transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <FileText className="w-8 h-8 text-indigo-100" />
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-black text-[11px] leading-tight truncate">{tpl.name}</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerate(tpl.id);
                        }}
                        disabled={cvLoading}
                        className="mt-3 rounded-lg font-bold text-[9px] w-full h-8 bg-indigo-600 text-white hover:bg-indigo-700 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10"
                      >
                        {cvLoading && selectedTemplate === tpl.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Layout className="w-3 h-3" />}
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {lastGeneratedCV && (
            <div className="bg-black rounded-xl md:rounded-2xl border border-slate-800 p-6 md:p-10 mb-8 md:mb-10 animate-in slide-in-from-bottom duration-700 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 md:mb-8 pb-4 md:pb-6 border-b border-white/5 relative z-10">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="p-2 md:p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg md:rounded-xl border border-emerald-500/20">
                    <FileCheck className="w-5 h-5 md:w-5.5 md:h-5.5" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm md:text-lg">Build Successful</h3>
                    <p className="text-slate-400 text-[10px] md:text-[11px] font-medium mt-0.5">Professional teacher resume is ready.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <button className="text-white hover:bg-white/5 h-8 md:h-9 px-3 md:px-5 rounded-lg font-semibold text-[10px] md:text-xs transition-colors" onClick={() => setLastGeneratedCV(null)}>
                    Dismiss
                  </button>
                  <button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg md:rounded-xl font-semibold h-8 md:h-9 px-4 md:px-6 shadow-lg shadow-indigo-600/10 transition-all flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs" onClick={() => handleDownload(lastGeneratedCV)}>
                    <Download className="w-3.5 h-3.5 md:w-4 md:h-4" /> Download
                  </button>
                </div>
              </div>
              <div className="aspect-[4/6] w-full max-w-2xl mx-auto rounded-2xl overflow-hidden border border-white/5 bg-white relative z-10 shadow-2xl">
                <iframe
                  src={`${lastGeneratedCV}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-full"
                  style={{ border: 'none' }}
                  title="CV Preview"
                />
              </div>
            </div>
          )}

          {/* List Section Removed and moved to Resume Manager */}

          {/* Generated History */}
          <section className="space-y-4 pt-4">
            <div className="flex items-center gap-2 px-1">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-base font-bold text-black tracking-tight">Built History ({generatedResumes.length})</h2>
            </div>

            {loading && generatedResumes.length === 0 ? (
              <div className="flex justify-center py-20 bg-indigo-50/20 rounded-2xl border border-indigo-100/50">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-200" />
              </div>
            ) : generatedResumes.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {generatedResumes.map((cv: any) => (
                  <div key={cv.id} className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all group flex flex-col relative border border-slate-100">
                    <div className="aspect-[4/5] bg-white relative overflow-hidden border-b border-slate-50">
                      <div className="absolute inset-0 pointer-events-none">
                        <iframe
                          src={`https://docs.google.com/viewer?url=${encodeURIComponent(normalizeMediaUrl(cv.pdf_path))}&embedded=true`}
                          className="w-[300%] h-[300%] scale-[0.33] origin-top-left border-none opacity-80 group-hover:opacity-100 transition-all bg-white"
                          title="CV Preview"
                        />
                      </div>
                      <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center p-3">
                        <button
                          className="w-full h-8 bg-white text-indigo-600 rounded-lg font-bold text-[10px] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-indigo-50 hover:bg-indigo-600 hover:text-white"
                          onClick={() => window.open(normalizeMediaUrl(cv.pdf_path), '_blank')}
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </div>
                    </div>
                    <div className="p-3 flex flex-col gap-2 bg-white">
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-black text-[11px] truncate tracking-tight">Resume ID</h4>
                          <span className="text-[9px] font-bold text-slate-400 block tracking-tight">#{cv.id}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteGenerated(cv.id)}
                          className="h-7 w-7 flex items-center justify-center text-rose-500 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        className="w-full h-8 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg font-bold text-[10px] transition-all active:scale-95 flex items-center justify-center gap-1.5"
                        onClick={() => handleDownload(cv.pdf_path)}
                      >
                        <Download className="w-3 h-3" /> Get Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-indigo-50/30 rounded-xl md:rounded-2xl p-10 md:p-16 text-center border border-dashed border-indigo-100">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                  <Clock className="w-6 h-6 text-indigo-300" />
                </div>
                <p className="text-black font-semibold text-sm md:text-base mb-1">No build history yet</p>
                <p className="text-slate-500 text-[10px] md:text-xs font-medium">Use a template above to generate your first professional CV.</p>
              </div>
            )}
          </section>

        </div>
      </div>

      {/* Template Preview Sidebar */}
      {previewTemplate && (
        <div className="fixed inset-0 z-100 flex justify-end animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
            onClick={() => setPreviewTemplate(null)}
          />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col p-0 overflow-hidden animate-in slide-in-from-right duration-500 border-l border-slate-100">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-50 bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-lg font-semibold text-black tracking-tight">{previewTemplate.name}</h3>
                <p className="text-indigo-600 text-[11px] font-semibold mt-1 tracking-wide uppercase">AI Optimized Layout</p>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="w-10 h-10 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all text-indigo-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/10">
              <div className="aspect-[4/5.5] w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden group relative">
                {(previewTemplate.preview_image || previewTemplate.preview_url) ? (
                  <img
                    src={normalizeMediaUrl(previewTemplate.preview_image || previewTemplate.preview_url || "")}
                    alt={previewTemplate.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-3 bg-indigo-50/50">
                    <FileText className="w-16 h-16 text-indigo-100" />
                    <p className="text-indigo-300 text-xs font-semibold">No preview available</p>
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-8 pb-20">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest pl-0.5">Key features</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: CheckCircle2, text: "ATS-Optimized", color: "text-emerald-700", bg: "bg-emerald-50" },
                      { icon: Layout, text: "Modern Layout", color: "text-indigo-700", bg: "bg-indigo-50" },
                      { icon: Briefcase, text: "Career Focused", color: "text-blue-700", bg: "bg-blue-50" },
                      { icon: Zap, text: "Fast Build", color: "text-amber-700", bg: "bg-amber-50" }
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-3.5 bg-white border border-slate-100 rounded-xl shadow-sm">
                        <div className={`p-1.5 ${feature.bg} rounded-lg`}>
                          <feature.icon className={`w-3.5 h-3.5 ${feature.color}`} />
                        </div>
                        <span className="text-[11px] font-semibold text-black">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-indigo-700 rounded-2xl shadow-lg ring-1 ring-indigo-800 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1 relative z-10">AI Smart Resume</h4>
                  <p className="text-[11px] text-indigo-100 leading-relaxed font-medium relative z-10">
                    Our AI-powered builder automatically adapts your experience for top educational institutions.
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar Action */}
            <div className="p-6 border-t border-slate-50 bg-white sticky bottom-0">
              <button
                className="w-full h-12 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-indigo-700"
                onClick={() => {
                  handleGenerate(previewTemplate.id);
                  setPreviewTemplate(null);
                }}
                disabled={cvLoading}
              >
                {cvLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Layout className="w-5 h-5" />}
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
