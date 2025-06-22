import { useState, useCallback } from 'react';
import { ImageData, CompressionSettings } from '../types';

export const useImageCompression = () => {
  const [images, setImages] = useState<ImageData[]>([]);

  const compressImage = useCallback(async (
    imageData: ImageData,
    settings: CompressionSettings
  ): Promise<{ dataUrl: string; actualSize: number }> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const targetSizeBytes = settings.targetSize * 1024;
        
        // Get original dimensions
        const originalWidth = img.width;
        const originalHeight = img.height;
        
        // Enhanced canvas context settings for better quality
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
        }
        
        // Function to compress with advanced quality settings
        const compressWithParams = (width: number, height: number, quality: number, format: string = settings.format) => {
          canvas.width = width;
          canvas.height = height;
          
          if (ctx) {
            // Clear canvas with white background for JPEG
            if (format === 'jpeg') {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, width, height);
            }
            
            // Use high-quality image smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Draw image with high quality scaling
            ctx.drawImage(img, 0, 0, width, height);
          }
          
          const dataUrl = canvas.toDataURL(`image/${format}`, quality);
          const base64Length = dataUrl.split(',')[1].length;
          const bytes = Math.round((base64Length * 3) / 4);
          return { dataUrl, bytes, format };
        };

        // Smart format selection based on image content
        const determineOptimalFormat = () => {
          // Try different formats to see which gives better compression
          const jpegTest = compressWithParams(Math.min(originalWidth, 800), Math.min(originalHeight, 600), 0.8, 'jpeg');
          const webpTest = compressWithParams(Math.min(originalWidth, 800), Math.min(originalHeight, 600), 0.8, 'webp');
          
          // Use WebP if it's significantly smaller, otherwise use JPEG for compatibility
          return webpTest.bytes < jpegTest.bytes * 0.8 ? 'webp' : 'jpeg';
        };

        const optimalFormat = determineOptimalFormat();
        
        // Step 1: Smart dimension calculation
        let width = originalWidth;
        let height = originalHeight;
        
        // Calculate optimal dimensions while preserving aspect ratio
        const aspectRatio = width / height;
        const maxDimension = 2048; // Maximum dimension for quality preservation
        
        // Scale down only if necessary
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            width = maxDimension;
            height = Math.round(width / aspectRatio);
          } else {
            height = maxDimension;
            width = Math.round(height * aspectRatio);
          }
        }
        
        // Step 2: Progressive quality reduction with dimension optimization
        let bestResult = compressWithParams(width, height, 0.95, optimalFormat);
        
        // If still too large, try progressive approach
        if (bestResult.bytes > targetSizeBytes) {
          const strategies = [
            // Strategy 1: High quality with slight dimension reduction
            { widthFactor: 0.9, heightFactor: 0.9, minQuality: 0.8 },
            // Strategy 2: Medium quality with moderate dimension reduction
            { widthFactor: 0.8, heightFactor: 0.8, minQuality: 0.6 },
            // Strategy 3: Lower quality with more dimension reduction
            { widthFactor: 0.7, heightFactor: 0.7, minQuality: 0.4 },
            // Strategy 4: Aggressive compression as last resort
            { widthFactor: 0.6, heightFactor: 0.6, minQuality: 0.2 }
          ];
          
          for (const strategy of strategies) {
            const testWidth = Math.round(width * strategy.widthFactor);
            const testHeight = Math.round(height * strategy.heightFactor);
            
            // Ensure minimum dimensions for quality
            if (testWidth < 100 || testHeight < 100) continue;
            
            // Binary search for optimal quality within this strategy
            let minQuality = strategy.minQuality;
            let maxQuality = 1.0;
            let strategyResult = compressWithParams(testWidth, testHeight, maxQuality, optimalFormat);
            
            // Fine-tune quality
            let iterations = 0;
            while (maxQuality - minQuality > 0.02 && iterations < 15) {
              const midQuality = (minQuality + maxQuality) / 2;
              const result = compressWithParams(testWidth, testHeight, midQuality, optimalFormat);
              
              if (result.bytes > targetSizeBytes) {
                maxQuality = midQuality;
              } else {
                minQuality = midQuality;
                strategyResult = result;
              }
              iterations++;
            }
            
            // If this strategy achieves target, use it
            if (strategyResult.bytes <= targetSizeBytes) {
              bestResult = strategyResult;
              break;
            }
            
            // Keep the best result so far
            if (strategyResult.bytes < bestResult.bytes) {
              bestResult = strategyResult;
            }
          }
        }
        
        // Step 3: Final optimization - try different quality levels at current dimensions
        if (bestResult.bytes > targetSizeBytes) {
          // Extract current dimensions from the best result
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          const tempImg = new Image();
          
          tempImg.onload = () => {
            const currentWidth = tempImg.width;
            const currentHeight = tempImg.height;
            
            // Fine-tune quality for exact target
            let minQuality = 0.1;
            let maxQuality = 1.0;
            let finalResult = bestResult;
            
            let iterations = 0;
            while (maxQuality - minQuality > 0.01 && iterations < 20) {
              const midQuality = (minQuality + maxQuality) / 2;
              const result = compressWithParams(currentWidth, currentHeight, midQuality, optimalFormat);
              
              if (result.bytes > targetSizeBytes) {
                maxQuality = midQuality;
              } else {
                minQuality = midQuality;
                finalResult = result;
              }
              iterations++;
            }
            
            resolve({
              dataUrl: finalResult.dataUrl,
              actualSize: finalResult.bytes
            });
          };
          
          tempImg.src = bestResult.dataUrl;
        } else {
          resolve({
            dataUrl: bestResult.dataUrl,
            actualSize: bestResult.bytes
          });
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageData.originalUrl;
    });
  }, []);

  const addImages = useCallback((files: File[]) => {
    const newImages = files.map(file => ({
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      file,
      originalSize: file.size,
      originalUrl: URL.createObjectURL(file),
      targetSize: Math.max(10, Math.round(file.size / 1024 * 0.3)), // Default to 30% of original
      quality: 0.8,
      status: 'pending' as const,
      progress: 0
    }));

    setImages(prev => [...prev, ...newImages]);
  }, []);

  const updateImage = useCallback((id: string, updates: Partial<ImageData>) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, ...updates } : img
    ));
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.originalUrl);
        if (image.compressedUrl) {
          URL.revokeObjectURL(image.compressedUrl);
        }
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const compressImageById = useCallback(async (id: string) => {
    const image = images.find(img => img.id === id);
    if (!image) return;

    updateImage(id, { status: 'compressing', progress: 0 });

    try {
      // Simulate realistic progress updates
      const progressInterval = setInterval(() => {
        setImages(prev => {
          const currentImage = prev.find(img => img.id === id);
          if (currentImage && currentImage.status === 'compressing') {
            const newProgress = Math.min(85, currentImage.progress + Math.random() * 10 + 5);
            return prev.map(img => 
              img.id === id ? { ...img, progress: newProgress } : img
            );
          }
          return prev;
        });
      }, 300);

      const result = await compressImage(image, {
        targetSize: image.targetSize,
        quality: image.quality,
        format: 'jpeg' // Will be optimized internally
      });

      clearInterval(progressInterval);

      updateImage(id, {
        compressedUrl: result.dataUrl,
        compressedSize: result.actualSize,
        status: 'completed',
        progress: 100
      });
    } catch (error) {
      updateImage(id, { status: 'error', progress: 0 });
      console.error('Compression failed:', error);
    }
  }, [images, compressImage, updateImage]);

  return {
    images,
    addImages,
    updateImage,
    removeImage,
    compressImageById
  };
};