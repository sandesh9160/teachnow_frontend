"use client";

import type { ReactNode } from "react";

export function FilterCard({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="w-full rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all duration-300 ease-out hover:shadow-md">
      {children}
    </div>
  );
}

export default FilterCard;

