"use client";

import { useEffect } from "react";
import { useView } from "@/contexts/ViewContext";
import { AnimatePresence } from "framer-motion";
import Dashboard from "@/components/Dashboard";
import Gallery from "@/components/Gallery";

export default function HomePage() {
  const { isGalleryOpen, setIsGalleryOpen } = useView();

  const onEnterGallery = () => {
    setIsGalleryOpen(true);
  };

  const onExitGallery = () => {
    setIsGalleryOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isGalleryOpen) {
        onExitGallery();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGalleryOpen]);

  return (
    <div>
      <AnimatePresence>
        {!isGalleryOpen && (
          <Dashboard
            onEnterGallery={onEnterGallery}
            isGalleryOpen={isGalleryOpen}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>{isGalleryOpen && <Gallery />}</AnimatePresence>
    </div>
  );
}
