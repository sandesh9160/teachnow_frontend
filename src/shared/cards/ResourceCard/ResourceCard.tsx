"use client";

import { ResourceData } from "@/types/homepage";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BookOpen, Clock } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";

interface ResourceCardProps {
  resource: ResourceData;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const ResourceCard = ({ resource, className, onClick }: ResourceCardProps) => {
  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const base = process.env.NEXT_PUBLIC_IMAGE_URL || "http://teachnowbackend.jobsvedika.in:8080";
    return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  };

  const imageUrl = getImageUrl(resource.resource_photo);
  const authorImageUrl = getImageUrl(resource.author_photo);
  const resourceHref = `/resources/${resource.slug}`;

  return (
    <Link 
      href={resourceHref}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col bg-white rounded-xl p-3.5 border border-slate-100 shadow-sm transition-all duration-300 h-full overflow-hidden hover:shadow-md cursor-pointer",
        className
      )}
    >
      {/* Photo */}
      <div className="relative aspect-[1.15/1] w-full overflow-hidden rounded-md mb-2.5 bg-slate-50">
        <Image
          src={imageUrl}
          alt={resource.title}
          fill
          className="h-full w-full object-cover"
          onError={(e) => {
             (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1000&auto=format&fit=crop";
          }}
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-0.5">
        <h3 className="text-[13.5px] font-bold text-slate-800 leading-tight mb-2 line-clamp-2 min-h-[34px]">
          {resource.title}
        </h3>

        {/* Compact Meta Row */}
        <div className="flex items-center gap-3 mb-2.5">
          {resource.total_pages && (
            <span className="flex items-center gap-1 text-[10.5px] font-bold text-slate-400">
              <BookOpen className="h-3 w-3 opacity-60" />
              {resource.total_pages} pages
            </span>
          )}
          {resource.read_time && (
            <span className="flex items-center gap-1 text-[10.5px] font-bold text-primary/60">
              <Clock className="h-3 w-3 opacity-60" />
              {resource.read_time} minutes
            </span>
          )}
        </div>

        {/* Author Row - Tiny but Legible */}
        <div className="flex items-center gap-1.5 mb-3 pb-3 border-b border-slate-100/50">
          <div className="h-5.5 w-5.5 rounded-full overflow-hidden bg-slate-50 border border-slate-200/50 shrink-0">
            <Image
              src={authorImageUrl}
              alt={resource.author_name || "Author"}
              width={22}
              height={22}
              className="h-full w-full object-cover"
              onError={(e) => {
                const name = resource.author_name || "Author";
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=32`;
              }}
              loading="lazy"
            />
          </div>
          <span className="text-[11px] font-bold text-slate-500 truncate">
            {resource.author_name}
          </span>
        </div>

        <Button
          variant="hero"
          className="mt-auto w-full py-2.5 h-auto rounded-lg text-[13px] font-semibold"
          tabIndex={-1}
        >
          View Details
        </Button>
      </div>
    </Link>
  );
};

export default ResourceCard;
