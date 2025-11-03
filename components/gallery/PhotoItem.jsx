"use client";

import { motion } from "framer-motion";

export default function PhotoItem({
  photo,
  onClick,
  galleryHeaderHeight,
  filterBarHeight,
}) {
  return (
    <motion.div
      className="gallery-image-container aspect-square bg-neutral-800 cursor-pointer"
      style={{
        height: `calc((100vh - 5rem - 4rem - ${galleryHeaderHeight}px - ${filterBarHeight}px - 44px - 8px - 4px) / 5)`,
      }}
      onClick={onClick}
      data-hoverable="true"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.img
        src={photo.thumbUrl}
        alt={photo.filename}
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
}
