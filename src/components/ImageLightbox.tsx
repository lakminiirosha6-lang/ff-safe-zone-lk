import React from 'react';
import { X, ZoomIn } from 'lucide-react';

interface ImageLightboxProps {
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ imageUrl, title, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex items-center justify-between pb-3 text-zinc-300">
          <span className="text-xs uppercase font-gaming font-semibold text-yellow-400">
            {title || 'Evidence Screenshot / Proof Photo'}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-md bg-zinc-900 border border-zinc-700 transition-colors"
            title="Close image preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-auto max-h-[82vh] rounded border border-zinc-800 bg-zinc-950 flex items-center justify-center">
          <img
            src={imageUrl}
            alt={title || 'Screenshot proof'}
            className="max-w-full max-h-[80vh] object-contain rounded"
          />
        </div>
      </div>
    </div>
  );
};
