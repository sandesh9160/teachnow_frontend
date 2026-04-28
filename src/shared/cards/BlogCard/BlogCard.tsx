"use client";

import { Clock, Calendar } from "lucide-react";
import Link from "next/link";
import { normalizeMediaUrl } from "@/services/api/client";

interface BlogCardProps {
  title: string;
  slug: string;
  image?: string;
  category?: string;
  readTime?: string;
  date?: string;
  excerpt?: string; // ✅ ADD THIS LINE
}

const BlogCard = ({ title, excerpt, readTime, date, slug, image }: BlogCardProps) => {
  const imageUrl = normalizeMediaUrl(image);
  
  return (
    <Link
      href={slug ? `/blogs/${slug}` : "/blogs"}
      className="group relative flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.02)] hover:shadow-lg hover:border-blue-200/50 transition-all duration-300 h-full"
    >
      <div className="h-44 overflow-hidden relative">
        {image ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
            loading="lazy" 
          />
        ) : (
          <div className="h-full bg-slate-100 flex items-center justify-center">
            <span className="text-slate-300 font-bold text-lg">
              Teach<span className="text-blue-400">Now</span>
            </span>
          </div>
        )}
      </div>
      
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[17px] md:text-[18px] font-semibold text-[#111827] leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
          {title}
        </h3>
        
        <p className="mt-4 flex-1 text-[13px] md:text-[14px] leading-relaxed text-slate-500 font-medium line-clamp-3">
          {excerpt}
        </p>
        
        <div className="mt-6 pt-5 border-t border-slate-50 flex items-center gap-4 text-[11px] md:text-[12px] text-slate-400 font-semibold">
          <div className="flex items-center gap-1.5 tracking-wide">
            <Calendar className="h-3.5 w-3.5 text-slate-300 shrink-0" />
            <span className="whitespace-nowrap">{date}</span>
          </div>
          <div className="flex items-center gap-1.5 tracking-wide">
            <Clock className="h-3.5 w-3.5 text-slate-300 shrink-0" />
            <span className="whitespace-nowrap">{readTime}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
