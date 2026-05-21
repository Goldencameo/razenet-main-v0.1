import { ReactNode, useRef, useState, useEffect, forwardRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollerProps {
  children: ReactNode;
  /** scroll amount in px per arrow click */
  step?: number;
  className?: string;
}

/**
 * A horizontally scrollable strip with optional arrows and native touch swipe.
 * Hides arrows on touch devices / when content fits.
 */
const HorizontalScroller = forwardRef<HTMLDivElement, HorizontalScrollerProps>(
  ({ children, step = 320, className = '' }, _outerRef) => {
    const ref = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState(false);
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(false);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollStart = useRef(0);

    const update = () => {
      const el = ref.current;
      if (!el) return;
      setCanLeft(el.scrollLeft > 4);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    useEffect(() => {
      update();
      const el = ref.current;
      if (!el) return;
      el.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      return () => {
        el.removeEventListener('scroll', update);
        window.removeEventListener('resize', update);
      };
    }, []);

    // Prevent child clicks when dragging / swiping
    const handlePointerDown = useCallback((e: React.PointerEvent) => {
      isDragging.current = false;
      startX.current = e.clientX;
      scrollStart.current = ref.current?.scrollLeft ?? 0;
    }, []);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
      const dx = Math.abs(e.clientX - startX.current);
      if (dx > 5) isDragging.current = true;
    }, []);

    const handleClick = useCallback((e: React.MouseEvent) => {
      if (isDragging.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, []);

    const scrollBy = (dir: 1 | -1) => {
      ref.current?.scrollBy({ left: dir * step, behavior: 'smooth' });
    };

    return (
      <div className={`relative group ${className}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <div
          ref={ref}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onClickCapture={handleClick}
        >
          {children}
        </div>

        {canLeft && (
          <button
            aria-label="Scroll left"
            onClick={() => scrollBy(-1)}
            className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-card border border-border shadow-md items-center justify-center transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
        )}
        {canRight && (
          <button
            aria-label="Scroll right"
            onClick={() => scrollBy(1)}
            className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-9 h-9 rounded-full bg-card border border-border shadow-md items-center justify-center transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
        )}
      </div>
    );
  }
);
HorizontalScroller.displayName = 'HorizontalScroller';

export default HorizontalScroller;
