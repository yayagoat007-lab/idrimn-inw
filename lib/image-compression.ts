/**
 * Compresses an image file client-side using HTML5 Canvas.
 * Resizes the image to maximum dimensions and lowers the JPEG/WebP quality to keep file size under maxSizeKB.
 */
export async function compressImage(
  file: File,
  maxSizeKB: number = 500,
  maxWidth: number = 1200,
  maxHeight: number = 1200
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // If the file is already small enough, return it immediately as a Blob
    if (file.size <= maxSizeKB * 1024) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while sizing down
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Failed to get 2D canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Compress iteratively to match size budget if possible
        let quality = 0.85;
        const mimeType = file.type === 'image/png' ? 'image/jpeg' : file.type || 'image/jpeg';

        const checkAndResolve = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Canvas compression returned null blob"));
                return;
              }

              // If blob is still too large and we can reduce quality, try again
              if (blob.size > maxSizeKB * 1024 && quality > 0.3) {
                quality -= 0.1;
                checkAndResolve();
              } else {
                resolve(blob);
              }
            },
            mimeType,
            quality
          );
        };

        checkAndResolve();
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
}

/**
 * Utility helper to convert a Blob back to a local object URL or Base64 string for display/storage
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
