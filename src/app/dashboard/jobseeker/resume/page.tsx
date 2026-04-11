"use client";

import { useEffect, useRef, useState } from "react";
import { useResumes } from "@/hooks/useResumes";
import { useCV } from "@/hooks/useCV";
import {
  Loader2,
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  FileUp,
  Download,
  Eye,
  FileCheck,
  Monitor,
  Clock,
  X
} from "lucide-react";
// import { Button } from "@/shared/ui/Buttons/Buttons";
// import { Badge } from "@/shared/ui/Badge/Badge";
import { toast } from "sonner";
import { normalizeMediaUrl } from "@/lib/utils";

export default function ResumeManagementPage() {
  const {
    resumes = [],
    loading,
    upload,
    remove,
    setDefault,
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

  const [uploading, setUploading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number | string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);
  const [lastGeneratedCV, setLastGeneratedCV] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    try {
      setUploading(true);
      await upload(file);
      toast.success("Resume uploaded successfully!");
    } catch {
      toast.error("Failed to upload resume.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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

  const handleSetDefault = async (id: number | string) => {
    try {
      await setDefault(id);
      toast.success("Default resume updated.");
    } catch {
      toast.error("Failed to set default.");
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await remove(id);
      toast.success("Deleted.");
    } catch {
      toast.error("Failed to delete.");
    }
  };

  const handleDeleteGenerated = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this generated CV?")) return;
    try {
      await removeGenerated(id);
      toast.success("Generated CV deleted.");
    } catch {
      toast.error("Failed to delete generated CV.");
    }
  };

  if (loading && resumes.length === 0 && generatedResumes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-50 animate-pulse" />
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 absolute inset-0" />
        </div>
        <p className="text-black font-semibold text-xs">Loading profile...</p>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div className="relative pl-4">
          <div className="absolute left-0 top-1 bottom-1 w-1 bg-indigo-600 rounded-full" />
          <h1 className="text-lg md:text-2xl font-semibold text-black tracking-tight">
            Resume Hub
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-[11px] md:text-xs">Manage files and generate custom layouts.</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || loading}
            className="rounded-xl font-semibold bg-indigo-600 text-white h-9 px-4 md:px-5 active:scale-95 transition-all text-[11px] md:text-xs shadow-lg shadow-indigo-600/15 flex items-center gap-2"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Upload file
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-12 space-y-12">

          <section className="space-y-6">
            <div className="flex items-center gap-3 px-1">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700">
                 <FileCheck className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-semibold text-black tracking-tight">Professional Templates</h2>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl md:rounded-2xl p-4 md:p-8 shadow-sm">
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className={`group relative flex flex-col bg-white border border-slate-100 rounded-lg md:rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${selectedTemplate === tpl.id ? 'border-indigo-600 ring-4 ring-indigo-50' : 'hover:border-indigo-200 hover:shadow-lg'}`}
                    onClick={() => setPreviewTemplate(tpl)}
                  >
                    <div className="aspect-[4/5] bg-slate-50/50 relative overflow-hidden flex items-center justify-center p-3 md:p-4 border-b border-slate-50">
                      {(tpl.preview_image || tpl.preview_url) ? (
                        <img
                          src={normalizeMediaUrl(tpl.preview_image || tpl.preview_url || "")}
                          alt={tpl.name}
                          className="w-full h-full object-cover rounded shadow-md transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <FileText className="w-10 h-10 md:w-12 md:h-12 text-slate-100" />
                      )}
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white p-2 md:p-2.5 rounded-full shadow-xl">
                          <Eye className="w-4 h-4 md:w-4.5 md:h-4.5 text-indigo-700" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                      <div className="flex items-center justify-between gap-1.5 min-w-0">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-black text-[11px] md:text-[13px] leading-tight break-words">{tpl.name}</h4>
                          <span className="text-[8px] md:text-[9px] font-semibold text-indigo-700 mt-1 md:mt-1.5 block opacity-60">Verified layout</span>
                        </div>
                        {selectedTemplate === tpl.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-700 shrink-0" />
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerate(tpl.id);
                        }}
                        disabled={cvLoading}
                        className="rounded-xl font-semibold text-[9px] md:text-[10px] w-full h-9 bg-indigo-600 text-white hover:bg-black transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5 md:gap-2"
                      >
                        {cvLoading && selectedTemplate === tpl.id ? <Loader2 className="w-3 h-3 md:w-3.5 md:h-3.5 animate-spin" /> : <FileCheck className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {lastGeneratedCV && (
            <div className="bg-slate-900 rounded-xl md:rounded-2xl border border-slate-800 p-6 md:p-10 mb-8 md:mb-10 animate-in slide-in-from-bottom duration-700 shadow-2xl relative overflow-hidden">
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

          {/* List Section */}
          <section className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-2.5 md:gap-3 px-1">
               <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700">
                  <Upload className="w-3.5 h-3.5 md:w-4 md:h-4" />
               </div>
               <h2 className="text-base md:text-lg font-semibold text-black tracking-tight">Saved Resumes</h2>
            </div>

            <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm">
              {loading && !uploading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-200 mb-2" />
                  <p className="text-slate-400 font-medium text-[10px] tracking-wider">Syncing documents...</p>
                </div>
              ) : resumes.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {resumes.map((resume: any) => {
                    const ext = resume.file_name?.split('.').pop()?.toLowerCase() || 'doc';
                    const isPdf = ext === 'pdf';
                    const previewUrl = resume.url || resume.file || resume.file_url || resume.resume_file;

                    return (
                      <div key={resume.id} className={`p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${resume.is_default ? 'bg-indigo-50/15' : 'hover:bg-slate-50/40'}`}>
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${resume.is_default ? 'bg-indigo-700 border-indigo-700 text-white shadow-md' : 'bg-white border-slate-100 text-slate-400'}`}>
                            <FileText className="w-5.5 h-5.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center flex-wrap gap-2.5 mb-1">
                              <h4 className="font-semibold text-black text-sm leading-tight break-words">
                                {resume.title || resume.file_name}
                              </h4>
                              {resume.is_default ? (
                                <span className="text-[9px] font-semibold text-indigo-700 bg-white border border-indigo-100 px-2 py-0.5 rounded shadow-xs shrink-0">Primary</span>
                              ) : (
                                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border shrink-0 ${isPdf ? 'text-rose-600 border-rose-100 bg-rose-50' : 'text-blue-600 border-blue-100 bg-blue-50'}`}>
                                  {ext.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-medium text-slate-500">
                              <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 opacity-60" /> {new Date(resume.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-200" />
                              <span className="text-black/50">Stable Professional CV</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 border-t md:border-t-0 border-slate-50 pt-4 md:pt-0">
                          {!resume.is_default && (
                            <button
                              onClick={() => handleSetDefault(resume.id)}
                              className="h-8.5 px-5 rounded-lg font-semibold text-[11px] bg-white border border-slate-200 text-black hover:border-black transition-all active:scale-95"
                            >
                              Set Main
                            </button>
                          )}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                if (previewUrl) window.open(normalizeMediaUrl(previewUrl), '_blank');
                                else toast.error("Preview URL not found");
                              }}
                              className="h-8.5 w-8.5 flex items-center justify-center bg-slate-50 text-black hover:bg-black hover:text-white rounded-lg border border-slate-100 transition-all shadow-sm"
                            >
                              <Eye className="w-4.5 h-4.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(resume.id)}
                              className="h-8.5 w-8.5 flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg border border-rose-100 transition-all shadow-sm"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-16 text-center flex flex-col items-center">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-5 text-slate-100 border border-slate-50">
                    <FileUp className="w-7 h-7" />
                  </div>
                  <p className="text-black font-semibold text-base mb-1">No resumes found</p>
                  <p className="text-slate-500 font-medium text-xs max-w-xs leading-relaxed">Upload a file to enable instant job applications.</p>
                </div>
              )}
            </div>
          </section>

          {/* Generated History */}
          <section className="space-y-4 pt-4">
            <div className="flex items-center gap-2.5 md:gap-3 px-1">
              <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700">
                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </div>
              <h2 className="text-base md:text-lg font-semibold text-black tracking-tight">Built History ({generatedResumes.length})</h2>
            </div>

            {loading && generatedResumes.length === 0 ? (
              <div className="flex justify-center py-20 bg-slate-50/20 rounded-2xl border border-slate-100">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-100" />
              </div>
            ) : generatedResumes.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {generatedResumes.map((cv: any) => (
                  <div key={cv.id} className="bg-white rounded-xl md:rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all group shadow-sm flex flex-col relative">
                    <div className="aspect-[4/5] bg-white relative transition-all overflow-hidden border-b border-slate-50 rounded-t-xl md:rounded-t-2xl">
                      <div className="absolute inset-0 pointer-events-none bg-white rounded-t-xl md:rounded-t-2xl">
                        <iframe
                          src={`https://docs.google.com/viewer?url=${encodeURIComponent(normalizeMediaUrl(cv.pdf_path))}&embedded=true`}
                          className="w-[300%] h-[300%] scale-[0.33] origin-top-left border-none opacity-80 group-hover:opacity-100 transition-all bg-white"
                          title="CV Preview"
                        />
                      </div>
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center p-3 rounded-t-xl md:rounded-t-2xl">
                        <button
                          className="w-full h-8 md:h-9 bg-white text-black rounded-lg font-semibold text-[10px] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-slate-100"
                          onClick={() => window.open(normalizeMediaUrl(cv.pdf_path), '_blank')}
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </div>
                    </div>
                    <div className="p-3 md:p-4 flex flex-col gap-3 bg-white">
                      <div className="flex items-start justify-between gap-1.5 min-w-0">
                        <div className="min-w-0 flex-1 text-left">
                          <h4 className="font-semibold text-black text-[11px] md:text-[13px] leading-tight break-words">Stable Professional CV</h4>
                          <span className="text-[9px] font-medium text-slate-400 mt-1 block opacity-60">ID: #{cv.id}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteGenerated(cv.id)}
                          className="h-7 w-7 md:h-8 md:w-8 flex items-center justify-center text-rose-500 bg-rose-50 rounded-lg hover:bg-rose-600 hover:text-white transition-all shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        className="w-full h-8 md:h-9 bg-indigo-600 text-white hover:bg-black rounded-lg md:rounded-xl font-semibold text-[10px] md:text-[11px] transition-all shadow-lg shadow-indigo-600/10 active:scale-95 flex items-center justify-center gap-1.5"
                        onClick={() => handleDownload(cv.pdf_path)}
                      >
                        <Download className="w-3 h-3 md:w-3.5 md:h-3.5" /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50/40 rounded-xl md:rounded-2xl p-10 md:p-16 text-center">
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
            className="absolute inset-0 bg-slate-900/10 cursor-pointer"
            onClick={() => setPreviewTemplate(null)}
          />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col p-0 overflow-hidden animate-in slide-in-from-right duration-500 border-l border-slate-100">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-50 bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-lg font-semibold text-black">{previewTemplate.name}</h3>
                <p className="text-indigo-700 text-[11px] font-medium mt-0.5">Simple resume template</p>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-black hover:text-white flex items-center justify-center transition-all text-black"
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
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
                    <FileText className="w-16 h-16 text-slate-100" />
                    <p className="text-slate-400 text-xs font-semibold">No preview available</p>
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-8 pb-20">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest pl-0.5">Key features</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: CheckCircle2, text: "Good for filters", color: "text-emerald-700", bg: "bg-emerald-50" },
                      { icon: Monitor, text: "Clear design", color: "text-indigo-700", bg: "bg-indigo-50" },
                      { icon: FileCheck, text: "Work history", color: "text-blue-700", bg: "bg-blue-50" },
                      { icon: Clock, text: "Quick to build", color: "text-amber-700", bg: "bg-amber-50" }
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-3.5 bg-white border border-slate-100 rounded-xl shadow-sm">
                        <div className={`p-1.5 ${feature.bg} rounded-lg`}>
                           <feature.icon className={`w-3.5 h-3.5 ${feature.color}`} />
                        </div>
                        <span className="text-[11px] font-medium text-black">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-indigo-700 rounded-2xl shadow-lg ring-1 ring-indigo-800">
                  <h4 className="text-sm font-semibold text-white mb-1">Resume builder</h4>
                  <p className="text-[11px] text-indigo-100 leading-relaxed font-medium">
                    Our simple builder helps highlight your skills to employers and helps you get hired.
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar Action */}
            <div className="p-6 border-t border-slate-50 bg-white sticky bottom-0">
              <button
                className="w-full h-12 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-black"
                onClick={() => {
                  handleGenerate(previewTemplate.id);
                  setPreviewTemplate(null);
                }}
                disabled={cvLoading}
              >
                {cvLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                Build My Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
