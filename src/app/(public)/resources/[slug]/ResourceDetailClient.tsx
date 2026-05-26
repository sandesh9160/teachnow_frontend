"use client";

import { useState } from "react";
import { useClientSession } from "@/hooks/useClientSession";
import { normalizeMediaUrl } from "@/services/api/client";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/Buttons/Buttons";
import QuickAuthModal from "@/components/auth/QuickAuthModal";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import { ResourceData } from "@/types/homepage";

interface ResourceDetailClientProps {
  readonly resource: ResourceData;
  readonly isMobileButton?: boolean;
}

export default function ResourceDetailClient({ resource, isMobileButton = false }: ResourceDetailClientProps) {
  const { isLoggedIn } = useClientSession();
  const [showAuth, setShowAuth] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const performDownload = async (resourceId: number, pdfUrl: string) => {
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

  const handleDownload = async () => {
    if (!isLoggedIn) {
      setShowAuth(true);
      return;
    }

    if (resource?.id && resource?.pdf) {
      void performDownload(resource.id, resource.pdf);
    } else {
      toast.error("Resource file not found.");
    }
  };

  if (isMobileButton) {
    return (
      <Button
        className="w-full h-12 rounded-lg font-semibold shadow-lg shadow-primary/20"
        onClick={handleDownload}
        disabled={isDownloading}
      >
        {isDownloading ? "Processing..." : "Download Now"}
      </Button>
    );
  }

  return (
    <>
      <Button
        className="w-full h-12 rounded-lg font-semibold shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all"
        onClick={handleDownload}
        disabled={isDownloading}
      >
        {isDownloading ? (
          "Processing..."
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Download Free
          </>
        )}
      </Button>

      {!isLoggedIn && (
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
          if (resource?.id && resource?.pdf) {
            void performDownload(resource.id, resource.pdf);
          }
        }}
      />
    </>
  );
}
