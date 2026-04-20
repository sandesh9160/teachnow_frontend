"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { GraduationCap, BookOpen, Briefcase, Headphones, Atom, UserCheck } from "lucide-react";
import AutoScrollCarousel from "@/shared/ui/Carousel/AutoScrollCarousel";
import { CategoriesProps } from "@/types/components";

const genericIcons = [GraduationCap, BookOpen, Briefcase, Headphones, Atom, UserCheck];

const getFullImageUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";
  return `${baseUrl}/${path.startsWith('/') ? path.slice(1) : path}`;
};

const CategoryIcon = ({ iconPath, id, name }: { iconPath: string | null | undefined, id: number, name: string }) => {
  const [error, setError] = useState(false);
  const fullUrl = getFullImageUrl(iconPath);

  // Try to match icon by name for better accuracy with the provided image
  const lowerName = name.toLowerCase();
  let FallbackIcon = genericIcons[id % genericIcons.length];

  if (lowerName.includes("physics") || lowerName.includes("chemistry")) FallbackIcon = Atom;
  if (lowerName.includes("english") || lowerName.includes("language")) FallbackIcon = BookOpen;
  if (lowerName.includes("online") || lowerName.includes("tutor")) FallbackIcon = Headphones;
  if (lowerName.includes("computer") || lowerName.includes("science")) FallbackIcon = Briefcase;
  if (lowerName.includes("math")) FallbackIcon = GraduationCap;

  if (!fullUrl || error) {
    return <FallbackIcon className="h-7 w-7" />;
  }

  return (
    <div className="relative w-full h-full group-hover:scale-110 transition-transform duration-300 overflow-hidden rounded-xl">
      <Image
        src={fullUrl}
        alt="Category icon"
        fill
        unoptimized
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
};

export const Categories = ({ categories }: CategoriesProps) => {

  const uniqueCategories = Array.from(
    new Map(
      (Array.isArray(categories) ? categories : []).map((cat) => [cat.id, cat])
    ).values()
  );

  return (
    <section className="pt-20 pb-12 bg-white overflow-hidden relative">
      <div className="max-w-none w-full px-2">

        {/* Header - Matching requested text and style */}
        <div className="text-center mb-14 px-4">
          <h2 className="text-[30px] md:text-[36px] font-bold text-[#111827] tracking-tight mb-2">
            Popular Categories
          </h2>
          <p className="text-[16px] md:text-[18px] text-slate-500 font-medium">
            Explore teaching roles by category
          </p>
        </div>

        {/* Carousel - Centered and Styled */}
        <AutoScrollCarousel speed={0.5} isContinuous={true} className="pb-10">
          {uniqueCategories.map((cat) => {
            const cleanSlug = cat.slug ? cat.slug.replaceAll(/^[:/]+/g, "") : cat.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");
            const href = `/${cleanSlug}`;

            return (
              <Link
                key={cat.id}
                href={href}
                className="group relative flex flex-col shrink-0 w-[180px] h-[165px] items-center justify-center rounded-[20px] border border-primary/20 bg-[#f8faff] p-4 text-center shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-all duration-300 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 mx-0"
              >
                {/* Icon box - matching the light blue aesthetic of the reference */}
                <div className="relative z-10 shrink-0 flex h-12 w-12 mb-3 items-center justify-center rounded-[16px] bg-[#ecf2ff] text-[#1e3a8a] transition-all duration-300 group-hover:bg-[#1e3a8a] group-hover:text-white">
                  <CategoryIcon iconPath={cat.icon} id={cat.id} name={cat.name} />
                </div>

                {/* Content */}
                <div className="relative z-10 space-y-0.5">
                  <h3 className="text-[16px] font-bold text-[#111827] group-hover:text-blue-700 transition-colors leading-tight line-clamp-2">
                    {cat.name}
                  </h3>
                  <p className="text-[12px] font-medium text-[#64748b]">
                    {cat.jobs_count || 0} {cat.jobs_count === 1 ? "Job" : "Jobs"} Available
                  </p>
                </div>
              </Link>
            );
          })}
        </AutoScrollCarousel>

      </div>
    </section>
  );
};

export default Categories;