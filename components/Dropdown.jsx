"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiChevronDown } from "react-icons/hi";

export default function Dropdown({ label, items, onSelect, defaultValue }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue || items[0]);

  const handleSelect = (item) => {
    setSelected(item);
    setIsOpen(false);
    onSelect(item);
  };

  return (
    <div className="relative inline-block w-full md:w-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg font-mono text-sm text-neutral-100 transition-colors w-full md:w-auto min-w-[180px]"
        data-hoverable="true"
      >
        <span className="truncate">{selected}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <HiChevronDown className="w-4 h-4 flex-shrink-0" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-neutral-800 border border-neutral-700 rounded-lg shadow-2xl overflow-hidden backdrop-blur-md"
          >
            <div className="max-h-64 overflow-y-auto">
              {items.map((item, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSelect(item)}
                  className={`w-full px-4 py-2.5 text-left font-mono text-sm transition-colors ${
                    selected === item
                      ? "bg-neutral-700 text-neutral-100"
                      : "text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100"
                  }`}
                  whileHover={{ backgroundColor: "#404040" }}
                  data-hoverable="true"
                >
                  {item}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
