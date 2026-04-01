"use client";

import { useState, useEffect, useRef } from "react";
import { LucideIcon } from "lucide-react";

const useCounter = (target: number, duration: number, inView: boolean) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [inView, target, duration]);
  return count;
};

interface StatsCardProps {
  icon: LucideIcon;
  target: number;
  suffix: string;
  label: string;
  color?: string;
}

export const StatsCard = ({
  icon: Icon,
  target,
  suffix,
  label,
  color = "#002B7F",
}: StatsCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const count = useCounter(target || 0, 1500, inView);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="group flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1">
      <div className="mb-5 p-3 rounded-2xl bg-slate-50 transition-colors group-hover:bg-primary/5" style={{ color }}>
        <Icon className="h-8 w-8 stroke-[1.5] transition-transform duration-500 group-hover:scale-110" />
      </div>
      
      <div className="font-display text-4xl font-bold tracking-tight text-slate-900">
        {count.toLocaleString()}
        <span className="text-primary">{suffix}</span>
      </div>
      <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
    </div>
  );
};

export default StatsCard;
