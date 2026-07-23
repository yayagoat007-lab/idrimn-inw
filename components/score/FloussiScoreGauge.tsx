import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, Sparkles, Star, Target, Compass, 
  TrendingUp, TrendingDown, Minus, Crown
} from 'lucide-react';
import { FloussiScoreTier } from '../../lib/floussi-score';

interface FloussiScoreGaugeProps {
  score: number;
  tier: FloussiScoreTier;
  trend: 'up' | 'stable' | 'down';
  variant?: 'detailed' | 'compact' | 'header';
  language: 'fr' | 'darija';
}

export function FloussiScoreGauge({
  score,
  tier,
  trend,
  variant = 'detailed',
  language
}: FloussiScoreGaugeProps) {
  const isDarija = language === 'darija';

  // Retrieve details based on current tier
  const getTierDetails = (t: FloussiScoreTier) => {
    switch (t) {
      case 'Légende':
        return {
          bg: 'from-amber-500 via-orange-500 to-yellow-500',
          text: 'text-amber-600',
          darkText: 'text-amber-900',
          lightBg: 'bg-amber-50',
          borderColor: 'border-amber-200',
          strokeColor: '#f59e0b',
          glow: 'shadow-amber-100',
          icon: <Crown className="w-5 h-5 text-amber-500" />,
          titleFr: 'Légende',
          titleDarija: 'أسطورة'
        };
      case 'Maître':
        return {
          bg: 'from-emerald-500 to-teal-500',
          text: 'text-emerald-600',
          darkText: 'text-emerald-900',
          lightBg: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          strokeColor: '#10b981',
          glow: 'shadow-emerald-100',
          icon: <Trophy className="w-5 h-5 text-emerald-500" />,
          titleFr: 'Maître',
          titleDarija: 'معلم'
        };
      case 'Stratège':
        return {
          bg: 'from-violet-500 to-purple-500',
          text: 'text-violet-600',
          darkText: 'text-violet-900',
          lightBg: 'bg-violet-50',
          borderColor: 'border-violet-200',
          strokeColor: '#8b5cf6',
          glow: 'shadow-violet-100',
          icon: <Compass className="w-5 h-5 text-violet-500" />,
          titleFr: 'Stratège',
          titleDarija: 'مخطط'
        };
      case 'Discipliné':
        return {
          bg: 'from-blue-500 to-indigo-500',
          text: 'text-blue-600',
          darkText: 'text-blue-900',
          lightBg: 'bg-blue-50',
          borderColor: 'border-blue-200',
          strokeColor: '#3b82f6',
          glow: 'shadow-blue-100',
          icon: <Star className="w-5 h-5 text-blue-500" />,
          titleFr: 'Discipliné',
          titleDarija: 'منضبط'
        };
      case 'Débutant':
      default:
        return {
          bg: 'from-slate-400 to-slate-500',
          text: 'text-slate-600',
          darkText: 'text-slate-900',
          lightBg: 'bg-slate-50',
          borderColor: 'border-slate-200',
          strokeColor: '#64748b',
          glow: 'shadow-slate-100',
          icon: <Sparkles className="w-5 h-5 text-slate-400" />,
          titleFr: 'Débutant',
          titleDarija: 'مبتدئ'
        };
    }
  };

  const details = getTierDetails(tier);
  const tierName = isDarija ? details.titleDarija : details.titleFr;

  // Circle Math
  const radius = 55;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  // Score mapping (0 to 1000) mapped to 0 to 100%
  const percentage = Math.min(100, Math.max(0, (score / 1000) * 100));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Header Variant (Very compact for dashboards & navbars)
  if (variant === 'header') {
    return (
      <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-slate-100 bg-white/90 backdrop-blur-sm shadow-xs`}>
        <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="16"
              cy="16"
              r="13"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="3.5"
            />
            <circle
              cx="16"
              cy="16"
              r="13"
              fill="none"
              stroke={details.strokeColor}
              strokeWidth="3.5"
              strokeDasharray={2 * Math.PI * 13}
              strokeDashoffset={(1 - percentage / 100) * (2 * Math.PI * 13)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-slate-800">
            {score}
          </div>
        </div>
        <div className="flex flex-col pr-1 text-left">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">
            {isDarija ? "سكور فلوسي" : "Floussi Score"}
          </span>
          <span className={`text-[10px] font-black uppercase tracking-tight mt-0.5 leading-none flex items-center gap-0.5 ${details.text}`}>
            {tierName}
          </span>
        </div>
      </div>
    );
  }

  // Compact Card Variant
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
        <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="5"
            />
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke={details.strokeColor}
              strokeWidth="5"
              strokeDasharray={2 * Math.PI * 26}
              strokeDashoffset={(1 - percentage / 100) * (2 * Math.PI * 26)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-black text-slate-800 leading-none">{score}</span>
            <span className="text-[7px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">/1k</span>
          </div>
        </div>

        <div className="space-y-1 text-left">
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${details.lightBg} ${details.text} border ${details.borderColor}`}>
              {tierName}
            </span>
            {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
            {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-rose-500" />}
          </div>
          <p className="text-xs font-black text-slate-700">
            {isDarija ? "النضج المالي ديالك" : "Niveau de Maturité Financière"}
          </p>
          <p className="text-[10px] text-slate-400 font-bold">
            {isDarija ? "كمل الساندوق ديالك با تزيد" : "Complétez des tâches pour augmenter"}
          </p>
        </div>
      </div>
    );
  }

  // Detailed (Large Circular Gauge) Variant
  return (
    <div className="flex flex-col items-center text-center p-6 bg-slate-50/40 rounded-3xl border border-slate-100/60 shadow-xs relative overflow-hidden group">
      
      {/* Background radial glow */}
      <div className={`absolute -top-12 -left-12 w-32 h-32 rounded-full ${details.lightBg} filter blur-3xl opacity-40`} />
      
      {/* 3D-ish Circular Gauge Container */}
      <div className="relative w-36 h-36 flex items-center justify-center mb-4">
        {/* Progress SVG */}
        <svg className="w-full h-full -rotate-90 select-none">
          {/* Track circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {/* Foreground circle with animation */}
          <motion.circle
            cx="72"
            cy="72"
            r={radius}
            fill="transparent"
            stroke={details.strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="p-1 rounded-full bg-white shadow-xs mb-1 border border-slate-50">
            {details.icon}
          </div>
          <span className="text-3xl font-black text-slate-800 tracking-tight leading-none">
            {score}
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            / 1000
          </span>
        </div>
      </div>

      {/* Meta details & Tiers info */}
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-1.5">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${details.lightBg} ${details.text} border ${details.borderColor}`}>
            {isDarija ? "الرتبة : " : "Rang : "}{tierName}
          </span>
          
          {/* Trend pill */}
          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
            trend === 'down' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
            'bg-slate-50 text-slate-500 border border-slate-100'
          }`}>
            {trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3 text-rose-500" />}
            {trend === 'stable' && <Minus className="w-3 h-3 text-slate-400" />}
            <span className="uppercase tracking-tight">
              {trend === 'up' && (isDarija ? "طالع" : "En hausse")}
              {trend === 'down' && (isDarija ? "هابط" : "En baisse")}
              {trend === 'stable' && (isDarija ? "مستقر" : "Stable")}
            </span>
          </span>
        </div>

        <p className="text-[11px] text-slate-500 max-w-[240px] font-semibold leading-relaxed">
          {isDarija 
            ? "هاد السكور كيمثل الصحة المالية والنضج والمواضبة ديالك فالتطبيق."
            : "Ce score évalue globalement votre rigueur budgétaire, votre assiduité d'épargne et votre éducation financière."}
        </p>
      </div>

    </div>
  );
}
