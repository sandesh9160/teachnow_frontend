"use client";

import {
   FileText,
   Loader2,
   AlertCircle,
   Clock,
   Eye,
   PlusCircle,
   FileUp,
   X,
   CheckCircle2,
   Calendar,
   ExternalLink,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/shared/ui/Buttons/Buttons";
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

export default function DocumentsClient({ isVerified = false }: { isVerified?: boolean }) {
   const [loading, setLoading] = useState(true);
   const [uploading, setUploading] = useState(false);
   const [documents, setDocuments] = useState<EmployerDocument[]>([]);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [selectedDocType, setSelectedDocType] = useState<string>("");
   const [showUploadform, setShowUploadForm] = useState(false);

   const [previewData, setPreviewData] = useState<{ url: string; original: string; name: string; isPending?: boolean } | null>(null);
   const [isPreviewLoading, setIsPreviewLoading] = useState(false);
   const [pendingFile, setPendingFile] = useState<File | null>(null);
   const [isRedirecting, setIsRedirecting] = useState(false);

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
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      void fetchDocuments();
   }, [fetchDocuments]);

   useEffect(() => {
      if (!loading && documents.length === 0) {
         toast.warning("Upload documents to get verified institute", {
            description: "Your verification process starts after the first upload.",
            duration: 5000,
            style: {
               background: '#FFF7ED',
               borderLeft: '4px solid #F97316',
               color: '#C2410C',
            }
         });
      }
   }, [loading, documents.length]);

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const allowedExtensions = ["svg", "jpg", "jpeg", "png", "webp", "pdf"];
      const fileExt = file.name.split(".").pop()?.toLowerCase();

      if (!fileExt || !allowedExtensions.includes(fileExt)) {
         toast("Unsupported File Format", {
            description: `Please upload only ${allowedExtensions.join(", ").toUpperCase()} files.`,
            style: {
               background: '#FFFBEB',
               border: '1px solid #FCD34D',
               color: '#92400E',
            },
            duration: 5000,
         });
         if (fileInputRef.current) fileInputRef.current.value = "";
         return;
      }

      if (!selectedDocType) {
         toast.error("Please select a document type.");
         if (fileInputRef.current) fileInputRef.current.value = "";
         return;
      }

      const maxSize = 4 * 1024 * 1024; // 4MB
      if (file.size > maxSize) {
         toast.error("File size exceeds 4MB limit", {
            description: "Please upload a document smaller than 4MB for successful verification.",
            style: {
               background: '#FEF2F2',
               border: '1px solid #FCA5A5',
               color: '#991B1B',
            },
            duration: 5000,
         });
         if (fileInputRef.current) fileInputRef.current.value = "";
         return;
      }

      // Generate local preview URL
      const objectUrl = URL.createObjectURL(file);
      setPendingFile(file);
      setPreviewData({
         url: objectUrl,
         original: objectUrl,
         name: docTypes.find(t => t.value === selectedDocType)?.label || file.name,
         isPending: true
      });
      setIsPreviewLoading(true);

      if (fileInputRef.current) fileInputRef.current.value = "";
   };

   const handleFinalizeUpload = async () => {
      if (!pendingFile || !selectedDocType) return;

      try {
         setUploading(true);
         const formData = new FormData();
         formData.append("document_file", pendingFile);
         formData.append("document_type", selectedDocType);

         const res = await uploadFile<any>("employer/documents/upload", {
            method: "POST",
            data: formData,
         });

         if (res?.status) {
            setIsRedirecting(true);
            setShowUploadForm(false);
            setSelectedDocType("");
            setPendingFile(null);
            setPreviewData(null);
            
            // Redirect to Billing Section
            setTimeout(() => {
               window.location.href = "/dashboard/employer/purchase-history";
            }, 3000);
         } else {
            toast.error(res?.message || "Upload failed.");
         }
      } catch (err: any) {
         toast.error("An error occurred.");
      } finally {
         setUploading(false);
      }
   };


   const handlePreview = (doc: EmployerDocument) => {
      if (!doc.document_file) return;
      const fullUrl = normalizeMediaUrl(doc.document_file);
      const ext = (doc.document_file || "").split('.').pop()?.toLowerCase();

      let preview = fullUrl;
      if (ext === 'pdf' || ext === 'doc' || ext === 'docx') {
         preview = `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
      }

      setIsPreviewLoading(true);
      setPreviewData({
         url: preview,
         original: fullUrl,
         name: (doc.document_type || "Document").replace(/_/g, " "),
         isPending: false
      });
   };

   // Clean up object URLs to prevent memory leaks
   useEffect(() => {
      return () => {
         if (previewData?.isPending && previewData.url) {
            URL.revokeObjectURL(previewData.url);
         }
      };
   }, [previewData]);

   const docTypes = [
      { value: "institution_registration", label: "Institution Registration Certificate" },
      { value: "government_license", label: "Government License / Accreditation" },
      { value: "approval_document", label: "College / School Approval Document" },
      { value: "pan_card", label: "PAN Card" },
      { value: "id_proof", label: "Identity Proof (Admin)" },
      { value: "other", label: "Other Supporting Document" }
   ];

   //   const verifiedCount = documents.filter(d => d.is_verified === 1 || d.status === 'verified').length;
   const rejectedDoc = documents.find(d => d.status === 'rejected');

   // Status determination based on dashboard isVerified prop
   let statusTitle = "Under Process";
   let statusDesc = "We are currently reviewing your institutional documents. This usually takes 24-48 hours.";
   let statusColor = "bg-blue-50/30 border-blue-100 text-blue-600";
   let badgeColor = "bg-blue-50 text-blue-600";
   let StatusIcon = Clock;

   if (isVerified) {
      statusTitle = "Verified";
      statusDesc = "Your institution is verified. You now have full access to recruit on TeachNow.";
      statusColor = "bg-emerald-50/30 border-emerald-100 text-emerald-600";
      badgeColor = "bg-[#D1FAE5] text-[#059669]";
      StatusIcon = CheckCircle2;
   } else if (rejectedDoc) {
      statusTitle = "Action Required";
      statusDesc = rejectedDoc.admin_remark || "One of your documents was rejected. Please re-upload a clear copy.";
      statusColor = "bg-rose-50/50 border-rose-100 text-rose-600";
      badgeColor = "bg-rose-100 text-rose-600";
      StatusIcon = AlertCircle;
   } else if (documents.length === 0) {
      statusTitle = "Not Started";
      statusDesc = "Please upload your institutional documents to begin the verification process.";
      statusColor = "bg-slate-50 border-slate-100 text-slate-400";
      badgeColor = "bg-slate-100 text-slate-500";
   }

   return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 font-sans">
         {/* Existing Documents Preview Modal */}
         {previewData && !previewData.isPending && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-[#1E1B4B]/20 backdrop-blur-sm" onClick={() => setPreviewData(null)} />
               <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                           <FileText className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                           <h3 className="text-base font-semibold text-[#1E1B4B]">{previewData.name}</h3>
                           <p className="text-[10px] text-slate-400 font-medium">Confidential institutional record</p>
                        </div>
                     </div>
                     <button onClick={() => setPreviewData(null)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                     </button>
                  </div>

                  <div className="flex-1 bg-slate-50 relative overflow-hidden">
                     {isPreviewLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 transition-opacity">
                           <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                     )}
                     {previewData.url.match(/\.(jpg|jpeg|png|webp|gif|svg)/i) && !previewData.url.includes('docs.google.com') ? (
                        <div className="w-full h-full flex items-center justify-center p-8">
                           <img src={previewData.url} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-lg bg-white" onLoad={() => setIsPreviewLoading(false)} />
                        </div>
                     ) : (
                        <iframe src={previewData.url} className="w-full h-full border-none bg-white" onLoad={() => setIsPreviewLoading(false)} title="Viewer" />
                     )}
                  </div>
                  <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white shrink-0">
                     <p className="text-xs text-slate-400 font-medium">Viewing secure document vault</p>
                     <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg text-xs flex-1 sm:flex-none" onClick={() => window.open(previewData.original, '_blank')}>
                           <ExternalLink className="w-4 h-4 mr-1" /> Open
                        </Button>
                        <Button className="h-9 px-5 rounded-lg text-xs bg-[#1E1B4B] flex-1 sm:flex-none" onClick={() => setPreviewData(null)}>Close</Button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
               </div>
               <div>
                  <h1 className="text-lg font-bold text-[#1E1B4B] leading-tight">Verification Center</h1>
                  <p className="text-[11px] text-slate-400 font-medium">Manage institutional credentials</p>
               </div>
            </div>

            <Button
               onClick={() => setShowUploadForm(!showUploadform)}
               className={cn(
                  "h-9 px-4 rounded-lg font-bold text-[11px] flex items-center gap-2 shrink-0 transition-none hover:scale-100 active:scale-100",
                  showUploadform ? "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-100" : "bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md shadow-blue-100"
               )}
            >
               {showUploadform ? <X className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
               {showUploadform ? "Cancel" : "Upload New"}
            </Button>
         </div>

         {/* Dynamic Verification Status Box */}
         <div className={cn(
            "rounded-2xl border p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm transition-all",
            statusColor
         )}>
            <div className={cn(
               "w-12 h-12 rounded-full flex items-center justify-center shrink-0 border border-current opacity-80"
            )}>
               <StatusIcon className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-1">
               <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold text-[#1E1B4B]">Verification Status:</h3>
                  <span className={cn(
                     "px-3 py-0.5 rounded-lg text-[11px] font-semibold",
                     badgeColor
                  )}>{statusTitle}</span>
               </div>
               <p className="text-sm text-slate-500">
                  {statusDesc}
               </p>
            </div>
         </div>

         {/* Removed Progress Bar and Count per user request */}

         {/* Inline Upload Form (Simple) */}
         {showUploadform && (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 overflow-hidden">
               {pendingFile ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                     {/* Left: Configuration & Details */}
                     <div className="lg:col-span-5 space-y-6">
                        <div className="space-y-1">
                           <h3 className="text-lg font-bold text-[#1E1B4B]">Review & Conform</h3>
                           <p className="text-sm text-slate-500">Ensure the document category matches your file.</p>
                        </div>

                        <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-5 shadow-sm">
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Document Category</label>
                              <select
                                 value={selectedDocType}
                                 onChange={(e) => setSelectedDocType(e.target.value)}
                                 className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                              >
                                 <option value="">Select Category...</option>
                                 {docTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                              </select>
                           </div>

                           <div className="flex items-center gap-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                              <div className="w-12 h-12 rounded-xl bg-white border border-indigo-100 flex items-center justify-center shrink-0 shadow-sm">
                                 <FileText className="w-6 h-6 text-indigo-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                 <p className="text-sm font-bold text-slate-700 truncate">{pendingFile.name}</p>
                                 <p className="text-[10px] text-slate-400 font-medium">{(pendingFile.size / (1024 * 1024)).toFixed(2)} MB • Verification Ready</p>
                              </div>
                           </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                           <Button
                              onClick={handleFinalizeUpload}
                              className="h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-lg shadow-blue-200"
                              disabled={uploading}
                           >
                              {uploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <FileUp className="w-5 h-5 mr-2" />}
                              Conform 
                           </Button>
                           <Button
                              variant="outline"
                              onClick={() => { setPendingFile(null); setPreviewData(null); }}
                              className="h-12 rounded-xl border-slate-200 text-slate-500 font-semibold text-sm hover:bg-slate-100"
                              disabled={uploading}
                           >
                              Change Document
                           </Button>
                        </div>
                     </div>

                     {/* Right: Real-time Preview Pane */}
                     <div className="lg:col-span-7 space-y-3">
                        <div className="flex items-center justify-between px-1">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live Preview
                           </span>
                           <span className="text-[10px] font-bold text-slate-300">SECURE VIEWER</span>
                        </div>
                        <div className="relative aspect-[4/5] lg:aspect-auto lg:h-[500px] bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-inner group">
                           <div className="absolute inset-0 flex items-center justify-center bg-white">
                              {pendingFile && previewData?.url ? (
                                 pendingFile.type.startsWith('image/') ? (
                                    <img
                                       src={previewData.url}
                                       alt="Preview"
                                       className="max-w-full max-h-full object-contain p-4 drop-shadow-md"
                                    />
                                 ) : (
                                    <iframe
                                       src={previewData.url}
                                       className="w-full h-full border-none"
                                       title="PDF Preview"
                                    />
                                 )
                              ) : (
                                 <div className="flex flex-col items-center gap-2 text-slate-300">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Preparing Preview...</p>
                                 </div>
                              )}
                           </div>
                           <div className="absolute bottom-4 right-4 transition-opacity z-20">
                              <div className="px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-lg text-[10px] text-white font-bold">
                                 PREVIEW MODE
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="max-w-2xl mx-auto space-y-4">
                     <div className="text-center space-y-1 mb-4">
                        <h3 className="text-base font-semibold text-[#1E1B4B]">Select Document Category</h3>
                        <p className="text-xs text-slate-500">Choose a type and select your file for verification.</p>
                     </div>
                     <div className="flex flex-col sm:flex-row gap-3">
                        <select
                           value={selectedDocType}
                           onChange={(e) => setSelectedDocType(e.target.value)}
                           className="flex-1 h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                        >
                           <option value="">Select Category...</option>
                           {docTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <Button
                           onClick={() => !uploading && fileInputRef.current?.click()}
                           className="h-11 px-8 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm shadow-md shadow-blue-50 flex items-center gap-2 shrink-0"
                           disabled={uploading}
                        >
                           {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
                           {uploading ? "Uploading..." : "Select & Upload"}
                        </Button>
                     </div>
                     <div className="mt-6 p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                           <AlertCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-[#1E1B4B]">Upload Documents with Limit not exceed 4 MB</p>
                           <p className="text-[11px] text-slate-500">Supported: SVG, JPG, PNG, WEBP, PDF</p>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         )}

         <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
               <h2 className="text-[13px] font-bold text-[#1E1B4B] uppercase tracking-wider">Your Documents</h2>
               <span className="text-[10px] font-bold text-slate-400">{documents.length} Records</span>
            </div>
            
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
               {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3">
                     <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                     <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Syncing Records...</p>
                  </div>
               ) : documents.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                     {documents.map((doc) => {
                        const isImg = doc.document_file.match(/\.(jpg|jpeg|png|webp|gif|svg)/i);
                        const thumbUrl = normalizeMediaUrl(doc.document_file);
                        return (
                           <div key={doc.id} className="p-3 sm:p-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors group">
                              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0 shadow-sm group-hover:border-indigo-100 transition-all">
                                 {isImg ? <img src={thumbUrl} alt="Preview" className="w-full h-full object-cover" /> : <FileText className="w-5 h-5 text-slate-300" />}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                 <h4 className="text-[13px] font-bold text-[#1E1B4B] capitalize truncate">{doc.document_type.replace(/_/g, " ")}</h4>
                                 <div className="flex items-center gap-3 mt-0.5">
                                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-tighter">
                                       <Calendar className="w-3 h-3" /> {new Date(doc.created_at).toLocaleDateString('en-GB')}
                                    </p>
                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                    <span className={cn(
                                       "text-[10px] font-bold uppercase tracking-tight",
                                       doc.status === 'approved' ? "text-emerald-600" : (doc.status === 'rejected' ? "text-rose-600" : "text-amber-500")
                                    )}>
                                       {doc.status || "Pending Review"}
                                    </span>
                                 </div>
                              </div>

                              <Button 
                                 onClick={() => handlePreview(doc)} 
                                 variant="outline" 
                                 size="sm" 
                                 className="h-8 px-3 rounded-lg bg-white border-slate-200 text-indigo-600 hover:bg-slate-50 text-[11px] font-bold flex items-center gap-2 shadow-sm"
                              >
                                 <Eye className="w-3.5 h-3.5" /> <span className="hidden sm:inline">View Details</span>
                              </Button>
                           </div>
                        );
                     })}
                  </div>
               ) : (
                  <div className="py-24 text-center flex flex-col items-center justify-center">
                     <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                        <PlusCircle className="w-8 h-8 text-slate-300" />
                     </div>
                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Documents Yet</h3>
                     <p className="text-[11px] text-slate-400 mt-1">Please upload your first document to begin the verification process.</p>
                  </div>
               )}
            </div>
         </div>

         <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept=".svg,.jpg,.jpeg,.png,.webp,.pdf" disabled={uploading} />
         
         {/* Redirecting Modal */}
         {isRedirecting && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
               <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center space-y-4 animate-in zoom-in-95 duration-300">
               <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
               </div>
               <h3 className="text-xl font-bold text-slate-900">Success!</h3>
               <p className="text-sm text-slate-500 font-medium">
                  Document uploaded successfully. Redirecting to Billing Section...
               </p>
               <div className="flex items-center justify-center gap-2 text-sm text-indigo-600 font-semibold pt-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecting...
               </div>
               </div>
            </div>
         )}
      </div>
   );
}
