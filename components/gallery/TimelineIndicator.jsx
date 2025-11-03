"use client";

import { useEffect, useRef } from "react";

export default function TimelineIndicator({
  sortedYears,
  currentYear,
  scrollXProgress,
  scrollRef,
}) {
  const scrollbarRef = useRef(null);
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef(0);

  useEffect(() => {
    const container = scrollRef?.current;
    const scrollbar = scrollbarRef.current;
    const track = scrollbar?.parentElement;

    if (!container || !scrollbar || !track) return;

    const updateScrollbar = () => {
      if (isDraggingRef.current) return;

      const scrollWidth = container.scrollWidth - container.clientWidth;
      if (scrollWidth <= 0) {
        scrollbar.style.display = "none";
        return;
      }

      scrollbar.style.display = "block";

      const scrollProgress = container.scrollLeft / scrollWidth;
      const trackWidth = track.offsetWidth;
      const thumbWidth = Math.max(20, trackWidth * 0.3);
      const maxTranslate = trackWidth - thumbWidth;

      scrollbar.style.width = `${thumbWidth}px`;
      scrollbar.style.transform = `translateX(${
        scrollProgress * maxTranslate
      }px)`;
    };

    const handleMouseDown = (e) => {
      if (!track) return;

      e.preventDefault();
      e.stopPropagation();

      const trackRect = track.getBoundingClientRect();
      const scrollWidth = container.scrollWidth - container.clientWidth;

      if (scrollWidth <= 0) return;

      const thumbWidth = scrollbar.offsetWidth;
      const trackWidth = trackRect.width;
      const maxX = trackWidth - thumbWidth;

      const thumbRect = scrollbar.getBoundingClientRect();
      const thumbLeft = thumbRect.left - trackRect.left;

      const clickX = e.clientX - trackRect.left;
      const isClickingThumb =
        clickX >= thumbLeft && clickX <= thumbLeft + thumbWidth;

      if (!isClickingThumb) {
        const targetX = Math.max(0, Math.min(clickX - thumbWidth / 2, maxX));
        const scrollProgress = targetX / maxX;
        container.scrollLeft = scrollProgress * scrollWidth;
        return;
      }

      isDraggingRef.current = true;
      dragOffsetRef.current = e.clientX - thumbRect.left;

      document.body.style.userSelect = "none";
      document.body.style.cursor = "grabbing";

      const handleMouseMove = (moveEvent) => {
        if (!isDraggingRef.current) return;

        const newX = moveEvent.clientX - trackRect.left - dragOffsetRef.current;
        const clampedX = Math.max(0, Math.min(newX, maxX));
        const scrollProgress = clampedX / maxX;

        container.scrollLeft = scrollProgress * scrollWidth;
        scrollbar.style.transform = `translateX(${clampedX}px)`;
        scrollbar.style.transition = "none";
      };

      const handleMouseUp = () => {
        if (!isDraggingRef.current) return;

        isDraggingRef.current = false;
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        scrollbar.style.transition = "";

        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);

        requestAnimationFrame(updateScrollbar);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    container.addEventListener("scroll", updateScrollbar, { passive: true });
    track.addEventListener("mousedown", handleMouseDown);
    updateScrollbar();
    const resizeObserver = new ResizeObserver(updateScrollbar);
    resizeObserver.observe(container);
    resizeObserver.observe(track);

    return () => {
      container.removeEventListener("scroll", updateScrollbar);
      track.removeEventListener("mousedown", handleMouseDown);
      resizeObserver.disconnect();
    };
  }, [scrollRef]);

  return (
    <div className="w-full flex-shrink-0 h-16 bg-[#0d0d0d]/50 backdrop-blur-md flex items-center justify-center space-x-6 px-8 relative font-mono">
      <div className="flex-1 flex justify-between items-center text-sm text-neutral-400">
        {sortedYears.map((year) => (
          <span
            key={year}
            className={`transition-all duration-300 ${
              currentYear === year ? "text-[#e5e5e5] font-bold text-lg" : ""
            }`}
          >
            {year}
          </span>
        ))}
      </div>

      <div
        ref={containerRef}
        className="absolute bottom-2 left-0 right-0 h-1.5 bg-neutral-700/50 cursor-pointer"
        style={{ margin: "0 8px" }}
      >
        <div
          ref={scrollbarRef}
          className="h-full bg-neutral-300 cursor-grab active:cursor-grabbing"
          style={{
            width: "30%",
            transform: "translateX(0)",
          }}
        />
      </div>
    </div>
  );
}
