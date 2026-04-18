"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import BlogCard from "@/shared/cards/BlogCard/BlogCard";
import { BlogSectionsProps } from "@/types/components";
import { formatDate } from "@/lib/utils";

export const BlogSections = ({ blogs }: BlogSectionsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const blogPreview = Array.isArray(blogs) ? blogs : [];

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const timeout = setTimeout(checkScroll, 500); // Initial check after render
    window.addEventListener('resize', checkScroll);
    return () => {
      window.removeEventListener('resize', checkScroll);
      clearTimeout(timeout);
    };
  }, [blogPreview]);

  if (blogPreview.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 350;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      // Check after smooth scroll completes
      setTimeout(checkScroll, 400);
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
          {/* Side Navigation Buttons */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              scroll("left");
            }}
            disabled={blogPreview.length <= 1}
            className={`absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-[70] h-10 w-10 md:h-12 md:w-12 rounded-full border shadow-xl flex items-center justify-center transition-all duration-300 focus:outline-none pointer-events-auto cursor-pointer ${
              canScrollLeft 
                ? "bg-[#1e3a8a] border-transparent text-white hover:bg-[#1e40af] active:scale-95" 
                : "bg-white border-slate-200 text-slate-400 opacity-60"
            }`}
          >
            <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" />
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              scroll("right");
            }}
            disabled={blogPreview.length <= 1}
            className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-[70] h-10 w-10 md:h-12 md:w-12 rounded-full border shadow-xl flex items-center justify-center transition-all duration-300 focus:outline-none pointer-events-auto cursor-pointer ${
              canScrollRight 
                ? "bg-[#1e3a8a] border-transparent text-white hover:bg-[#1e40af] active:scale-95" 
                : "bg-white border-slate-200 text-slate-400 opacity-60"
            }`}
          >
            <ChevronRight className="h-6 w-6 md:h-7 md:w-7" />
          </button>

          {/* Horizontal Scroll Area */}
          <div 
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 pt-1 px-1 scroll-smooth snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {blogPreview.map((post) => (
              <div key={post.id || post.slug} className="shrink-0 w-[270px] sm:w-[320px] md:w-[360px] snap-start">
                <BlogCard 
                  title={post.title}
                  slug={post.slug}
                  image={post.image}
                  date={post.created_at ? formatDate(post.created_at) : "Recently"}
                  category={post.category || "Career Advice"}
                  readTime={post.readTime || "5 min read"}
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
