"use client";

import type { ReactNode } from "react";

export function FilterSection({
  title,
  children,
}: Readonly<{
  title: string;
  children: ReactNode;
}>) {
  return (
    <div className="space-y-4 pt-1 first:pt-0">
      <h4 className="text-[13px] font-bold text-black uppercase tracking-wider">{title}</h4>
      <div className="transition-all duration-300 ease-out">
        {children}
      </div>
    </div>
  );
}

export default FilterSection;

