import React, { useRef } from 'react';
import { Upload, X, ArrowLeft, ArrowRight, Image as ImageIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * ImageUploader supporting uploading, reordering, and deleting images for donation listings.
 */
export const ImageUploader = ({
  images = [],
  onUpload,
  onDelete,
  onReorder,
  isUploading = false,
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds the 5MB size limit.`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file.`);
        return;
      }
      if (onUpload) {
        onUpload(file);
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const shiftImage = (index, direction) => {
    if (!onReorder) return;
    const newImages = [...images];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;

    // Swap items
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    const orderedIds = newImages.map((img) => img.id);
    onReorder(orderedIds);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-foreground">
          Donation Photos (Max 5)
        </label>
        <span className="text-xs text-muted-foreground">
          {images.length} / 5 uploaded
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {/* Render Thumbnails */}
        {images.map((img, index) => (
          <div
            key={img.id}
            className="relative aspect-square rounded-lg border border-border overflow-hidden bg-muted group"
          >
            <img
              src={img.image_url.startsWith('/') ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/..${img.image_url}` : img.image_url}
              alt={`Upload thumbnail ${index}`}
              className="w-full h-full object-cover"
            />
            
            {/* Action Overlays */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-20">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => shiftImage(index, -1)}
                  className="p-1 rounded bg-white/20 text-white hover:bg-white/40"
                  title="Move left"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => onDelete(img.id)}
                className="p-1 rounded bg-rose-500/80 text-white hover:bg-rose-500"
                title="Delete image"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {index < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => shiftImage(index, 1)}
                  className="p-1 rounded bg-white/20 text-white hover:bg-white/40"
                  title="Move right"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Display Order Index Badge */}
            <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              #{index + 1}
            </span>
          </div>
        ))}

        {/* Upload Trigger Square */}
        {images.length < 5 && (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-lg border border-dashed border-input bg-card hover:bg-accent/40 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
            <span className="text-xs">Upload Image</span>
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        multiple
      />
    </div>
  );
};

export default ImageUploader;
