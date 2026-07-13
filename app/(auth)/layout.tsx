import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans select-none">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center gap-2.5 mb-6">
          <div className="bg-emerald-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-600/25">
            F
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            Floussi<span className="text-emerald-600">.</span>
          </span>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-100/80 rounded-2xl border border-slate-100">
          {children}
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-slate-400 relative z-10">
        Floussi Maroc • Tracing cash, saving smart. All rights reserved.
      </div>
    </div>
  );
}
