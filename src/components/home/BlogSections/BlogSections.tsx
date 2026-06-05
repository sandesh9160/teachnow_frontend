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
  const [canScrollRight, setCanScrollRight] = useState(false);
  const blogPreview = Array.isArray(blogs) ? blogs : [];

  const checkScroll = () => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 50);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 50);
      }
    });
  };

  useEffect(() => {
    // Defer initial scroll state check to avoid triggering a synchronous forced reflow on mount
    const mountTimeout = setTimeout(checkScroll, 200);
    const timeout = setTimeout(checkScroll, 500); // Initial check after render
    window.addEventListener('resize', checkScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', checkScroll);
      clearTimeout(timeout);
      clearTimeout(mountTimeout);
    };
  }, [blogs]);

  const showContent = blogPreview.length > 0;

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
    <section className="pt-12 pb-20 bg-white overflow-hidden relative">
      <div className="max-w-none w-full">
        {/* Header with All Posts Link */}
        <div className="relative mb-14 px-4 md:px-12">
          <div className="text-center">
            <h2 className="text-[32px] md:text-[32px] font-extrabold text-[#111827] tracking-tight mb-2">
              Career Blogs
            </h2>
            <p className="text-[16px] md:text-[18px] text-slate-600 font-normal">
              Tips, insights, and career advice for educators
            </p>
          </div>

          <div className="absolute right-4 md:right-12 bottom-0 sm:top-1/2 sm:-translate-y-1/2 hidden md:block">
            <Link
              href="/blogs"
              className="group flex items-center gap-2 text-blue-600 font-semibold"
            >
              All Posts <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {showContent ? (
            <>
              {/* Side Navigation Buttons */}
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    scroll("left");
                  }}
                  aria-label="Scroll blogs left"
                  className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-[70] h-10 w-10 md:h-12 md:w-12 rounded-full border shadow-xl flex items-center justify-center transition-all duration-300 focus:outline-none pointer-events-auto cursor-pointer bg-[#1e3a8a] border-transparent text-white hover:bg-[#1e40af] active:scale-95 animate-in fade-in duration-200"
                >
                  <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" />
                </button>
              )}

              {canScrollRight && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    scroll("right");
                  }}
                  aria-label="Scroll blogs right"
                  className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-[70] h-10 w-10 md:h-12 md:w-12 rounded-full border shadow-xl flex items-center justify-center transition-all duration-300 focus:outline-none pointer-events-auto cursor-pointer bg-[#1e3a8a] border-transparent text-white hover:bg-[#1e40af] active:scale-95 animate-in fade-in duration-200"
                >
                  <ChevronRight className="h-6 w-6 md:h-7 md:w-7" />
                </button>
              )}

              {/* Horizontal Scroll Area */}
              <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-10 pt-2 px-[calc(50%-135px)] md:px-12 scroll-smooth snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* Start Spacer */}
                <div className="shrink-0 w-px md:hidden" />
                {blogPreview.map((post) => (
                  <div key={post.id || post.slug} className="shrink-0 w-[270px] sm:w-[320px] md:w-[360px] snap-center md:snap-start">
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
                {/* End Spacer */}
                <div className="shrink-0 w-px md:hidden" />
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 font-semibold bg-slate-50/50 rounded-2xl mx-4 md:mx-12 border border-slate-100">
              No blogs available at the moment.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BlogSections;
