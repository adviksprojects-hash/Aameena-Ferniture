/**
 * @file imageProcessor.js
 * Image validation, client-side compression, and upload processing utilities.
 */

export const ALLOWED_IMAGE_TYPES = Object.freeze(["image/jpeg", "image/png", "image/webp"]);
export const MAX_IMAGE_SIZE_MB = Number(process.env.MAX_UPLOAD_SIZE_MB) || 10;
export const MAX_IMAGE_COUNT = Number(process.env.MAX_REVIEW_IMAGES) || 6;

/**
 * Validate a single image file (size and MIME type)
 * @param {File|Blob} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file) {
  if (!file) return { valid: false, error: "No file selected." };

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file format "${file.type}". Allowed formats: JPG, PNG, WebP.`,
    };
  }

  const maxBytes = MAX_IMAGE_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `Image exceeds maximum allowed size of ${MAX_IMAGE_SIZE_MB}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Validate array of files
 * @param {Array<File>} files
 * @param {number} [existingCount=0]
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateImagesList(files = [], existingCount = 0) {
  const errors = [];
  const total = files.length + existingCount;

  if (total > MAX_IMAGE_COUNT) {
    errors.push(`Maximum ${MAX_IMAGE_COUNT} images can be attached to a review.`);
  }

  for (const f of files) {
    const res = validateImageFile(f);
    if (!res.valid) {
      errors.push(`${f.name}: ${res.error}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Client-side Canvas Image Compression helper (converts to high-efficiency WebP/JPEG data URL)
 * @param {File} file
 * @param {number} [maxWidth=1200]
 * @param {number} [maxHeight=1200]
 * @param {number} [quality=0.82]
 * @returns {Promise<string>} Base64 data URL
 */
export function readAndCompressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Image compression must run in browser context."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image data."));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        resolve(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export const compressImageToDataUrl = readAndCompressImage;
