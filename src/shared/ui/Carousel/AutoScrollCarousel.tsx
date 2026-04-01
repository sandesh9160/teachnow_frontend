"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface AutoScrollCarouselProps {
  children: ReactNode[];
  speed?: number;
  className?: string;
}

const AutoScrollCarousel = ({ children, speed = 1, className = "" }: AutoScrollCarouselProps) => {
  const scrollRef = useRef<HTMLElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animRef = useRef<number | null>(null);
  const childCount = children?.length ?? 0;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || childCount === 0) return;

    const scroll = () => {
      if (!isPaused && el && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += speed;
        
        // Reset when we pass the first set's width (content is repeated 4 times)
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
    };
  }, [isPaused, speed, childCount]);

  if (!children || children.length === 0) return null;

  return (
    <section
      ref={scrollRef}
      aria-label="Auto-scrolling carousel"
      className={`flex gap-4 overflow-hidden select-none whitespace-nowrap focus-within:ring-2 focus-within:ring-blue-500/50 outline-none ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      style={{ scrollBehavior: "auto" }}
    >
      {/* Render children 4 times to ensure it always fills the screen and scrolls smoothly */}
      {children}
      {children}
      {children}
      {children}
    </section>
  );
};

export default AutoScrollCarousel;
