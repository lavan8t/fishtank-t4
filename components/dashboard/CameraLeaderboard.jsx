"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineStar, HiStar } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { getDeviceIcon } from "@/lib/utils";

export default function CameraLeaderboard({ cameraLeaderboard, photos }) {
  const [favorites, setFavorites] = useState(new Set());
  const router = useRouter();

  const toggleFavorite = (e, deviceKey) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(deviceKey)) {
        newFavorites.delete(deviceKey);
      } else {
        newFavorites.add(deviceKey);
      }
      return newFavorites;
    });
  };

  const handleDeviceClick = (device) => {
    const filteredPhotos = photos.filter((photo) => {
      const make = photo.cameraMake || "Unknown";
      const model = photo.cameraModel || "";
      const fullName = model ? `${make} ${model}` : make;
      return fullName === device.name;
    });

    sessionStorage.setItem("filteredPhotos", JSON.stringify(filteredPhotos));
    sessionStorage.setItem("filterType", `Camera: ${device.name}`);
    router.push("/gallery");
  };

  const topThree = cameraLeaderboard.slice(0, 3);
  const restDevices = cameraLeaderboard.slice(3);

  return (
    <div
      className="flex-1 flex flex-col bg-neutral-900/50 border border-neutral-800 rounded-2xl shadow-lg min-h-0 overflow-hidden font-sans"
      style={{ fontFamily: "'Instrument Sans', sans-serif" }}
    >
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Top 3 Devices, single row */}
        {topThree.length > 0 && (
          <div className="flex items-stretch justify-center gap-4 mb-5">
            {topThree.map((device, idx) => {
              const rank = idx + 1;
              const isFavorite = favorites.has(device.name);
              return (
                <motion.div
                  key={device.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleDeviceClick(device)}
                  className="flex flex-col items-center flex-1 p-3 cursor-pointer select-none group"
                  data-hoverable="true"
                >
                  <span className="text-md font-bold mb-1 text-[#BADA55]">
                    {rankMedal(rank)}{" "}
                    <span className="ml-1 text-[#BADA55]">#{rank}</span>
                  </span>
                  <div className="text-2xl mb-2">
                    {getDeviceIcon(device.name)}
                  </div>
                  <span className="font-sans text-sm font-bold text-neutral-100 group-hover:text-[#BADA55] mb-0.5 text-center">
                    {device.name}
                  </span>
                  <span className="font-sans text-xs text-neutral-400">
                    {device.value} photos
                  </span>
                  <button
                    onClick={(e) => toggleFavorite(e, device.name)}
                    className="p-2 rounded-full mt-1 hover:bg-[#BADA55]/10"
                    tabIndex={-1}
                    type="button"
                  >
                    {isFavorite ? (
                      <HiStar
                        className="w-4 h-4"
                        style={{ color: "#BADA55" }}
                      />
                    ) : (
                      <HiOutlineStar className="w-4 h-4 text-neutral-500 group-hover:text-[#BADA55] transition-colors" />
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Remaining devices as list */}
        <ul className="space-y-1">
          {restDevices.map((device, idx) => {
            const rank = idx + 4;
            const isFavorite = favorites.has(device.name);
            return (
              <motion.li
                key={device.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (idx + 3) * 0.03 }}
                onClick={() => handleDeviceClick(device)}
                className="flex items-center gap-3 py-2 px-2 rounded-lg group cursor-pointer select-none font-sans text-neutral-200 hover:bg-neutral-800/40 transition-all"
                style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                data-hoverable="true"
              >
                {/* Rank */}
                <span className="w-8 font-semibold text-neutral-500 group-hover:text-[#BADA55] text-sm font-sans text-center">
                  #{rank}
                </span>
                {/* Icon */}
                <div className="w-8 h-8 flex items-center justify-center">
                  <span className="text-xl">{getDeviceIcon(device.name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate font-sans font-semibold">
                    {device.name}
                  </div>
                  <div className="text-xs text-neutral-400 font-sans">
                    {device.value} photos
                  </div>
                </div>
                {/* Fav */}
                <button
                  onClick={(e) => toggleFavorite(e, device.name)}
                  className="ml-2 p-2 rounded-full transition-all hover:bg-[#BADA55]/10 flex-shrink-0"
                  tabIndex={-1}
                  type="button"
                  style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                >
                  {isFavorite ? (
                    <HiStar className="w-4 h-4" style={{ color: "#BADA55" }} />
                  ) : (
                    <HiOutlineStar className="w-4 h-4 text-neutral-500 group-hover:text-[#BADA55] transition-colors" />
                  )}
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
