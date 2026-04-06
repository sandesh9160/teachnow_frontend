"use client";

import { useState } from "react";
import { MapPin, Clock, Briefcase, Building2, Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useClientSession } from "@/hooks/useClientSession";
import QuickAuthModal from "@/components/auth/QuickAuthModal";
import { JobCardProps } from "@/types/components";
import { sanitizeSlug } from "@/lib/utils";
import { normalizeMediaUrl } from "@/services/api/client";

const JobCard = ({ id = 1, title, company, location, type, salary, tags, posted, slug, logo }: JobCardProps) => {
  const [saved, setSaved] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();
  const { isLoggedIn, user } = useClientSession();
  
  // Clean the slug for a "neat" URL, fallback to ID if no slug provided
  const jobPath = slug ? sanitizeSlug(slug) : String(id);
  const jobHref = `/${jobPath}`;

  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    if (user?.role === "employer") {
      toast.error("Employers cannot apply for jobs.");
      return;
    }
    router.push(`/apply/${jobPath}`);
  };

  const handleAuthSuccess = () => {
    router.push(`/apply/${jobPath}`);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      toast.info(`${title} removed from saved jobs.`);
    } else {
      toast.success(`${title} saved to your list.`);
    }
    setSaved(!saved);
  };

  return (
    <>
      <div
        className="group relative block rounded-xl border border-slate-200 bg-card p-5 shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary/20 hover:-translate-y-0.5"
      >
        <div className="flex items-start justify-between">
          <Link href={jobHref} className="flex gap-4 flex-1">
            <div className="absolute inset-0 z-0" aria-hidden="true" />
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-display font-bold text-lg transition-transform duration-300 group-hover:scale-110 relative z-10 overflow-hidden">
              {logo ? (
                <img src={normalizeMediaUrl(logo)} alt={company} className="h-full w-full object-contain" />
              ) : (
                company[0]
              )}
            </div>
            <div className="relative z-10">
              <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
              <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                {company}
              </div>
            </div>
          </Link>
          <button
            onClick={handleSave}
            suppressHydrationWarning={true}
            className={`relative z-20 rounded-lg p-2 transition-colors ${saved ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
        </div>

        <div className="relative z-10">
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{location}</span>
            <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{type}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{posted}</span>
            <span className="ml-auto font-semibold text-foreground text-sm uppercase">₹ {salary}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{tag}</span>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-2 relative z-20">
          <Button size="sm" className="flex-1" onClick={handleApply}>Apply Now</Button>
          <Link href={jobHref} className="flex-1">
            <Button size="sm" variant="outline" className="w-full">View Details</Button>
          </Link>
        </div>
      </div>

      <QuickAuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        title="Apply for this Job"
        submitText="Login to Apply"
      />
    </>
  );
};

export default JobCard;
