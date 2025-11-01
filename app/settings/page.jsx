"use client";
import { useRouter } from "next/navigation";
import { usePhotos } from "@/contexts/PhotoContext";
import {
  HiOutlineFolderAdd,
  HiOutlineTrash,
  HiOutlineClock,
  HiOutlineX,
} from "react-icons/hi";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const { settings, clearAllData, updateSettings, removeFolderPath } =
    usePhotos();

  const handleClearData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all data and settings? This cannot be undone."
      )
    ) {
      clearAllData();
      router.push("/");
    }
  };

  const handleSpeedChange = (speed) => {
    updateSettings({ slideshowSpeed: speed });
  };

  return (
    <section className="flex flex-col w-full min-h-[70vh]">
      <header className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-sm text-neutral-400">
            Manage your application and data settings.
          </p>
        </div>
      </header>

      <div className="mt-8 flex flex-col gap-10">
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl shadow-lg">
          <h2 className="font-semibold text-lg text-white mb-4">
            Scanned Folders
          </h2>
          <p className="text-sm text-neutral-500 mb-4">
            This is the list of folders you've scanned. Photo data is stored in
            your browser.
          </p>
          <div className="flex flex-wrap gap-3">
            {settings.folderPaths.length > 0 ? (
              settings.folderPaths.map((path, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-2 py-3 px-4 bg-neutral-800 rounded-full border border-neutral-700"
                >
                  <span className="text-sm text-neutral-300 truncate">
                    {path}
                  </span>
                  <button
                    onClick={() => removeFolderPath(path)}
                    className="opacity-50 group-hover:opacity-100 transition-opacity"
                    data-hoverable="true"
                    aria-label="Remove folder"
                  >
                    <HiOutlineX className="w-4 h-4 text-neutral-400 hover:text-white" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500">
                No folders have been scanned in this session.
              </p>
            )}

            <Link href="/upload" passHref>
              <button
                className="magic-hover-button flex items-center justify-center gap-2 text-center p-3 font-medium"
                data-hoverable="true"
              >
                <HiOutlineFolderAdd className="w-5 h-5" />
                <span className="text-sm">Scan a New Folder</span>
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl shadow-lg">
          <h2 className="font-semibold text-lg text-white mb-4">
            Dashboard Slideshow Speed
          </h2>
          <div className="flex flex-wrap gap-3">
            {[1500, 3000, 5000].map((speed) => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                data-hoverable="true"
                className={`magic-hover-button text-sm px-4 py-2 ${
                  settings.slideshowSpeed === speed
                    ? "bg-white text-black"
                    : "text-neutral-300"
                }`}
              >
                <span>{speed / 1000}s</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl shadow-lg">
          <h2 className="font-semibold text-lg text-white mb-4">Manage Data</h2>
          <button
            onClick={handleClearData}
            data-hoverable="true"
            className="magic-hover-button flex items-center justify-center gap-2 text-center p-3 font-medium text-red-500"
          >
            <HiOutlineTrash className="w-5 h-5" />
            <span className="text-sm">Clear All Settings & Data</span>
          </button>
        </div>
      </div>
    </section>
  );
}
