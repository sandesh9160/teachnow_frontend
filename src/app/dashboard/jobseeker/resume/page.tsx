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
import { Button } from "@/shared/ui/Buttons/Buttons";
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-primary/20 animate-pulse" />
          <Loader2 className="w-12 h-12 animate-spin text-primary absolute inset-0" />
        </div>
        <p className="text-slate-400 font-semibold text-sm">Loading your professional profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 md:px-0 relative">
      {/* Generation Overlay */}
      {cvLoading && selectedTemplate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-50 flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center space-y-6 max-w-sm w-full mx-4 border border-slate-100">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary/10 animate-ping absolute inset-0" />
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-slate-800 font-bold text-lg">Generating Professional CV</h3>
              <p className="text-slate-500 text-sm mt-1 font-medium">Please wait while our AI architect builds your high-converting resume.</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            Professional Resume
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-sm">Upload master resumes or build high-converting teacher CVs.</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="hidden"
          />
          <Button
            variant="default"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || loading}
            className="rounded-xl font-semibold h-10 px-6 active:scale-95 transition-all text-sm shadow-lg shadow-primary/10"
          >
            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            Upload Resume
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-12 space-y-12">

          <section className="space-y-6">
            <div className="flex items-center gap-3 pl-1">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-sm shadow-indigo-100" />
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Resume Templates</h2>
            </div>

            <div className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className={`group relative flex flex-col bg-white border rounded-xl overflow-hidden shadow-sm transition-all duration-300 cursor-pointer ${selectedTemplate === tpl.id ? 'border-primary ring-1 ring-primary/20 scale-[1.02]' : 'border-slate-100 hover:border-slate-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50'}`}
                    onClick={() => setPreviewTemplate(tpl)}
                  >
                    <div className="aspect-4/5 bg-slate-50 relative overflow-hidden flex items-center justify-center p-6 grayscale-[0.2] group-hover:grayscale-0 transition-all border-b border-slate-50">
                      {(tpl.preview_image || tpl.preview_url) ? (
                        <img
                          src={normalizeMediaUrl(tpl.preview_image || tpl.preview_url || "")}
                          alt={tpl.name}
                          className="w-full h-full object-cover rounded shadow-sm transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <FileText className="w-12 h-12 text-slate-200" />
                      )}
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-md border border-white/30 p-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-800 text-[14px] leading-tight">{tpl.name}</h4>
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block">ATS Optimized</span>
                        </div>
                        {selectedTemplate === tpl.id && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerate(tpl.id);
                        }}
                        disabled={cvLoading}
                        className="rounded-xl font-bold text-[12px] w-full h-9 bg-primary text-white hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                      >
                        {cvLoading && selectedTemplate === tpl.id ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <FileText className="w-3.5 h-3.5 mr-2" />}
                        Generate CV
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {lastGeneratedCV && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 pt-6 animate-in zoom-in-95 duration-500 shadow-2xl shadow-primary/10">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">CV Preview Ready</h3>
                    <p className="text-slate-400 text-xs font-medium">Your generated professional CV is ready for use.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" className="text-white hover:bg-white/5 rounded-xl font-semibold text-sm" onClick={() => setLastGeneratedCV(null)}>
                    <X className="w-4 h-4 mr-2" /> Close
                  </Button>
                  <Button variant="default" className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold px-8 shadow-xl shadow-primary/20" onClick={() => handleDownload(lastGeneratedCV)}>
                    <Download className="w-4 h-4 mr-2" /> Download Full PDF
                  </Button>
                </div>
              </div>
              <div className="aspect-4/6 w-full max-w-4xl mx-auto rounded-lg overflow-hidden border border-white/5 shadow-2xl bg-white shadow-black/40">
                <iframe
                  src={`${lastGeneratedCV}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-full"
                  style={{ border: 'none' }}
                  title="CV Preview"
                />
              </div>
            </div>
          )}

          <section className="space-y-6">
            <div className="flex items-center gap-3 pl-1">
              <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm shadow-blue-100" />
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Uploaded Resumes</h2>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden p-2">
              {loading && !uploading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-primary/10" />
                </div>
              ) : resumes.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {resumes.map((resume: any) => {
                    const ext = resume.file_name?.split('.').pop()?.toLowerCase() || 'doc';
                    const isPdf = ext === 'pdf';
                    const previewUrl = resume.url || resume.file || resume.file_url || resume.resume_file;

                    return (
                      <div key={resume.id} className={`p-5 flex items-center justify-between gap-4 transition-all rounded-xl ${resume.is_default ? 'bg-emerald-50/20' : 'hover:bg-slate-50/50'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${resume.is_default ? 'bg-emerald-100 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center flex-wrap gap-2 mb-0.5">
                              <h4 className="font-bold text-slate-800 text-[14px] leading-tight">
                                {resume.title || resume.file_name}
                              </h4>
                              {resume.is_default ? (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">Primary</span>
                              ) : (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${isPdf ? 'text-rose-500 border-rose-100 bg-rose-50' : 'text-blue-500 border-blue-100 bg-blue-50'}`}>
                                  {ext.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                              <Monitor className="w-3 h-3" /> Indexed on {new Date(resume.created_at).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!resume.is_default && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSetDefault(resume.id)}
                              className="h-9 px-4 rounded-lg font-bold text-[11px] border-slate-200 text-slate-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm"
                            >
                              Set Primary
                            </Button>
                          )}
                          <div className="h-6 w-px bg-slate-100 mx-1 hidden md:block" />
                          <button
                            onClick={() => {
                              if (previewUrl) window.open(normalizeMediaUrl(previewUrl), '_blank');
                              else toast.error("Preview URL not found");
                            }}
                            className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg border border-transparent hover:border-primary/10 transition-all"
                            title="Preview Master Resume"
                          >
                            <Eye className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(resume.id)}
                            className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-16 text-center flex flex-col items-center">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-200">
                    <FileUp className="w-7 h-7" />
                  </div>
                  <p className="text-slate-400 font-semibold text-sm leading-relaxed">No resumes found.<br />Upload one to start applying.</p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-6 pt-4">
            <div className="flex items-center gap-3 pl-1">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-sm shadow-emerald-100" />
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Generated Resumes ({generatedResumes.length})</h2>
            </div>

            {loading && generatedResumes.length === 0 ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500/10" />
              </div>
            ) : generatedResumes.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {generatedResumes.map((cv: any) => (
                  <div key={cv.id} className="bg-white border border-slate-100 rounded-xl overflow-hidden hover:border-emerald-200 transition-all group shadow-sm flex flex-col">
                    <div className="aspect-4/5 bg-slate-50 relative transition-all overflow-hidden border-b border-slate-50">
                      <div className="absolute inset-0 pointer-events-none bg-white">
                        <iframe
                          src={`https://docs.google.com/viewer?url=${encodeURIComponent(normalizeMediaUrl(cv.pdf_path))}&embedded=true`}
                          className="w-[300%] h-[300%] scale-[0.33] origin-top-left border-none opacity-90 group-hover:opacity-100 transition-opacity"
                          title="CV Preview"
                        />
                      </div>
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="rounded-full h-8 px-6 font-bold text-[11px] pointer-events-auto shadow-2xl"
                          onClick={() => window.open(normalizeMediaUrl(cv.pdf_path), '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-2" /> View
                        </Button>
                      </div>
                    </div>
                    <div className="p-3.5 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="truncate">
                          <h4 className="font-semibold text-slate-800 text-[13px] leading-tight truncate">Teacher CV</h4>
                          <span className="text-[10px] font-medium text-slate-400 mt-0.5 block">ID: {cv.id}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">Saved</span>
                          <button
                            onClick={() => handleDeleteGenerated(cv.id)}
                            className="h-7 w-7 flex items-center justify-center text-rose-500 bg-rose-50 rounded-lg transition-all hover:bg-rose-100"
                            title="Delete Generated CV"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="default"
                        className="w-full h-8 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-bold text-[11px] border-none transition-all shadow-md shadow-emerald-100"
                        onClick={() => handleDownload(cv.pdf_path)}
                      >
                        <Download className="w-3.5 h-3.5 mr-2" /> Download Full PDF
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50/50 border border-slate-100 border-dashed rounded-2xl p-12 text-center">
                <p className="text-slate-400 font-medium text-sm">Your history is currently empty.<br />Build a CV above to get started.</p>
              </div>
            )}
          </section>

        </div>
      </div>

      {/* Template Preview Sidebar */}
      {previewTemplate && (
        <div className="fixed inset-0 z-100 flex justify-end animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
            onClick={() => setPreviewTemplate(null)}
          />
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col p-0 overflow-hidden animate-in slide-in-from-right duration-500">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{previewTemplate.name}</h3>
                <p className="text-slate-500 text-xs font-medium">Professional ATS-Optimized Template</p>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
              <div className="aspect-4/5.5 w-full bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden group relative">
                {(previewTemplate.preview_image || previewTemplate.preview_url) ? (
                  <img
                    src={normalizeMediaUrl(previewTemplate.preview_image || previewTemplate.preview_url || "")}
                    alt={previewTemplate.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                    <FileText className="w-20 h-20 text-slate-100" />
                    <p className="text-slate-400 text-sm font-medium">No preview available</p>
                  </div>
                )}
                {/* Scroll hint/decoration */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-slate-900/10 to-transparent pointer-events-none" />
              </div>

              <div className="mt-8 space-y-6 pb-24">
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Template Features</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: CheckCircle2, text: "ATS Friendly", color: "emerald" },
                      { icon: Monitor, text: "Modern Design", color: "blue" },
                      { icon: FileCheck, text: "Job-Tailored", color: "indigo" },
                      { icon: Clock, text: "Fast Generation", color: "amber" }
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                        <feature.icon className={`w-4 h-4 text-${feature.color}-500`} />
                        <span className="text-xs font-semibold text-slate-600">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
                  <h4 className="text-sm font-bold text-indigo-900 mb-1">AI-Powered Optimization</h4>
                  <p className="text-[11px] text-indigo-600 leading-relaxed font-medium">
                    This template uses our proprietary AI architect to restructure your profile for maximum recruiter engagement.
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar Action */}
            <div className="p-6 border-t border-slate-100 bg-white/80 backdrop-blur-md sticky bottom-0">
              <Button
                variant="default"
                className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
                onClick={() => {
                  handleGenerate(previewTemplate.id);
                  setPreviewTemplate(null);
                }}
                disabled={cvLoading}
              >
                {cvLoading ? (
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                ) : (
                  <FileText className="w-5 h-5 mr-3" />
                )}
                Create Resume from this Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
