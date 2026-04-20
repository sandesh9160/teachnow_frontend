import { ChevronDown } from "lucide-react";

interface PaginationFilterProps {
  totalResults: number;
  resultsPerPage: number;
  setResultsPerPage: (val: number) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  startIndex: number;
}

export const PaginationFilter = ({
  totalResults,
  resultsPerPage,
  setResultsPerPage,
  sortBy,
  setSortBy,
  startIndex,
}: PaginationFilterProps) => {
  const sortOptions = ["Default", "Salary: High to Low", "Experience: Low to High"];
  const pageOptions = [10, 20, 50];

  const endIndex = Math.min(startIndex + resultsPerPage, totalResults);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <p className="text-sm font-medium text-slate-500">
          Showing <span className="font-bold text-slate-900">{totalResults > 0 ? `${startIndex + 1} to ${endIndex}` : '0'}</span> of <span className="font-bold text-slate-900">{totalResults}</span> results
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Sort Dropdown */}
        <div className="relative group min-w-[140px]">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full appearance-none bg-white rounded-xl px-5 py-2.5 pr-10 text-sm font-semibold text-slate-600 border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 cursor-pointer transition-all hover:border-slate-300"
            suppressHydrationWarning={true}
          >
            {sortOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none group-hover:text-primary transition-colors" />
        </div>

        {/* Limit Dropdown */}
        <div className="relative group min-w-[120px]">
          <select 
            value={resultsPerPage}
            onChange={(e) => setResultsPerPage(Number(e.target.value))}
            className="w-full appearance-none bg-white rounded-xl px-5 py-2.5 pr-10 text-sm font-semibold text-slate-600 border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 cursor-pointer transition-all hover:border-slate-300"
            suppressHydrationWarning={true}
          >
            {pageOptions.map(opt => <option key={opt} value={opt}>{opt} per page</option>)}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none group-hover:text-primary transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default PaginationFilter;
