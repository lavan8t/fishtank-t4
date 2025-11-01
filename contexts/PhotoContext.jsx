"use client";
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import * as db from "@/lib/db";

const PhotoContext = createContext({
  settings: {
    folderPaths: [],
    slideshowSpeed: 3000,
  },
  photos: [],
  addPhotos: (processedPhotos, path) => {},
  clearAllData: () => {},
  updateSettings: (newSetting) => {},
  removeFolderPath: (path) => {},
});

const SETTINGS_KEY = "vynx-settings";
const DEFAULT_SETTINGS = { folderPaths: [], slideshowSpeed: 3000 };

export function PhotoProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const storedSettings = localStorage.getItem(SETTINGS_KEY);
        if (storedSettings && storedSettings !== "undefined") {
          setSettings(JSON.parse(storedSettings));
        } else {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
        }

        const photosFromDb = await db.getAllPhotos();
        setPhotos(photosFromDb);
      } catch (e) {
        console.error("Failed to load data, resetting settings:", e);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const saveSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  }, []);

  const addPhotos = useCallback(
    async (processedPhotos, path) => {
      const newPhotosForState = [];
      let duplicatesSkipped = 0;

      for (const item of processedPhotos) {
        const existing = await db.getFingerprint(item.fingerprint);
        if (existing) {
          duplicatesSkipped++;
          continue;
        }

        const newId = await db.addPhoto(
          item.metadata,
          item.thumbBlob,
          item.fullSizeBlob
        );
        await db.addFingerprint(item.fingerprint);

        newPhotosForState.push({
          ...item.metadata,
          id: newId,
          thumbUrl: URL.createObjectURL(item.thumbBlob),
        });
      }

      if (duplicatesSkipped > 0) {
        console.log(`Skipped ${duplicatesSkipped} duplicate photos.`);
      }

      setPhotos((prev) => [...prev, ...newPhotosForState]);

      saveSettings({
        ...settings,
        folderPaths: [...new Set([...settings.folderPaths, path])],
      });
    },
    [settings, saveSettings]
  );

  const removeFolderPath = useCallback(
    (path) => {
      db.clearAllData();
      setPhotos([]);
      saveSettings({
        ...settings,
        folderPaths: settings.folderPaths.filter((p) => p !== path),
      });
    },
    [settings, saveSettings]
  );

  const updateSettings = useCallback(
    (newSetting) => {
      saveSettings({ ...settings, ...newSetting });
    },
    [settings, saveSettings]
  );

  const clearAllData = useCallback(() => {
    db.clearAllData();
    setPhotos([]);
    saveSettings(DEFAULT_SETTINGS);
  }, [saveSettings]);

  const value = useMemo(
    () => ({
      settings,
      photos,
      addPhotos,
      removeFolderPath,
      updateSettings,
      clearAllData,
    }),
    [
      settings,
      photos,
      addPhotos,
      removeFolderPath,
      updateSettings,
      clearAllData,
    ]
  );

  if (isLoading) {
    return null;
  }

  return (
    <PhotoContext.Provider value={value}>{children}</PhotoContext.Provider>
  );
}

export function usePhotos() {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error("usePhotos must be used within a PhotoProvider");
  }
  return context;
}
