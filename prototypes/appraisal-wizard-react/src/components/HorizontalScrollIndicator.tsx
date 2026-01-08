import React, { useRef, useEffect, useState, useCallback } from 'react';

interface HorizontalScrollIndicatorProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  stickyTop?: number; // Default 120px (below property cards)
  rightOffset?: number; // Right margin to avoid overlapping action columns (default 160px)
  className?: string;
  hideIndicator?: boolean; // New prop to allow logic execution without visual rendering
}

/**
 * A sleek horizontal scroll indicator that sits below the sticky headers
 * and allows users without scroll wheels to navigate horizontally.
 */
export const HorizontalScrollIndicator: React.FC<HorizontalScrollIndicatorProps> = ({
  scrollContainerRef,
  stickyTop = 120,
  rightOffset = 0,
  className = '',
  hideIndicator = false,
}) => {
  const [scrollState, setScrollState] = useState({
    scrollLeft: 0,
    scrollWidth: 0,
    clientWidth: 0,
  });
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Handle wheel events for horizontal scrolling
  const handleWheel = useCallback((e: WheelEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Check if there's horizontal overflow
    if (container.scrollWidth <= container.clientWidth) return;

    // ZONE CHECK: Allow vertical scroll if mouse is over sticky headers (left) or action column (right)
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Left zone: Label (160px) + Subject (180px) = 340px
    const LEFT_ZONE_WIDTH = 340;
    // Right zone: Action column width passed as rightOffset (default 0 if not provided)
    const RIGHT_ZONE_WIDTH = rightOffset;

    const isInLeftZone = mouseX < LEFT_ZONE_WIDTH;
    const isInRightZone = mouseX > (rect.width - RIGHT_ZONE_WIDTH);

    // If in sticky zones, allow default vertical scroll behavior
    if (isInLeftZone || isInRightZone) return;

    // Prevent default vertical scroll and scroll horizontally instead
    // Only intercept if we're not at the scroll boundaries or if there's deltaX
    const canScrollLeft = container.scrollLeft > 0;
    const canScrollRight = container.scrollLeft < container.scrollWidth - container.clientWidth;

    // Use deltaY for horizontal scroll (converting vertical to horizontal)
    // Also support deltaX for touchpads with horizontal scroll
    const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;

    if ((delta < 0 && canScrollLeft) || (delta > 0 && canScrollRight)) {
      e.preventDefault();
      container.scrollLeft += delta;
    }
  }, [scrollContainerRef, rightOffset]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateScrollState = () => {
      setScrollState({
        scrollLeft: container.scrollLeft,
        scrollWidth: container.scrollWidth,
        clientWidth: container.clientWidth,
      });
    };

    updateScrollState();
    container.addEventListener('scroll', updateScrollState);
    container.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('resize', updateScrollState);

    return () => {
      container.removeEventListener('scroll', updateScrollState);
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [scrollContainerRef, handleWheel]);

  const { scrollLeft, scrollWidth, clientWidth } = scrollState;
  const canScroll = scrollWidth > clientWidth;

  if (!canScroll || hideIndicator) return null;

  const thumbWidth = Math.max((clientWidth / scrollWidth) * 100, 10);
  const thumbPosition = (scrollLeft / (scrollWidth - clientWidth)) * (100 - thumbWidth);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current || !trackRef.current) return;

    const trackRect = trackRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - trackRect.left) / trackRect.width;
    const newScrollLeft = clickPosition * (scrollWidth - clientWidth);

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;

    const startX = e.clientX;
    const startScrollLeft = scrollContainerRef.current?.scrollLeft || 0;
    const trackWidth = trackRef.current?.clientWidth || 1;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current || !scrollContainerRef.current) return;

      const deltaX = moveEvent.clientX - startX;
      const scrollDelta = (deltaX / trackWidth) * (scrollWidth - clientWidth);
      scrollContainerRef.current.scrollLeft = startScrollLeft + scrollDelta;
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={`sticky z-[85] bg-slate-50/80 dark:bg-elevation-1/80 backdrop-blur-sm ${className}`}
      style={{
        top: stickyTop,
        left: 0,
        right: rightOffset,
        transform: 'translateZ(0)',
      }}
    >
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className="h-2 mx-4 my-1 bg-slate-200/60 dark:bg-elevation-1/60 rounded-full cursor-pointer transition-colors hover:bg-slate-200 dark:hover:bg-harken-gray"
      >
        <div
          onMouseDown={handleThumbMouseDown}
          className="h-full bg-slate-400 dark:bg-slate-500 rounded-full cursor-grab active:cursor-grabbing transition-colors hover:bg-slate-500 dark:hover:bg-slate-400"
          style={{
            width: `${thumbWidth}%`,
            marginLeft: `${thumbPosition}%`,
          }}
        />
      </div>
    </div>
  );
};

export default HorizontalScrollIndicator;

