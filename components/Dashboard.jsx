"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { usePhotos } from "@/contexts/PhotoContext";
import { processCameraLeaderboard, processPhotosByDay } from "@/lib/utils";
import * as db from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";
import CameraLeaderboard from "./dashboard/CameraLeaderboard";
import PhotosTimelineChart from "./dashboard/PhotosTimelineChart";
import PhotoViewer from "./PhotoViewer";
import { HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";

// Time-seeded random
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getSeededRandomInt(max, seed) {
  if (max <= 0) return 0;
  return Math.floor(seededRandom(seed) * max);
}

async function getAverageColor(blobUrl) {
  return new Promise((resolve) => {
    try {
      const img = new window.Image();
      img.crossOrigin = "Anonymous";
      img.src = blobUrl;

      const timeout = setTimeout(() => resolve(null), 3000);

      img.onload = () => {
        clearTimeout(timeout);
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const data = ctx.getImageData(0, 0, 1, 1).data;
          const r = data[0],
            g = data[1],
            b = data[2];
          resolve(`rgb(${r},${g},${b})`);
        } catch (e) {
          resolve(null);
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve(null);
      };
    } catch (error) {
      resolve(null);
    }
  });
}

export default function Dashboard({ onEnterGallery }) {
  const { photos, settings, setAmbientColor } = usePhotos();
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cameraLeaderboard, setCameraLeaderboard] = useState([]);
  const [fullResUrl, setFullResUrl] = useState(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const photoDataCache = useRef(new Map());
  const timerRef = useRef(null);
  const loadingRef = useRef(false);
  const componentMountedRef = useRef(true);
  const firstPhotoLoadedRef = useRef(false);

  useEffect(() => {
    componentMountedRef.current = true;
    return () => {
      componentMountedRef.current = false;
      photoDataCache.current.forEach((data) => {
        if (data.blobUrl) URL.revokeObjectURL(data.blobUrl);
      });
      photoDataCache.current.clear();
    };
  }, []);

  useEffect(() => {
    setWindowSize({
      width: typeof window !== "undefined" ? window.innerWidth : 0,
      height: typeof window !== "undefined" ? window.innerHeight : 0,
    });
  }, []);

  const leftPanelVariants = {
    initial: { x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 },
    exit: {
      x: -windowSize.width / 2,
      y: -windowSize.height / 2,
      opacity: 0,
      scale: 0.5,
      rotate: -15,
      transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
    },
  };

  const rightPanelVariants = {
    initial: { x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 },
    exit: {
      x: windowSize.width / 2,
      y: -windowSize.height / 2,
      opacity: 0,
      scale: 0.5,
      rotate: 15,
      transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
    },
  };

  const loadPhotoData = useCallback(async (photo) => {
    if (!photo || loadingRef.current || !componentMountedRef.current)
      return { fullResUrl: null, ambientColor: null };

    if (photoDataCache.current.has(photo.id)) {
      return photoDataCache.current.get(photo.id);
    }

    loadingRef.current = true;
    try {
      const blob = await db.getFullSizePhoto(photo.id);
      if (!blob || !componentMountedRef.current) {
        loadingRef.current = false;
        return { fullResUrl: null, ambientColor: null };
      }

      const blobUrl = URL.createObjectURL(blob);
      const ambientColor = await getAverageColor(blobUrl);

      const photoData = {
        fullResUrl: blobUrl,
        ambientColor: ambientColor,
        blobUrl,
      };

      photoDataCache.current.set(photo.id, photoData);
      loadingRef.current = false;
      return photoData;
    } catch (error) {
      console.warn("Error loading photo:", error);
      loadingRef.current = false;
      return { fullResUrl: null, ambientColor: null };
    }
  }, []);

  const updateSlide = useCallback(
    (photo, index, data) => {
      if (!componentMountedRef.current) return;

      requestAnimationFrame(() => {
        if (componentMountedRef.current) {
          setCurrentPhoto(photo);
          setCurrentIndex(index);
          setFullResUrl(data.fullResUrl);
          setAmbientColor(data.ambientColor);
          setIsLoadingImage(false);
        }
      });
    },
    [setAmbientColor]
  );

  // Main slideshow effect
  useEffect(() => {
    if (!photos.length || !componentMountedRef.current) {
      setCurrentPhoto(null);
      setFullResUrl(null);
      setAmbientColor(null);
      return;
    }

    setCameraLeaderboard(processCameraLeaderboard(photos, 10));

    // Load first photo with random selection (seeded by time)
    if (!firstPhotoLoadedRef.current) {
      firstPhotoLoadedRef.current = true;
      const timeSeed = Date.now();
      const firstRandomIndex = getSeededRandomInt(photos.length, timeSeed);
      const firstRandomPhoto = photos[firstRandomIndex];

      setIsLoadingImage(true);
      loadPhotoData(firstRandomPhoto).then((data) => {
        if (data.fullResUrl && componentMountedRef.current) {
          updateSlide(firstRandomPhoto, firstRandomIndex, data);
        } else {
          setIsLoadingImage(false);
        }
      });
    }

    // Setup slideshow timer
    timerRef.current = setInterval(async () => {
      if (!componentMountedRef.current) return;

      const timeSeed = Date.now();
      let nextPhotoIndex;

      do {
        nextPhotoIndex = getSeededRandomInt(photos.length, timeSeed);
      } while (photos.length > 1 && nextPhotoIndex === currentIndex);

      const nextPhoto = photos[nextPhotoIndex];
      setIsLoadingImage(true);
      const nextPhotoData = await loadPhotoData(nextPhoto);

      if (nextPhotoData.fullResUrl && componentMountedRef.current) {
        updateSlide(nextPhoto, nextPhotoIndex, nextPhotoData);
      } else {
        setIsLoadingImage(false);
      }
    }, settings.slideshowSpeed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    photos,
    settings.slideshowSpeed,
    loadPhotoData,
    updateSlide,
    setAmbientColor,
  ]);

  const photosByDay = useMemo(() => processPhotosByDay(photos), [photos]);

  const handleImageError = useCallback(() => {
    if (!componentMountedRef.current) return;

    setFullResUrl(null);

    setTimeout(() => {
      const timeSeed = Date.now();
      let nextPhotoIndex;
      do {
        nextPhotoIndex = getSeededRandomInt(photos.length, timeSeed);
      } while (photos.length > 1 && nextPhotoIndex === currentIndex);

      const nextPhoto = photos[nextPhotoIndex];
      setIsLoadingImage(true);
      loadPhotoData(nextPhoto).then((data) => {
        if (data.fullResUrl && componentMountedRef.current) {
          updateSlide(nextPhoto, nextPhotoIndex, data);
        } else {
          setIsLoadingImage(false);
        }
      });
    }, 200);
  }, [photos, currentIndex, loadPhotoData, updateSlide]);

  return (
    <>
      <motion.section
        className="flex flex-col md:flex-row w-full gap-6 h-[calc(100vh-theme(spacing.24)-theme(spacing.10))] overflow-hidden"
        variants={{
          exit: { transition: { staggerChildren: 0.1, staggerDirection: -1 } },
        }}
        exit="exit"
      >
        <motion.div
          className="w-full md:w-3/5 flex flex-col h-full"
          variants={leftPanelVariants}
        >
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl shadow-lg overflow-hidden relative h-full">
            {currentPhoto && fullResUrl ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPhoto.id}
                  className="w-full h-full relative"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                >
                  <img
                    src={fullResUrl}
                    alt={currentPhoto.fileName}
                    className="w-full h-full object-cover"
                    onLoad={() => setIsLoadingImage(false)}
                    onError={handleImageError}
                    loading="eager"
                  />
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-500 font-mono bg-neutral-800">
                <p>
                  {isLoadingImage ? "Loading..." : "Scan a folder to begin."}
                </p>
              </div>
            )}

            <div
              className="absolute top-0 left-0 right-0 h-full pointer-events-none z-10"
              style={{
                background:
                  "linear-gradient(180deg, rgba(13, 13, 13, 0.9) 0%, rgba(13, 13, 13, 0.7) 15%, transparent 40%)",
              }}
            />

            <h2
              className="absolute top-0 left-0 p-6 font-serif text-4xl font-normal text-[#e5e5e5] z-20 pointer-events-auto flex items-center gap-3 cursor-pointer"
              onClick={onEnterGallery}
              data-hoverable="true"
            >
              Gallery
              <HiOutlineArrowTopRightOnSquare className="w-6 h-6" />
            </h2>

            <div className="absolute bottom-0 left-0 right-0 z-10 pt-24 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-6 gap-0.5 px-6 pb-6">
                {photos.slice(0, 6).map((photo, i) => (
                  <motion.div
                    key={photo.id || i}
                    className="aspect-square bg-neutral-800 overflow-hidden cursor-pointer"
                    data-hoverable="true"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedThumbnailIndex(i)}
                  >
                    <img
                      src={photo.thumbUrl}
                      alt={photo.fileName}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="w-full md:w-2/5 flex flex-col gap-6 h-full"
          variants={rightPanelVariants}
        >
          <CameraLeaderboard
            cameraLeaderboard={cameraLeaderboard}
            photos={photos}
          />
          <PhotosTimelineChart photos={photos} photosByDay={photosByDay} />
        </motion.div>
      </motion.section>

      <AnimatePresence>
        {selectedThumbnailIndex !== null && (
          <PhotoViewer
            photos={photos}
            startIndex={selectedThumbnailIndex}
            onClose={() => setSelectedThumbnailIndex(null)}
            onNavigate={setSelectedThumbnailIndex}
          />
        )}
      </AnimatePresence>
    </>
  );
}
