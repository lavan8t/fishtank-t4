"use client";
import { useState, useEffect, useMemo, useRef, Fragment } from "react";
import { usePhotos } from "@/contexts/PhotoContext";
import {
  motion,
  useDragControls,
  AnimatePresence,
  useAnimation,
} from "framer-motion";
import * as db from "@/lib/db";

const IconClose = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
const IconChevronLeft = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-8 h-8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5L8.25 12l7.5-7.5"
    />
  </svg>
);
const IconChevronRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-8 h-8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 4.5l7.5 7.5-7.5 7.5"
    />
  </svg>
);
const IconPlay = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
    />
  </svg>
);
const IconZoomIn = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
    />
  </svg>
);
const IconZoomOut = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
    />
  </svg>
);
const IconFit = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
    />
  </svg>
);
const IconExpand = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
    />
  </svg>
);
const IconLoading = () => (
  <svg
    className="animate-spin h-8 w-8 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
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

      // Clean up previous blob URL if it exists
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
          console.warn(
            `No full-size photo found for ID ${currentPhoto.id}, using thumbnail`
          );
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
    imageControls.start({ x: 0, y: 0, scale: 1, transition: { duration: 0 } });
  }, [currentIndex, imageControls]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        nextPhoto();
      } else if (e.key === "ArrowLeft") {
        prevPhoto();
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, photos.length]);

  const nextPhoto = () => {
    const nextIndex = (currentIndex + 1) % photos.length;
    setCurrentIndex(nextIndex);
    onNavigate(nextIndex);
  };

  const prevPhoto = () => {
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
    setCurrentIndex(prevIndex);
    onNavigate(prevIndex);
  };

  const handleZoom = (e) => {
    e.preventDefault();
    const newScale = Math.max(0.5, Math.min(5, scale - e.deltaY * 0.01));
    setScale(newScale);
    imageControls.start({ scale: newScale, transition: { duration: 0.1 } });
  };

  const setZoom = (newScale) => {
    setScale(newScale);
    if (newScale === 1) {
      imageControls.start({
        x: 0,
        y: 0,
        scale: 1,
        transition: { duration: 0.3 },
      });
    } else {
      imageControls.start({ scale: newScale, transition: { duration: 0.3 } });
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

  if (!currentPhoto) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onWheel={handleZoom}
      onContextMenu={handleContextMenu}
      onClick={onClose}
    >
      <button
        className="viewer-btn absolute top-6 right-6 z-[60]"
        onClick={onClose}
        data-hoverable="true"
      >
        <IconClose />
      </button>

      <button
        className="viewer-btn absolute left-6 top-1/2 -translate-y-1/2 z-[60]"
        onClick={(e) => {
          e.stopPropagation();
          prevPhoto();
        }}
        data-hoverable="true"
      >
        <IconChevronLeft />
      </button>
      <button
        className="viewer-btn absolute right-6 top-1/2 -translate-y-1/2 z-[60]"
        onClick={(e) => {
          e.stopPropagation();
          nextPhoto();
        }}
        data-hoverable="true"
      >
        <IconChevronRight />
      </button>

      <div
        className="w-full h-[70vh] flex items-center justify-center overflow-hidden"
        ref={constraintsRef}
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <IconLoading />
            </motion.div>
          ) : (
            <motion.div
              key={currentPhoto.id || currentIndex}
              ref={imageWrapperRef}
              className="relative"
              drag
              dragControls={controls}
              dragConstraints={constraintsRef}
              dragListener={false}
              onPointerDown={startDrag}
              style={{
                cursor: scale > 1 ? "grab" : "auto",
              }}
              whileDrag={{ cursor: "grabbing" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={fullResUrl || currentPhoto.thumbUrl}
                alt={currentPhoto.filename}
                className="max-w-[90vw] max-h-[70vh] object-contain select-none"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ExifPanel photo={currentPhoto} />

      <PhotoToolbar
        onZoomIn={() => setZoom(scale + 0.5)}
        onZoomOut={() => setZoom(scale - 0.5)}
        onZoomFit={() => setZoom(1)}
        onZoom100={() => setZoom(2)}
        onToggleFullscreen={toggleFullscreen}
      />

      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            photo={currentPhoto}
            onClose={closeContextMenu}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PhotoToolbar({
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onZoom100,
  onToggleFullscreen,
}) {
  return (
    <div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-neutral-900/80 backdrop-blur-md text-white rounded-full shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 p-2">
        <button className="viewer-btn-sm" title="Slideshow (coming soon)">
          <IconPlay />
        </button>
        <div className="w-px h-6 bg-neutral-700 mx-2" />
        <button className="viewer-btn-sm" title="Zoom Out" onClick={onZoomOut}>
          <IconZoomOut />
        </button>
        <button
          className="viewer-btn-sm"
          title="Fit to Screen"
          onClick={onZoomFit}
        >
          <IconFit />
        </button>
        <button className="viewer-btn-sm" title="Zoom In" onClick={onZoomIn}>
          <IconZoomIn />
        </button>
        <div className="w-px h-6 bg-neutral-700 mx-2" />
        <button
          className="viewer-btn-sm"
          title="Toggle Fullscreen"
          onClick={onToggleFullscreen}
        >
          <IconExpand />
        </button>
      </div>
    </div>
  );
}

function ExifPanel({ photo }) {
  // Format date and time nicely
  const formatDateTime = (date) => {
    if (!date) return "N/A";
    try {
      const d = new Date(date);
      const dateStr = d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const timeStr = d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return `${dateStr} ${timeStr}`;
    } catch (e) {
      return "N/A";
    }
  };

  const cameraInfo =
    photo.cameraMake !== "Unknown"
      ? `${photo.cameraMake} ${photo.cameraModel}`
      : "N/A";

  const metadataItems = [
    { label: "Date", value: formatDateTime(photo.date) },
    { label: "Camera", value: cameraInfo },
    { label: "Focal Length", value: photo.focalLength || "N/A" },
    { label: "Aperture", value: photo.aperture || "N/A" },
    { label: "ISO", value: photo.iso || "N/A" },
    { label: "Shutter", value: photo.shutterSpeed || "N/A" },
  ];

  return (
    <motion.div
      className="w-full max-w-5xl z-50 p-4 bg-neutral-900/50 backdrop-blur-sm"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ ease: "easeInOut", duration: 0.3 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="space-y-3">
        <div className="text-white text-base font-medium font-mono">
          {photo.filename}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-mono">
          {metadataItems.map((item, idx) => (
            <span key={idx} className="flex items-center gap-1.5">
              <span className="text-neutral-400">{item.label}:</span>
              <span className="text-white">{item.value}</span>
              {idx < metadataItems.length - 1 && (
                <span className="text-neutral-600 mx-1">•</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ContextMenu({ x, y, photo, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleCopyExif = () => {
    console.log("Copying EXIF for", photo.filename);
    onClose();
  };

  const handleExport = () => {
    console.log("Exporting", photo.filename);
    onClose();
  };

  return (
    <motion.div
      ref={menuRef}
      className="fixed z-[70] w-56 bg-neutral-800 border border-neutral-700 rounded-md shadow-lg overflow-hidden"
      style={{ top: y, left: x }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.1 }}
    >
      <ul className="text-white text-sm py-2">
        <li
          className="px-4 py-2 hover:bg-neutral-700 cursor-pointer"
          onClick={onClose}
        >
          Show in Gallery
        </li>
        <li
          className="px-4 py-2 hover:bg-neutral-700 cursor-pointer"
          onClick={handleCopyExif}
        >
          Copy EXIF Data
        </li>
        <li
          className="px-4 py-2 hover:bg-neutral-700 cursor-pointer"
          onClick={handleExport}
        >
          Export with Watermark
        </li>
        <div className="h-px bg-neutral-700 my-2" />
        <li className="px-4 py-2 text-neutral-500 cursor-not-allowed">
          Open Externally (stub)
        </li>
      </ul>
    </motion.div>
  );
}
