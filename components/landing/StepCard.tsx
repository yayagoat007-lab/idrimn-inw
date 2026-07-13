import React from 'react';

interface StepCardProps {
  number: string;
  title: string;
  description: string;
  emoji: string;
  colorClass: string;
}

export function StepCard({ number, title, description, emoji, colorClass }: StepCardProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 relative hover:shadow-md transition-all space-y-4">
      <div className="flex justify-between items-start">
        <span className="text-3xl">{emoji}</span>
        <span className={`text-2xl font-black ${colorClass} opacity-80`}>{number}</span>
      </div>
      <div>
        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">{title}</h4>
        <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">{description}</p>
      </div>
    </div>
  );
}
export default StepCard;
