import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';

export interface TestimonialCardProps {
  key?: React.Key;
  name: string;
  city: string;
  text: string;
  avatarUrl: string;
  planName: string;
}

export function TestimonialCard({ name, city, text, avatarUrl, planName }: TestimonialCardProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
      <div className="space-y-2">
        {/* Rating Stars */}
        <div className="flex gap-1 text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} fill="currentColor" />
          ))}
        </div>
        
        {/* Quote */}
        <p className="text-xs text-slate-600 font-medium italic leading-relaxed">
          "{text}"
        </p>
      </div>

      {/* User info */}
      <div className="flex items-center gap-3 border-t border-slate-50 pt-3.5">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-black text-emerald-800 text-xs border border-emerald-200">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            name.charAt(0)
          )}
        </div>
        <div>
          <div className="flex items-center gap-1">
            <h5 className="text-xs font-black text-slate-900 leading-none">{name}</h5>
            <ShieldCheck size={14} className="text-emerald-500" />
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
            {city} · <span className="text-emerald-600 uppercase tracking-wider">{planName}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
export default TestimonialCard;
