import Link from "next/link";
import CategoryIcon from "./CategoryIcon";
import AutoScrollCarousel from "@/shared/ui/Carousel/AutoScrollCarousel";
import { CategoriesProps } from "@/types/components";

export const Categories = ({ categories }: CategoriesProps) => {
  const uniqueCategories = Array.from(
    new Map(
      (Array.isArray(categories) ? categories : []).map((cat) => [cat.id, cat])
    ).values()
  );

  const carouselItems = uniqueCategories.map((cat) => {
    const cleanSlug = cat.slug ? cat.slug.replaceAll(/^[:/]+/g, "") : cat.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");
    const href = `/${cleanSlug}`;

    return (
      <Link
        key={cat.id}
        href={href}
        aria-label={`View jobs in ${cat.name}`}
        className="group relative flex flex-col shrink-0 w-[200px] h-[150px] items-center justify-center rounded-xl border border-slate-300 bg-[#f8faff] p-4 text-center shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-all duration-300 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 mx-0"
      >
        <CategoryIcon iconPath={cat.icon} id={cat.id} name={cat.name} />

        {/* Content */}
        <div className="relative z-10 space-y-0.5">
          <h3 className="text-[16px] font-semibold text-[#111827] group-hover:text-blue-700 transition-colors leading-tight line-clamp-2">
            {cat.name}
          </h3>
          <p className="text-[12px] font-bold text-slate-600">
            {cat.active_jobs_count ?? cat.jobs_count ?? 0} {(cat.active_jobs_count ?? cat.jobs_count) === 1 ? "Job" : "Jobs"} Available
          </p>
        </div>
      </Link>
    );
  });

  return (
    <section className="pt-20 pb-12 bg-white overflow-hidden relative">
      <div className="max-w-none w-full px-4 md:px-12">

        {/* Header - Matching requested text and style */}
        <div className="text-center mb-14 px-4">
          <h2 className="text-[32px] md:text-[32px] font-extrabold text-[#111827] tracking-tight mb-2">
            Popular Categories
          </h2>
          <p className="text-[16px] md:text-[18px] text-slate-600 font-normal">
            Explore teaching roles by category
          </p>
        </div>

        {/* Carousel - Centered and Styled */}
        <AutoScrollCarousel speed={80} isContinuous={true} className="pb-10">
          {carouselItems}
        </AutoScrollCarousel>

      </div>
    </section>
  );
};

export default Categories;