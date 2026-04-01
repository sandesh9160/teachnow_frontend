"use client";

import { useState } from "react";

export function StaticDualRangeSlider({
  minLabel,
  maxLabel,
  kind,
  valueMin,
  valueMax,
  onChange,
}: Readonly<{
  minLabel: string;
  maxLabel: string;
  kind: "experience" | "salary";
  valueMin?: number;
  valueMax?: number;
  onChange?: (min: number, max: number) => void;
}>) {
  const minBound = 0;
  const maxBound = 15;
  const step = 1;

  const safeMin = typeof valueMin === "number" ? valueMin : minBound;
  const safeMax = typeof valueMax === "number" ? valueMax : maxBound;
  const [activeThumb, setActiveThumb] = useState<"min" | "max" | null>(null);

  const pctMin = ((safeMin - minBound) / (maxBound - minBound)) * 100;
  const pctMax = ((safeMax - minBound) / (maxBound - minBound)) * 100;

  const minValueLabel = kind === "salary" ? `${safeMin}L` : `${safeMin}`;
  const maxValueLabel = kind === "salary" ? `${safeMax}L` : `${safeMax}`;

  return (
    <div className="px-1">
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-primary/5 px-3 py-1 text-xs font-semibold text-primary transition-all duration-200">
          Min {minValueLabel}
        </span>
        <span className="rounded-full bg-primary/5 px-3 py-1 text-xs font-semibold text-primary transition-all duration-200">
          Max {maxValueLabel}
        </span>
      </div>

      <div className="relative mb-4 h-2 rounded-full bg-primary/10">
        {/* Filled track based on current value */}
        <div
          className="absolute top-0 h-full rounded-full bg-primary transition-all duration-200 ease-out"
          style={{
            left: `${pctMin}%`,
            right: `${100 - pctMax}%`,
          }}
        />

        <div
          className={`absolute bottom-full mb-3 -translate-x-1/2 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg transition-all duration-200 ${
            activeThumb === "min" ? "pointer-events-none translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"
          }`}
          style={{ left: `${pctMin}%` }}
        >
          {minValueLabel}
        </div>
        <div
          className={`absolute bottom-full mb-3 -translate-x-1/2 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg transition-all duration-200 ${
            activeThumb === "max" ? "pointer-events-none translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"
          }`}
          style={{ left: `${pctMax}%` }}
        >
          {maxValueLabel}
        </div>

        {/* Thumbs */}
        <div
          className={`absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow-md transition-all duration-200 ease-out ${
            activeThumb === "min" ? "scale-110 shadow-[0_0_0_6px_rgba(37,64,170,0.14)]" : ""
          }`}
          style={{ left: `${pctMin}%` }}
        />
        <div
          className={`absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow-md transition-all duration-200 ease-out ${
            activeThumb === "max" ? "scale-110 shadow-[0_0_0_6px_rgba(37,64,170,0.14)]" : ""
          }`}
          style={{ left: `${pctMax}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>

      {/* Accessible controls. Visual layer is the track above; thumbs are driven by input values. */}
      {onChange ? (
        <div className="relative -mt-10 h-10">
          <input
            type="range"
            min={minBound}
            max={maxBound}
            step={step}
            value={safeMin}
            className="absolute inset-0 cursor-grab opacity-0 active:cursor-grabbing"
            aria-label={`${kind} minimum`}
            onMouseDown={() => setActiveThumb("min")}
            onTouchStart={() => setActiveThumb("min")}
            onMouseUp={() => setActiveThumb(null)}
            onTouchEnd={() => setActiveThumb(null)}
            onBlur={() => setActiveThumb(null)}
            onChange={(e) => {
              const nextMin = Number(e.target.value);
              onChange(Math.min(nextMin, safeMax), safeMax);
            }}
          />
          <input
            type="range"
            min={minBound}
            max={maxBound}
            step={step}
            value={safeMax}
            className="absolute inset-0 cursor-grab opacity-0 active:cursor-grabbing"
            aria-label={`${kind} maximum`}
            onMouseDown={() => setActiveThumb("max")}
            onTouchStart={() => setActiveThumb("max")}
            onMouseUp={() => setActiveThumb(null)}
            onTouchEnd={() => setActiveThumb(null)}
            onBlur={() => setActiveThumb(null)}
            onChange={(e) => {
              const nextMax = Number(e.target.value);
              onChange(safeMin, Math.max(nextMax, safeMin));
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

export default StaticDualRangeSlider;

