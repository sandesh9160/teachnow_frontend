"use client";

import { Star, Quote, User, ChevronLeft, ChevronRight } from "lucide-react";
import { TestimonialProps } from "@/types/components";
import { normalizeMediaUrl } from "@/services/api/client";
import { useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const TestimonialAvatar = ({ src, name }: { src?: string | null, name: string }) => {
  const [error, setError] = useState(false);
  const fullUrl = normalizeMediaUrl(src);

  if (!src || error || src.includes('/tmp/')) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary font-bold text-sm">
        {name ? name[0] : <User className="w-5 h-5" />}
      </div>
    );
  }

  return (
    <Image 
      src={fullUrl} 
      alt={name || "Author"}
      fill
      unoptimized
      className="object-cover"
      onError={() => setError(true)}
    />
  );
};

export const Testimonial = ({ testimonials }: TestimonialProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  if (!testimonials || !Array.isArray(testimonials) || testimonials.length === 0) return null;



  return (
    <section className="py-12 md:py-16 bg-slate-50/50 overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-10 pl-2">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            What Our <span className="text-primary/80">Community</span> Says
          </h2>
          <p className="mt-2 text-lg text-slate-500 font-medium tracking-wide">
            Real experiences from teachers and educational institutions
          </p>
        </div>
      </div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative group">
        {/* Navigation Arrows */}
        <button 
          onClick={() => {
            if (scrollRef.current) scrollRef.current.scrollBy({ left: -scrollRef.current.offsetWidth * 0.8, behavior: 'smooth' });
          }}
          className="absolute -left-4 xl:-left-12 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/40 shadow-xl transition-all duration-300 hidden md:flex active:scale-90"
          title="Previous"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button 
          onClick={() => {
            if (scrollRef.current) scrollRef.current.scrollBy({ left: scrollRef.current.offsetWidth * 0.8, behavior: 'smooth' });
          }}
          className="absolute -right-4 xl:-right-12 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/40 shadow-xl transition-all duration-300 hidden md:flex active:scale-90"
          title="Next"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div 
          ref={scrollRef} 
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Use unique items for manual scroll section */}
          {Array.from(new Map(testimonials.map((t) => [t.id, t])).values()).map((t) => (
            <div
              key={t.id}
              className="shrink-0 w-80 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
            >
              {/* Star Rating Section */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => {
                  const rating = t.rating || 5;
                  const isFilled = i < Math.floor(rating);
                  return (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        isFilled ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-transparent"
                      )}
                    />
                  );
                })}
              </div>
              
              <Quote className="h-6 w-6 text-primary/10 mb-4" />
              
              <p className="text-sm text-slate-600 leading-relaxed min-h-[96px] line-clamp-4 font-medium italic">
                "{t.message}"
              </p>
              
              <div className="mt-6 flex items-center gap-3 pt-5 border-t border-slate-100">
                <div className="relative h-11 w-11 shrink-0 rounded-full border border-slate-100 shadow-inner overflow-hidden">
                  <TestimonialAvatar src={t.photo} name={t.name} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate tracking-tight">{t.name}</p>
                  <p className="text-[11px] font-medium text-slate-400 truncate uppercase tracking-tighter">
                    {t.designation} at {t.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
