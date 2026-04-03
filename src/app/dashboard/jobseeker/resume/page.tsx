"use client";

import { useEffect, useRef, useState } from "react";
import { useResumes } from "@/hooks/useResumes";
import { useCV } from "@/hooks/useCV";
import { Loader2, FileText, Upload, Trash2, CheckCircle2, FileUp, Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Badge } from "@/shared/ui/Badge/Badge";
import { toast } from "sonner";

export default function ResumeManagementPage() {
  const { resumes, loading, error, fetchResumes, upload, remove, setDefault } = useResumes();
  const {
    templates,
    loading: cvLoading,
    error: cvError,
    fetchTemplates,
    generateCV,
  } = useCV();
  const [uploading, setUploading] = useState(false);
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

  const handleSetDefault = async (id: number | string) => {
    try {
      await setDefault(id);
      toast.success("Default resume updated.");
    } catch {
      toast.error("Failed to set default.");
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      await remove(id);
      toast.success("Resume deleted.");
    } catch {
      toast.error("Failed to delete resume.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 drop-shadow-sm">Manage Resumes</h1>
          <p className="text-gray-500 mt-2">Upload and manage your CVs for job applications.</p>
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
          >
            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            Upload Resume
          </Button>
        </div>
      </div>

      <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-semibold text-gray-900">Resume Builder (CV Templates)</h2>
              <p className="text-xs text-gray-500">
                Quickly generate a polished CV from ready-made templates.
              </p>
            </div>
          </div>
        </div>

        {cvError ? (
          <div className="px-6 py-4 text-sm text-red-700 bg-red-50 border-t border-red-100">
            {cvError}
          </div>
        ) : null}

        {cvLoading && templates.length === 0 ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-5">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="rounded-xl border border-gray-100 p-4 flex flex-col gap-3 bg-gray-50/60 hover:bg-white hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{tpl.name}</h3>
                    {tpl.description && (
                      <p className="text-xs text-gray-500 mt-1">{tpl.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    disabled={cvLoading}
                    onClick={async () => {
                      try {
                        await generateCV({ template_id: tpl.id });
                        toast.success("Your CV is being generated.");
                      } catch {
                        toast.error("Failed to generate CV.");
                      }
                    }}
                  >
                    {cvLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Generate CV
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-sm text-gray-500">
            No CV templates available right now.
          </div>
        )}
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-100 bg-red-50/80 px-6 py-4 text-red-800 text-sm">
          <p className="font-medium">{error}</p>
          <button
            type="button"
            onClick={() => void fetchResumes()}
            className="mt-2 font-semibold text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      ) : null}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading && !uploading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : resumes.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {resumes.map((resume) => (
              <div key={resume.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{resume.title || resume.file_name}</h3>
                    <p className="text-sm text-gray-500">
                      Uploaded on {resume.created_at ? new Date(resume.created_at).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {resume.is_default ? (
                    <Badge variant="success" className="gap-1 flex items-center">
                      <CheckCircle2 className="w-3 h-3" /> Default
                    </Badge>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={loading}
                      onClick={() => void handleSetDefault(resume.id)}
                    >
                      Set as Default
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    disabled={loading}
                    onClick={() => void handleDelete(resume.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <FileUp className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No resumes uploaded</h3>
            <p className="text-gray-500 max-w-sm mb-6">Upload your resume to quickly apply for jobs with just a single click.</p>
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || loading}
            >
              Upload your first resume
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
