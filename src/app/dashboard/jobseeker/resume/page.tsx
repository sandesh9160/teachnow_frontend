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
  // Sparkles,
  Download,
  Eye,
  FileCheck,
  Monitor,
  X
} from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Badge } from "@/shared/ui/Badge/Badge";
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

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight underline decoration-primary/10 decoration-8 -underline-offset-2">
            Professional Resume
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-sm">Upload master resumes or build high-converting teacher CVs.</p>
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
            className="rounded font-bold h-10 px-6 active:scale-95 transition-all text-xs"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-2" />}
            Upload Resume
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-12 space-y-10">

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase text-[11px] tracking-widest pl-1">
              <FileCheck className="w-4 h-4" /> Professional Builder
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-none">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className={`group relative flex flex-col bg-slate-50/30 border rounded-xl overflow-hidden transition-all duration-300 ${selectedTemplate === tpl.id ? 'border-primary ring-1 ring-primary/20 bg-white' : 'border-slate-100 hover:border-slate-200 hover:bg-white'}`}
                  >
                    <div className="aspect-4/5 bg-slate-50 relative overflow-hidden flex items-center justify-center p-6 grayscale-[0.8] group-hover:grayscale-0 transition-all border-b border-slate-50">
                      {(tpl.preview_image || tpl.preview_url) ? (
                        <img
                          src={normalizeMediaUrl(tpl.preview_image || tpl.preview_url || "")}
                          alt={tpl.name}
                          className="w-full h-full object-cover rounded shadow-sm"
                        />
                      ) : (
                        <FileText className="w-16 h-16 text-slate-200" />
                      )}
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-tight">{tpl.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-tight">ATS Friendly</p>
                        </div>
                        {selectedTemplate === tpl.id && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleGenerate(tpl.id)}
                        disabled={cvLoading}
                        className="rounded font-bold text-[11px] w-full h-9 bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-none"
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
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">CV Preview Ready</h3>
                    <p className="text-slate-400 text-xs font-medium">Your generated professional CV is ready for use.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" className="text-white hover:bg-white/5 rounded-xl font-bold" onClick={() => setLastGeneratedCV(null)}>
                    <X className="w-4 h-4 mr-2 text-white" /> Close
                  </Button>
                  <Button variant="default" className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold px-8" onClick={() => handleDownload(lastGeneratedCV)}>
                    <Download className="w-4 h-4 mr-2" /> Download PDF
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
            <div className="flex items-center gap-2 text-blue-600 font-bold uppercase text-[11px] tracking-widest pl-1">
              <FileUp className="w-4 h-4" /> Uploaded Master Resumes
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-none transition-all">
              {loading && !uploading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-primary/20" />
                </div>
              ) : resumes.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {resumes.map((resume) => {
                    const extension = resume.file_name?.split('.').pop()?.toUpperCase() || 'DOC';
                    const isPdf = extension === 'PDF';
                    
                    return (
                      <div key={resume.id} className={`p-5 flex items-center justify-between gap-4 transition-all ${resume.is_default ? 'bg-emerald-50/30' : 'hover:bg-slate-50/50'}`}>
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border ${resume.is_default ? 'bg-emerald-100 border-emerald-200 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center flex-wrap gap-2">
                              <h4 className="font-bold text-slate-800 text-[13px] leading-tight truncate max-w-[200px] md:max-w-md">
                                {resume.title || resume.file_name}
                              </h4>
                              {resume.is_default ? (
                                <Badge variant="default" className="text-[9px] h-4.5 px-2 bg-emerald-500 text-white border-none font-bold uppercase tracking-wider">Default Resume</Badge>
                              ) : (
                                <Badge variant="outline" className={`text-[9px] h-4.5 px-2 font-bold uppercase ${isPdf ? 'text-red-500 border-red-100 bg-red-50' : 'text-blue-500 border-blue-100 bg-blue-50'}`}>
                                  {extension}
                                </Badge>
                              )}
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <Monitor className="w-3 h-3" /> Indexed on {new Date(resume.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          {!resume.is_default && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSetDefault(resume.id)}
                              className="h-8 px-4 rounded font-bold text-[10px] border-slate-200 text-slate-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all uppercase tracking-wider"
                            >
                              Set Default
                            </Button>
                          )}
                          <div className="h-8 w-px bg-slate-100 mx-1 hidden md:block" />
                          <button
                            onClick={() => {
                              if (resume.url) window.open(normalizeMediaUrl(resume.url), '_blank');
                            }}
                            className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                            title="Preview Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(resume.id)}
                            className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                            title="Remove Permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-16 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-200">
                    <FileUp className="w-8 h-8" />
                  </div>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-loose text-center">No active resumes found.<br />Upload yours to start applying.</p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-6 pt-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase text-[11px] tracking-widest pl-1">
              <Monitor className="w-4 h-4" /> Generated CV History ({generatedResumes.length})
            </div>

            {loading && generatedResumes.length === 0 ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500/20" />
              </div>
            ) : generatedResumes.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {generatedResumes.map((cv: any) => (
                  <div key={cv.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all group shadow-none flex flex-col">
                    <div className="aspect-4/5 bg-slate-100 relative grayscale-[0.05] hover:grayscale-0 transition-all overflow-hidden border-b border-slate-50">
                      {/* Live document preview via high-reliability proxy */}
                      <div className="absolute inset-0 pointer-events-none bg-white">
                        <iframe 
                          src={`https://docs.google.com/viewer?url=${encodeURIComponent(normalizeMediaUrl(cv.pdf_path))}&embedded=true`}
                          className="w-[300%] h-[300%] scale-[0.33] origin-top-left border-none opacity-95"
                          title="CV Live Preview"
                        />
                      </div>
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <Button 
                          size="sm" 
                          variant="default" 
                          className="rounded-full h-8 px-6 font-bold text-[10px] pointer-events-auto bg-white text-slate-900 hover:bg-slate-100 border-none shadow-xl" 
                          onClick={() => window.open(normalizeMediaUrl(cv.pdf_path), '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-2" /> Live Preview
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="truncate">
                          <h4 className="font-bold text-slate-900 text-xs leading-tight truncate">Professional CV</h4>
                          <p className="text-[11px] text-slate-400 font-bold mt-0.5 tracking-tight uppercase">Doc ID:{cv.id}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] h-5 border-emerald-100 text-emerald-600 bg-emerald-50/50">Stored</Badge>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="w-full h-9 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded font-bold text-[11px] border border-emerald-100 transition-all shadow-none mt-1" 
                        onClick={() => handleDownload(cv.pdf_path)}
                      >
                        <Download className="w-4 h-4 mr-2" /> Download Full PDF
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center">
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-loose">Your generated CV history is currently empty.<br />Use the builder above to create one.</p>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
