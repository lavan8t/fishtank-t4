import { openDB } from 'idb';

const DB_NAME = 'vynx-db';
const DB_VERSION = 3;
const PHOTOS_STORE = 'photos';
const THUMBS_STORE = 'thumbnails';
const FULLSIZE_STORE = 'fullsize';
const FINGERPRINT_STORE = 'fingerprints';

async function openDatabase() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains(PHOTOS_STORE)) {
        db.createObjectStore(PHOTOS_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains(THUMBS_STORE)) {
        db.createObjectStore(THUMBS_STORE);
      }
      if (!db.objectStoreNames.contains(FULLSIZE_STORE)) {
        db.createObjectStore(FULLSIZE_STORE);
      }
      if (!db.objectStoreNames.contains(FINGERPRINT_STORE)) {
        const store = db.createObjectStore(FINGERPRINT_STORE, { 
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('fingerprint', 'fingerprint', { unique: true });
      }
    },
  });
}

export async function getFingerprint(fingerprint) {
  const db = await openDatabase();
  return db.getFromIndex(FINGERPRINT_STORE, 'fingerprint', fingerprint);
}

export async function addFingerprint(fingerprint) {
  const db = await openDatabase();
  return db.add(FINGERPRINT_STORE, { fingerprint });
}

export async function addPhoto(metadata, thumbBlob, fullSizeBlob) {
  const db = await openDatabase();
  const tx = db.transaction([PHOTOS_STORE, THUMBS_STORE, FULLSIZE_STORE], 'readwrite');
  
  const id = await tx.objectStore(PHOTOS_STORE).add(metadata);
  await tx.objectStore(THUMBS_STORE).put(thumbBlob, id);
  await tx.objectStore(FULLSIZE_STORE).put(fullSizeBlob, id);
  
  await tx.done;
  return id;
}

export async function getAllPhotos() {
  const db = await openDatabase();
  const metadataArray = await db.getAll(PHOTOS_STORE);
  const photos = [];

  for (const metadata of metadataArray) {
    const thumbBlob = await db.get(THUMBS_STORE, metadata.id);
    if (thumbBlob) {
      photos.push({
        ...metadata,
        thumbUrl: URL.createObjectURL(thumbBlob),
      });
    }
  }
  return photos;
}

export async function getFullSizePhoto(id) {
  const db = await openDatabase();
  return db.get(FULLSIZE_STORE, id);
}

export async function clearAllData() {
  const db = await openDatabase();
  const tx = db.transaction([PHOTOS_STORE, THUMBS_STORE, FULLSIZE_STORE, FINGERPRINT_STORE], 'readwrite');
  await tx.objectStore(PHOTOS_STORE).clear();
  await tx.objectStore(THUMBS_STORE).clear();
  await tx.objectStore(FULLSIZE_STORE).clear();
  await tx.objectStore(FINGERPRINT_STORE).clear();
  await tx.done;
}