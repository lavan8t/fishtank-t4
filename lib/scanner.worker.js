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

// Convert Blob to base64
async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

self.onmessage = async (event) => {
  const { file, id } = event.data;
  try {
    console.log(`Starting to process file: ${file.name}`);
    
    const fingerprint = await createFingerprint(file);
    if (!fingerprint) {
      throw new Error('Failed to create fingerprint');
    }

    // Extract EXIF data
    let exif = {};
    try {
      exif = await exifr.parse(file, true) || {};
    } catch (e) {
      console.warn('EXIF parsing error:', e.message);
      exif = {};
    }

    console.log('Full EXIF for', file.name, ':', exif);

    // Helper function to safely extract values
    const getValue = (obj, ...keys) => {
      for (const key of keys) {
        if (obj && typeof obj === 'object' && key in obj) {
          const val = obj[key];
          if (val !== null && val !== undefined && val !== '') {
            return val;
          }
        }
      }
      return null;
    };

    // Extract camera make
    const cameraMake = getValue(exif, 'Make', 'make', 'Maker');
    const cameraMakeTrimmed = cameraMake ? String(cameraMake).trim() : null;

    // Extract camera model
    const cameraModel = getValue(exif, 'Model', 'model');
    let cameraModelTrimmed = cameraModel ? String(cameraModel).trim() : null;

    // Clean up model if it contains make
    if (cameraMakeTrimmed && cameraModelTrimmed) {
      const makeUpper = cameraMakeTrimmed.toUpperCase();
      const modelUpper = cameraModelTrimmed.toUpperCase();
      if (modelUpper.includes(makeUpper)) {
        cameraModelTrimmed = cameraModelTrimmed.substring(cameraMakeTrimmed.length).trim();
      }
    }

    // Extract date taken
    const dateTaken = getValue(exif, 'DateTimeOriginal', 'DateTime', 'CreateDate', 'ModifyDate');

    // Extract focal length
    const focalLength = getValue(exif, 'FocalLength', 'FocalLengthIn35mmFilm');
    const focalLengthFormatted = focalLength ? Math.round(parseFloat(focalLength)) : null;

    // Extract aperture
    const aperture = getValue(exif, 'FNumber', 'ApertureValue');
    const apertureFormatted = aperture ? parseFloat(aperture).toFixed(1) : null;

    // Extract ISO
    const iso = getValue(exif, 'ISO', 'ISOSpeedRatings', 'ISOSpeed');
    const isoFormatted = iso ? parseInt(iso) : null;

    // Extract shutter speed
    const shutterSpeed = getValue(exif, 'ExposureTime', 'ShutterSpeedValue');
    let shutterSpeedFormatted = null;
    if (shutterSpeed) {
      const et = parseFloat(shutterSpeed);
      if (et >= 1) {
        shutterSpeedFormatted = `${et.toFixed(1)}s`;
      } else if (et > 0) {
        shutterSpeedFormatted = `1/${Math.round(1 / et)}`;
      }
    }

    // Extract dimensions
    const width = getValue(exif, 'ImageWidth', 'PixelXDimension', 'ExifImageWidth', 'ImageWidthPixels');
    const height = getValue(exif, 'ImageHeight', 'PixelYDimension', 'ExifImageHeight', 'ImageHeightPixels');
    const widthFormatted = width ? parseInt(width) : null;
    const heightFormatted = height ? parseInt(height) : null;

    // Extract GPS coordinates
    const latitude = getValue(exif, 'latitude', 'GPSLatitude');
    const longitude = getValue(exif, 'longitude', 'GPSLongitude');
    const latFormatted = latitude ? parseFloat(latitude) : null;
    const lonFormatted = longitude ? parseFloat(longitude) : null;

    const photoData = {
      fileName: file.name,
      date: dateTaken ? new Date(dateTaken).toISOString() : null,
      dateTaken: dateTaken ? new Date(dateTaken).toISOString() : null,
      cameraMake: cameraMakeTrimmed,
      cameraModel: cameraModelTrimmed,
      focalLength: focalLengthFormatted,
      aperture: apertureFormatted,
      iso: isoFormatted,
      shutterSpeed: shutterSpeedFormatted,
      width: widthFormatted,
      height: heightFormatted,
      latitude: latFormatted,
      longitude: lonFormatted,
    };

    console.log('Processed photo data for', file.name, ':', photoData);

    // Create thumbnail
    const thumbnailBlob = await createThumbnail(file);
    if (!thumbnailBlob) {
      throw new Error('Failed to create thumbnail');
    }

    // Convert blobs to base64
    const thumbnailBase64 = await blobToBase64(thumbnailBlob);
    const fullSizeBase64 = await blobToBase64(file);

    console.log(`Successfully processed: ${file.name}`);

    self.postMessage({ 
      success: true, 
      photoData, 
      thumbnailBase64,
      fullSizeBase64,
      fingerprint, 
      id 
    });

  } catch (err) {
    const errorMsg = err.message || "Unknown worker error";
    console.error(`Error processing ${file.name}:`, errorMsg, err);
    self.postMessage({ 
      success: false, 
      filename: file.name, 
      error: errorMsg, 
      id 
    });
  }
};
