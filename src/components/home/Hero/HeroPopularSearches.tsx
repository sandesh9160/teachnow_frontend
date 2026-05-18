import Link from "next/link";
import { getHeroCTAData } from "@/lib/globalLayout/getGlobalLayoutData";

export default async function HeroPopularSearches() {
  const heroCTA = await getHeroCTAData();
  const popularSearches = heroCTA?.popular_searches ?? [];

  if (popularSearches.length === 0) return null;

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
      <span className="text-slate-500 font-semibold text-[14px] mr-1">Popular Searches:</span>
      {popularSearches.map((search) => (
        <Link
          key={search.slug}
          href={`/jobs/${search.slug}`}
          className="px-4 py-1.5 bg-white border border-slate-300 rounded-full text-[13px] font-semibold text-[#4a5568] hover:border-indigo-500 hover:text-indigo-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          {search.name}
        </Link>
      ))}
    </div>
  );
}
