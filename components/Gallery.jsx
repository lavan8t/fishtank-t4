"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { usePhotos } from "@/contexts/PhotoContext";
import { processCameraLeaderboard } from "@/lib/utils";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { HiOutlineXCircle, HiOutlineSearch } from "react-icons/hi";
import Dropdown from "@/components/Dropdown";
import PhotoViewer from "@/components/PhotoViewer";
import GalleryHeader from "@/components/gallery/GalleryHeader.jsx";
import GalleryFilterBar from "@/components/gallery/GalleryFilterBar.jsx";
import PhotoItem from "@/components/gallery/PhotoItem.jsx";
import TimelineIndicator from "@/components/gallery/TimelineIndicator.jsx";

export default function Gallery() {
  const { photos } = usePhotos();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const scrollRef = useRef(null);
  const galleryHeaderRef = useRef(null);
  const filterBarRef = useRef(null);

  const [sortOrder, setSortOrder] = useState("date-desc");
  const [filterCamera, setFilterCamera] = useState("all");
  const [filterRegex, setFilterRegex] = useState("");
  const [isRegexValid, setIsRegexValid] = useState(true);

  const [isFilterBarVisible, setIsFilterBarVisible] = useState(false);
  const [galleryHeaderHeight, setGalleryHeaderHeight] = useState(0);
  const [filterBarHeight, setFilterBarHeight] = useState(0);

  const cameraList = useMemo(() => {
    const allCameras = processCameraLeaderboard(photos);
    const options = allCameras.map((cam) => ({
      value: cam.name,
      label: cam.name,
    }));
    return [{ value: "all", label: "All Cameras" }, ...options];
  }, [photos]);

  const sortOptions = [
    { value: "date-desc", label: "Date (Newest)" },
    { value: "date-asc", label: "Date (Oldest)" },
    { value: "name-asc", label: "Filename (A-Z)" },
    { value: "name-desc", label: "Filename (Z-A)" },
  ];

  const handleRegexChange = (e) => {
    const newRegex = e.target.value;
    setFilterRegex(newRegex);
    if (newRegex.trim() === "") {
      setIsRegexValid(true);
      return;
    }
    try {
      new RegExp(newRegex.trim(), "i");
      setIsRegexValid(true);
    } catch (err) {
      setIsRegexValid(false);
    }
  };

  const { photosByYear, sortedYears, totalMatches, flatFilteredPhotos } =
    useMemo(() => {
      let processedPhotos = [...photos];

      if (filterCamera !== "all") {
        processedPhotos = processedPhotos.filter((p) => {
          const make = p.cameraMake || "Unknown";
          const model = p.cameraModel || "Unknown";
          let cameraName;
          if (make === "Unknown" && model === "Unknown") cameraName = "Unknown";
          else if (make === "Unknown") cameraName = model;
          else if (model === "Unknown") cameraName = make;
          else if (model.toLowerCase().includes(make.toLowerCase()))
            cameraName = model;
          else cameraName = `${make} ${model}`;
          return cameraName === filterCamera;
        });
      }

      if (filterRegex.trim() !== "" && isRegexValid) {
        try {
          const regex = new RegExp(filterRegex.trim(), "i");
          processedPhotos = processedPhotos.filter((p) =>
            regex.test(p.filename)
          );
        } catch (e) {
          console.warn("Regex filter error:", e.message);
        }
      }

      processedPhotos.sort((a, b) => {
        switch (sortOrder) {
          case "date-asc":
            return new Date(a.date) - new Date(b.date);
          case "name-asc":
            return a.filename.localeCompare(b.filename);
          case "name-desc":
            return b.filename.localeCompare(a.filename);
          case "date-desc":
          default:
            return new Date(b.date) - new Date(a.date);
        }
      });

      const flatFilteredPhotos = [...processedPhotos];
      const totalMatches = processedPhotos.length;

      const groups = {};
      processedPhotos.forEach((photo) => {
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

      const sortedYearKeys = Object.keys(groups).sort((a, b) => {
        if (a === "Unknown") return 1;
        if (b === "Unknown") return -1;
        if (sortOrder.startsWith("date-")) {
          return sortOrder === "date-asc"
            ? Number(a) - Number(b)
            : Number(b) - Number(a);
        }
        return Number(a) - Number(b);
      });

      return {
        photosByYear: groups,
        sortedYears: sortedYearKeys,
        totalMatches,
        flatFilteredPhotos,
      };
    }, [photos, sortOrder, filterCamera, filterRegex, isRegexValid]);

  useEffect(() => {
    if (galleryHeaderRef.current) {
      setGalleryHeaderHeight(galleryHeaderRef.current.offsetHeight);
    }
    if (filterBarRef.current) {
      setFilterBarHeight(filterBarRef.current.offsetHeight);
    }
  }, [totalMatches, filterCamera, filterRegex, isFilterBarVisible]);

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
      if (selectedPhotoIndex !== null) {
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        container.scrollLeft += 400;
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
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
  }, [selectedPhotoIndex]);

  const handlePhotoClick = (photoId) => {
    const index = flatFilteredPhotos.findIndex((p) => p.id === photoId);
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
  }, [sortedYears, photosByYear]);

  return (
    <motion.section
      className="fixed top-20 left-0 right-0 bottom-0 flex flex-col"
      style={{ height: "calc(100vh - 5rem)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <GalleryHeader
        headerRef={galleryHeaderRef}
        onToggleFilter={() => setIsFilterBarVisible(!isFilterBarVisible)}
        isFilterVisible={isFilterBarVisible}
      />

      <AnimatePresence>
        {isFilterBarVisible && (
          <GalleryFilterBar
            filterBarRef={filterBarRef}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            sortOptions={sortOptions}
            filterCamera={filterCamera}
            setFilterCamera={setFilterCamera}
            cameraList={cameraList}
            filterRegex={filterRegex}
            handleRegexChange={handleRegexChange}
            isRegexValid={isRegexValid}
            setFilterRegex={setFilterRegex}
            setIsRegexValid={setIsRegexValid}
            totalMatches={totalMatches}
          />
        )}
      </AnimatePresence>

      <div
        className="flex-1 flex overflow-x-auto overflow-y-hidden no-scrollbar gap-0.5 p-0.5"
        ref={scrollRef}
      >
        {totalMatches === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-neutral-500 font-mono">
            <p>No photos match your filters.</p>
          </div>
        ) : (
          <div className="flex flex-row h-full">
            {sortedYears.map((year) => (
              <div
                key={year}
                id={`year-column-${year}`}
                className="h-full flex flex-col flex-shrink-0"
              >
                <h2 className="font-serif text-2xl font-normal text-[#e5e5e5] sticky left-4 py-2 bg-[#0d0d0d]/50 backdrop-blur-sm z-10 px-2">
                  {year}
                </h2>
                <div className="grid grid-flow-col grid-rows-5 flex-1 gap-0.5">
                  {photosByYear[year].map((photo) => (
                    <PhotoItem
                      key={photo.id}
                      photo={photo}
                      onClick={() => handlePhotoClick(photo.id)}
                      galleryHeaderHeight={galleryHeaderHeight}
                      filterBarHeight={isFilterBarVisible ? filterBarHeight : 0}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TimelineIndicator
        sortedYears={sortedYears}
        currentYear={currentYear}
        scrollXProgress={scrollXProgress}
        scrollRef={scrollRef}
      />

      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <PhotoViewer
            photos={flatFilteredPhotos}
            startIndex={selectedPhotoIndex}
            onClose={handleCloseViewer}
            onNavigate={setSelectedPhotoIndex}
          />
        )}
      </AnimatePresence>
    </motion.section>
  );
}
