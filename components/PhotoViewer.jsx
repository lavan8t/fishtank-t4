"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useAnimation,
  useDragControls,
} from "framer-motion";
import * as db from "@/lib/db";
import {
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineZoomIn,
  HiOutlineZoomOut,
  HiOutlineRefresh,
  HiOutlineArrowsExpand,
  HiOutlineDownload,
} from "react-icons/hi";

const IconLoading = () => (
  <HiOutlineRefresh className="w-8 h-8 animate-spin text-neutral-400" />
);

export default function PhotoViewer({
  photos,
  startIndex,
  onClose,
  onNavigate,
}) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [scale, setScale] = useState(1);
  const [contextMenu, setContextMenu] = useState(null);
  const [fullResUrl, setFullResUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const controls = useDragControls();
  const imageControls = useAnimation();
  const imageWrapperRef = useRef(null);
  const constraintsRef = useRef(null);

  const currentPhoto = photos[currentIndex];

  useEffect(() => {
    let currentBlobUrl = null;

    const loadFullResImage = async () => {
      if (!currentPhoto) return;
      setIsLoading(true);

      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
        currentBlobUrl = null;
      }

      try {
        const blob = await db.getFullSizePhoto(currentPhoto.id);
        if (blob) {
          currentBlobUrl = URL.createObjectURL(blob);
          setFullResUrl(currentBlobUrl);
        } else {
          console.warn(`No full-size photo found for ID ${currentPhoto.id}`);
          setFullResUrl(null);
        }
      } catch (error) {
        console.error(
          `Error loading full-size photo for ID ${currentPhoto.id}:`,
          error
        );
        setFullResUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadFullResImage();

    return () => {
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [currentPhoto]);

  useEffect(() => {
    setScale(1);
    imageControls.start({ x: 0, y: 0, transition: { duration: 0 } });
  }, [currentIndex, imageControls]);

  useEffect(() => {
    const container = constraintsRef.current;
    if (!container) return;

    const wheelHandler = (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      const target = e.target;
      const isOverImageArea =
        container.contains(target) ||
        target.closest('[class*="overflow-hidden"]') ||
        target.tagName === "IMG";

      if (isOverImageArea) {
        const zoomSensitivity = e.ctrlKey || e.metaKey ? 0.005 : 0.01;
        const newScale = Math.max(
          0.5,
          Math.min(5, scale - e.deltaY * zoomSensitivity)
        );
        setScale(newScale);
      }
    };

    const gestureHandler = (e) => e.preventDefault();
    const options = { passive: false, capture: true };

    window.addEventListener("wheel", wheelHandler, options);
    window.addEventListener("gesturestart", gestureHandler, options);
    window.addEventListener("gesturechange", gestureHandler, options);
    window.addEventListener("gestureend", gestureHandler, options);

    const keyHandler = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "=" || e.key === "+" || e.key === "-" || e.key === "0")
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", keyHandler, options);

    return () => {
      window.removeEventListener("wheel", wheelHandler, options);
      window.removeEventListener("gesturestart", gestureHandler, options);
      window.removeEventListener("gesturechange", gestureHandler, options);
      window.removeEventListener("gestureend", gestureHandler, options);
      window.removeEventListener("keydown", keyHandler, options);
    };
  }, [scale]);

  const nextPhoto = useCallback(() => {
    const nextIndex = (currentIndex + 1) % photos.length;
    setCurrentIndex(nextIndex);
    onNavigate(nextIndex);
  }, [currentIndex, photos.length, onNavigate]);

  const prevPhoto = useCallback(() => {
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
    setCurrentIndex(prevIndex);
    onNavigate(prevIndex);
  }, [currentIndex, photos.length, onNavigate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === "ArrowRight" ||
        e.key === "ArrowLeft" ||
        e.key === "Escape"
      ) {
        e.stopPropagation();
        e.preventDefault();
      }

      if (e.key === "ArrowRight") {
        nextPhoto();
      } else if (e.key === "ArrowLeft") {
        prevPhoto();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [nextPhoto, prevPhoto, onClose]);

  const setZoom = (newScale) => {
    const clampedScale = Math.max(0.5, Math.min(5, newScale));
    setScale(clampedScale);
    if (clampedScale === 1) {
      imageControls.start({ x: 0, y: 0, transition: { duration: 0.3 } });
    }
  };

  const startDrag = (e) => {
    if (scale > 1) {
      controls.start(e, { snapToCursor: false });
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => setContextMenu(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleDownload = () => {
    if (fullResUrl) {
      const link = document.createElement("a");
      link.href = fullResUrl;
      link.download = currentPhoto.fileName;
      link.click();
    }
    closeContextMenu();
  };

  if (!currentPhoto) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex font-mono pt-8"
      onClick={closeContextMenu}
    >
      {/* Left Side - Photo Display */}
      <div className="flex-1 relative flex items-center justify-center">
        <div
          ref={constraintsRef}
          className="w-full h-full flex items-center justify-center overflow-hidden"
        >
          <motion.div
            ref={imageWrapperRef}
            drag={scale > 1}
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            dragMomentum={false}
            animate={imageControls}
            onPointerDown={startDrag}
            className="relative"
            style={{ cursor: scale > 1 ? "grab" : "default" }}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <IconLoading />
              </div>
            )}
            <img
              src={fullResUrl || currentPhoto.thumbUrl}
              alt={currentPhoto.fileName}
              style={{
                transform: `scale(${scale})`,
                maxWidth: "calc(100vw - 320px)",
                maxHeight: "calc(100vh - 32px)",
                objectFit: "contain",
              }}
              onContextMenu={handleContextMenu}
              draggable={false}
            />
          </motion.div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevPhoto}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 bg-black/30 hover:text-white hover:bg-black/50 transition-all backdrop-blur-sm"
          data-hoverable="true"
        >
          <HiOutlineChevronLeft className="w-8 h-8" />
        </button>
        <button
          onClick={nextPhoto}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 bg-black/30 hover:text-white hover:bg-black/50 transition-all backdrop-blur-sm"
          data-hoverable="true"
        >
          <HiOutlineChevronRight className="w-8 h-8" />
        </button>

        {/* Top Controls */}
        <div className="absolute top-4 left-4 flex gap-2">
          <button
            onClick={onClose}
            className="p-3 text-white/70 bg-black/30 hover:text-white hover:bg-black/50 transition-all backdrop-blur-sm"
            data-hoverable="true"
          >
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        {/* Photo Counter */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50">
          {currentIndex + 1} / {photos.length}
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-2">
          <button
            onClick={() => setZoom(scale - 0.5)}
            className="p-2 text-white/70 hover:text-white hover:bg-neutral-700 transition-all"
            data-hoverable="true"
            disabled={scale <= 0.5}
          >
            <HiOutlineZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-2 text-white/70 hover:text-white hover:bg-neutral-700 transition-all"
            data-hoverable="true"
          >
            <HiOutlineRefresh className="w-5 h-5" />
          </button>
          <button
            onClick={() => setZoom(scale + 0.5)}
            className="p-2 text-white/70 hover:text-white hover:bg-neutral-700 transition-all"
            data-hoverable="true"
            disabled={scale >= 5}
          >
            <HiOutlineZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 text-white/70 hover:text-white hover:bg-neutral-700 transition-all"
            data-hoverable="true"
          >
            <HiOutlineArrowsExpand className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Right Side - Details Panel */}
      <div className="w-80 bg-neutral-900 overflow-y-auto p-6 border-l border-neutral-800">
        <h3 className="text-xl font-serif mb-6">Details</h3>

        <div className="space-y-6">
          {/* File Name */}
          <div>
            <div className="text-xs text-neutral-500 mb-1 font-mono uppercase tracking-wide">
              File Name
            </div>
            <div className="text-sm font-mono break-all">
              {currentPhoto.fileName}
            </div>
          </div>

          {/* Date Taken */}
          {currentPhoto.dateTaken && (
            <div>
              <div className="text-xs text-neutral-500 mb-1 font-mono uppercase tracking-wide">
                Date Taken
              </div>
              <div className="text-sm font-mono">
                {new Date(currentPhoto.dateTaken).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          )}

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="w-full mt-4 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2 font-mono"
            data-hoverable="true"
          >
            <HiOutlineDownload className="w-5 h-5" />
            <span>Download Photo</span>
          </button>
        </div>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: "fixed",
              left: contextMenu.x,
              top: contextMenu.y,
            }}
            className="bg-neutral-800 shadow-xl p-2 z-50 font-mono"
          >
            <button
              className="w-full text-left px-4 py-2 hover:bg-neutral-700 text-sm flex items-center gap-2"
              onClick={handleDownload}
            >
              <HiOutlineDownload className="w-4 h-4" />
              Download
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
