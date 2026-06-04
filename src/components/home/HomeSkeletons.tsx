
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
            <JobCardSkeleton />
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
          <div key={i} className="w-[240px] h-[190px] shrink-0 bg-white rounded-xl border border-slate-100 shadow-sm" />
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
  <section className="py-12 md:py-16 bg-white overflow-hidden">
    <div className="max-w-none w-full px-4 md:px-12">
      <SectionHeaderSkeleton />
      <div className="flex gap-6 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-[300px] h-[200px] shrink-0 bg-slate-50 rounded-[20px]" />
        ))}
      </div>
    </div>
  </section>
);
export const HeroStatsSkeleton = () => (
  <section className="py-12 bg-white border-y border-slate-100">
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <div className="h-8 w-24 bg-slate-100 rounded-lg mx-auto animate-pulse" />
            <div className="h-4 w-32 bg-slate-50 rounded mx-auto animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const TestimonialsSkeleton = () => (
  <section className="py-24 bg-[#f8faff] overflow-hidden w-full">
    <div className="w-full">
      <SectionHeaderSkeleton />
      <div className="flex gap-6 overflow-hidden justify-center py-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-[320px] h-[250px] shrink-0 bg-white rounded-[16px] border border-slate-100 shadow-sm" />
        ))}
      </div>
    </div>
  </section>
);

export const FAQSkeleton = () => (
  <section className="bg-[#f8faff] py-10 px-4">
    <div className="max-w-3xl mx-auto">
      <SectionHeaderSkeleton />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-white rounded-lg border border-slate-200 w-full" />
        ))}
      </div>
    </div>
  </section>
);

export const BlogsSkeleton = () => (
  <section className="py-16 bg-white overflow-hidden w-full">
    <div className="w-full max-w-7xl mx-auto md:px-8">
      <SectionHeaderSkeleton />
      <div className="flex gap-6 overflow-hidden py-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-[360px] h-[400px] shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm" />
        ))}
      </div>
    </div>
  </section>
);
