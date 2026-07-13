import React, { useState } from 'react';
import { QrCode, Scan, Camera, Sparkles } from 'lucide-react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
}

export function QRCodeGenerator({ value, size = 180 }: QRCodeGeneratorProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleNativeScanSim = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult(value);
    }, 2500);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
      {!isScanning ? (
        <div className="relative p-3 bg-white rounded-2xl shadow-xs border border-slate-150">
          {/* Simple and elegant CSS-based QR code representation with centered logo */}
          <div 
            style={{ width: `${size}px`, height: `${size}px` }} 
            className="flex items-center justify-center bg-slate-50 relative border-4 border-emerald-500 rounded-lg p-2"
          >
            <QrCode size={size - 20} className="text-slate-800" />
            <div className="absolute bg-white p-1 rounded-md shadow-xs border border-slate-100">
              <span className="text-[9px] font-black text-emerald-600 tracking-tighter">Floussi</span>
            </div>
          </div>
          
          <div className="mt-3 text-center">
            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
              ID: {value.substring(0, 12)}...
            </span>
          </div>
        </div>
      ) : (
        <div className="w-[200px] h-[200px] bg-slate-900 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden border-2 border-emerald-500">
          <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500 animate-bounce"></div>
          <Camera className="w-8 h-8 text-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-bold mt-2">Scan natif en cours...</span>
        </div>
      )}

      <button
        onClick={handleNativeScanSim}
        className="mt-4 flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] px-3.5 py-2 rounded-xl transition-all shadow-xs"
      >
        <Scan className="w-3.5 h-3.5" />
        <span>Tester le Scan Photo</span>
      </button>

      {scanResult && (
        <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-xl p-2 text-center w-full">
          <p className="text-[9px] text-emerald-800 font-bold flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Invitation décodée avec succès !
          </p>
        </div>
      )}
    </div>
  );
}
