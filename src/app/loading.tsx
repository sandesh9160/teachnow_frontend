

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* 
          NOTE: We do NOT render a Header Skeleton here because the real Header 
          is already rendered by the Root Layout and LayoutWrapper. 
          The main content below is offset by pt-20 in LayoutWrapper.
      */}

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-16 sm:py-24 space-y-12">
        {/* Hero Skeleton - Optimized for LCP */}
        <div className="space-y-8 text-center max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#1a202c] leading-[1.1] tracking-tight">
              Find Teaching Jobs at <br />
              Schools, Colleges & <br />
              <span className="text-indigo-600">Institutes</span>
            </h1>
            <p className="text-slate-400 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto font-medium">
              Discover thousands of teaching opportunities across India. Connect with top schools and universities.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <div className="h-12 w-40 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-12 w-40 bg-slate-100 rounded-xl animate-pulse" />
          </div>

          {/* Search Bar Skeleton */}
          <div className="mt-10 max-w-3xl mx-auto h-16 bg-white rounded-2xl shadow-sm border border-slate-100 animate-pulse" />
        </div>

        {/* Categories Grid Skeleton */}
        <div className="pt-20">
          <div className="h-10 w-48 bg-slate-200 rounded-lg mx-auto mb-12 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-3xl border border-slate-100 animate-pulse shadow-sm" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

