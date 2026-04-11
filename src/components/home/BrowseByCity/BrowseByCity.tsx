"use client";

import Link from "next/link";
import AutoScrollCarousel from "@/shared/ui/Carousel/AutoScrollCarousel";
import { City } from "@/types/homepage";
import { normalizeMediaUrl } from "@/services/api/client";

interface BrowseByCityProps {
  cities: City[];
}

export const BrowseByCity = ({ cities }: BrowseByCityProps) => {

  if (!cities || !Array.isArray(cities) || cities.length === 0) return null;

  // Deduplicate and filter out cities without images
  const uniqueCities = Array.from(
    new Map(
      cities
        .filter((city) => city.image && city.image.trim() !== "")
        .map((city) => [city.id, city])
    ).values()
  );

  return (
    <section className="border-t border-border bg-card py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-10 pl-2">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Explore teaching jobs in major <span className="text-primary/80">Indian cities</span>
          </h2>
          <p className="mt-2 text-lg text-slate-500 font-medium tracking-wide">
            Find opportunities in your preferred location
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AutoScrollCarousel speed={0.6}>
          {uniqueCities.map((city) => {
            const imageUrl = normalizeMediaUrl(city.image);
            return (
              <Link
                key={city.id}
                href={`/${city.name.toLowerCase()}-jobs`}
                className="group relative shrink-0 w-64 h-44 overflow-hidden rounded-xl border-2 border-blue-500 shadow-none transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full -mr-12 -mt-12 animate-pulse pointer-events-none z-20" />
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={city.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="h-full w-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {city.name}
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-foreground/80 via-foreground/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-display text-lg font-bold text-primary-foreground">{city.name}</h3>
                </div>
              </Link>
            );
          })}
        </AutoScrollCarousel>
      </div>
    </section>
  );
};

export default BrowseByCity;
