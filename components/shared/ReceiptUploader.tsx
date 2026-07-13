import React, { useRef, useState } from 'react';
import { Camera, X, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';

interface ReceiptUploaderProps {
  receiptUrl: string | null;
  onChange: (url: string | null) => void;
  onScanTrigger?: (file: File) => void;
  isScanning?: boolean;
  language: 'fr' | 'darija';
}

export function ReceiptUploader({
  receiptUrl,
  onChange,
  onScanTrigger,
  isScanning = false,
  language
}: ReceiptUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(receiptUrl);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create local object URL for instant gorgeous preview
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    onChange(objectUrl);

    if (onScanTrigger) {
      onScanTrigger(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-1.5 font-sans">
      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
        Ticket de caisse / Justificatif (Wassl)
      </label>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {localPreview ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 p-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={localPreview} 
              alt="Receipt justification" 
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl object-cover border border-slate-100" 
            />
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-800 truncate">Ticket_de_caisse.png</p>
              <p className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                <Sparkles size={11} /> Prêt pour lecture automatique (OCR)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pr-2">
            {isScanning && (
              <RefreshCw size={14} className="animate-spin text-emerald-600" />
            )}
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 bg-slate-200 hover:bg-slate-300 hover:text-rose-600 text-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={triggerUploadClick}
          className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-5 text-center cursor-pointer transition-colors hover:bg-emerald-50/5 relative group"
        >
          <div className="space-y-2">
            <Camera size={24} className="text-slate-400 group-hover:text-emerald-500 mx-auto transition-colors" />
            <p className="text-xs font-bold text-slate-700">Prendre en photo / Importer le reçu</p>
            <p className="text-[9px] text-slate-400 font-bold">Extraction auto par Tesseract OCR (BIM, Marjane, Carrefour...)</p>
          </div>
        </div>
      )}
    </div>
  );
}
