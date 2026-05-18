"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { useClientSession } from "@/hooks/useClientSession";
import { normalizeMediaUrl } from "@/services/api/client";
import { toast } from "sonner";
import QuickAuthModal from "@/components/auth/QuickAuthModal";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";

interface ResourceDownloadClientProps {
  resourceId: number;
  pdfUrl: string | null;
  className?: string;
  isMobile?: boolean;
}

export default function ResourceDownloadClient({ 
  resourceId, 
  pdfUrl, 
  className = "",
  isMobile = false
}: ResourceDownloadClientProps) {
  const { isLoggedIn } = useClientSession();
  const [showAuth, setShowAuth] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const performDownload = async () => {
    if (!pdfUrl) {
      toast.error("Resource file not found.");
      return;
    }

    try {
      setIsDownloading(true);
      const res = await dashboardServerFetch<any>(`jobseeker/resources/${resourceId}/download`, {
        method: "GET"
      });

      const downloadUrl = res?.data?.download_url || res?.download_url || pdfUrl;

      if (downloadUrl) {
        window.open(normalizeMediaUrl(downloadUrl), "_blank", "noopener,noreferrer");
        toast.success("Download started!");
      } else {
        toast.error("Download link not available.");
      }
    } catch (err) {
      window.open(normalizeMediaUrl(pdfUrl), "_blank", "noopener,noreferrer");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownload = () => {
    if (!isLoggedIn) {
      setShowAuth(true);
      return;
    }
    void performDownload();
  };

  return (
    <div className={className}>
      <Button
        className={isMobile ? "w-full h-12 rounded-lg font-semibold shadow-lg shadow-primary/20" : "w-full h-12 rounded-lg font-semibold shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all"}
        onClick={handleDownload}
        disabled={isDownloading}
      >
        {isDownloading ? (
          "Processing..."
        ) : isMobile ? (
          "Download Now"
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Download Free
          </>
        )}
      </Button>

      {!isMobile && !isLoggedIn && (
        <p className="mt-3 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          Sign in required
        </p>
      )}

      <QuickAuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        title="Access Resource"
        submitText="Sign in to Download"
        onSuccess={() => {
          void performDownload();
        }}
      />
    </div>
  );
}
