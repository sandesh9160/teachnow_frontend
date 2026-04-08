"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AutoScrollCarouselProps {
  children: ReactNode[];
  speed?: number;
  className?: string;
  isContinuous?: boolean;
  showArrows?: boolean;
}

const AutoScrollCarousel = ({ 
  children, 
  speed = 1, 
  className = "", 
  isContinuous = false,
  showArrows = false
}: AutoScrollCarouselProps) => {
  const scrollRef = useRef<HTMLElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animRef = useRef<number | null>(null);
  const manualPauseRef = useRef<NodeJS.Timeout | null>(null);
  const childCount = children?.length ?? 0;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || childCount === 0) return;

    const scroll = () => {
      // Auto-scroll logic: only move if NOT paused (pause happens during manual scroll or hover)
      if (!isPaused && el && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += speed;
        
        const oneSetWidth = el.scrollWidth / 4;
        if (el.scrollLeft >= oneSetWidth) {
          el.scrollLeft -= oneSetWidth;
        }
      }
      animRef.current = requestAnimationFrame(scroll);
    };
    
    animRef.current = requestAnimationFrame(scroll);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (manualPauseRef.current) clearTimeout(manualPauseRef.current);
    };
  }, [isPaused, speed, childCount, isContinuous]);

  const handleManualScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (el) {
      // 1. Force pause auto-scroll
      setIsPaused(true);
      
      // 2. Clear any existing resume timer
      if (manualPauseRef.current) clearTimeout(manualPauseRef.current);
      
      // 3. Perform manual scroll
      const currentScroll = el.scrollLeft;
      const offset = 400;
      const targetScroll = direction === 'left' ? currentScroll - offset : currentScroll + offset;
      
      el.scrollTo({ 
        left: targetScroll, 
        behavior: 'smooth' 
      });

      // 4. Resume auto-scroll after 3 seconds of inactivity
      manualPauseRef.current = setTimeout(() => {
        setIsPaused(false);
        manualPauseRef.current = null;
      }, 3000);
    }
  };

  if (!children || children.length === 0) return null;

  return (
    <div className="relative w-full group/carousel">
      {showArrows && (
        <div className="absolute inset-y-0 -left-4 -right-4 flex items-center justify-between pointer-events-none z-40">
          <button 
            type="button"
            onClick={() => handleManualScroll('left')}
            className="pointer-events-auto w-12 h-12 rounded-full bg-white shadow-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:scale-110 active:scale-90 transition-all ml-1 md:ml-0"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          
          <button 
            type="button"
            onClick={() => handleManualScroll('right')}
            className="pointer-events-auto w-12 h-12 rounded-full bg-white shadow-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:scale-110 active:scale-90 transition-all mr-1 md:mr-0"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
      )}

      <section
        ref={scrollRef}
        className={`flex gap-4 overflow-hidden select-none whitespace-nowrap outline-none ${className}`}
        onMouseEnter={() => !isContinuous && setIsPaused(true)}
        onMouseLeave={() => !manualPauseRef.current && setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        style={{ scrollBehavior: "auto" }}
      >
        {children}
        {children}
        {children}
        {children}
      </section>
    </div>
  );
};

export default AutoScrollCarousel;
