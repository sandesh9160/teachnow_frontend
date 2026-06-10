"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AutoScrollCarouselProps {
  children: ReactNode[];
  speed?: number; // Duration in seconds for one full loop
  className?: string;
  isContinuous?: boolean;
  showArrows?: boolean;
  gapClass?: string;
}

const AutoScrollCarousel = ({ 
  children, 
  speed = 40, // Increased default as it's now duration based
  className = "", 
  isContinuous = true,
  showArrows = false,
  gapClass = "gap-6 md:gap-8"
}: AutoScrollCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleManualScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (el) {
      const offset = 400;
      const targetScroll = direction === 'left' ? el.scrollLeft - offset : el.scrollLeft + offset;
      
      el.scrollTo({ 
        left: targetScroll, 
        behavior: 'smooth' 
      });
    }
  };

  if (!children || children.length === 0) return null;

  // Use CSS animation for continuous scroll to eliminate TBT
  const animationDuration = `${speed}s`;

  return (
    <div className="relative w-full group/carousel" ref={containerRef}>
      {showArrows && (
        <div className="absolute inset-y-0 -left-4 -right-4 flex items-center justify-between pointer-events-none z-40">
          <button 
            type="button"
            onClick={() => handleManualScroll('left')}
            aria-label="Scroll left"
            className="pointer-events-auto w-12 h-12 rounded-full bg-white shadow-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:scale-110 active:scale-90 transition-all ml-1 md:ml-0"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          
          <button 
            type="button"
            onClick={() => handleManualScroll('right')}
            aria-label="Scroll right"
            className="pointer-events-auto w-12 h-12 rounded-full bg-white shadow-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:scale-110 active:scale-90 transition-all mr-1 md:mr-0"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
      )}

      <div
        className={`overflow-hidden ${className}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div 
          ref={scrollRef}
          className={`flex ${gapClass} w-max ${isContinuous && isInView ? "animate-marquee" : ""}`}
          style={{ 
            animationDuration: animationDuration,
            animationPlayState: isPaused ? 'paused' : 'running',
            willChange: 'transform',
            transform: 'translateZ(0)' // Force layer promotion for compositing
          }}
        >
          {/* We double the children to ensure seamless looping with lower DOM overhead */}
          <div className={`flex ${gapClass} shrink-0`}>
            {children}
          </div>
          <div className={`flex ${gapClass} shrink-0`}>
            {children}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AutoScrollCarousel;

