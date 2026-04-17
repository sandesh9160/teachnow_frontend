"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import BlogCard from "@/shared/cards/BlogCard/BlogCard";
import { BlogSectionsProps } from "@/types/components";
import { formatDate } from "@/lib/utils";

export const BlogSections = ({ blogs }: BlogSectionsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const blogPreview = Array.isArray(blogs) ? blogs : [];

  if (blogPreview.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 350;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-16 bg-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header with All Posts Link */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div className="text-left">
            <h2 className="text-[28px] md:text-[36px] font-bold text-[#111827] tracking-tight mb-2">
              Career Resources
            </h2>
            <p className="text-[15px] md:text-[17px] text-slate-500 font-medium">
              Tips, insights, and career advice for educators
            </p>
          </div>
          
          <Link 
            href="/blogs" 
            className="flex items-center gap-2 text-[14px] font-semibold text-blue-600 hover:text-blue-700 transition-all group pb-0.5"
          >
            All Posts <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Navigation Arrows */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 md:h-11 md:w-11 rounded-full bg-white border border-slate-100 shadow-lg flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-blue-600 hover:border-blue-100 -translate-x-3 group-hover:translate-x-0"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => scroll("right")}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 md:h-11 md:w-11 rounded-full bg-white border border-slate-100 shadow-lg flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-blue-600 hover:border-blue-100 translate-x-3 group-hover:translate-x-0"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Horizontal Scroll Area */}
          <div 
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 pt-1 px-1 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {blogPreview.map((post) => (
              <div key={post.id || post.slug} className="shrink-0 w-[270px] sm:w-[320px] md:w-[360px]">
                <BlogCard 
                  title={post.title}
                  slug={post.slug}
                  image={post.image}
                  date={post.created_at ? formatDate(post.created_at) : "Recently"}
                  category={post.category || "Career Advice"}
                  readTime={post.read_time || "5 min read"}
                  excerpt={post.excerpt || "Read more about this article on our blog."}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSections;
