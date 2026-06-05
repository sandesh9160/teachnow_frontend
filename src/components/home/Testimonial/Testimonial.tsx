"use client";

import { Star, Quote, User } from "lucide-react";
import { TestimonialProps } from "@/types/components";
import { normalizeMediaUrl } from "@/services/api/client";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import AutoScrollCarousel from "@/shared/ui/Carousel/AutoScrollCarousel";

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
      sizes="40px"
      className="object-cover"
      onError={() => setError(true)}
    />
  );
};

export const Testimonial = ({ testimonials }: TestimonialProps) => {
  const showContent = testimonials && Array.isArray(testimonials) && testimonials.length > 0;
  const isSingle = showContent && testimonials.length === 1;

  const testimonialItems = showContent ? testimonials.map((t) => (
    <div
      key={t.id}
      className="shrink-0 w-[280px] md:w-[320px] h-full rounded-[16px] border border-[#eef2f8] bg-white p-7 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] whitespace-normal"
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

        <p className="text-[14px] text-slate-600 flex-1 font-normal leading-relaxed mb-6">
          {t.message}
        </p>

        {/* Subtle Divider and Small Author Profile */}
        <div className="pt-5 border-t border-[#f1f5fb] flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 rounded-full bg-[#ecf2ff] overflow-hidden flex items-center justify-center text-black font-semibold text-sm ring-1 ring-[#ecf2ff]">
            <TestimonialAvatar src={t.photo} name={t.name} />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-[#111827]">{t.name}</p>
            <p className="text-[11px] font-normal text-slate-600">
              {t.designation}
            </p>
          </div>
        </div>
      </div>
    </div>
  )) : [];

  return (
    <section className="py-24 bg-[#F7F9FC] overflow-hidden relative w-full">
      <div className="w-full">
        <div className="text-center mb-14 px-4">
          <h2 className="text-[32px] md:text-[32px] font-extrabold text-[#111827] tracking-tight mb-2">
            What Teachers and Schools Say
          </h2>
          <p className="text-[16px] md:text-[18px] text-slate-600 font-normal">
            Real experiences from our community
          </p>
        </div>

        {showContent ? (
          isSingle ? (
            <div className="flex justify-center py-4">
              {testimonialItems}
            </div>
          ) : (
            <AutoScrollCarousel speed={80} isContinuous={true} className="py-4">
              {testimonialItems}
            </AutoScrollCarousel>
          )
        ) : (
          <div className="text-center py-12 text-slate-400 font-semibold bg-white rounded-2xl mx-4 md:mx-12 border border-[#eef2f8] shadow-sm">
            No testimonials available at the moment.
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonial;
