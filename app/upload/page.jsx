"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePhotos } from "@/contexts/PhotoContext";
import { HiUpload } from "react-icons/hi";

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

  useEffect(() => {
    const worker = new Worker(
      new URL("../../lib/scanner.worker.js", import.meta.url),
      { type: "module" }
    );
    setScannerWorker(worker);

    return () => {
      console.log("Terminating worker.");
      worker.terminate();
    };
  }, []);

  const handleFolderSelect = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !scannerWorker) return;

    setIsScanning(true);

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    setTotalFiles(imageFiles.length);

    if (imageFiles.length === 0) {
      setIsScanning(false);
      setScanMessage("No image files found in that folder.");
      return;
    }

    setProgress(0);

    let processedCount = 0;
    let newPhotoData = [];

    const folderPath = imageFiles[0].webkitRelativePath.split("/")[0];
    setScanMessage(`Scanning folder: ${folderPath}`);

    scannerWorker.onmessage = (event) => {
      processedCount++;

      const { success, photoData, thumbnailBlob, fullSizeBlob, fingerprint } =
        event.data;

      if (success) {
        newPhotoData.push({
          metadata: photoData,
          thumbBlob: thumbnailBlob,
          fullSizeBlob: fullSizeBlob,
          fingerprint: fingerprint,
        });
      } else {
        console.warn(
          `Failed to process ${event.data.filename}: ${event.data.error}`
        );
      }

      setProgress(processedCount);

      if (processedCount === imageFiles.length) {
        setIsScanning(false);
        addPhotos(newPhotoData, folderPath);
        router.push("/gallery");
      }
    };

    scannerWorker.onerror = (error) => {
      console.error("Scanner Worker Error (from UploadPage):", error);
      setIsScanning(false);
      setScanMessage("An error occurred during scanning. Check the console.");
    };

    for (let i = 0; i < imageFiles.length; i++) {
      scannerWorker.postMessage({ file: imageFiles[i], id: i });
    }
  };

  return (
    <section className="flex flex-col items-center justify-center text-center space-y-8 w-full min-h-[70vh]">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Scan Your Library
        </h1>
        <p className="text-neutral-400 text-lg max-w-2xl mt-4">{scanMessage}</p>
      </div>

      <div className="mt-8 w-full max-w-lg">
        {!isScanning ? (
          <label
            data-hoverable="true"
            className="magic-hover-button text-white bg-white px-8 py-3 font-semibold cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <span className="relative z-20 flex items-center gap-2">
              <HiUpload />
              Select Photo Folder
            </span>
            <input
              type="file"
              className="hidden"
              webkitdirectory="true"
              directory="true"
              multiple
              onChange={handleFolderSelect}
            />
          </label>
        ) : (
          <div className="w-full text-left">
            <p className="text-lg font-semibold text-white">Scanning...</p>
            <p className="text-sm text-neutral-400 truncate">
              {progress} of {totalFiles}
            </p>
            <div className="w-full bg-neutral-800 rounded-full h-2.5 mt-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${(progress / totalFiles) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
