import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageLightboxProps {
  images?: string[];
  imageUrl?: string | null;
  initialIndex?: number;
  title?: string;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  imageUrl,
  initialIndex = 0,
  title,
  onClose,
}) => {
  // Normalize image list
  const list = images && images.length > 0 ? images : imageUrl ? [imageUrl] : [];
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, imageUrl]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : list.length - 1));
  }, [list.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < list.length - 1 ? prev + 1 : 0));
  }, [list.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, onClose]);

  if (list.length === 0) return null;

  const currentSrc = list[currentIndex];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/95 backdrop-blur-md animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="w-full flex items-center justify-between pb-3 text-zinc-300">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-gaming font-semibold text-yellow-400">
              {title || 'Evidence Screenshot / Proof Gallery'}
            </span>
            {list.length > 1 && (
              <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                {currentIndex + 1} / {list.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-md bg-zinc-900 border border-zinc-700 transition-colors"
            title="Close image preview (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Image Stage with Next / Prev buttons */}
        <div className="relative w-full flex items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 min-h-[300px] max-h-[72vh]">
          {/* Previous Arrow Button */}
          {list.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-2.5 z-10 p-2.5 rounded-full bg-black/70 hover:bg-yellow-400 hover:text-black text-white border border-zinc-700 transition-all shadow-lg active:scale-95"
              title="Previous Photo (Left Arrow)"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Current Image */}
          <div className="w-full h-full flex items-center justify-center p-2">
            <img
              src={currentSrc}
              alt={`Proof ${currentIndex + 1}`}
              className="max-w-full max-h-[68vh] object-contain rounded"
            />
          </div>

          {/* Next Arrow Button */}
          {list.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-2.5 z-10 p-2.5 rounded-full bg-black/70 hover:bg-yellow-400 hover:text-black text-white border border-zinc-700 transition-all shadow-lg active:scale-95"
              title="Next Photo (Right Arrow)"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Bottom Thumbnail Strip */}
        {list.length > 1 && (
          <div className="w-full flex items-center justify-center gap-2 overflow-x-auto py-3 px-2">
            {list.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-14 h-14 rounded overflow-hidden border shrink-0 transition-all ${
                  currentIndex === idx
                    ? 'ring-2 ring-yellow-400 border-yellow-400 scale-105'
                    : 'border-zinc-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
