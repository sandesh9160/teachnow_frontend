"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";

interface JobPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const JobPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: JobPaginationProps) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="mt-12 flex items-center justify-center gap-3">
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="rounded-full h-10 w-10 border-border hover:border-primary transition-all duration-300"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="hidden md:flex items-center gap-2">
        {pages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className={`min-w-[40px] h-10 rounded-full transition-all duration-300 ${
              page === currentPage 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
              : "hover:border-primary hover:text-primary"
            }`}
          >
            {page}
          </Button>
        ))}
      </div>

      <div className="flex md:hidden items-center px-4 font-medium text-sm text-foreground">
        Page {currentPage} of {totalPages}
      </div>

      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="rounded-full h-10 w-10 border-border hover:border-primary transition-all duration-300"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default JobPagination;
