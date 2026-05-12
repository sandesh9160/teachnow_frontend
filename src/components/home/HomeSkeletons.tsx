
import { JobCardSkeleton } from "@/shared/cards/JobCard/JobCardSkeleton";

export const SectionHeaderSkeleton = () => (
  <div className="text-center mb-14 px-4">
    <div className="h-10 w-64 bg-slate-100 rounded-lg mx-auto mb-3" />
    <div className="h-4 w-80 bg-slate-50 rounded mx-auto" />
  </div>
);

export const FeaturedJobsSkeleton = () => (
  <section className="py-12 md:py-16 bg-white overflow-hidden">
    <div className="max-w-none w-full px-4 md:px-12">
      <SectionHeaderSkeleton />
      <div className="flex gap-6 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-[320px] shrink-0">
            <JobCardSkeleton compact={true} />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const FeaturedInstitutionsSkeleton = () => (
  <section className="pt-12 pb-20 bg-[#f8faff] overflow-hidden">
    <div className="max-w-none w-full px-4 md:px-12">
      <SectionHeaderSkeleton />
      <div className="flex gap-6 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-[240px] h-[300px] shrink-0 bg-white rounded-3xl border border-slate-100 shadow-sm" />
        ))}
      </div>
    </div>
  </section>
);

export const CategoriesSkeleton = () => (
  <section className="pt-20 pb-12 bg-white overflow-hidden">
    <div className="max-w-none w-full px-4 md:px-12">
      <SectionHeaderSkeleton />
      <div className="flex gap-6 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-[180px] h-[165px] shrink-0 bg-slate-50 rounded-[20px] border border-slate-100" />
        ))}
      </div>
    </div>
  </section>
);

export const BrowseByCitySkeleton = () => (
  <section className="py-16 bg-white overflow-hidden">
    <div className="max-w-none w-full px-4 md:px-12">
      <SectionHeaderSkeleton />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-48 bg-slate-50 rounded-2xl" />
        ))}
      </div>
    </div>
  </section>
);
