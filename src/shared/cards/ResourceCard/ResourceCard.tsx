"use client";

import { ResourceData } from "@/types/homepage";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BookOpen, Clock } from "lucide-react";

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
    <div className={cn(
      "group flex flex-col bg-white rounded-xl p-1.5 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-primary/20 h-full",
      className
    )}>
      {/* Photo */}
      <div className="relative aspect-[1.15/1] w-full overflow-hidden rounded-md mb-1.5 shadow-inner bg-slate-50">
        <img
          src={imageUrl}
          alt={resource.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
             (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1000&auto=format&fit=crop";
          }}
        />
        {/* Detail Overlay on Hover */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-0.5">
        <h3 className="text-[12px] font-bold text-slate-800 leading-tight mb-1 line-clamp-2 min-h-7">
          {resource.title}
        </h3>

        {/* Compact Meta Row */}
        <div className="flex items-center gap-2.5 mb-1.5">
          {resource.total_pages && (
            <span className="flex items-center gap-1 text-[9.5px] font-bold text-slate-400">
              <BookOpen className="h-2.5 w-2.5 opacity-60" />
              {resource.total_pages} PGs
            </span>
          )}
          {resource.read_time && (
            <span className="flex items-center gap-1 text-[9.5px] font-bold text-primary/60">
              <Clock className="h-2.5 w-2.5 opacity-60" />
              {resource.read_time} M
            </span>
          )}
        </div>

        {/* Author Row - Tiny but Legible */}
        <div className="flex items-center gap-1.5 mb-2.5 pb-2.5 border-b border-slate-100/50">
          <div className="h-4.5 w-4.5 rounded-full overflow-hidden bg-slate-50 border border-slate-200/50 shrink-0">
            <img
              src={authorImageUrl}
              alt={resource.author_name || "Author"}
              className="h-full w-full object-cover"
              onError={(e) => {
                const name = resource.author_name || "Author";
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=32`;
              }}
            />
          </div>
          <span className="text-[10px] font-bold text-slate-500 truncate">
            {resource.author_name}
          </span>
        </div>

        {/* Action Button - Balanced */}
        <Link
          href={resourceHref}
          onClick={onClick}
          className="mt-auto block w-full py-2 bg-[#007AB0] hover:bg-[#006999] text-white text-center rounded-lg text-[11px] font-extrabold transition-colors shadow-sm active:scale-[0.98]"
        >
          VIEW DETAILS
        </Link>
      </div>
    </div>
  );
};

export default ResourceCard;
