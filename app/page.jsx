"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePhotos } from "../contexts/PhotoContext";
import { processCameraLeaderboard, getDeviceIcon } from "../lib/utils";

export default function DashboardPage() {
  const { photos, settings } = usePhotos();
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [cameraLeaderboard, setCameraLeaderboard] = useState([]);

  useEffect(() => {
    if (photos.length > 0) {
      if (!currentPhoto) setCurrentPhoto(photos[0]);

      setCameraLeaderboard(processCameraLeaderboard(photos, 10));

      const timer = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * photos.length);
        setCurrentPhoto(photos[randomIndex]);
      }, settings.slideshowSpeed);

      return () => clearInterval(timer);
    }
  }, [photos, currentPhoto, settings.slideshowSpeed]);

  return (
    <section className="flex flex-col md:flex-row w-full gap-6 h-[calc(100vh-theme(spacing.24)-theme(spacing.10))] overflow-hidden">
      <div className="w-full md:w-3/5 flex flex-col gap-6 h-full overflow-y-auto no-scrollbar">
        <div className="w-full aspect-video bg-neutral-800 rounded-2xl flex items-center justify-center text-neutral-600 overflow-hidden">
          {currentPhoto ? (
            <img
              src={currentPhoto.thumbUrl}
              alt={currentPhoto.filename}
              key={currentPhoto.filename}
              className="w-full h-full object-cover"
            />
          ) : (
            <p className="text-neutral-500">Scan a folder to begin.</p>
          )}
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl shadow-lg">
          <h2 className="font-semibold text-lg text-white mb-4">
            Recent Captures
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {photos.slice(0, 6).map((photo, i) => (
              <div
                key={photo.id || i}
                className="gallery-image-container aspect-square bg-neutral-800 rounded-md overflow-hidden"
                data-hoverable="true"
              >
                <img
                  src={photo.thumbUrl}
                  alt={photo.filename}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <Link href="/gallery" passHref>
            <button
              data-hoverable="true"
              className="magic-hover-button w-full text-center text-neutral-300 px-5 py-2 font-medium transition mt-4"
            >
              <span>Open Full Gallery</span>
            </button>
          </Link>
        </div>
      </div>

      <div className="w-full md:w-2/5 flex flex-col gap-6 h-full">
        <div className="flex-1 flex flex-col bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl shadow-lg overflow-hidden">
          <div className="flex-1 overflow-y-auto no-scrollbar pr-2">
            {photos.length > 0 ? (
              <ul className="space-y-3">
                {cameraLeaderboard.map((device, index) => (
                  <li
                    key={device.name}
                    className="flex items-center p-3 bg-neutral-800/50 border border-neutral-800 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-3">
                      {getDeviceIcon(device.name)}
                    </div>
                    {index === 0 ? (
                      <>
                        <div className="flex-1">
                          <p className="font-semibold text-white truncate">
                            {device.name}
                          </p>
                          <p className="text-sm text-neutral-400">
                            {device.value} photos
                          </p>
                        </div>
                        <span className="text-lg font-bold text-white ml-4">
                          #1
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-semibold text-neutral-400 w-6">
                          #{index + 1}
                        </span>
                        <p
                          className="flex-1 text-sm text-neutral-300 truncate"
                          title={device.name}
                        >
                          {device.name}
                        </p>
                        <p className="text-sm text-neutral-400 ml-4">
                          {device.value}
                        </p>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-500">
                <p>No camera data to show.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
