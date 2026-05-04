"use client";

import { cn } from "@/lib/utils";

export function CheckboxItem({
  label,
  checked,
  onChange,
}: Readonly<{
  label: string;
  checked: boolean;
  onChange: () => void;
}>) {
  return (
    <label 
      className={cn(
        "group flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-all duration-200 ease-out",
        "hover:bg-slate-100/80 active:scale-[0.98]"
      )}
    >
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer h-4 w-4 cursor-pointer appearance-none rounded-[2px] border-[1.5px] border-slate-300 bg-white transition-all duration-200 ease-out checked:border-indigo-600 checked:bg-indigo-600 hover:border-indigo-400 focus:outline-none"
        />
        <div className="pointer-events-none absolute text-white opacity-0 transition-all duration-200 ease-out peer-checked:scale-100 peer-checked:opacity-100 scale-75">
          <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <span className={cn(
        "text-[13px] font-medium leading-none transition-colors duration-200",
        checked ? "text-slate-900 font-semibold" : "text-slate-600 group-hover:text-slate-900"
      )}>
        {label}
      </span>
    </label>
  );
}

export default CheckboxItem;

