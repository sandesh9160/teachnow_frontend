"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function FilterSection({
  title,
  children,
  defaultOpen = true,
}: Readonly<{
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}>) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="space-y-3 pt-3 first:pt-0 border-b border-slate-100 pb-3 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full group"
        suppressHydrationWarning={true}
      >
        <h4 className="text-[12px] font-bold text-slate-800 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
          {title}
        </h4>
        {isOpen ? (
          <ChevronUp className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        )}
      </button>
      
      <div className={cn(
        "transition-all duration-300 ease-in-out overflow-hidden",
        isOpen ? "max-h-[500px] opacity-100 mt-3" : "max-h-0 opacity-0 mt-0"
      )}>
        {children}
      </div>
    </div>
  );
}

export default FilterSection;
