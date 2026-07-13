import React from 'react';

export function HeroAnimation() {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-square bg-gradient-to-br from-emerald-50 to-teal-50/40 rounded-3xl border border-emerald-100/50 p-6 flex flex-col justify-between overflow-hidden shadow-xs">
      
      {/* Visual background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-15"></div>

      {/* Floating Elements (Simulated coins falling) */}
      <div className="absolute top-10 left-1/4 w-8 h-8 rounded-full bg-amber-400 border-2 border-amber-500 flex items-center justify-center text-[10px] font-black text-amber-900 shadow-sm animate-bounce">
        10 DH
      </div>

      <div className="absolute top-16 right-1/3 w-10 h-10 rounded-full bg-amber-400 border-2 border-amber-500 flex items-center justify-center text-xs font-black text-amber-900 shadow-sm animate-bounce delay-300">
        20 DH
      </div>

      <div className="absolute top-24 left-1/2 w-6 h-6 rounded-full bg-slate-300 border-2 border-slate-400 flex items-center justify-center text-[8px] font-black text-slate-800 shadow-sm animate-bounce delay-700">
        5 DH
      </div>

      <div className="text-center pt-8 z-10">
        <span className="text-[10px] bg-emerald-150 text-emerald-800 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-200">
          Méthode des Enveloppes
        </span>
        <h4 className="text-sm font-black text-slate-800 mt-2">Visualisez vos économies d'un coup d'œil</h4>
      </div>

      {/* Labeled Buckets */}
      <div className="grid grid-cols-3 gap-3 z-10 pt-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-3 text-center shadow-xs flex flex-col items-center justify-between h-32 hover:scale-105 transition-transform duration-300">
          <span className="text-xl">🥩</span>
          <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-tight">Masrouf</p>
            <p className="text-xs font-extrabold text-emerald-600">300 DH</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-2/3"></div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-3 text-center shadow-xs flex flex-col items-center justify-between h-32 hover:scale-105 transition-transform duration-300 relative">
          <span className="text-xl">🐏</span>
          <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-tight">Aïd Al Adha</p>
            <p className="text-xs font-extrabold text-amber-600">1 500 DH</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full w-4/5"></div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-3 text-center shadow-xs flex flex-col items-center justify-between h-32 hover:scale-105 transition-transform duration-300">
          <span className="text-xl">🏠</span>
          <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-tight">Kraydar</p>
            <p className="text-xs font-extrabold text-blue-600">2 000 DH</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default HeroAnimation;
