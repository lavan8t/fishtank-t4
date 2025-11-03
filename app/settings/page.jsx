"use client";

import { useState, useEffect } from "react";
import { usePhotos } from "@/contexts/PhotoContext";
import { motion } from "framer-motion";
import { HiTrash, HiCheck, HiX } from "react-icons/hi";

export default function SettingsPage() {
  const { settings, updateSettings, clearAllData, photos } = usePhotos();
  const [slideshowSpeed, setSlideshowSpeed] = useState(
    settings.slideshowSpeed || 5000
  );
  const [isClearing, setIsClearing] = useState(false);
  const [clearMessage, setClearMessage] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Debounce slideshow speed updates
  useEffect(() => {
    const timeout = setTimeout(() => {
      updateSettings({ slideshowSpeed });
    }, 500);

    return () => clearTimeout(timeout);
  }, [slideshowSpeed, updateSettings]);

  const handleClearAllData = async () => {
    setIsClearing(true);
    setClearMessage("Clearing all data...");

    try {
      // Clear IndexedDB
      await clearAllData();

      // Clear localStorage
      localStorage.clear();

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear service worker cache if exists
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }

      // Clear all blob URLs (in case any are hanging)
      if ("storage" in navigator) {
        try {
          const estimate = await navigator.storage.estimate();
          console.log("Storage quota:", estimate.quota);
          console.log("Storage usage:", estimate.usage);
        } catch (e) {
          console.warn("Could not estimate storage:", e);
        }
      }

      setClearMessage("✓ All data cleared successfully!");
      setShowConfirmDialog(false);

      // Reload after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error clearing data:", error);
      setClearMessage("✗ Error clearing data. Please try again.");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 pt-0">
      {/* Header - positioned behind navbar */}
      <div className="relative z-30 bg-neutral-950 border-b border-neutral-800 pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-8">
          <h1 className="text-4xl font-serif text-neutral-100">Settings</h1>
          <p className="text-neutral-400 font-mono text-sm mt-2">
            Manage your photo collection and application preferences
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-8 py-12">
        <div className="space-y-8">
          {/* Collection Stats */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-800/50 border border-neutral-700 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-serif text-neutral-100 mb-6">
              Collection Stats
            </h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="bg-neutral-700/50 rounded-lg p-4">
                <p className="text-neutral-400 text-sm font-mono mb-1">
                  Total Photos
                </p>
                <p className="text-3xl font-serif text-neutral-100">
                  {photos.length}
                </p>
              </div>
              <div className="bg-neutral-700/50 rounded-lg p-4">
                <p className="text-neutral-400 text-sm font-mono mb-1">
                  Storage Used
                </p>
                <p className="text-3xl font-serif text-neutral-100">—</p>
              </div>
              <div className="bg-neutral-700/50 rounded-lg p-4">
                <p className="text-neutral-400 text-sm font-mono mb-1">
                  Folders
                </p>
                <p className="text-3xl font-serif text-neutral-100">
                  {settings.folderPaths?.length || 0}
                </p>
              </div>
              <div className="bg-neutral-700/50 rounded-lg p-4">
                <p className="text-neutral-400 text-sm font-mono mb-1">
                  Status
                </p>
                <p className="text-3xl font-serif text-green-400">✓</p>
              </div>
            </div>
          </motion.section>

          {/* Display Settings */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-neutral-800/50 border border-neutral-700 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-serif text-neutral-100 mb-6">
              Display Settings
            </h2>

            <div className="space-y-6">
              {/* Slideshow Speed */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="text-neutral-100 font-mono text-sm block mb-1">
                      Slideshow Speed
                    </label>
                    <p className="text-neutral-400 text-xs font-mono">
                      Time between photo transitions in milliseconds
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-serif text-neutral-100">
                      {slideshowSpeed}
                    </p>
                    <p className="text-xs text-neutral-400 font-mono">
                      {(slideshowSpeed / 1000).toFixed(1)}s
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <input
                    type="range"
                    min="1000"
                    max="10000"
                    step="500"
                    value={slideshowSpeed}
                    onChange={(e) =>
                      setSlideshowSpeed(parseInt(e.target.value))
                    }
                    className="flex-1 h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-neutral-400"
                  />
                </div>

                <div className="flex gap-2 mt-3 justify-between text-xs text-neutral-500 font-mono">
                  <span>1s</span>
                  <span>5.5s</span>
                  <span>10s</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Danger Zone */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-red-950/30 border border-red-900/50 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-serif text-red-300 mb-2">
              Danger Zone
            </h2>
            <p className="text-red-200/70 text-sm font-mono mb-6">
              These actions cannot be undone. Proceed with caution.
            </p>

            <div className="space-y-4">
              {/* Clear Cache Button */}
              <div className="bg-red-900/20 rounded-lg p-4 border border-red-800/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-neutral-100 font-mono text-sm font-semibold mb-1">
                      Clear All Cached Data
                    </h3>
                    <p className="text-red-200/70 text-xs font-mono">
                      Removes IndexedDB storage, localStorage, and browser
                      cache. This will clear all downloaded photos and
                      application data.
                    </p>
                  </div>
                </div>

                {!showConfirmDialog ? (
                  <button
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={isClearing}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-full font-mono text-sm transition-colors"
                    data-hoverable="true"
                  >
                    <HiTrash className="w-4 h-4" />
                    Clear All Data
                  </button>
                ) : (
                  <div className="mt-4 p-3 bg-red-900/30 rounded-lg border border-red-700">
                    <p className="text-red-200 text-sm font-mono mb-3">
                      Are you absolutely sure? This will delete everything.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleClearAllData}
                        disabled={isClearing}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-full font-mono text-sm transition-colors"
                        data-hoverable="true"
                      >
                        <HiCheck className="w-4 h-4" />
                        {isClearing ? "Clearing..." : "Yes, Clear All"}
                      </button>
                      <button
                        onClick={() => {
                          setShowConfirmDialog(false);
                          setClearMessage("");
                        }}
                        disabled={isClearing}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-700/50 text-white rounded-full font-mono text-sm transition-colors"
                        data-hoverable="true"
                      >
                        <HiX className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>

                    {clearMessage && (
                      <p
                        className={`mt-3 text-sm font-mono ${
                          clearMessage.includes("✓")
                            ? "text-green-400"
                            : "text-red-300"
                        }`}
                      >
                        {clearMessage}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.section>

          {/* Storage Info */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-neutral-800/30 border border-neutral-700 rounded-2xl p-8"
          >
            <h2 className="text-xl font-serif text-neutral-100 mb-4">
              Storage Information
            </h2>
            <div className="space-y-3 text-sm font-mono text-neutral-400">
              <p>• Photos are stored in IndexedDB for offline access</p>
              <p>• Settings are saved in browser localStorage</p>
              <p>• Browser cache helps with faster loading times</p>
              <p>• Clearing data will remove all stored information</p>
            </div>
          </motion.section>

          {/* Footer Spacing */}
          <div className="h-8" />
        </div>
      </main>
    </div>
  );
}
