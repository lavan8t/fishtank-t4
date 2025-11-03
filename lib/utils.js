import {
    HiOutlinePhone,
    HiOutlineCamera,
    HiOutlineQuestionMarkCircle,
  } from "react-icons/hi";
  
  export const processCameraLeaderboard = (photos, limit = 0) => {
    const cameraCounts = new Map();
    photos.forEach((photo) => {
      const make = photo.cameraMake || "Unknown";
      const model = photo.cameraModel || "Unknown";
      let cameraName;

      if (make === "Unknown" && model === "Unknown") {
        cameraName = "Unknown";
      } else if (make === "Unknown") {
        cameraName = model;
      } else if (model === "Unknown") {
        cameraName = make;
      } else if (model.toLowerCase().includes(make.toLowerCase())) {
        cameraName = model;
      } else {
        cameraName = `${make} ${model}`;
      }
      
      cameraCounts.set(cameraName, (cameraCounts.get(cameraName) || 0) + 1);
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

  // NEW FUNCTION: Process photos by day
  export const processPhotosByDay = (photos) => {
    const dayCounts = photos.reduce((acc, photo) => {
      let dayStr;
      if (photo.date) {
        try {
          const d = new Date(photo.date);
          // Format as YYYY-MM-DD to ensure correct chronological sorting
          const year = d.getFullYear();
          const month = (d.getMonth() + 1).toString().padStart(2, '0');
          const day = d.getDate().toString().padStart(2, '0');
          
          if (year > 1990 && year <= new Date().getFullYear()) {
            dayStr = `${year}-${month}-${day}`;
          } else {
            dayStr = "Unknown";
          }
        } catch (e) {
          dayStr = "Unknown";
        }
      } else {
        dayStr = "Unknown";
      }
      
      if (!acc[dayStr]) {
        acc[dayStr] = 0;
      }
      acc[dayStr]++;
      return acc;
    }, {});

    return Object.keys(dayCounts)
      .map(day => ({
        name: day, // 'name' will be the YYYY-MM-DD string
        photos: dayCounts[day],
      }))
      .sort((a, b) => {
        if (a.name === "Unknown") return 1;
        if (b.name === "Unknown") return -1;
        return a.name.localeCompare(b.name); // Sort by date string
      });
  };

