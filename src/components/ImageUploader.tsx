import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle2, Sparkles, Loader2, Link as LinkIcon } from 'lucide-react';
import { api } from '../services/api.ts';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  onImageFitSuggested?: (fit: 'contain' | 'cover') => void;
  label?: string;
  description?: string;
}

const PRESET_IMAGES = [
  {
    name: 'ANC Headphones',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    category: 'Audio',
  },
  {
    name: 'Smart Fitness Band',
    url: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=1200&q=80',
    category: 'Wearables',
  },
  {
    name: 'Radiance Serum Bottle',
    url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80',
    category: 'Beauty',
  },
  {
    name: 'Mechanical Keyboard',
    url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80',
    category: 'Desk Gear',
  },
  {
    name: 'Urban Commuter Backpack',
    url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
    category: 'Apparel',
  },
  {
    name: 'Cold Brew Coffee Maker',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
    category: 'Kitchen',
  },
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const ALLOWED_EXT_RE = /\.(png|jpe?g|webp|svg)$/i;

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  onImageFitSuggested,
  label = 'Product PNG / Image',
  description = 'Upload transparent or studio PNG (recommended), JPG, or WebP. Max 5MB.',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPngUrl = value.toLowerCase().includes('.png') || value.startsWith('data:image/png');

  const validateAndProcessFile = (file: File) => {
    setError(null);

    const hasValidType = file.type ? ALLOWED_TYPES.includes(file.type) : false;
    const hasValidExt = ALLOWED_EXT_RE.test(file.name);

    if (!hasValidType && !hasValidExt) {
      setError('Invalid file format. Please upload a PNG, JPG, WebP, or SVG product image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is 5MB.`);
      return;
    }

    const inferredMime =
      file.type && ALLOWED_TYPES.includes(file.type)
        ? file.type
        : file.name.toLowerCase().endsWith('.png')
        ? 'image/png'
        : file.name.toLowerCase().endsWith('.webp')
        ? 'image/webp'
        : file.name.toLowerCase().endsWith('.svg')
        ? 'image/svg+xml'
        : 'image/jpeg';

    const reader = new FileReader();
    setUploading(true);

    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;

      const img = new Image();
      img.onload = async () => {
        setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        try {
          const res = await api.uploadImage({
            data: base64Data,
            filename: file.name,
            mimeType: inferredMime,
          });
          onChange(res.url);
          if (inferredMime === 'image/png' || res.url.toLowerCase().endsWith('.png')) {
            onImageFitSuggested?.('contain');
          }
          setError(null);
        } catch (uploadErr) {
          setError(uploadErr instanceof Error ? uploadErr.message : 'Upload failed. Using local image preview.');
          onChange(base64Data);
          if (inferredMime === 'image/png') {
            onImageFitSuggested?.('contain');
          }
        } finally {
          setUploading(false);
        }
      };
      img.onerror = () => {
        setError('Corrupted image file. Please choose another PNG or photo.');
        setUploading(false);
      };
      img.src = base64Data;
    };

    reader.onerror = () => {
      setError('Failed to read file from your device.');
      setUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handlePresetSelect = (url: string) => {
    setError(null);
    onChange(url);
    onImageFitSuggested?.('cover');
    const img = new Image();
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = url;
  };

  const handleApplyUrl = () => {
    const clean = urlInput.trim();
    if (!clean) return;
    setError(null);
    onChange(clean);
    if (clean.toLowerCase().includes('.png')) {
      onImageFitSuggested?.('contain');
    }
    setUrlInput('');
    setShowUrlInput(false);
  };

  return (
    <div className="space-y-3">
      {/* Persistent file input (always mounted for both empty & replace states) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            validateAndProcessFile(e.target.files[0]);
            e.target.value = '';
          }
        }}
        accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
            {label} <span className="text-rose-500">*</span>
          </label>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60">
            PNG Supported
          </span>
        </div>
        {dimensions && (
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {dimensions.width} × {dimensions.height} px
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Always-visible quick upload bar (works smoothly on mobile & desktop) */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-60"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          <span>{uploading ? 'Uploading PNG...' : value ? 'Upload Your Product PNG' : 'Choose Product PNG File'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Paste PNG URL</span>
        </button>

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setDimensions(null);
            }}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {showUrlInput && (
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/product.png"
            className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
          >
            Apply URL
          </button>
        </div>
      )}

      {/* Main Dropzone / Current Preview */}
      {value ? (
        <div
          className={`relative group rounded-2xl overflow-hidden border-2 border-indigo-500/30 shadow-sm ${
            isPngUrl
              ? 'bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800/80 dark:to-slate-900'
              : 'bg-slate-100 dark:bg-slate-900'
          }`}
        >
          <img
            src={value}
            alt="Product preview"
            className={`w-full h-56 sm:h-64 transition-transform group-hover:scale-102 ${
              isPngUrl ? 'object-contain p-4 drop-shadow-xl' : 'object-cover object-center'
            }`}
            onError={() => setError('Image failed to load. Please upload a PNG or select a preset.')}
          />
          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-md text-[11px] font-medium text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isPngUrl ? 'Product PNG Ready' : 'Image Ready'}</span>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-101'
              : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-900/50'
          }`}
        >
          <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>

          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {uploading ? 'Processing & uploading your PNG...' : 'Drop your Product PNG here, or click to select'}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{description}</p>
        </div>
      )}

      {/* Instant Presets for Quick Testing */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Or choose from curated product presets:</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PRESET_IMAGES.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handlePresetSelect(preset.url)}
              className={`group relative rounded-xl overflow-hidden border aspect-square transition-all ${
                value === preset.url
                  ? 'border-indigo-600 ring-2 ring-indigo-500/40 scale-95'
                  : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400'
              }`}
            >
              <img
                src={preset.url}
                alt={preset.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/70 py-0.5 px-1 text-[9px] text-white truncate text-center font-medium">
                {preset.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
