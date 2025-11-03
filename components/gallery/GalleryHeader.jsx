"use client";

import { HiOutlineSearch } from "react-icons/hi";

export default function GalleryHeader({
  headerRef,
  onToggleFilter,
  isFilterVisible,
}) {
  return (
    <div
      ref={headerRef}
      className="sticky top-20 z-30 flex items-center justify-between p-4 bg-[#0d0d0d]/50 backdrop-blur-sm border-b border-neutral-800"
    >
      <h1 className="font-serif text-3xl font-normal text-[#e5e5e5]">
        Gallery
      </h1>
      <button
        onClick={onToggleFilter}
        data-hoverable="true"
        className={`p-2 rounded-md transition-colors font-mono ${
          isFilterVisible
            ? "bg-blue-600 text-white"
            : "hover:bg-neutral-700 text-neutral-400"
        }`}
        aria-label="Toggle Filters"
      >
        <HiOutlineSearch className="w-6 h-6 " />
      </button>
    </div>
  );
}
