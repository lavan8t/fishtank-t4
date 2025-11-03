"use client";

import { motion } from "framer-motion";
import { HiOutlineXCircle } from "react-icons/hi";
import Dropdown from "@/components/Dropdown";

export default function GalleryFilterBar({
  filterBarRef,
  sortOrder,
  setSortOrder,
  sortOptions,
  filterCamera,
  setFilterCamera,
  cameraList,
  filterRegex,
  handleRegexChange,
  isRegexValid,
  setFilterRegex,
  setIsRegexValid,
  totalMatches,
}) {
  return (
    <motion.div
      key="filter-bar"
      ref={filterBarRef}
      className="w-full z-20"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex-shrink-0 w-full flex flex-wrap items-center gap-4 p-4 border-b border-neutral-800 bg-[#0d0d0d]/50 backdrop-blur-sm font-mono">
        <div className="flex items-center gap-2">
          <label
            htmlFor="sort"
            className="text-sm font-medium text-neutral-400"
          >
            Sort by
          </label>
          <Dropdown
            value={sortOrder}
            onChange={setSortOrder}
            options={sortOptions}
          />
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="camera"
            className="text-sm font-medium text-neutral-400"
          >
            Camera
          </label>
          <Dropdown
            value={filterCamera}
            onChange={setFilterCamera}
            options={cameraList}
          />
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="regex"
            className="text-sm font-medium text-neutral-400"
          >
            Filename
          </label>
          <input
            type="text"
            id="regex"
            value={filterRegex}
            onChange={handleRegexChange}
            placeholder="Filter by name (regex)..."
            className={`bg-neutral-800 border ${
              isRegexValid ? "border-neutral-700" : "border-red-500"
            } rounded-md px-3 py-1.5 text-sm text-[#e5e5e5] placeholder-neutral-500 focus:outline-none focus:ring-2 ${
              isRegexValid ? "focus:ring-blue-600" : "focus:ring-red-500"
            } font-mono`}
          />
        </div>

        {(filterCamera !== "all" || filterRegex !== "") && (
          <button
            onClick={() => {
              setFilterCamera("all");
              setFilterRegex("");
              setIsRegexValid(true);
            }}
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-[#e5e5e5] transition font-mono"
          >
            <HiOutlineXCircle />
            Clear Filters
          </button>
        )}
      </div>
      <div className="flex-shrink-0 text-center py-2 text-sm text-neutral-500 bg-[#0d0d0d]/50 backdrop-blur-sm font-mono">
        {totalMatches} matching photo{totalMatches !== 1 ? "s" : ""}
      </div>
    </motion.div>
  );
}
