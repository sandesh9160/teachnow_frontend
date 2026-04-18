"use client";

import { useRef, useState } from "react";
import { useResumes } from "@/hooks/useResumes";
import {
  Loader2,
  FileText,
  Trash2,
  FileUp,
  Eye,
  Download,
  Star,

  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { normalizeMediaUrl } from "@/lib/utils";

export default function ResumeManagerPage() {
  const {
    resumes = [],
    loading,
    upload,
    remove,
    setDefault,
  } = useResumes();

  const [uploading, setUploading] = useState(false);
  const [previewingResume, setPreviewingResume] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDownload = (resume: any) => {
    const url = resume.url || resume.file || resume.file_url || resume.resume_file;
    if (!url) {
      toast.error("File not found");
      return;
    }
    const fullUrl = normalizeMediaUrl(url);
    const link = document.createElement("a");
    link.href = fullUrl;
    link.setAttribute("download", resume.file_name || "resume.pdf");
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
    toast("Delete this resume?", {
      id: "confirm-delete",
      duration: Infinity,
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await remove(id);
            toast.success("Deleted.");
          } catch {
            toast.error("Failed to delete.");
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

  if (loading && resumes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium text-sm">Syncing your resumes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-32 px-4 md:px-8 mt-4 lg:mt-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-black tracking-tight">
            My Resumes
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-xs md:text-sm">Upload and manage multiple resumes to apply for different jobs.</p>
        </div>

        <div className="w-full md:w-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full md:w-auto rounded-xl md:rounded-2xl font-bold bg-indigo-600 text-white h-11 md:h-12 px-6 md:px-8 active:scale-95 transition-all text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 hover:bg-indigo-700"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Upload Resume
          </button>
        </div>
      </div>

      {/* List Section */}
      <div className="space-y-4 pt-2">
        {resumes.length > 0 ? (
          resumes.map((resume: any) => {
            const ext = resume.file_name?.split('.').pop()?.toLowerCase() || 'PDF';

            return (
              <div
                key={resume.id}
                className={`rounded-[22px] p-5 md:px-6 md:py-5 flex flex-col group transition-all duration-300 ${resume.is_default
                    ? 'bg-indigo-50/40 border-[1.5px] border-indigo-100 shadow-sm'
                    : 'bg-white border border-slate-100 hover:border-indigo-200'
                  }`}
              >
                <div className="flex items-start gap-3 md:gap-4 min-w-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                    <FileText className="w-5 h-5 md:w-6 md:h-6 text-indigo-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-black text-[14px] md:text-[15px] leading-tight truncate max-w-[200px] sm:max-w-none">
                        {resume.title && resume.title !== "0" ? resume.title : resume.file_name}
                      </h4>
                      {resume.is_default && (
                        <span className="text-[8px] md:text-[9px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">Default</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 md:mt-1.5 text-[10px] md:text-[11px] text-slate-500 font-medium overflow-hidden">
                      <span className="uppercase shrink-0">{ext}</span>
                      <span>•</span>
                      <span className="shrink-0">{resume.file_size && resume.file_size > 0 ? `${(resume.file_size / 1024).toFixed(0)} KB` : "Document"}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="truncate hidden sm:inline">Uploaded {new Date(resume.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between md:justify-end gap-3 md:gap-7 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100/50">
                  <div className="flex items-center gap-4 md:gap-7">
                    <button
                      onClick={() => setPreviewingResume(resume)}
                      className="w-9 h-9 flex items-center justify-center md:w-auto md:h-auto text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 md:hover:bg-transparent rounded-lg transition-all"
                      title="View"
                    >
                      <Eye className="w-[18px] h-[18px]" />
                      <span className="sm:hidden ml-2 text-[10px] font-bold">View</span>
                    </button>

                    <button
                      onClick={() => handleDownload(resume)}
                      className="w-9 h-9 flex items-center justify-center md:w-auto md:h-auto text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 md:hover:bg-transparent rounded-lg transition-all"
                      title="Download"
                    >
                      <Download className="w-[18px] h-[18px]" />
                      <span className="sm:hidden ml-2 text-[10px] font-bold">Get</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-4 md:gap-7">
                    <button
                      onClick={() => handleSetDefault(resume.id)}
                      className={`w-9 h-9 flex items-center justify-center md:w-auto md:h-auto rounded-lg transition-all ${resume.is_default ? 'text-indigo-700 bg-indigo-50 md:bg-transparent' : 'text-slate-300 hover:text-indigo-700 hover:bg-indigo-50 md:hover:bg-transparent'}`}
                      title="Set Default"
                    >
                      <Star className={`w-[19px] h-[19px] ${resume.is_default ? 'fill-indigo-700' : ''}`} />
                      {!resume.is_default && <span className="sm:hidden ml-2 text-[10px] font-bold">Star</span>}
                    </button>

                    <button
                      onClick={() => handleDelete(resume.id)}
                      className="w-9 h-9 flex items-center justify-center md:w-auto md:h-auto text-slate-400 hover:text-rose-500 hover:bg-rose-50 md:hover:bg-transparent rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-[19px] h-[19px]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-20 text-center flex flex-col items-center bg-white border border-dashed border-slate-200 rounded-3xl">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-200">
              <FileUp className="w-8 h-8" />
            </div>
            <h3 className="text-black font-bold text-lg mb-1">No resumes found</h3>
            <p className="text-slate-500 font-medium text-sm">Upload your first resume to get started.</p>
          </div>
        )}
      </div>

      {/* Resume Tips */}
      <div className="mt-12 bg-[#F1F9F9] border border-[#DEEFEF] rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-yellow-500">💡</span>
          <h3 className="text-black font-bold text-sm">Resume Tips</h3>
        </div>
        <ul className="space-y-3">
          {[
            "Keep different resumes tailored for different job types",
            "Set your most relevant resume as default for quick applications",
            "Update your resumes regularly with latest experience",
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-600 text-[13px] font-medium leading-relaxed">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Preview Sidebar */}
      {previewingResume && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPreviewingResume(null)} />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col p-0 overflow-hidden animate-in slide-in-from-right duration-500 border-l border-slate-100">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-50 bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-black font-bold text-lg leading-none">{previewingResume.title || previewingResume.file_name}</h3>
                <p className="text-[#0046B5] text-[11px] font-semibold mt-2 tracking-wide uppercase">Document Preview</p>
              </div>
              <button
                onClick={() => setPreviewingResume(null)}
                className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-hidden bg-slate-50 relative p-4">
              <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-white">
                <iframe
                  src={`${normalizeMediaUrl(previewingResume.url || previewingResume.file || previewingResume.file_url || previewingResume.resume_file)}#toolbar=0`}
                  className="w-full h-full border-none"
                  title="Resume Preview"
                />
              </div>
            </div>

            {/* Sidebar Actions */}
            <div className="p-6 border-t border-slate-50 bg-white grid grid-cols-2 gap-3 sticky bottom-0">
              <button
                onClick={() => handleDownload(previewingResume)}
                className="h-12 rounded-2xl bg-[#0046B5] text-white text-[13px] font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Copy
              </button>
              {!previewingResume.is_default && (
                <button
                  onClick={() => {
                    handleSetDefault(previewingResume.id);
                    setPreviewingResume(null);
                  }}
                  className="h-12 rounded-2xl bg-indigo-600 text-white text-[13px] font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-indigo-700"
                >
                  <Star className="w-4 h-4 fill-white" />
                  Set Primary
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
