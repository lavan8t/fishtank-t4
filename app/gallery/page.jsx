"use client";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { usePhotos } from "@/contexts/PhotoContext";
import PhotoViewer from "@/components/PhotoViewer";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";

export default function GalleryPage() {
  const { photos } = usePhotos();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  const scrollRef = useRef(null);

  const { photosByYear, sortedYears } = useMemo(() => {
    const groups = {};
    photos.forEach((photo) => {
      let year;
      if (photo.date) {
        const parsedYear = new Date(photo.date).getFullYear();
        year =
          parsedYear > 1990 && parsedYear <= new Date().getFullYear()
            ? parsedYear.toString()
            : "Unknown";
      } else {
        year = "Unknown";
      }

      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(photo);
    });

    const sorted = Object.keys(groups).sort((a, b) => {
      if (a === "Unknown") return 1;
      if (b === "Unknown") return -1;
      return Number(a) - Number(b);
    });

    return { photosByYear: groups, sortedYears: sorted };
  }, [photos]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        container.scrollLeft += 400;
      } else if (e.key === "ArrowLeft") {
        container.scrollLeft -= 400;
      }
    };

    container.addEventListener("wheel", handleScroll, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleScroll);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handlePhotoClick = (photoId) => {
    const index = photos.findIndex((p) => p.id === photoId);
    if (index !== -1) {
      setSelectedPhotoIndex(index);
    }
  };

  const handleCloseViewer = () => {
    setSelectedPhotoIndex(null);
  };

  const { scrollXProgress } = useScroll({ container: scrollRef });

  const [currentYear, setCurrentYear] = useState(sortedYears[0] || "...");

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const checkCenterYear = () => {
      const containerCenter =
        container.getBoundingClientRect().left + container.offsetWidth / 2;
      let newCurrentYear = "...";

      for (const year of sortedYears) {
        const elem = document.getElementById(`year-column-${year}`);
        if (elem) {
          const elemRect = elem.getBoundingClientRect();
          if (
            elemRect.left <= containerCenter &&
            elemRect.right >= containerCenter
          ) {
            newCurrentYear = year;
            break;
          }
        }
      }
      setCurrentYear(newCurrentYear);
    };

    container.addEventListener("scroll", checkCenterYear);
    checkCenterYear();

    return () => container.removeEventListener("scroll", checkCenterYear);
  }, [sortedYears, photos]);

  return (
    <>
      <section
        className="fixed top-20 left-0 right-0 bottom-0 flex flex-col"
        style={{ height: "calc(100vh - 5rem)" }}
      >
        <div
          className="flex-1 flex overflow-x-auto overflow-y-hidden no-scrollbar gap-0.5"
          ref={scrollRef}
        >
          <div className="flex flex-row h-full">
            {sortedYears.map((year) => (
              <div
                key={year}
                id={`year-column-${year}`}
                className="h-full flex flex-col flex-shrink-0"
              >
                <h2 className="text-2xl font-bold text-white sticky left-4 py-2 bg-black/50 backdrop-blur-sm z-10 px-2">
                  {year}
                </h2>
                <div className="grid grid-flow-col grid-rows-5 flex-1 gap-0.5">
                  {photosByYear[year].map((photo) => (
                    <PhotoItem
                      key={photo.id}
                      photo={photo}
                      onClick={() => handlePhotoClick(photo.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <TimelineIndicator
          sortedYears={sortedYears}
          currentYear={currentYear}
          scrollXProgress={scrollXProgress}
        />
      </section>

      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <PhotoViewer
            photos={photos}
            startIndex={selectedPhotoIndex}
            onClose={handleCloseViewer}
            onNavigate={setSelectedPhotoIndex}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function PhotoItem({ photo, onClick }) {
  return (
    <motion.div
      className="aspect-square h-full bg-neutral-800 overflow-hidden cursor-pointer"
      style={{
        height: "calc((100vh - 9rem - 44px - 8px) / 5)",
      }}
      onClick={onClick}
      data-hoverable="true"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.img
        src={photo.thumbUrl}
        alt={photo.filename}
        className="w-full h-full object-cover"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

function TimelineIndicator({ sortedYears, currentYear, scrollXProgress }) {
  return (
    <div className="w-full flex-shrink-0 h-16 bg-black/50 backdrop-blur-md flex items-center justify-center space-x-6 px-8 relative">
      <div className="flex-1 flex justify-between items-center text-sm text-neutral-400">
        {sortedYears.map((year) => (
          <span
            key={year}
            className={`transition-all duration-300 ${
              currentYear === year ? "text-white font-bold text-lg" : ""
            }`}
          >
            {year}
          </span>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-700">
        <motion.div
          className="h-full bg-white"
          style={{ scaleX: scrollXProgress }}
        />
      </div>
    </div>
  );
}
