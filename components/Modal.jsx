"use client";

export default function Modal({ photo, onClose }) {
  if (!photo) return null;

  const handleContentClick = (e) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
      data-hoverable="true"
    >
      <button
        className="absolute top-4 right-6 text-white text-4xl font-light hover:text-neutral-400 z-[60]"
        onClick={onClose}
        data-hoverable="true"
      >
        &times;
      </button>

      <div
        className="w-full max-w-5xl max-h-[90vh]"
        onClick={handleContentClick}
      >
        <img
          src={photo.fullSizeUrl}
          alt={photo.filename}
          className="w-full h-full object-contain"
          data-hoverable="true"
        />

        <div className="text-center mt-2 text-neutral-300">
          <p>{photo.filename}</p>
        </div>
      </div>
    </div>
  );
}
