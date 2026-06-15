import { Star, Quote } from "lucide-react";
import { TestimonialProps } from "@/types/components";
import { cn } from "@/lib/utils";
import AutoScrollCarousel from "@/shared/ui/Carousel/AutoScrollCarousel";
import TestimonialAvatar from "./TestimonialAvatar";


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
      <div className="max-w-none w-full px-4 md:px-12">
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
          <div className="text-center py-12 text-slate-400 font-semibold bg-white rounded-2xl border border-[#eef2f8] shadow-sm">
            No testimonials available at the moment.
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonial;
