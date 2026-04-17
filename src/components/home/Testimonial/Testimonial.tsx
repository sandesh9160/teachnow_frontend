"use client";

import { Star, Quote, User } from "lucide-react";
import { TestimonialProps } from "@/types/components";
import { normalizeMediaUrl } from "@/services/api/client";
import { useState } from "react";
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
  // const scrollRef = useRef<HTMLDivElement>(null);
  
  if (!testimonials || !Array.isArray(testimonials) || testimonials.length === 0) return null;



  return (
    <section className="py-24 bg-[#f8faff] overflow-hidden relative w-full">
      <div className="w-full">
        <div className="text-center mb-16 px-4">
          <h2 className="text-[32px] md:text-[42px] font-bold text-[#111827] tracking-tight mb-4">
            What Teachers and Schools Say
          </h2>
          <p className="text-[17px] md:text-[19px] text-slate-500 font-medium">
            Real experiences from our community
          </p>
        </div>

        {/* Full-width Autoscrolling Container */}
        <div className="relative w-full overflow-hidden py-4 flex">
          <div 
            className="flex gap-6 animate-marquee-fast whitespace-nowrap hover:[animation-play-state:paused] w-max"
            style={{ 
              animation: 'marquee-left 60s linear infinite',
              display: 'flex',
              width: 'max-content'
            }}
          >
            {/* Duplicating array multiple times for a truly seamless infinite scroll */}
            {[...testimonials, ...testimonials, ...testimonials, ...testimonials, ...testimonials, ...testimonials].map((t, index) => (
              <div
                key={`${t.id}-${index}`}
                className="shrink-0 w-[280px] md:w-[320px] rounded-[18px] border border-slate-300 bg-white p-7 shadow-[0_2px_15px_rgba(0,0,0,0.02)] whitespace-normal"
              >
                <div className="flex flex-col h-full text-left">
                  <div className="flex gap-1 mb-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3.5 w-3.5",
                          i < (t.rating || 5) ? "text-amber-400 fill-amber-400" : "text-slate-200"
                        )}
                      />
                    ))}
                  </div>
                  
                  <div className="relative mb-8">
                    <Quote className="h-8 w-8 text-blue-500/10 mb-2" />
                    <p className="text-[15px] text-slate-600 leading-relaxed min-h-[90px] font-medium italic">
                      "{t.message}"
                    </p>
                  </div>
                  
                  <div className="mt-auto pt-5 border-t border-slate-100 flex items-center gap-4">
                    <div className="relative h-11 w-11 shrink-0 rounded-full bg-slate-50 overflow-hidden ring-1 ring-slate-100 shadow-sm">
                       <TestimonialAvatar src={t.photo} name={t.name} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-bold text-[#111827] truncate">{t.name}</p>
                      <p className="text-[12px] font-medium text-slate-400 truncate">
                        {t.designation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style key="marquee-style">{`
          @keyframes marquee-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>
    </section>
  );
};

export default Testimonial;
