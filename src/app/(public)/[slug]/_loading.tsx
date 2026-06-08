export default function PublicSlugLoading() {
  return (
    <div className="bg-[#F8FAFC] min-h-[calc(100vh-5rem)] px-4 sm:px-6 lg:px-8 xl:px-12 py-10 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-blue-500/20 border-t-blue-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          </div>
        </div>
        <p className="text-xs font-bold text-slate-400 tracking-widest uppercase animate-pulse">
          Loading Opportunities...
        </p>
      </div>
    </div>
  );
}

