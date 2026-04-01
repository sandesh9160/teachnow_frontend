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
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition-all duration-300 ease-out hover:border-slate-300 hover:shadow-[0_10px_24px_rgba(37,64,170,0.06)]">
      <h4 className="mb-5 text-base font-bold text-slate-900">{title}</h4>
      <div className="transition-all duration-300 ease-out">
        {children}
      </div>
    </div>
  );
}

export default FilterSection;

