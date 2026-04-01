"use client";

import type { ReactNode } from "react";

export function FilterCard({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="h-full w-full rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_10px_32px_rgba(15,23,42,0.05)] transition-all duration-300 ease-out hover:border-slate-300 hover:shadow-[0_18px_44px_rgba(37,64,170,0.08)] sm:p-8">
      {children}
    </div>
  );
}

export default FilterCard;

