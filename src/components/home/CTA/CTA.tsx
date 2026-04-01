"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { CTASection } from "@/types/homepage";
import { normalizeMediaUrl } from "@/services/api/client";

interface CTAProps {
  cta: CTASection[];
}

export const HomeCTA = ({ cta }: CTAProps) => {
  const items = (cta ?? []).filter((item) => item?.is_active === undefined || item.is_active === 1);
  if (!items.length) return null;

  return (
    <section className="py-16 md:py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-12">
        {items.map((cta) => {
          const bgImage = normalizeMediaUrl(cta.background_image);

          return (
            <div
              key={cta.id ?? cta.title}
              className="relative rounded-[3rem] overflow-hidden bg-slate-900 shadow-2xl border border-white/5 flex flex-col md:flex-row items-stretch min-h-[460px]"
            >
              {/* Visual Background Pattern (Subtle) */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(var(--primary-rgb),0.15),transparent_50%)] z-0" />

              {/* Left Column: Text Content */}
              <div className="flex-1 relative z-10 p-10 md:p-16 lg:p-20 flex flex-col justify-center text-center md:text-left">
                <div className="space-y-6 max-w-xl mx-auto md:mx-0">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1]">
                    {cta.title}
                  </h2>
                  <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed max-w-lg">
                    {cta.subtitle}
                  </p>

                  <div className="pt-6 flex justify-center md:justify-start">
                    <Button asChild variant="hero" size="xl" className="h-16 px-12 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all font-bold text-lg group">
                      <Link href={cta.button_link} className="flex items-center gap-3">
                        {cta.button_text}
                        <ArrowRight className="h-6! w-6! transition-transform group-hover:translate-x-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Background */}
              <div className="w-full md:w-1/2 lg:w-[45%] bg-slate-800/30 relative flex items-center justify-center p-8 md:p-12 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.2),transparent_70%)] animate-pulse" />

                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  {bgImage ? (
                    <img
                      src={bgImage}
                      alt={cta.title}
                      className="max-h-[300px] md:max-h-[380px] w-auto object-contain drop-shadow-[0_35px_60px_rgba(0,0,0,0.5)] transition-transform duration-700 hover:scale-105"
                    />
                  ) : (
                    <div className="h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
                  )}
                </div>

                {/* Subtle Decorative Elements */}
                <div className="absolute top-10 right-10 w-24 h-24 border-t-2 border-r-2 border-white/5 rounded-tr-3xl" />
                <div className="absolute bottom-10 left-10 w-24 h-24 border-b-2 border-l-2 border-white/5 rounded-bl-3xl" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HomeCTA;
