"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { SearchBar } from "./SearchBar";
import type { CTASection, HeroSection } from "@/types/homepage";
import { normalizeMediaUrl } from "@/services/api/client";

export const Hero = ({
  hero,
  cta,
}: Readonly<{
  hero: HeroSection;
  cta?: CTASection[] | null;
}>) => {
  const imageUrl = normalizeMediaUrl(hero.background_image);
  const ctaItems = (cta ?? []).filter((item) => item?.is_active === undefined || item.is_active === 1);

  // Your UX request: render `cta` as the button above the search bar (no separate CTA section).
  const primaryCta = ctaItems[0] ?? null;
  const secondaryCtas = ctaItems.slice(1);

  return (
    <section className="relative z-40 py-16 md:py-24 bg-slate-100">
      {/* Dynamic Background Image from API */}
      {imageUrl && (
        <div 
          className="absolute inset-0 z-0 opacity-90 transition-opacity duration-1000" 
          style={{ 
            backgroundImage: `url(${imageUrl})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }} 
        />
      )}
      
      {/* Refined Overlays for maximum visibility + readability */}
      <div className="absolute inset-0 bg-linear-to-b from-white/80 via-white/50 to-white z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,white_100%)] z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary-rgb),0.05),transparent_40%)] z-[1]" />
      
      <div className="max-w-none w-full px-2 relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <h1
            className="text-4xl font-bold text-foreground md:text-6xl lg:text-7xl leading-[1.1]"
          >
            {hero.title.split(' ').slice(0, -1).join(' ')} <span className="text-primary">{hero.title.split(' ').slice(-1)}</span>
          </h1>
          <p
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl font-medium"
          >
            {hero.subtitle}
          </p>
        </div>

        <div className="mx-auto mt-10 flex flex-wrap justify-center gap-4">
          {primaryCta ? (
            <Button
              asChild
              variant="hero"
              size="lg"
              className="h-14 px-10 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all font-bold rounded-2xl text-lg"
            >
              <Link href={primaryCta.button_link} className="inline-flex items-center gap-3">
                {primaryCta.background_image ? (
                  <img
                    src={normalizeMediaUrl(primaryCta.background_image)}
                    alt={primaryCta.button_text || "CTA"}
                    className="h-6 w-6 object-contain"
                  />
                ) : null}
                <span>{primaryCta.button_text}</span>
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              variant="hero"
              size="lg"
              className="h-14 px-10 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all font-bold rounded-2xl text-lg"
            >
              <Link href={hero.button_link}>{hero.button_text}</Link>
            </Button>
          )}

          {secondaryCtas.map((item) => (
            <Button
              key={item.id ?? item.title ?? item.button_text}
              asChild
              variant="outline"
              size="lg"
              className="h-14 px-10 bg-white/50 backdrop-blur-md border-primary/10 hover:border-primary/30 transition-all font-semibold rounded-2xl text-foreground"
            >
              <Link
                href={item.button_link}
                className="inline-flex items-center gap-3"
              >
                {item.background_image ? (
                  <img
                    src={normalizeMediaUrl(item.background_image)}
                    alt={item.button_text || "CTA"}
                    className="h-6 w-6 object-contain"
                  />
                ) : null}
                <span>{item.button_text}</span>
              </Link>
            </Button>
          ))}
        </div>

        <div className="mx-auto mt-20 md:mt-16 max-w-4xl relative z-[100]">
          <SearchBar />
          {hero.trust_text ? (
            <div className="mt-8 md:mt-12 text-center text-base md:text-lg font-bold text-muted-foreground/80 animate-in fade-in slide-in-from-bottom-2 duration-700 tracking-tight">
              {hero.trust_text}
            </div>
          ) : null}
        </div>
      </div>


    </section>
  );
};

export default Hero;
