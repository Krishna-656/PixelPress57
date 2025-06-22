import React from 'react';
import { Download, Trash2, Settings, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { ImageData } from '../types';

interface ImageCardProps {
  image: ImageData;
  onRemove: (id: string) => void;
  onCompress: (id: string) => void;
  onUpdateSettings: (id: string, updates: Partial<ImageData>) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  onRemove,
  onCompress,
  onUpdateSettings
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const downloadImage = () => {
    if (image.compressedUrl) {
      const link = document.createElement('a');
      link.href = image.compressedUrl;
      link.download = `compressed_${image.file.name}`;
      link.click();
    }
  };

  const compressionRatio = image.compressedSize 
    ? ((image.originalSize - image.compressedSize) / image.originalSize * 100).toFixed(1)
    : '0';

  const targetSizeBytes = image.targetSize * 1024;
  const isCloseToTarget = image.compressedSize && 
    Math.abs(image.compressedSize - targetSizeBytes) / targetSizeBytes < 0.15; // Within 15% tolerance

  const getQualityIndicator = () => {
    if (!image.compressedSize) return null;
    
    const ratio = image.compressedSize / image.originalSize;
    if (ratio > 0.7) return { color: 'text-green-600', label: 'Excellent Quality' };
    if (ratio > 0.4) return { color: 'text-blue-600', label: 'High Quality' };
    if (ratio > 0.2) return { color: 'text-yellow-600', label: 'Good Quality' };
    return { color: 'text-orange-600', label: 'Compressed' };
  };

  const qualityIndicator = getQualityIndicator();

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
      <div className="relative">
        <img
          src={image.compressedUrl || image.originalUrl}
          alt={image.file.name}
          className="w-full h-48 object-cover"
          style={{ imageRendering: 'high-quality' }}
        />
        
        <div className="absolute top-4 right-4 flex gap-2">
          {qualityIndicator && (
            <div className="bg-white bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded-full">
              <span className={`text-xs font-medium ${qualityIndicator.color}`}>
                {qualityIndicator.label}
              </span>
            </div>
          )}
          <button
            onClick={() => onRemove(image.id)}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {image.status === 'compressing' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-medium">Optimizing Quality... {Math.round(image.progress)}%</p>
              <p className="text-xs opacity-75 mt-1">Preserving image clarity</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-2 truncate">
          {image.file.name}
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p className="text-gray-600">Original Size</p>
            <p className="font-medium">{formatFileSize(image.originalSize)}</p>
          </div>
          <div>
            <p className="text-gray-600">Compressed Size</p>
            <p className={`font-medium ${image.compressedSize ? 'text-green-600' : 'text-gray-400'}`}>
              {image.compressedSize ? formatFileSize(image.compressedSize) : 'N/A'}
            </p>
          </div>
        </div>

        {image.compressedSize && (
          <div className={`mb-4 p-3 rounded-lg ${isCloseToTarget ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${isCloseToTarget ? 'text-green-800' : 'text-blue-800'}`}>
                <CheckCircle className="w-4 h-4 inline mr-1" />
                {isCloseToTarget 
                  ? `🎯 Target achieved!`
                  : `📊 Compressed by ${compressionRatio}%`
                }
              </p>
              <Zap className={`w-4 h-4 ${isCloseToTarget ? 'text-green-600' : 'text-blue-600'}`} />
            </div>
            <p className={`text-xs mt-1 ${isCloseToTarget ? 'text-green-700' : 'text-blue-700'}`}>
              {isCloseToTarget 
                ? `Size reduced by ${compressionRatio}% with quality preserved`
                : `Target: ${image.targetSize}KB | Actual: ${Math.round(image.compressedSize / 1024)}KB`
              }
            </p>
          </div>
        )}

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Target Size: {image.targetSize} KB
            </label>
            <input
              type="number"
              min="5"
              max={Math.round(image.originalSize / 1024)}
              value={image.targetSize}
              onChange={(e) => onUpdateSettings(image.id, { targetSize: parseInt(e.target.value) || 10 })}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={image.status === 'compressing'}
            />
          </div>
          <input
            type="range"
            min="5"
            max={Math.round(image.originalSize / 1024)}
            value={image.targetSize}
            onChange={(e) => onUpdateSettings(image.id, { targetSize: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            disabled={image.status === 'compressing'}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5 KB</span>
            <span className="text-center">🎯 Smart Compression</span>
            <span>{Math.round(image.originalSize / 1024)} KB</span>
          </div>
        </div>

        <div className="flex gap-2">
          {image.status === 'pending' && (
            <button
              onClick={() => onCompress(image.id)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Smart Compress to {image.targetSize}KB
            </button>
          )}

          {image.status === 'completed' && (
            <>
              <button
                onClick={() => onCompress(image.id)}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Re-optimize
              </button>
              <button
                onClick={downloadImage}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
              >
                <Download className="w-4 h-4 inline mr-2" />
                Download
              </button>
            </>
          )}

          {image.status === 'error' && (
            <button
              onClick={() => onCompress(image.id)}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200"
            >
              <AlertCircle className="w-4 h-4 inline mr-2" />
              Retry Compression
            </button>
          )}
        </div>
      </div>
    </div>
  );
};