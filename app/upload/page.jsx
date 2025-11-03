"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePhotos } from "@/contexts/PhotoContext";
import { HiUpload } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Seeded random number generator using epoch time with ms
class SeededRandom {
  constructor() {
    this.seed = Date.now();
  }

  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(max) {
    return Math.floor(this.next() * max);
  }
}

// Convert base64 to Blob
function base64ToBlob(base64, mimeType = "application/octet-stream") {
  const byteCharacters = atob(base64.split(",")[1] || base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

async function blobUrlToDataUrl(blobUrl) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg"));
    };
    img.src = blobUrl;
  });
}

const MotionImage = motion(Image);

export default function UploadPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [scanMessage, setScanMessage] = useState(
    "Select a folder to begin scanning"
  );
  const router = useRouter();
  const { addPhotos } = usePhotos();
  const [scannerWorker, setScannerWorker] = useState(null);
  const [flyingThumbnails, setFlyingThumbnails] = useState([]);

  const lastThrowTimeRef = useRef(0);
  const completedRef = useRef(0);
  const totalFilesRef = useRef(0);
  const processedPhotosRef = useRef([]);
  const rngRef = useRef(new SeededRandom());

  const MAX_VISIBLE_THUMBNAILS = 8;
  const THROW_THROTTLE_MS = 1000 / 5;
  const ANIMATION_DURATION = 0.6;

  useEffect(() => {
    const worker = new Worker(
      new URL("../../lib/scanner.worker.js", import.meta.url),
      { type: "module" }
    );
    setScannerWorker(worker);

    return () => worker.terminate();
  }, []);

  const addThrowingThumbnail = async (thumbnailUrl) => {
    const now = Date.now();
    const timeSinceLastThrow = now - lastThrowTimeRef.current;

    if (timeSinceLastThrow < THROW_THROTTLE_MS) {
      URL.revokeObjectURL(thumbnailUrl);
      return;
    }

    if (flyingThumbnails.length >= MAX_VISIBLE_THUMBNAILS) {
      URL.revokeObjectURL(thumbnailUrl);
      return;
    }

    lastThrowTimeRef.current = now;
    const randomY =
      rngRef.current.next() * window.innerHeight * 0.6 +
      window.innerHeight * 0.2;
    const flyingId = Date.now() + Math.random();

    const dataUrl = await blobUrlToDataUrl(thumbnailUrl);
    URL.revokeObjectURL(thumbnailUrl);

    setFlyingThumbnails((prev) => [
      ...prev,
      { id: flyingId, src: dataUrl, startY: randomY },
    ]);

    setTimeout(() => {
      setFlyingThumbnails((prev) => prev.filter((t) => t.id !== flyingId));
    }, ANIMATION_DURATION * 1000 + 50);
  };

  const completeScanning = () => {
    setScanMessage("Finalizing...");
    setTimeout(() => {
      if (processedPhotosRef.current.length > 0) {
        addPhotos(processedPhotosRef.current, "Imported Photos");
      }
      setIsScanning(false);
      setScanMessage(
        `Scan complete! Imported ${processedPhotosRef.current.length} photos.`
      );

      setTimeout(() => router.push("/"), 2000);
    }, 500);
  };

  const handleFolderSelect = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !scannerWorker) return;

    completedRef.current = 0;
    totalFilesRef.current = 0;
    processedPhotosRef.current = [];
    lastThrowTimeRef.current = 0;
    rngRef.current = new SeededRandom();

    setIsScanning(true);
    setProgress(0);
    setFlyingThumbnails([]);
    setScanMessage("Starting scan...");

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );
    const totalImageFiles = imageFiles.length;
    totalFilesRef.current = totalImageFiles;
    setTotalFiles(totalImageFiles);

    if (totalImageFiles === 0) {
      setScanMessage("No image files found in selected folder.");
      setIsScanning(false);
      return;
    }

    console.log(`Starting to process ${totalImageFiles} image files`);

    scannerWorker.onmessage = (e) => {
      const {
        success,
        photoData,
        thumbnailBase64,
        fullSizeBase64,
        fingerprint,
        filename,
        error,
      } = e.data;

      completedRef.current += 1;
      setProgress(completedRef.current);

      if (success && photoData && thumbnailBase64 && fullSizeBase64) {
        console.log(`✓ Processed: ${photoData.fileName}`);

        const thumbnailBlob = base64ToBlob(thumbnailBase64, "image/jpeg");
        const fullSizeBlob = base64ToBlob(fullSizeBase64);

        processedPhotosRef.current.push({
          ...photoData,
          fingerprint,
          thumbnailBlob,
          fullSizeBlob,
        });

        const thumbnailUrl = URL.createObjectURL(thumbnailBlob);
        addThrowingThumbnail(thumbnailUrl);

        setScanMessage(`Processing: ${photoData.fileName}`);
      } else {
        console.warn(`✗ Failed: ${filename} - ${error}`);
      }

      if (completedRef.current >= totalImageFiles) {
        completeScanning();
      }
    };

    scannerWorker.onerror = (error) => {
      console.error("Worker error:", error);
      setScanMessage(`Error: ${error.message}`);
    };

    imageFiles.forEach((file, index) => {
      scannerWorker.postMessage({ file, id: index });
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <div className="mb-8">
            <HiUpload className="w-24 h-24 mx-auto text-neutral-600 mb-6" />
            <h1 className="text-4xl font-serif mb-4">Import Photos</h1>
            <p className="text-neutral-400 mb-8 font-mono">
              Select a folder containing your photos to begin scanning
            </p>
          </div>

          {!isScanning ? (
            <label
              htmlFor="folder-input"
              className="inline-block px-8 py-4 bg-neutral-800 hover:bg-neutral-700 cursor-pointer transition-all"
              data-hoverable="true"
            >
              <span className="text-lg font-mono">Choose Folder</span>
              <input
                id="folder-input"
                type="file"
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleFolderSelect}
                className="hidden"
              />
            </label>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="w-full h-2 bg-neutral-800 overflow-hidden">
                  <motion.div
                    className="h-full bg-neutral-200"
                    initial={{ width: 0 }}
                    animate={{ width: `${(progress / totalFiles) * 100}%` }}
                    transition={{ duration: 0.15 }}
                  />
                </div>
                <div className="mt-3 text-sm text-neutral-400 font-mono">
                  {progress} / {totalFiles}
                </div>
              </div>

              <div className="text-neutral-300 text-sm truncate font-mono h-6">
                {scanMessage}
              </div>

              <div className="flex justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-8 h-8 border-2 border-neutral-600 border-t-neutral-200"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence mode="sync">
          {flyingThumbnails.map((thumb) => (
            <MotionImage
              key={thumb.id}
              src={thumb.src}
              alt="Scanning"
              width={100}
              height={100}
              quality={70}
              priority={false}
              initial={{
                position: "fixed",
                left: -100,
                top: thumb.startY,
                opacity: 0,
                scale: 0.75,
              }}
              animate={{
                left:
                  typeof window !== "undefined" ? window.innerWidth + 100 : 0,
                opacity: [0, 1, 1, 0],
                scale: [0.75, 1, 1, 0.85],
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{
                duration: ANIMATION_DURATION,
                ease: "easeInOut",
                times: [0, 0.1, 0.85, 1],
              }}
              className="z-50 will-change-transform object-cover"
              draggable={false}
              style={{ width: "100px", height: "100px" }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
