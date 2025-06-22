import React from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ImageCard } from './components/ImageCard';
import { Stats } from './components/Stats';
import { useImageCompression } from './hooks/useImageCompression';

function App() {
  const { images, addImages, updateImage, removeImage, compressImageById } = useImageCompression();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Compress Your Images
          </h2>
          <p className="text-gray-600 text-lg">
            Reduce file sizes while maintaining quality. Perfect for web optimization.
          </p>
        </div>

        <ImageUploader onImagesAdded={addImages} />

        {images.length > 0 && (
          <>
            <Stats images={images} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map(image => (
                <ImageCard
                  key={image.id}
                  image={image}
                  onRemove={removeImage}
                  onCompress={compressImageById}
                  onUpdateSettings={updateImage}
                />
              ))}
            </div>
          </>
        )}

        {images.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ready to compress?
              </h3>
              <p className="text-gray-600">
                Upload your images above to get started with our powerful compression tool.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>© 2025 ImageCompress. All rights reserved. Your images are processed locally for privacy.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;