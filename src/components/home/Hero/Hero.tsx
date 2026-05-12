import Image from "next/image";
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
  hero?: HeroSection | null;
  cta?: CTASection[] | null;
  popularSearches?: { name: string; slug: string }[];
}>) => {
  const imageUrl = hero?.background_image ? normalizeMediaUrl(hero.background_image) : null;
  const ctaItems = (cta ?? []).filter((item) => item?.is_active === undefined || item.is_active === 1);

  return (
    <section 
      id="main-hero" 
      className="relative w-full min-h-[500px] lg:min-h-[600px] flex items-center bg-[#F7F9FC] overflow-visible"
    >
      {/* Background layer */}
      {imageUrl && (
        <div className="absolute inset-0 z-0">
          <Image
            src={imageUrl}
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      )}

      {/* Relative container to stay above background */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-6 pb-16 sm:pt-16 sm:pb-24 text-center">
        <div className="mx-auto max-w-5xl">
          <h1 
            id="hero-heading"
            className="font-display text-5xl sm:text-6xl lg:text-[72px] font-extrabold text-[#1a202c] leading-[1.1] tracking-tight whitespace-pre-line"
          >
            {hero?.title ? (
              hero.title
            ) : (
              <>
                Find Teaching Jobs at <br />
                Schools, Colleges & <br />
                <span className="text-indigo-600">Institutes</span>
              </>
            )}
          </h1>
          <p className="mt-5 text-slate-500 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
            {hero?.subtitle ?? "Discover thousands of teaching opportunities across India. Connect with top schools, universities, and edtech companies."}
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          {ctaItems.map((item, index) => {
            const isBlue = index % 2 === 0;
            const btnIconUrl = item.background_image ? normalizeMediaUrl(item.background_image) : null;

            return (
              <Button
                key={item.id ?? item.title ?? item.button_text}
                asChild
                variant={isBlue ? "default" : "outline"}
                className={
                  isBlue
                    ? "bg-gradient-to-r from-[#2e3fc7] to-[#0c00ec] hover:shadow-xl hover:shadow-indigo-200/50 text-white px-6 py-3 h-auto rounded-xl transition-all font-bold text-sm w-full sm:w-auto flex items-center justify-center gap-2.5 border-0 active:scale-95"
                    : "border border-slate-200 bg-white hover:bg-slate-50 text-[#1a202c] px-6 py-2.5 h-auto rounded-xl shadow-sm hover:shadow-md transition-all font-bold text-sm w-full sm:w-auto flex items-center justify-center gap-2.5 active:scale-95"
                }
              >
                <Link href={item.button_link}>
                  {btnIconUrl && (
                    <Image
                      src={btnIconUrl}
                      alt=""
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain shrink-0"
                    />
                  )}
                  <span>{item.button_text}</span>
                </Link>
              </Button>
            );
          })}
        </div>

        {/* Search Bar Section */}
        <div className="mt-6 md:mt-10 max-w-5xl mx-auto relative z-20">
          <SearchBar />

          {/* Popular Searches */}
          {popularSearches && popularSearches.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <span className="text-slate-500 font-medium text-[14px] mr-1">Popular:</span>
              {popularSearches.map((search) => (
                <Link
                  key={search.slug}
                  href={`/jobs/${search.slug}`}
                  className="px-4 py-1 bg-white border border-slate-200 rounded-full text-[14px] font-medium text-[#5a6b82] hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm"
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

