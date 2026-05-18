/** Static search UI shell — paints immediately for mobile LCP while SearchBar hydrates */
export function SearchBarSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto h-auto my-6 md:my-8" aria-hidden>
      <div className="bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col md:flex-row items-stretch md:items-center gap-3 p-2 border border-slate-200">
        <div className="flex-[1.4] w-full px-5 py-2.5 border border-slate-300 rounded-xl min-h-[44px]" />
        <div className="flex-1 w-full px-6 py-2.5 border border-slate-300 rounded-xl min-h-[44px]" />
        <div className="px-8 py-2.5 h-[44px] rounded-xl bg-[#3b49df] w-full md:w-auto shrink-0" />
      </div>
    </div>
  );
}
