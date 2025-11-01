import {
    HiOutlinePhone,
    HiOutlineCamera,
    HiOutlineQuestionMarkCircle,
  } from "react-icons/hi";
  
  export const processCameraLeaderboard = (photos, limit = 0) => {
    const cameraCounts = new Map();
    photos.forEach((photo) => {
      const model = photo.cameraModel || photo.cameraMake || "Unknown";
      cameraCounts.set(model, (cameraCounts.get(model) || 0) + 1);
    });
    const sorted = Array.from(cameraCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    if (limit > 0) {
      return sorted.slice(0, limit);
    }
    return sorted;
  };
  
  export const getDeviceIcon = (modelName) => {
    const name = modelName.toLowerCase();
    if (
      name.includes("iphone") ||
      name.includes("pixel") ||
      name.includes("sm-") ||
      name.includes("oneplus")
    ) {
      return <HiOutlinePhone className="w-5 h-5 text-neutral-400" />;
    }
    if (
      name.includes("canon") ||
      name.includes("sony") ||
      name.includes("nikon")
    ) {
      return <HiOutlineCamera className="w-5 h-5 text-neutral-400" />;
    }
    if (name.includes("unknown")) {
      return <HiOutlineQuestionMarkCircle className="w-5 h-5 text-neutral-500" />;
    }
    return <HiOutlineCamera className="w-5 h-5 text-neutral-400" />;
  };
  
  export const processPhotosByYear = (photos) => {
    const yearCounts = photos.reduce((acc, photo) => {
      let year;
      if (photo.date) {
        const parsedYear = new Date(photo.date).getFullYear();
        if (parsedYear > 1990 && parsedYear <= new Date().getFullYear()) {
          year = parsedYear.toString();
        } else {
          year = "Unknown";
        }
      } else {
        year = "Unknown";
      }
      
      if (!acc[year]) {
        acc[year] = 0;
      }
      acc[year]++;
      return acc;
    }, {});
  
    return Object.keys(yearCounts)
      .map(year => ({
        name: year,
        photos: yearCounts[year],
      }))
      .sort((a, b) => {
        if (a.name === "Unknown") return 1;
        if (b.name === "Unknown") return -1;
        return a.name.localeCompare(b.name);
      });
  };