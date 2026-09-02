import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
  Maximize2,
  Loader2,
  Clipboard,
  Check,
  Sparkles,
} from 'lucide-react';
import { compressImageFile, formatImageUrl } from '../utils/imageCompression';

interface OrderImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
  subLabel?: string;
  maxImages?: number;
  compact?: boolean;
}

export const OrderImageUploader: React.FC<OrderImageUploaderProps> = ({
  images = [],
  onChange,
  label = 'รูปภาพกราฟวิเคราะห์ / สลิปออเดอร์ (Chart Screenshots & Order Slips)',
  subLabel = 'อัปโหลดไฟล์ภาพจากเครื่อง, ลากและวาง (Drag & Drop), กดวางภาพ (Ctrl+V) หรือใส่ลิงก์รูปภาพ',
  maxImages = 8,
  compact = false,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);

  // Process files (compress and add)
  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file && file.type.startsWith('image/')) {
          if (images.length + newImages.length >= maxImages) break;
          const compressed = await compressImageFile(file, {
            maxWidth: 1600,
            maxHeight: 1600,
            quality: 0.82,
            format: 'image/jpeg',
          });
          newImages.push(compressed);
        }
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
      }
    } catch (err) {
      console.error('Failed to compress image:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset input value so the same file can be picked again if needed
      e.target.value = '';
    }
  };

  // Handle URL addition
  const handleAddUrl = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const formatted = formatImageUrl(urlInput);
    if (formatted) {
      if (images.length < maxImages) {
        onChange([...images, formatted]);
        setUrlInput('');
      }
    }
  };

  // Handle Delete
  const handleRemoveImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Clipboard Paste Support (Ctrl+V / Command+V)
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const filesToProcess: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          filesToProcess.push(file);
        }
      }
    }

    if (filesToProcess.length > 0) {
      e.preventDefault();
      e.stopPropagation();
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
      await processFiles(filesToProcess);
    }
  };

  return (
    <div
      onPaste={handlePaste}
      tabIndex={0}
      className="space-y-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500/40 rounded-xl"
    >
      {/* Label and Count */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <div className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>{label}</span>
          </div>
          {subLabel && (
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
              {subLabel}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {copiedNotification && (
            <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 animate-pulse">
              <Check className="w-3 h-3" />
              <span>วางรูปสำเร็จแล้ว!</span>
            </span>
          )}
          <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-[#060913] border border-[#1e293b]">
            {images.length}/{maxImages} รูป
          </span>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Drop Zone & Actions Container */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer p-4 text-center ${
          isDragging
            ? 'border-blue-500 bg-blue-950/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
            : 'border-[#1e293b] hover:border-blue-500/60 bg-[#060913]/90 hover:bg-[#0e131f]'
        }`}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-2 text-blue-300">
            <Loader2 className="w-6 h-6 animate-spin mb-1.5" />
            <span className="text-xs font-mono font-bold">กำลังย่อและโหลดรูปภาพ...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-950 text-blue-400 border border-blue-600/40 flex items-center justify-center shadow-inner">
                <Upload className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                  <span>คลิกเพื่อเลือกรูปภาพจากเครื่อง</span>
                  <span className="text-[10px] text-blue-400 font-normal">หรือลากไฟล์มาวาง</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                  <span>รองรับ JPG, PNG, WebP</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-amber-300/90 font-bold flex items-center gap-0.5">
                    <Clipboard className="w-2.5 h-2.5" /> กด Ctrl+V เพื่อวางรูปได้ทันที
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* URL Input Bar */}
      <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500">
            <LinkIcon className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder="หรือวาง URL รูปภาพ / ลิงก์ TradingView (เช่น tradingview.com/x/...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                handleAddUrl(e);
              }
            }}
            className="w-full bg-[#060913] border border-[#1e293b] focus:border-blue-500 rounded-xl pl-8 pr-3 py-2 text-xs font-mono text-slate-200 focus:outline-none placeholder-slate-500"
          />
        </div>
        <button
          type="button"
          onClick={handleAddUrl}
          disabled={!urlInput.trim() || images.length >= maxImages}
          className="px-3.5 py-2 bg-[#0e131f] hover:bg-[#1e293b] text-blue-300 hover:text-white text-xs font-mono font-bold rounded-xl border border-blue-900/50 hover:border-blue-500/60 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1 shadow-sm shrink-0"
        >
          <span>+ ใส่ลิงก์</span>
        </button>
      </div>

      {/* Thumbnails Grid Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {images.map((imgUrl, idx) => (
            <div
              key={idx}
              className="relative aspect-video rounded-xl overflow-hidden border border-[#1e293b] bg-[#030407] group shadow-sm hover:border-blue-500/60 transition-all"
            >
              <img
                src={imgUrl}
                alt={`Order screenshot ${idx + 1}`}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => setPreviewImage(imgUrl)}
                referrerPolicy="no-referrer"
              />

              {/* Number Badge */}
              <div className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-black/75 text-[9px] font-mono text-slate-300 border border-white/10 pointer-events-none">
                #{idx + 1}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-1 right-1 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setPreviewImage(imgUrl)}
                  className="p-1 rounded-md bg-black/80 hover:bg-slate-700 text-white transition-colors border border-white/10"
                  title="ดูรูปขนาดใหญ่"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleRemoveImage(idx, e)}
                  className="p-1 rounded-md bg-rose-950/90 hover:bg-rose-600 text-rose-200 hover:text-white transition-colors border border-rose-600/40"
                  title="ลบรูปนี้"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Modal View Full Image */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] bg-[#060913] border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-[#1e293b] flex items-center justify-between bg-[#030407]">
              <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>ภาพขยายเต็มจอ (Full View)</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-lg bg-[#0e131f] hover:bg-[#1e293b] text-slate-400 hover:text-white transition-colors border border-[#1e293b]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 overflow-auto flex items-center justify-center max-h-[80vh]">
              <img
                src={previewImage}
                alt="Full preview"
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
