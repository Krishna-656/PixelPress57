import React from 'react';
import { ImageData } from '../types';
import { FileImage, Download, Zap } from 'lucide-react';

interface StatsProps {
  images: ImageData[];
}

export const Stats: React.FC<StatsProps> = ({ images }) => {
  const totalOriginalSize = images.reduce((sum, img) => sum + img.originalSize, 0);
  const totalCompressedSize = images.reduce((sum, img) => sum + (img.compressedSize || 0), 0);
  const completedImages = images.filter(img => img.status === 'completed').length;
  const savedBytes = totalOriginalSize - totalCompressedSize;
  const savedPercentage = totalOriginalSize > 0 ? (savedBytes / totalOriginalSize * 100).toFixed(1) : '0';

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (images.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Img Stats</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="bg-blue-50 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            <FileImage className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{images.length}</p>
          <p className="text-sm text-gray-600">Total Images</p>
        </div>

        <div className="text-center">
          <div className="bg-green-50 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            <Download className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{completedImages}</p>
          <p className="text-sm text-gray-600">Compressed</p>
        </div>

        <div className="text-center">
          <div className="bg-purple-50 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            <Zap className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{savedPercentage}%</p>
          <p className="text-sm text-gray-600">Space Saved</p>
        </div>
      </div>

      {totalCompressedSize > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Original Size:</span>
            <span className="font-medium">{formatFileSize(totalOriginalSize)}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-gray-600">Compressed Size:</span>
            <span className="font-medium text-green-600">{formatFileSize(totalCompressedSize)}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-gray-600">Space Saved:</span>
            <span className="font-bold text-purple-600">{formatFileSize(savedBytes)}</span>
          </div>
        </div>
      )}
    </div>
  );
};