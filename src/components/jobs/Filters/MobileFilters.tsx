"use client";

import { X } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";

interface MobileFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filterContent: React.ReactNode;
  resultCount: number;
}

export const MobileFilters = ({ isOpen, onClose, filterContent, resultCount }: MobileFiltersProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden font-sans">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] flex flex-col rounded-t-[32px] bg-white shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="p-6 pb-2 flex items-center justify-between border-b border-slate-50">
          <h3 className="text-xl font-bold text-black font-sans ">Search Filters</h3>
          <button onClick={onClose} className="rounded-full p-2.5 bg-slate-50 hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5 text-black" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 pb-32 no-scrollbar">
          {filterContent}
        </div>

        <div className="shrink-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 pb-8">
          <Button className="w-full h-12 rounded-xl bg-[#312E81] text-white font-bold shadow-lg shadow-indigo-100" onClick={onClose}>
            Show {resultCount} Results
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileFilters;
