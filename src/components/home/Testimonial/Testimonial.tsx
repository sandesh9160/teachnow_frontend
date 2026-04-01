"use client";

import { Star, Quote } from "lucide-react";
import AutoScrollCarousel from "@/shared/ui/Carousel/AutoScrollCarousel";
import { TestimonialProps } from "@/types/components";
import { normalizeMediaUrl } from "@/services/api/client";

export const Testimonial = ({ testimonials }: TestimonialProps) => {
  if (!testimonials || !Array.isArray(testimonials) || testimonials.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AutoScrollCarousel speed={0.5}>
          {Array.from(new Map(testimonials.map((t) => [t.id, t])).values()).map((t) => (
            <div
              key={t.id}
              className="shrink-0 w-80 rounded-xl border border-slate-200 bg-card p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 text-amber-400 fill-amber-400`}
                  />
                ))}
              </div>
              <Quote className="h-6 w-6 text-primary/30 mb-3" />
              <p className="text-sm text-slate-600 leading-relaxed h-24 overflow-hidden text-ellipsis line-clamp-4 font-medium italic">"{t.message}"</p>
              <div className="mt-4 flex items-center gap-3 pt-4 border-t border-slate-200">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-primary/5 text-primary font-bold text-sm overflow-hidden`}
                >
                  {t.photo ? (
                    <img 
                      src={normalizeMediaUrl(t.photo)} 
                      alt={t.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=random`;
                      }}
                    />
                  ) : t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.designation} at {t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </AutoScrollCarousel>
      </div>
    </section>
  );
};

export default Testimonial;
