"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import * as db from "@/lib/db";

const PhotoContext = createContext();

export const PhotoProvider = ({ children }) => {
  const [photos, setPhotos] = useState([]);
  const [settings, setSettings] = useState({
    slideshowSpeed: 5000,
    folderPaths: [],
  });
  const [ambientColor, setAmbientColor] = useState(null);

  // Load photos from IndexedDB on mount
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const allPhotos = await db.getAllPhotos();
        console.log("Loaded photos from IndexedDB:", allPhotos);
        setPhotos(allPhotos);
      } catch (error) {
        console.error("Error loading photos:", error);
      }
    };

    loadPhotos();
  }, []);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("photoSettings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }, []);

  const addPhotos = useCallback(
    async (processedPhotos, folderPath) => {
      try {
        console.log(
          `Adding ${processedPhotos.length} photos from ${folderPath}`
        );

        const newPhotos = [];

        for (const photo of processedPhotos) {
          try {
            // Ensure blobs are actual Blob objects
            const thumbBlob =
              photo.thumbnailBlob instanceof Blob
                ? photo.thumbnailBlob
                : new Blob([photo.thumbnailBlob]);

            const fullSizeBlob =
              photo.fullSizeBlob instanceof Blob
                ? photo.fullSizeBlob
                : new Blob([photo.fullSizeBlob]);

            // Store in IndexedDB
            const photoId = await db.addPhoto(
              {
                fileName: photo.fileName,
                date: photo.date || photo.dateTaken,
                dateTaken: photo.dateTaken,
                cameraMake: photo.cameraMake,
                cameraModel: photo.cameraModel,
                focalLength: photo.focalLength,
                aperture: photo.aperture,
                iso: photo.iso,
                shutterSpeed: photo.shutterSpeed,
                width: photo.width,
                height: photo.height,
                latitude: photo.latitude,
                longitude: photo.longitude,
                fingerprint: photo.fingerprint,
              },
              thumbBlob,
              fullSizeBlob
            );

            // Create blob URL for thumbnail
            const thumbUrl = URL.createObjectURL(thumbBlob);

            newPhotos.push({
              id: photoId,
              fileName: photo.fileName,
              date: photo.date || photo.dateTaken,
              dateTaken: photo.dateTaken,
              cameraMake: photo.cameraMake,
              cameraModel: photo.cameraModel,
              focalLength: photo.focalLength,
              aperture: photo.aperture,
              iso: photo.iso,
              shutterSpeed: photo.shutterSpeed,
              width: photo.width,
              height: photo.height,
              latitude: photo.latitude,
              longitude: photo.longitude,
              fingerprint: photo.fingerprint,
              thumbUrl,
            });

            console.log(`Successfully added photo: ${photo.fileName}`);
          } catch (error) {
            console.error(`Error adding photo ${photo.fileName}:`, error);
          }
        }

        // Update state with new photos
        setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);

        // Update settings
        if (folderPath && !settings.folderPaths.includes(folderPath)) {
          const updatedSettings = {
            ...settings,
            folderPaths: [...settings.folderPaths, folderPath],
          };
          setSettings(updatedSettings);
          localStorage.setItem(
            "photoSettings",
            JSON.stringify(updatedSettings)
          );
        }

        console.log(`Successfully added ${newPhotos.length} photos`);
      } catch (error) {
        console.error("Error in addPhotos:", error);
      }
    },
    [settings]
  );

  const updateSettings = useCallback((newSetting) => {
    setSettings((prevSettings) => {
      const updated = { ...prevSettings, ...newSetting };
      localStorage.setItem("photoSettings", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFolderPath = useCallback((path) => {
    setSettings((prevSettings) => {
      const updated = {
        ...prevSettings,
        folderPaths: prevSettings.folderPaths.filter((p) => p !== path),
      };
      localStorage.setItem("photoSettings", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAllData = useCallback(async () => {
    try {
      await db.clearAllData();
      setPhotos([]);
      setSettings({ slideshowSpeed: 5000, folderPaths: [] });
      localStorage.removeItem("photoSettings");
      console.log("All data cleared");
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  }, []);

  return (
    <PhotoContext.Provider
      value={{
        photos,
        settings,
        addPhotos,
        updateSettings,
        removeFolderPath,
        clearAllData,
        ambientColor,
        setAmbientColor,
      }}
    >
      {children}
    </PhotoContext.Provider>
  );
};

export const usePhotos = () => {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error("usePhotos must be used within PhotoProvider");
  }
  return context;
};
