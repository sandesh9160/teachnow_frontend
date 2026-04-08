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
  // Handle "storage/..." paths correctly by prepending base URL
  return `${baseUrl}/${path.startsWith('/') ? path.slice(1) : path}`;
};

const CategoryIcon = ({ iconPath, id }: { iconPath: string | null | undefined, id: number }) => {
  const [error, setError] = useState(false);
  const fullUrl = getFullImageUrl(iconPath);
  const FallbackIcon = genericIcons[id % genericIcons.length] || GraduationCap;

  if (!fullUrl || error) {
    return <FallbackIcon className="h-8 w-8" />;
  }

  return (
    <div className="relative w-full h-full group-hover:scale-110 transition-transform duration-300 overflow-hidden rounded-2xl">
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
    <section className="py-12 md:py-16 bg-white overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-left mb-10 pl-2">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Popular <span className="text-primary/80">Teaching</span> Categories
          </h2>
          <p className="mt-2 text-lg text-slate-500 font-medium tracking-wide">
            Explore teaching roles by your area of expertise
          </p>
        </div>

        {/* Carousel */}
        <AutoScrollCarousel speed={0.6} isContinuous={true} className="pb-8">
          {uniqueCategories.map((cat) => {
            const cleanSlug = cat.slug ? cat.slug.replaceAll(/^[:/]+/g, "") : cat.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");
            const href = `/${cleanSlug}`;

            return (
              <Link
                key={cat.id}
                href={href}
                className="group flex flex-col shrink-0 w-52 items-center rounded-xl border border-slate-200 bg-card p-6 text-center shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary/20 hover:-translate-y-0.5"
              >
                {/* Icon box - matching site-wide square icon pattern */}
                <div className="shrink-0 flex h-16 w-16 mb-4 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-105 group-hover:border-primary">
                  <CategoryIcon iconPath={cat.icon} id={cat.id} />
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    <span>{cat.jobs_count || 0} {cat.jobs_count === 1 ? "Job" : "Jobs"}</span>
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