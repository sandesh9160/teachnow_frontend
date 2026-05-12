

import { CategoriesSkeleton, FeaturedInstitutionsSkeleton } from "@/components/home/HomeSkeletons";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* 
          NOTE: We do NOT render a Header Skeleton here because the real Header 
          is already rendered by the Root Layout and LayoutWrapper. 
          The main content below is offset by pt-20 in LayoutWrapper.
      */}

      <main className="flex-1 w-full">
        {/* Hero Skeleton - Optimized for LCP Alignment */}
        <section className="relative w-full min-h-[500px] lg:min-h-[600px] flex items-center bg-[#F7F9FC]">
          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-6 pb-16 sm:pt-16 sm:pb-24 text-center">
            <div className="mx-auto max-w-5xl space-y-5">
              <h1 className="font-display text-5xl sm:text-6xl lg:text-[72px] font-extrabold text-[#1a202c] leading-[1.1] tracking-tight">
                Find Teaching Jobs at <br />
                Schools, Colleges & <br />
                <span className="text-indigo-600">Institutes</span>
              </h1>
              <p className="text-slate-500 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
                Discover thousands of teaching opportunities across India. Connect with top schools, universities, and edtech companies.
              </p>
            </div>
            
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <div className="h-12 w-40 bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-12 w-40 bg-slate-100 rounded-xl animate-pulse" />
            </div>

            {/* Search Bar Skeleton */}
            <div className="mt-10 max-w-4xl mx-auto h-16 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] animate-pulse" />
          </div>
        </section>

        {/* standardized skeletons for initial fold */}
        <div className="space-y-0">
          <CategoriesSkeleton />
          <FeaturedInstitutionsSkeleton />
        </div>
      </main>
    </div>
  );
}

