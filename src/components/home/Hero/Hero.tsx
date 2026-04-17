"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { SearchBar } from "./SearchBar";
import type { CTASection, HeroSection } from "@/types/homepage";
import { normalizeMediaUrl } from "@/services/api/client";

export const Hero = ({
  hero,
  cta,
  popularSearches,
}: Readonly<{
  hero: HeroSection;
  cta?: CTASection[] | null;
  popularSearches?: { name: string; slug: string }[];
}>) => {
  const imageUrl = normalizeMediaUrl(hero.background_image);
  const ctaItems = (cta ?? []).filter((item) => item?.is_active === undefined || item.is_active === 1);

  const primaryCta = ctaItems[0] ?? null;
  const secondaryCtas = ctaItems.slice(1);

  return (
    <section className="relative w-full bg-white overflow-visible">
      {/* Background layer */}
      {imageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}

      {/* No overlay to show exact image */}

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 sm:py-24 text-center">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-[#1a202c] leading-tight tracking-tight">
            Find Teaching Jobs at <br />
            Schools, Colleges & <span className="text-indigo-600">Institutes</span>
          </h1>
          <p className="mt-8 text-slate-500 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
            {hero.subtitle}
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          {primaryCta && (
            <Button
              asChild
              className="bg-gradient-to-r from-[#2e3fc7] to-[#4f46e5] hover:shadow-xl hover:shadow-indigo-200/50 text-white px-8 py-3.5 h-auto rounded-xl transition-all font-bold text-lg w-full sm:w-auto flex items-center justify-center gap-3 border-0 active:scale-95"
            >
              <Link href={primaryCta.button_link}>
                {primaryCta.background_image && (
                  <img 
                    src={normalizeMediaUrl(primaryCta.background_image)} 
                    alt="" 
                    className="h-7 w-7 object-contain shrink-0 brightness-0 invert" 
                  />
                )}
                <span>{primaryCta.button_text}</span>
              </Link>
            </Button>
          )}

          {secondaryCtas.map((item) => (
            <Button
              key={item.id ?? item.title ?? item.button_text}
              asChild
              variant="outline"
              className="border border-slate-200 bg-white hover:bg-slate-50 text-[#1a202c] px-8 py-3.5 h-auto rounded-xl shadow-sm hover:shadow-md transition-all font-bold text-lg w-full sm:w-auto flex items-center justify-center gap-3 active:scale-95"
            >
              <Link href={item.button_link}>
                {item.background_image && (
                  <img 
                    src={normalizeMediaUrl(item.background_image)} 
                    alt="" 
                    className="h-7 w-7 object-contain shrink-0" 
                  />
                )}
                <span>{item.button_text}</span>
              </Link>
            </Button>
          ))}
        </div>

        {/* Search Bar Section */}
        <div className="mt-16 max-w-5xl mx-auto relative z-20">
          <SearchBar />

          {/* Popular Searches */}
          {popularSearches && popularSearches.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span className="text-slate-400 font-semibold text-sm mr-2 ">Popular:</span>
              {popularSearches.map((search) => (
                <Link
                  key={search.slug}
                  href={`/jobs/${search.slug}`}
                  className="px-5 py-2 bg-white border border-slate-100 rounded-full text-sm font-bold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm"
                >
                  {search.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
