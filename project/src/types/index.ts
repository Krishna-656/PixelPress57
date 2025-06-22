export interface ImageData {
  id: string;
  file: File;
  originalSize: number;
  compressedSize?: number;
  originalUrl: string;
  compressedUrl?: string;
  targetSize: number;
  quality: number;
  status: 'pending' | 'compressing' | 'completed' | 'error';
  progress: number;
}

export interface CompressionSettings {
  targetSize: number; // in KB
  quality: number; // 0.1 to 1.0
  format: 'jpeg' | 'png' | 'webp';
}