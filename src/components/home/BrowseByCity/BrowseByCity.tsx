import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import AutoScrollCarousel from "@/shared/ui/Carousel/AutoScrollCarousel";
import { City } from "@/types/homepage";
import { normalizeMediaUrl } from "@/services/api/client";

interface BrowseByCityProps {
  cities: City[];
  totalJobs?: number;
}

export const BrowseByCity = ({ cities, totalJobs }: BrowseByCityProps) => {

  const uniqueCities = useMemo(() => Array.from(
    new Map(
      (Array.isArray(cities) ? cities : [])
        .filter((city) => city.image && city.image.trim() !== "")
        .map((city) => [city.id, city])
    ).values()
  ), [cities]);

  const carouselItems = useMemo(() => uniqueCities.map((city) => {
    const imageUrl = normalizeMediaUrl(city.image);
    return (
      <Link
        key={city.id}
        href={`/${city.name.toLowerCase()}-jobs`}
        aria-label={`View teaching jobs in ${city.name}`}
        className="group relative shrink-0 w-[300px] h-[200px] overflow-hidden rounded-[20px] shadow-lg transition-all duration-500"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`Teaching jobs in ${city.name}`}
            width={300}
            height={200}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
            {city.name}
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-100 transition-opacity" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-xl font-bold text-white tracking-tight leading-tight mb-1">{city.name}</h3>
          <p className="text-sm font-bold text-white/95">
            {city.active_jobs_count ?? city.jobs_count ?? 0} Teaching Jobs
          </p>
        </div>
      </Link>
    );
  }), [uniqueCities]);

  if (!cities || !Array.isArray(cities) || cities.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-white overflow-hidden relative">
      <div className="max-w-none w-full px-2">
        <div className="text-center mb-14 px-4">
          <h2 className="text-[30px] md:text-[36px] font-bold text-[#111827] tracking-tight mb-2">
            Explore teaching jobs in major <span className="text-blue-600">Indian cities</span>
          </h2>
          <p className="text-[16px] md:text-[18px] text-slate-500 font-normal">
            Find opportunities {totalJobs ? `among ${totalJobs}+ ` : "in your "}preferred location
          </p>
        </div>
      </div>
      <div className="max-w-none w-full px-2">
        <AutoScrollCarousel speed={100} className="!gap-4 md:!gap-4">
          {carouselItems}
        </AutoScrollCarousel>
      </div>
    </section>
  );
};

export default BrowseByCity;
