"use client";
import { useState, useEffect } from "react";
import { useCursor } from "@/contexts/CursorContext";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { cursorState, setCursorState } = useCursor();

  useEffect(() => {
    const onMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Check what element the mouse is over
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (!target) {
        setCursorState("default");
        return;
      }

      // Check if the target or its parent has [data-hoverable="true"]
      const isHoverable = target.closest('[data-hoverable="true"]');
      // NEW: Check if it's a gallery image
      const isGalleryImage = target.closest(".gallery-image-container");

      // Only set to "active" if it's hoverable AND NOT a gallery image
      if (isHoverable && !isGalleryImage) {
        setCursorState("active");
      } else {
        setCursorState("default");
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [setCursorState]);

  // Base class for the cursor
  const cursorClasses = [
    "CustomCursor_cursor__HzHPF",
    cursorState === "active" ? "-active" : "",
  ]
    .join(" ")
    .trim();

  return (
    <>
      <div
        className={cursorClasses}
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
        }}
      />
      {/* This is the placeholder for the label.
        To use it, you would expand the CursorContext to also hold a 'cursorLabel'
        and then display it here.
      */}
      {/* <div
        className="CustomCursor_cursor__label__pWDCc"
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
        }}
      >
        My Label
      </div> */}
    </>
  );
}
