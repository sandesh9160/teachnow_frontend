"use client";

import Link from "next/link";
import { GraduationCap, BookOpen, Briefcase, Headphones, Atom, UserCheck } from "lucide-react";
import AutoScrollCarousel from "@/shared/ui/Carousel/AutoScrollCarousel";
import { CategoriesProps } from "@/types/components";

const genericIcons = [GraduationCap, BookOpen, Briefcase, Headphones, Atom, UserCheck];

export const Categories = ({ categories }: CategoriesProps) => {


  const uniqueCategories = Array.from(
    new Map(
      (Array.isArray(categories) ? categories : []).map((cat) => [cat.id, cat])
    ).values()
  );

  return (
    <section className="py-12 md:py-16 bg-white">
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
        <AutoScrollCarousel speed={0.6} className="pb-8">
          {uniqueCategories.map((cat) => {
            const Icon = genericIcons[cat.id % genericIcons.length] || GraduationCap;
            const cleanSlug = cat.slug ? cat.slug.replaceAll(/^[:/]+/g, "") : cat.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");
            const href = `/${cleanSlug}`;

            return (
              <Link
                key={cat.id}
                href={href}
                className="group flex flex-col shrink-0 w-52 items-center rounded-xl border border-slate-200 bg-card p-6 text-center shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary/20 hover:-translate-y-0.5"
              >
                {/* Icon box - matching site-wide square icon pattern */}
                <div className="flex h-16 w-16 mb-4 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-105 group-hover:border-primary">
                  <Icon className="h-8 w-8" />
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {cat.name}
                  </h3>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <span>{cat.jobs_count || 0} {cat.jobs_count === 1 ? "Job" : "Jobs"} Available</span>
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