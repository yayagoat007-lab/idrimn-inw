import React from 'react';

export function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-xs animate-pulse">
      <div className="flex justify-between items-center">
        <div className="w-1/3 h-4 bg-slate-200 rounded-lg"></div>
        <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
      </div>
      <div className="space-y-2">
        <div className="w-full h-8 bg-slate-100 rounded-xl"></div>
        <div className="w-2/3 h-3 bg-slate-100 rounded-md"></div>
      </div>
    </div>
  );
}
export default SkeletonCard;
