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
          className="absolute -left-4 xl:-left-12 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/40 shadow-xl transition-all duration-300 hidden lg:flex active:scale-90"
          title="Previous"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button 
          onClick={() => {
            if (scrollRef.current) scrollRef.current.scrollBy({ left: scrollRef.current.offsetWidth * 0.8, behavior: 'smooth' });
          }}
          className="absolute -right-4 xl:-right-12 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/40 shadow-xl transition-all duration-300 hidden lg:flex active:scale-90"
          title="Next"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div 
          ref={scrollRef} 
          className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:gap-4 lg:overflow-x-auto lg:scrollbar-hide lg:scroll-smooth pb-4 px-1 lg:px-2 gap-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Use unique items for manual scroll section */}
          {Array.from(new Map(testimonials.map((t) => [t.id, t])).values()).map((t) => (
            <div
              key={t.id}
              className="group relative w-full lg:w-[350px] shrink-0 rounded-2xl border-2 border-blue-500 bg-white p-8 shadow-none transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 animate-pulse pointer-events-none z-0" />
              
              <div className="relative z-10 flex flex-col h-full">
                {/* Star Rating Section */}
                <div className="flex gap-1 mb-6">
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
                
                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 h-10 w-10 text-blue-500/10 -z-10" />
                  <p className="text-[15px] text-slate-700 leading-relaxed min-h-[110px] font-medium italic relative z-10">
                    "{t.message}"
                  </p>
                </div>
                
                <div className="mt-auto pt-6 flex items-center gap-4 border-t border-slate-100">
                  <div className="relative h-12 w-12 shrink-0 rounded-full border-2 border-blue-100 p-0.5 shadow-sm overflow-hidden bg-white">
                    <div className="relative h-full w-full rounded-full overflow-hidden">
                      <TestimonialAvatar src={t.photo} name={t.name} />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-slate-900 truncate tracking-tight">{t.name}</p>
                    <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                      {t.designation}
                    </p>
                  </div>
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
