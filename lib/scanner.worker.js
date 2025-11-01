console.log("Scanner Worker loaded.");
import * as exifr from 'exifr';
import xxhash from 'xxhashjs';

async function createFingerprint(file) {
  try {
    const buffer = await file.slice(0, 65536).arrayBuffer();
    const hash = xxhash.h32(0);
    hash.update(new Uint8Array(buffer));
    return hash.digest().toString(16);
  } catch (err) {
    console.error(`Error creating fingerprint for ${file.name}:`, err);
    return null;
  }
}

async function createThumbnail(file) {
  const MAX_WIDTH = 300;
  const MAX_HEIGHT = 300;

  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;

    if (width > height) {
      if (width > MAX_WIDTH) {
        height = height * (MAX_WIDTH / width);
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width = width * (MAX_HEIGHT / height);
        height = MAX_HEIGHT;
      }
    }

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
    return blob;

  } catch (err) {
    console.error(`Error creating thumbnail for ${file.name}:`, err);
    return null;
  }
}

self.onmessage = async (event) => {
  const { file, id } = event.data;

  try {
    const fingerprint = await createFingerprint(file);
    if (!fingerprint) {
      throw new Error('Failed to create fingerprint');
    }

    // Extract comprehensive EXIF data from the original file
    const exif = await exifr.parse(file, {
      make: true,
      model: true,
      createDate: true,
      FocalLength: true,
      FNumber: true,
      ISO: true,
      ExposureTime: true,
      DateTimeOriginal: true,
      ImageWidth: true,
      ImageHeight: true,
    });

    const cameraMake = exif?.make?.trim() || "Unknown";
    let cameraModel = exif?.model?.trim() || "Unknown";

    if (cameraModel.startsWith(cameraMake)) {
      cameraModel = cameraModel.substring(cameraMake.length).trim();
    }

    // Format EXIF values for display
    const formatFocalLength = (focalLength) => {
      if (!focalLength) return null;
      const mm = typeof focalLength === 'number' ? focalLength : parseFloat(focalLength);
      return mm ? `${Math.round(mm)}mm` : null;
    };

    const formatAperture = (fNumber) => {
      if (!fNumber) return null;
      const f = typeof fNumber === 'number' ? fNumber : parseFloat(fNumber);
      return f ? `f/${f.toFixed(1)}` : null;
    };

    const formatISO = (iso) => {
      if (!iso) return null;
      return typeof iso === 'number' ? iso.toString() : iso.toString();
    };

    const formatShutterSpeed = (exposureTime) => {
      if (!exposureTime) return null;
      const et = typeof exposureTime === 'number' ? exposureTime : parseFloat(exposureTime);
      if (!et) return null;
      if (et >= 1) {
        return `${et.toFixed(1)}s`;
      } else {
        return `1/${Math.round(1 / et)}s`;
      }
    };

    const photoData = {
      filename: file.name,
      date: exif?.createDate || exif?.DateTimeOriginal || null,
      cameraMake,
      cameraModel,
      focalLength: formatFocalLength(exif?.FocalLength),
      aperture: formatAperture(exif?.FNumber),
      iso: formatISO(exif?.ISO),
      shutterSpeed: formatShutterSpeed(exif?.ExposureTime),
      width: exif?.ImageWidth || null,
      height: exif?.ImageHeight || null,
    };

    const thumbnailBlob = await createThumbnail(file);
    
    // Read the entire file as ArrayBuffer and convert to Blob to preserve original image data
    // This ensures we have the complete original file data, not just a reference
    const fileArrayBuffer = await file.arrayBuffer();
    const fullSizeBlob = new Blob([fileArrayBuffer], { type: file.type });

    if (thumbnailBlob) {
      self.postMessage({ success: true, photoData, thumbnailBlob, fullSizeBlob, fingerprint, id });
    } else {
      throw new Error('Failed to create thumbnail');
    }

  } catch (err) {
    const errorMsg = err.message || "Unknown worker error";
    console.warn(`Could not scan ${file.name}:`, errorMsg);
    self.postMessage({ success: false, filename: file.name, error: errorMsg, id });
  }
};