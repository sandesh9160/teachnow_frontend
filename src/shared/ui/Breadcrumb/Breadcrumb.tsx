import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb = ({ items, className }: BreadcrumbProps) => {
  return (
    <nav className={cn("flex flex-wrap items-center text-[13px] md:text-[14px] font-medium text-slate-800 gap-1.5 md:gap-2 py-2", className)}>
      <Link 
        href="/" 
        className="text-slate-500 hover:text-slate-900 transition-colors shrink-0 font-normal"
      >
        Home
      </Link>

      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center gap-1.5 md:gap-2">
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 stroke-[2]" />
          {item.href && !item.isCurrent ? (
            <Link 
              href={item.href} 
              className="text-slate-500 hover:text-slate-900 transition-colors truncate max-w-[120px] sm:max-w-[200px] md:max-w-none font-normal"
            >
              {item.label}
            </Link>
          ) : (
            <span 
              className={cn(
                "truncate max-w-[150px] sm:max-w-[250px] md:max-w-[500px] font-medium",
                item.isCurrent ? "text-slate-900" : "text-slate-500",
                "block"
              )}
              title={item.label}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
