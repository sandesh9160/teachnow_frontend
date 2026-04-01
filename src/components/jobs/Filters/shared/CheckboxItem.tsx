"use client";

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
    <label className="group flex cursor-pointer items-center gap-4 rounded-md border border-transparent px-3 py-2.5 transition-all duration-200 ease-out hover:border-primary/10 hover:bg-primary/5">
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer h-5 w-5 cursor-pointer appearance-none rounded-sm border-2 border-slate-200 bg-white transition-all duration-200 ease-out checked:border-primary checked:bg-primary hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary/15"
        />
        <div className="pointer-events-none absolute text-white opacity-0 transition-all duration-200 ease-out peer-checked:scale-100 peer-checked:opacity-100 peer-checked:rotate-0 scale-75 -rotate-6">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <span className={`text-sm font-medium transition-colors duration-200 group-hover:text-slate-900 ${checked ? "text-slate-900" : "text-slate-600"}`}>
        {label}
      </span>
    </label>
  );
}

export default CheckboxItem;

