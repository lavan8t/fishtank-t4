"use client";

import { useEffect, useState } from "react";
import { usePhotos } from "@/contexts/PhotoContext";
import Gallery from "@/components/Gallery";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { useRouter } from "next/navigation";

export default function GalleryPage() {
  const { photos } = usePhotos();
  const [displayPhotos, setDisplayPhotos] = useState([]);
  const [filterLabel, setFilterLabel] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if there are filtered photos in sessionStorage
    const filteredPhotosStr = sessionStorage.getItem("filteredPhotos");
    const filterType = sessionStorage.getItem("filterType");

    if (filteredPhotosStr) {
      try {
        const filteredPhotos = JSON.parse(filteredPhotosStr);
        setDisplayPhotos(filteredPhotos);
        setFilterLabel(filterType || "Filtered");
        // Clear after reading
        sessionStorage.removeItem("filteredPhotos");
        sessionStorage.removeItem("filterType");
      } catch (e) {
        console.error("Error parsing filtered photos:", e);
        setDisplayPhotos(photos);
      }
    } else {
      setDisplayPhotos(photos);
    }
  }, [photos]);

  const clearFilter = () => {
    setDisplayPhotos(photos);
    setFilterLabel("");
  };

  return (
    <div className="w-full h-full">
      {filterLabel && (
        <div className="mb-4 flex items-center gap-4 p-3 bg-neutral-800 border border-neutral-700">
          <HiOutlineArrowLeft
            className="w-5 h-5 text-neutral-400 cursor-pointer hover:text-neutral-200"
            onClick={clearFilter}
            data-hoverable="true"
          />
          <span className="font-mono text-sm text-neutral-300">
            Showing: <span className="text-neutral-100">{filterLabel}</span>
          </span>
          <span className="text-neutral-500 text-sm font-mono">
            ({displayPhotos.length}{" "}
            {displayPhotos.length === 1 ? "photo" : "photos"})
          </span>
        </div>
      )}
      <Gallery photos={displayPhotos} />
    </div>
  );
}
