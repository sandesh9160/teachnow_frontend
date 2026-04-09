import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
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
    <nav className={cn("flex flex-wrap items-center text-[14px] md:text-[15px] font-medium text-slate-500/90 gap-2 md:gap-2.5 hide-scrollbar py-1", className)}>
      <Link 
        href="/" 
        className="flex items-center gap-1.5 hover:text-primary transition-colors shrink-0"
      >
        <Home className="h-[17px] w-[17px] mb-0.5" />
        <span className="mb-0.5">Home</span>
      </Link>

      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center gap-2 md:gap-2.5">
          <ChevronRight className="h-4 w-4 text-slate-300" />
          {item.href && !item.isCurrent ? (
            <Link 
              href={item.href} 
              className="hover:text-primary transition-colors truncate max-w-[120px] sm:max-w-[200px] md:max-w-none mb-0.5"
            >
              {item.label}
            </Link>
          ) : (
            <span 
              className={cn(
                "truncate max-w-[150px] sm:max-w-[250px] md:max-w-[500px] lg:max-w-2xl font-semibold mb-0.5",
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
