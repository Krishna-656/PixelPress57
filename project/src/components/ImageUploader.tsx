import React, { useCallback, useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploaderProps {
  onImagesAdded: (files: File[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesAdded }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      onImagesAdded(files);
    }
  }, [onImagesAdded]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      onImagesAdded(files);
    }
  }, [onImagesAdded]);

  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  }, []);

  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
        dragActive
          ? 'border-blue-500 bg-blue-50 scale-105'
          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className={`transition-all duration-300 ${dragActive ? 'scale-110' : ''}`}>
        <div className="flex justify-center mb-4">
          {dragActive ? (
            <ImageIcon className="w-16 h-16 text-blue-500 animate-bounce" />
          ) : (
            <Upload className="w-16 h-16 text-gray-400" />
          )}
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {dragActive ? 'Drop your images here' : 'Upload Images'}
        </h3>
        
        <p className="text-gray-600 mb-4">
          Drag and drop your images here, or click to select files
        </p>
        
        <button 
          onClick={handleButtonClick}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Choose Files
        </button>
        
        <p className="text-sm text-gray-500 mt-4">
          Supports JPEG, PNG, and WEBP formats
        </p>
      </div>
    </div>
  );
};