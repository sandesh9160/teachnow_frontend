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
      <div className="flex h-full w-full items-center justify-center bg-[#ecf2ff] text-[#1e3a8a] font-bold text-sm">
        {name ? name[0].toUpperCase() : <User className="w-5 h-5" />}
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
        <div className="text-center mb-14 px-4">
          <h2 className="text-[30px] md:text-[36px] font-bold text-[#111827] tracking-tight mb-2">
            What Teachers and Schools Say
          </h2>
          <p className="text-[16px] md:text-[18px] text-slate-500 font-normal">
            Real experiences from our community
          </p>
        </div>

        {/* Full-width Autoscrolling Container */}
        <div className="relative w-full overflow-hidden py-4 flex">
          <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused] active:[animation-play-state:paused] w-max" style={{ width: 'max-content' }}>
            {/* Duplicating array multiple times for a truly seamless infinite scroll */}
            {[...testimonials, ...testimonials, ...testimonials, ...testimonials, ...testimonials, ...testimonials].map((t, index) => (
              <div
                key={`${t.id}-${index}`}
                className="shrink-0 w-[280px] md:w-[320px] rounded-[16px] border border-[#eef2f8] bg-white p-7 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] whitespace-normal"
              >
                <div className="flex flex-col h-full text-left">
                  {/* Mini Stars at Top Left */}
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < (t.rating || 5) ? "text-[#f59e0b] fill-[#f59e0b]" : "text-slate-100"
                        )}
                      />
                    ))}
                  </div>

                  {/* Light Quote Icon */}
                  <div className="mb-4">
                    <Quote className="h-6 w-6 text-[#dbeafe] fill-white" strokeWidth={1.5} />
                  </div>

                  <p className="text-[14px] text-slate-600 min-h-[70px] font-normal leading-relaxed">
                    {t.message}
                  </p>

                  {/* Subtle Divider and Small Author Profile */}
                  <div className="mt-8 pt-5 border-t border-[#f1f5fb] flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 rounded-full bg-[#ecf2ff] overflow-hidden flex items-center justify-center text-black font-semibold text-sm ring-1 ring-[#ecf2ff]">
                      <TestimonialAvatar src={t.photo} name={t.name} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-[#111827]">{t.name}</p>
                      <p className="text-[11px] font-normal text-slate-500">
                        {t.designation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
