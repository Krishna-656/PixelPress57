import React from 'react';
import { Image as ImageIcon, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl">
              <ImageIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pixel Press</h1>
              <p className="text-sm text-gray-600">Presented to my Brother❤ </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span>Fast • Secure • Client-side</span>
          </div>
        </div>
      </div>
    </header>
  );
};