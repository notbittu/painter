import { saveAs } from 'file-saver';

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

/**
 * Download an image as a file
 */
export const downloadImage = (dataUrl: string, filename: string = 'painter-image.png'): void => {
  const blob = dataURLToBlob(dataUrl);
  saveAs(blob, filename);
};

/**
 * Convert a data URL to a Blob
 */
export const dataURLToBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
};

/**
 * Merge an image with the canvas content
 */
export const mergeImageWithCanvas = (
  imageDataUrl: string,
  canvasDataUrl: string,
  callback: (mergedImageDataUrl: string) => void
): void => {
  const img1 = new Image();
  const img2 = new Image();
  
  img1.onload = () => {
    img2.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img1.width;
      canvas.height = img1.height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img1, 0, 0);
        ctx.drawImage(img2, 0, 0, img1.width, img1.height);
        callback(canvas.toDataURL('image/png'));
      }
    };
    img2.src = canvasDataUrl;
  };
  
  img1.src = imageDataUrl;
};

/**
 * Resize an image to a maximum width and height while maintaining aspect ratio
 */
export const resizeImage = (
  dataUrl: string,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.9
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
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
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(dataUrl);
      }
    };
    img.src = dataUrl;
  });
};

/**
 * Detect if the device is mobile
 */
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Throttle a function to prevent excessive calls
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let inThrottle: boolean = false;
  let lastResult: ReturnType<T>;
  
  return function(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    return lastResult;
  };
}

/**
 * Create an image thumbnail
 */
export const createThumbnail = (dataUrl: string, maxSize: number = 100): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      } else {
        resolve(dataUrl);
      }
    };
    img.src = dataUrl;
  });
}; 