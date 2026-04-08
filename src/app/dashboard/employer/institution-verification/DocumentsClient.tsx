"use client";

import { 
  FileText, 
  Loader2, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  Eye,
  PlusCircle,
  FileUp,
  X,
  ChevronLeft
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Label } from "@/shared/ui/Label/Label";
import { cn, normalizeMediaUrl } from "@/lib/utils";
import { uploadFile } from "@/actions/FileUpload";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import { toast } from "sonner";

interface EmployerDocument {
  id: number;
  employer_id: number;
  document_type: string;
  document_file: string;
  is_verified: number;
  status: string;
  admin_remark: string | null;
  created_at: string;
  updated_at: string;
}

export default function DocumentsClient() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<EmployerDocument[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocType, setSelectedDocType] = useState<string>("");

  const [previewData, setPreviewData] = useState<{ url: string; original: string; name: string } | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await dashboardServerFetch<any>("employer/documents");
      if (res?.status && Array.isArray(res.data)) {
        setDocuments(res.data);
      } else {
        setDocuments([]);
      }
    } catch (e: any) {
      console.error("Failed to fetch documents:", e);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDocuments();
  }, [fetchDocuments]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedDocType) {
      toast.error("Please select a document type first.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("document_file", file);
      formData.append("document_type", selectedDocType);

      const res = await uploadFile<any>("employer/documents/upload", {
        method: "POST",
        data: formData,
      });

      if (res?.status) {
        toast.success("Document uploaded successfully!");
        void fetchDocuments();
      } else {
        toast.error(res?.message || "Failed to upload document.");
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred during upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };


  const handlePreview = (doc: EmployerDocument) => {
    if (!doc.document_file) return;
    const fullUrl = normalizeMediaUrl(doc.document_file);
    const ext = (doc.document_file || "").split('.').pop()?.toLowerCase();
    
    let preview = fullUrl;
    // Use Google Docs Viewer for PDF and Office documents for professional preview and to bypass X-Frame-Options
    if (ext === 'doc' || ext === 'docx' || ext === 'pdf') {
      preview = `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
    }
    
    setIsPreviewLoading(true);
    setPreviewData({
      url: preview,
      original: fullUrl,
      name: (doc.document_type || "Document").replace(/_/g, " ")
    });
  };

  const docTypes = [
    { value: "institution_registration", label: "Institution Registration" },
    { value: "pan_card", label: "PAN Card" },
    { value: "gst_certificate", label: "GST Certificate" },
    { value: "id_proof", label: "Identity Proof (Admin)" },
    { value: "other", label: "Other Supporting Documents" }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4 relative">
      {/* Right Sidebar Preview Panel */}
      {previewData && (
        <div className="fixed inset-0 z-100 overflow-hidden group font-sans">
           <div 
             className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] transition-opacity animate-in fade-in duration-500" 
             onClick={() => setPreviewData(null)}
           />
           
           <div className="absolute inset-y-0 right-0 max-w-full flex">
              <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out border-l border-slate-100">
                 
                 <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-4">
                       <div className="w-11 h-11 rounded-2xl bg-primary/5 text-primary flex items-center justify-center border border-primary/10 shadow-sm transition-transform hover:scale-105">
                          <FileText className="w-5.5 h-5.5" />
                       </div>
                       <div>
                          <h3 className="text-base font-semibold text-slate-800 tracking-tight capitalize">{previewData.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
                             <p className="text-xs font-medium text-slate-400">Record integrity verified</p>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="h-10 w-10 p-0 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
                         onClick={() => setPreviewData(null)}
                       >
                          <X className="w-5 h-5 text-slate-400 group-hover:text-slate-800" />
                       </Button>
                    </div>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto bg-slate-50/10 p-6 flex items-start justify-center custom-scrollbar">
                    <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-full flex items-center justify-center relative">
                       {isPreviewLoading && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[1px] z-10 animate-in fade-in duration-300">
                            <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
                            <p className="text-xs font-medium text-slate-400 mt-3">Syncing preview...</p>
                         </div>
                       )}
                       
                       {previewData.url.match(/\.(jpg|jpeg|png|webp|gif|svg)/i) && !previewData.url.includes('docs.google.com') ? (
                          <img 
                            src={previewData.url} 
                            alt="Document Preview" 
                            onLoad={() => setIsPreviewLoading(false)}
                            className={cn(
                              "w-full h-auto object-contain pointer-events-none p-4 transition-opacity duration-500",
                              isPreviewLoading ? "opacity-0" : "opacity-100"
                            )}
                          />
                       ) : (
                          <iframe 
                            src={previewData.url} 
                            onLoad={() => setIsPreviewLoading(false)}
                            className={cn(
                              "w-full h-[85vh] border-none bg-slate-50 transition-opacity duration-500",
                              isPreviewLoading ? "opacity-0" : "opacity-100"
                            )}
                            title="Document Content"
                          />
                       )}
                    </div>
                 </div>
 
                 <div className="px-6 py-6 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-emerald-600">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">Secure Encryption Active</span>
                       </div>
                       <p className="text-xs font-medium text-slate-300 leading-none">Private institutional data vault</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <Button 
                         variant="outline" 
                         size="sm" 
                         className="h-10 px-5 rounded-xl font-medium text-xs border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                         onClick={() => window.open(previewData.original, "_blank")}
                       >
                          <Eye className="w-4 h-4 mr-2" /> Pop-out
                       </Button>
                       <Button 
                         variant="default" 
                         size="sm" 
                         className="h-10 px-8 rounded-xl font-medium text-xs shadow-lg shadow-primary/10 bg-primary hover:bg-primary/90 transition-all"
                         onClick={() => setPreviewData(null)}
                       >
                          Close
                       </Button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Back Button */}
      <div className="flex items-center gap-2 mb-2">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-primary transition-all group"
        >
          <div className="w-6 h-6 rounded-lg border bg-white flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-all shadow-sm">
            <ChevronLeft className="w-3.5 h-3.5" />
          </div>
          Back to Overview
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-inner">
            <FileText className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Institutional Verification</h1>
            <p className="text-xs font-medium text-gray-400">
               Manage credentials & verification records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-emerald-100" />
              <span className="text-xs font-medium text-emerald-700">Records Synchronized</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
           <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-2 border-l-4 border-indigo-500 pl-3">
                 <ShieldCheck className="w-4 h-4 text-indigo-500" />
                 <h2 className="text-sm font-semibold text-gray-900">Credential Upload</h2>
              </div>

              <div className="space-y-4">
                 <div className="space-y-1.5 font-medium">
                    <Label className="text-xs text-gray-400 ml-0.5">Category</Label>
                    <select 
                      value={selectedDocType}
                      onChange={(e) => setSelectedDocType(e.target.value)}
                      className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50/50 px-3 text-xs font-medium focus:ring-1 focus:ring-primary outline-none cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <option value="">Select category...</option>
                      {docTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                 </div>

                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className={cn(
                     "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group",
                     uploading ? "opacity-50 cursor-not-allowed bg-gray-50/50" : "hover:bg-primary/5 hover:border-primary/30 border-gray-100"
                   )}
                 >
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      disabled={uploading}
                    />
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-gray-300 group-hover:text-primary transition-colors border border-gray-100 group-hover:border-primary/20 shadow-sm group-hover:shadow-md">
                       {uploading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : <FileUp className="w-6 h-6" />}
                    </div>
                    <div className="text-center space-y-1">
                       <p className="text-xs font-semibold text-gray-900 leading-none">
                         {uploading ? "Processing..." : "Select Document"}
                       </p>
                       <p className="text-[10px] text-gray-400 font-medium opacity-60">PDF, JPG up to 10MB</p>
                    </div>
                 </div>

                 <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-2 shadow-sm">
                    <div className="flex items-center gap-2 text-amber-600">
                       <AlertCircle className="w-3.5 h-3.5" />
                       <span className="text-xs font-semibold">Security Notice</span>
                    </div>
                    <p className="text-xs text-amber-900 font-medium leading-relaxed opacity-70">
                       Verification SLA: 24-48 Hours. Ensure clarity for faster approval.
                    </p>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
           <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-2 border-l-4 border-primary pl-3">
                    <PlusCircle className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-semibold text-gray-900">Credential Vault</h2>
                 </div>
                 <div className="text-xs font-medium text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10 shadow-sm">
                    {documents.length} Records
                 </div>
              </div>

              <div className="flex-1">
                 {loading && documents.length === 0 ? (
                   <div className="h-full flex items-center justify-center flex-col gap-3 py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-primary/10" />
                      <p className="text-xs font-medium text-gray-300">Syncing records...</p>
                   </div>
                 ) : documents.length > 0 ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {documents.map((doc) => (
                        <div key={doc.id} className="p-4 rounded-xl border border-gray-100 bg-white hover:border-primary/20 transition-all flex items-start gap-4 shadow-sm hover:shadow-md group relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-12 h-12 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity -mr-6 -mt-6 rounded-full" />
                           <div className={cn(
                             "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-inner transition-transform group-hover:scale-105 relative z-10",
                             (doc.is_verified === 1 || doc.status === 'verified') ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
                           )}>
                             <FileText className="w-5 h-5" />
                           </div>
                           <div className="flex-1 min-w-0 relative z-10 pt-0.5">
                              <div className="flex items-center justify-between mb-0.5">
                                 <h4 className="text-sm font-semibold text-gray-900 truncate pr-2">
                                   {(doc.document_type || "File").replace(/_/g, " ")}
                                 </h4>
                                 {(doc.is_verified === 1 || doc.status === 'verified') ? (
                                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm border border-white" />
                                 ) : (
                                   <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse border border-white" />
                                 )}
                              </div>
                              <p className={cn(
                                "text-[10px] font-medium truncate mb-2",
                                (doc.is_verified === 1 || doc.status === 'verified') ? "text-emerald-500" : "text-amber-500"
                              )}>{doc.status || 'Under Review'}</p>
                              <div className="flex items-center gap-1">
                                 <Button 
                                   onClick={() => handlePreview(doc)}
                                   size="sm" 
                                   variant="ghost" 
                                   className="h-7 px-2.5 rounded-lg text-[10px] font-medium text-primary bg-primary/5 hover:bg-primary/10 transition-all border border-primary/10 shadow-sm"
                                 >
                                    <Eye className="w-3.5 h-3.5 mr-1.5" /> View
                                 </Button>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-gray-50/20 rounded-2xl border border-dashed border-gray-200">
                       <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 border border-gray-100 shadow-inner text-gray-200">
                          <PlusCircle className="w-8 h-8" />
                       </div>
                       <h3 className="text-sm font-semibold text-gray-900 mb-1">Vault Empty</h3>
                       <p className="text-xs text-gray-400 font-medium max-w-[200px] leading-relaxed mx-auto opacity-60">
                          Upload institution certificates for account trust synchronization.
                       </p>
                    </div>
                 )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between bg-slate-50/10 -mx-6 -mb-6 px-6 pb-6 rounded-b-xl">
                 <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-inner">
                       <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                       <p className="text-xs font-semibold text-gray-900">Encryption Status</p>
                       <p className="text-[10px] font-medium text-gray-400 leading-none opacity-60">Institutional protection active</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="text-right">
                       <p className="text-xs font-semibold text-gray-900">Approval SLA</p>
                       <p className="text-[10px] font-semibold text-blue-500 leading-none">24 - 48 Hours</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100 shadow-inner">
                       <Clock className="w-5 h-5" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
