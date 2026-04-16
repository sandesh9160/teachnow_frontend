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
                className="group relative shrink-0 w-80 h-52 overflow-hidden rounded-[24px] border border-slate-200/20 shadow-sm transition-all duration-500"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={city.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="h-full w-full bg-slate-100 flex items-center justify-center font-bold text-slate-300">
                    {city.name}
                  </div>
                )}
                
                {/* Visual Polish: Gradient & Glass Effect */}
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1 group-hover:text-white transition-colors">Explore</p>
                  <h3 className="text-xl font-bold text-white tracking-tight">{city.name}</h3>
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
