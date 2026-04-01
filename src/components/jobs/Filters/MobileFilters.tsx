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
      <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-card p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-display text-xl font-bold text-foreground">Filters</h3>
          <button onClick={onClose} className="rounded-full p-2 bg-muted/30 hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>
        
        <div className="pb-20">
          {filterContent}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-card/80 backdrop-blur-md border-t border-border">
          <Button className="w-full shadow-lg shadow-primary/20" onClick={onClose}>
            Show {resultCount} results
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileFilters;
