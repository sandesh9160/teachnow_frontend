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
import { toast } from "sonner";
import { normalizeMediaUrl } from "@/lib/utils";

export default function ResumeManagementPage() {
  const {
    loading: resumesLoading,
    fetchResumes,
    removeGenerated,
    generatedResumes = []
  } = useResumes();

  const {
    templates,
    loading: cvLoading,
    fetchTemplates,
    generateCV,
    resumeLimit,
  } = useCV();

  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [lastGeneratedCV, setLastGeneratedCV] = useState<string | null>(null);

  useEffect(() => {
    void fetchTemplates();
    void fetchResumes();
  }, [fetchTemplates, fetchResumes]);

  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0]);
    }
  }, [templates, selectedTemplate]);

  const handleGenerate = async (templateId?: any) => {
    const tplId = templateId || selectedTemplate?.id;
    if (!tplId) return;

    // Check resume generation limit
    if (resumeLimit && resumeLimit.remaining <= 0) {
      toast.error("Your monthly resume generation credits are completed", {
        style: { background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B' },
      });
      return;
    }

    try {
      const res = await generateCV({ template_id: tplId });
      const url = res?.data?.file_url || res?.file_url || res?.data?.url || res?.url;
      if (url) {
        setLastGeneratedCV(normalizeMediaUrl(url));
        toast.success("Generation complete! Successfully created Resume.", {
          style: { background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534' },
        });
      }
      await fetchResumes();
      await fetchTemplates();
    } catch {
      toast.error("Failed to generate PDF.", {
        style: { background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B' },
      });
    }
  };

  const handleDownload = (url: string) => {
    if (!url) return;
    const fullUrl = normalizeMediaUrl(url);
    const link = document.createElement("a");
    link.href = fullUrl;
    link.setAttribute("download", `My_Professional_CV.pdf`);
    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleDeleteGenerated = async (id: number | string) => {
    toast("Remove from history?", {
      description: "This will permanently delete this version.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await removeGenerated(id);
            toast.success("Resume deleted.", {
              style: { background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534' },
            });
          } catch {
            toast.error("Failed to delete.", {
              style: { background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B' },
            });
          }
        }
      }
    });
  };

  if (resumesLoading && generatedResumes.length === 0) {
    return (
      <div className="max-w-[1600px] mx-auto p-6 space-y-10 animate-pulse">
        <div className="h-16 bg-slate-50 rounded-2xl w-full" />
        <div className="flex gap-6">
          <div className="w-64 h-96 bg-slate-50 rounded-2xl" />
          <div className="flex-1 h-[600px] bg-slate-50 rounded-2xl" />
          <div className="w-80 h-[500px] bg-slate-50 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-32 px-4 md:px-8 mt-4 lg:mt-6 relative">
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-bold text-black tracking-tight">
            AI Resume Builder
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-[11px] md:text-xs">Generate professional Resumes tailored for specific job roles.</p>
          {/* <div className="flex items-center gap-2 mt-3">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            <p className="text-slate-400 font-semibold text-[10px] md:text-[11px] uppercase tracking-wider">High Fidelity Templates</p>
          </div> */}
        </div>

        {/* Professional & Colorful Usage Cards */}
        {resumeLimit && (
          <div className="flex flex-col lg:items-end items-start gap-3 w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Card 1: Resume Usage */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:min-w-[220px] w-full shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <h3 className="text-[9px] font-bold text-slate-500 tracking-wide">Resume Usage</h3>
                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[7px] font-bold rounded border border-emerald-100">Live</span>
                </div>
                <div className="flex gap-10">
                  <div>
                    <p className="text-[10px] font-medium text-slate-400 mb-1">Total Limit</p>
                    <p className="text-xl font-bold text-slate-800 leading-none">{resumeLimit.limit}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-slate-400 mb-1">Used</p>
                    <p className="text-xl font-bold text-slate-800 leading-none">{resumeLimit.used}</p>
                  </div>
                </div>
              </div>

              {/* Card 2: Remaining Credits */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:min-w-[220px] w-full shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <h3 className="text-[9px] font-bold text-indigo-500 tracking-wide">Remaining Credits</h3>
                  <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-[7px] font-bold rounded border border-indigo-100">Available</span>
                </div>
                <div className="flex gap-10">
                  <div>
                    <p className="text-[10px] font-medium text-slate-400 mb-1">Remaining</p>
                    <p className="text-xl font-bold text-indigo-600 leading-none">{resumeLimit.remaining}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Colorful Progress Bar with Percentage */}
            <div className="flex flex-col gap-1.5 w-full lg:max-w-[452px]">
              <div className="flex justify-between items-center px-0.5">
                <span className="text-[9px] font-bold text-slate-400">Usage Progress</span>
                <span className={`text-[10px] font-black ${resumeLimit.remaining <= 0 ? 'text-rose-500' : 'text-indigo-600'}`}>
                  {Math.round((resumeLimit.used / resumeLimit.limit) * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${resumeLimit.remaining <= 0 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                  style={{ width: `${Math.min(100, (resumeLimit.used / resumeLimit.limit) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-12 space-y-12">

          <section className="space-y-6">
            <div className="flex items-center gap-2 px-1">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 shadow-sm">
                <FileCheck className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-black tracking-tight">Select a Template</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {templates.map((tpl, index) => (
                <div
                  key={tpl.id}
                  className={`group flex flex-col bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${selectedTemplate?.id === tpl.id ? 'border-indigo-500 shadow-lg ring-1 ring-indigo-500/20' : 'border-slate-100 hover:border-indigo-200 hover:shadow-md'}`}
                  onClick={() => setSelectedTemplate(selectedTemplate?.id === tpl.id ? null : tpl)}
                >
                  {/* Image Container */}
                  <div className="aspect-[4/5] relative overflow-hidden p-3 bg-slate-50/50">
                    <div className="relative w-full h-full bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 transition-all duration-300 group-hover:shadow-md">
                      {(tpl.preview_image || tpl.preview_url) ? (
                        <img
                          src={normalizeMediaUrl(tpl.preview_image || tpl.preview_url || "")}
                          alt={tpl.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-white">
                          <FileText className="w-8 h-8 text-slate-200" />
                          <span className="text-[9px] font-bold text-slate-300 uppercase mt-2">No Preview</span>
                        </div>
                      )}

                      {/* Floating Preview Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTemplate(tpl);
                        }}
                        className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-md shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 border border-white/50 transition-all z-20 active:scale-95"
                        title="View Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Floating Primary Action */}
                      <div className="absolute bottom-3 left-3 right-3 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerate(tpl.id);
                          }}
                          disabled={cvLoading}
                          className="h-8 w-full bg-[#36D7B7] hover:bg-[#2EB89C] text-white rounded-md font-bold text-[10px] shadow-lg shadow-[#36D7B7]/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          {cvLoading && selectedTemplate?.id === tpl.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                          Apply Theme
                        </button>
                      </div>

                      {/* Selection Checkmark */}
                      {selectedTemplate?.id === tpl.id && (
                        <div className="absolute top-2.5 right-2.5 bg-indigo-600 text-white p-1 rounded-full shadow-lg animate-in zoom-in duration-200">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Footer */}
                  <div className="p-4 bg-white">
                    <div className="flex items-start justify-between mb-1.5">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug flex-1 line-clamp-1">{tpl.name}</h4>
                      <span className="text-xs font-bold text-slate-400 ml-3">{index + 1}/{templates.length}</span>
                    </div>
                    {tpl.description && (
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                        {tpl.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {lastGeneratedCV && (
            <div className="bg-black rounded-xl md:rounded-2xl border border-slate-800 p-6 md:p-10 mb-8 md:mb-10 animate-in slide-in-from-bottom duration-700 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8 pb-4 md:pb-6 border-b border-white/5 relative z-10">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="p-2 md:p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg md:rounded-xl border border-emerald-500/20">
                    <FileCheck className="w-5 h-5 md:w-5.5 md:h-5.5" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm md:text-lg">Build Successful</h3>
                    <p className="text-slate-400 text-[10px] md:text-[11px] font-medium mt-0.5">Professional teacher resume is ready.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-end">
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
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(lastGeneratedCV)}&embedded=true`}
                  className="w-full h-full"
                  style={{ border: 'none' }}
                  title="CV Preview"
                />
              </div>
            </div>
          )}

          {/* List Section Removed and moved to Resume Manager */}

          {/* Generated History */}
          <section className="space-y-6 pt-8">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 shadow-sm">
                  <Clock className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-black tracking-tight">Built History <span className="text-slate-300 ml-2 font-medium">({generatedResumes.length})</span></h2>
              </div>
            </div>

            {resumesLoading && generatedResumes.length === 0 ? (
              <div className="flex justify-center py-20 bg-indigo-50/20 rounded-2xl border border-indigo-100/50">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-200" />
              </div>
            ) : generatedResumes.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {generatedResumes.map((cv: any) => (
                  <div key={cv.id} className="group flex flex-col bg-white border border-slate-100 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="aspect-[3/4.2] bg-slate-50 relative overflow-hidden border-b border-slate-50">
                      {/* Document Render Container */}
                      <div className="absolute inset-0 pointer-events-none origin-top-left scale-[0.2] sm:scale-[0.25] w-[500%] sm:w-[400%] h-[500%] sm:h-[400%] bg-white opacity-90 transition-opacity">
                        <iframe
                          src={`https://docs.google.com/viewer?url=${encodeURIComponent(normalizeMediaUrl(cv.pdf_path))}&embedded=true`}
                          className="w-full h-full border-none"
                          title="CV Preview"
                        />
                      </div>

                      {/* Always Visible Delete Button */}
                      <button
                        onClick={() => handleDeleteGenerated(cv.id)}
                        className="absolute top-1.5 right-1.5 h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center bg-white/90 backdrop-blur-md text-rose-500 hover:bg-rose-600 hover:text-white rounded-md shadow-sm transition-all z-10"
                      >
                        <Trash2 className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      </button>
                    </div>

                    <div className="p-2 sm:p-2.5 bg-white flex flex-col gap-2 sm:gap-3">
                      <div>
                        <h4 className="text-[10px] sm:text-[11px] font-bold text-slate-900 truncate leading-tight mb-0.5 sm:mb-1">{cv.title || "AI Generated Resume"}</h4>
                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                          <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tight">
                            {cv.created_at ? new Date(cv.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "Draft"}
                          </span>
                        </div>
                      </div>

                      {/* Always Visible Actions */}
                      <div className="flex gap-1.5 sm:gap-2">
                        <button
                          className="flex-1 h-6 sm:h-7 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-md font-bold text-[8px] sm:text-[9px] transition-all flex items-center justify-center gap-1 sm:gap-1.5 border border-slate-100/50"
                          onClick={() => window.open(normalizeMediaUrl(cv.pdf_path), '_blank')}
                        >
                          <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> View
                        </button>
                        <button
                          className="flex-1 h-6 sm:h-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold text-[8px] sm:text-[9px] transition-all shadow-sm flex items-center justify-center gap-1 sm:gap-1.5"
                          onClick={() => handleDownload(cv.pdf_path)}
                        >
                          <Download className="w-2.5 h-2.5 sm:w-2.5 sm:h-2.5" /> Download
                        </button>
                      </div>
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
