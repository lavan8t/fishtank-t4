import { openDB } from 'idb';

const DB_NAME = 'vynx-db';
const DB_VERSION = 4;
const PHOTOS_STORE = 'photos';
const THUMBS_STORE = 'thumbnails';
const FULLSIZE_STORE = 'fullsize';

async function openDatabase() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      console.log(`Upgrading IndexedDB from v${oldVersion} to v${newVersion}`);

      // Create photos store if it doesn't exist
      if (!db.objectStoreNames.contains(PHOTOS_STORE)) {
        const photoStore = db.createObjectStore(PHOTOS_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        photoStore.createIndex('fingerprint', 'fingerprint', { unique: false });
      } else if (oldVersion < 4) {
        // For existing databases, check if index exists
        const photoStore = transaction.objectStore(PHOTOS_STORE);
        try {
          // Try to get the index - if it doesn't exist, it will throw
          photoStore.index('fingerprint');
        } catch (e) {
          // Index doesn't exist, create it
          try {
            photoStore.createIndex('fingerprint', 'fingerprint', { unique: false });
            console.log('Created fingerprint index');
          } catch (err) {
            console.warn('Could not create fingerprint index (may already exist):', err);
          }
        }
      }

      // Create thumbnails store
      if (!db.objectStoreNames.contains(THUMBS_STORE)) {
        db.createObjectStore(THUMBS_STORE);
      }

      // Create fullsize store
      if (!db.objectStoreNames.contains(FULLSIZE_STORE)) {
        db.createObjectStore(FULLSIZE_STORE);
      }
    },
  });
}

export async function checkDuplicateFingerprint(fingerprint) {
  if (!fingerprint) return false;

  const db = await openDatabase();
  try {
    const photoStore = db.transaction(PHOTOS_STORE).objectStore(PHOTOS_STORE);
    
    // Check if index exists
    if (!photoStore.indexNames.contains('fingerprint')) {
      console.warn('Fingerprint index not available, checking manually');
      const allPhotos = await photoStore.getAll();
      return allPhotos.some(photo => photo.fingerprint === fingerprint);
    }

    const existingPhoto = await photoStore.index('fingerprint').get(fingerprint);
    return !!existingPhoto;
  } catch (error) {
    console.warn('Error checking duplicate fingerprint:', error);
    // Fallback: check all photos manually
    try {
      const allPhotos = await db.getAll(PHOTOS_STORE);
      return allPhotos.some(photo => photo.fingerprint === fingerprint);
    } catch (e) {
      console.error('Error in fallback duplicate check:', e);
      return false;
    }
  }
}

export async function addPhoto(metadata, thumbBlob, fullSizeBlob) {
  const db = await openDatabase();
  
  try {
    // Check if fingerprint already exists using safe method
    if (metadata.fingerprint) {
      const isDuplicate = await checkDuplicateFingerprint(metadata.fingerprint);
      if (isDuplicate) {
        console.warn(`Photo with fingerprint ${metadata.fingerprint} already exists`);
        throw new Error('Duplicate photo detected');
      }
    }

    // Start transaction
    const tx = db.transaction([PHOTOS_STORE, THUMBS_STORE, FULLSIZE_STORE], 'readwrite');
    
    // Ensure metadata doesn't have an id field
    const cleanMetadata = { ...metadata };
    delete cleanMetadata.id;
    
    // Add metadata and get the generated ID
    const photoStore = tx.objectStore(PHOTOS_STORE);
    const id = await photoStore.add(cleanMetadata);
    
    // Add blobs with the same ID
    const thumbStore = tx.objectStore(THUMBS_STORE);
    await thumbStore.put(thumbBlob, id);
    
    const fullsizeStore = tx.objectStore(FULLSIZE_STORE);
    await fullsizeStore.put(fullSizeBlob, id);
    
    // Wait for transaction to complete
    await tx.done;
    
    console.log(`Photo stored with ID: ${id}, Fingerprint: ${metadata.fingerprint}`);
    return id;
  } catch (error) {
    console.error('Error adding photo to database:', error);
    throw error;
  }
}

export async function getAllPhotos() {
  const db = await openDatabase();
  try {
    const metadataArray = await db.getAll(PHOTOS_STORE);
    const photos = [];
    
    for (const metadata of metadataArray) {
      try {
        const thumbBlob = await db.get(THUMBS_STORE, metadata.id);
        if (thumbBlob) {
          photos.push({
            ...metadata,
            thumbUrl: URL.createObjectURL(thumbBlob),
          });
        }
      } catch (e) {
        console.warn(`Error loading thumbnail for photo ${metadata.id}:`, e);
      }
    }
    
    return photos;
  } catch (error) {
    console.error('Error getting all photos:', error);
    return [];
  }
}

export async function getThumbnail(id) {
  const db = await openDatabase();
  try {
    return await db.get(THUMBS_STORE, id);
  } catch (error) {
    console.error(`Error getting thumbnail ${id}:`, error);
    return null;
  }
}

export async function getFullSizePhoto(id) {
  const db = await openDatabase();
  try {
    return await db.get(FULLSIZE_STORE, id);
  } catch (error) {
    console.error(`Error getting full-size photo ${id}:`, error);
    return null;
  }
}

export async function clearAllData() {
  const db = await openDatabase();
  try {
    const tx = db.transaction([PHOTOS_STORE, THUMBS_STORE, FULLSIZE_STORE], 'readwrite');
    await tx.objectStore(PHOTOS_STORE).clear();
    await tx.objectStore(THUMBS_STORE).clear();
    await tx.objectStore(FULLSIZE_STORE).clear();
    await tx.done;
    console.log('All database data cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}
