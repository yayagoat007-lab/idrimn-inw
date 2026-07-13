import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { Bucket } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Language } from '../../lib/i18n';
import { SparklineChart } from '../shared/SparklineChart';
import { motion } from 'motion/react';

interface BucketCardProps {
  bucket: Bucket & { remaining?: number; percent?: number; statusColor?: 'green' | 'yellow' | 'red' | 'grey' | 'blue' };
  language: Language;
  variant?: 'compact' | 'detailed';
  onSelect?: (bucket: any) => void;
  onEdit?: (bucket: any) => void;
  onDelete?: (id: string) => void;
  onTransfer?: (bucket: any) => void;
  onQuickAdd?: (bucketId: string) => void;
  onArchive?: (bucketId: string) => void;
}

export function BucketCard({
  bucket,
  language,
  variant = 'compact',
  onSelect,
  onEdit,
  onDelete,
  onTransfer,
  onQuickAdd,
  onArchive
}: BucketCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  // Dynamic Lucide Icon
  const IconComponent = (Icons as any)[bucket.icon] || Icons.HelpCircle;

  // Values
  const spent = bucket.spent_amount || 0;
  const allocated = bucket.allocated_amount || 0;
  const remaining = bucket.remaining ?? Math.max(0, allocated - spent);
  const percent = bucket.percent ?? (allocated > 0 ? Math.round((spent / allocated) * 100) : 0);
  const statusColor = bucket.statusColor ?? 'green';

  // Days left in current month helper
  const getDaysLeftInMonth = () => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return lastDay - today.getDate();
  };
  const daysLeft = getDaysLeftInMonth();

  // Status color styles
  const statusConfig = {
    green: {
      border: "border-emerald-100",
      bg: "bg-emerald-50/40",
      progressBg: "bg-emerald-500",
      text: "text-emerald-700",
      badge: "bg-emerald-50 text-emerald-800 border-emerald-100"
    },
    yellow: {
      border: "border-amber-200",
      bg: "bg-amber-50/20",
      progressBg: "bg-amber-500",
      text: "text-amber-700",
      badge: "bg-amber-50 text-amber-800 border-amber-200"
    },
    red: {
      border: "border-rose-200 animate-pulse",
      bg: "bg-rose-50/20",
      progressBg: "bg-rose-500",
      text: "text-rose-700",
      badge: "bg-rose-50 text-rose-800 border-rose-200"
    },
    grey: {
      border: "border-slate-300",
      bg: "bg-slate-50",
      progressBg: "bg-slate-500",
      text: "text-slate-700",
      badge: "bg-slate-100 text-slate-800 border-slate-200"
    },
    blue: {
      border: "border-blue-100",
      bg: "bg-blue-50/30",
      progressBg: "bg-blue-500",
      text: "text-blue-700",
      badge: "bg-blue-50 text-blue-800 border-blue-100"
    }
  }[statusColor];

  // Simulated sparkline data points
  const sparklineData = [
    spent * 0.1,
    spent * 0.25,
    spent * 0.3,
    spent * 0.5,
    spent * 0.65,
    spent * 0.8,
    spent
  ];

  return (
    <motion.div
      layoutId={`bucket-card-${bucket.id}`}
      onClick={() => onSelect && onSelect(bucket)}
      className={`bg-white border rounded-3xl p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden cursor-pointer flex flex-col justify-between h-full space-y-4 group ${statusConfig.border}`}
    >
      {/* Background soft glow */}
      <div className={`absolute -right-12 -top-12 w-24 h-24 rounded-full filter blur-2xl opacity-10`} style={{ backgroundColor: bucket.color }} />

      {/* Top row */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div 
            className="p-3 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-xs"
            style={{ backgroundColor: bucket.color || "#10B981" }}
          >
            <IconComponent size={18} />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-800 leading-snug line-clamp-1">
              {bucket.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-black uppercase text-slate-400">
                {bucket.category.toUpperCase()}
              </span>
              {bucket.parent_id && (
                <span className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 text-[8px] font-black uppercase text-slate-500 rounded-md">
                  Sous-bucket
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Menu Actions dropdown trigger */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
          >
            <Icons.MoreVertical size={16} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-100 rounded-2xl shadow-lg z-30 py-1.5 text-xs font-bold text-slate-600 divide-y divide-slate-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onEdit && onEdit(bucket);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-1.5 text-slate-700"
              >
                <Icons.Edit2 size={12} />
                Modifier
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onTransfer && onTransfer(bucket);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-1.5 text-slate-700"
              >
                <Icons.ArrowRightLeft size={12} />
                Transférer
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onArchive && onArchive(bucket.id);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-1.5 text-amber-700"
              >
                <Icons.Archive size={12} />
                Archiver
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onDelete && onDelete(bucket.id);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-rose-50 flex items-center gap-1.5 text-rose-600"
              >
                <Icons.Trash size={12} />
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Stats Body */}
      <div className="space-y-3.5 flex-1">
        {/* Sum details */}
        <div className="flex justify-between items-baseline">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black uppercase text-slate-400">Dépensé</span>
            <p className="text-xs font-black text-slate-800">{formatCurrency(spent)}</p>
          </div>
          <div className="text-right space-y-0.5">
            <span className="text-[9px] font-black uppercase text-slate-400">Alloué</span>
            <p className="text-xs font-black text-slate-800">{formatCurrency(allocated)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${statusConfig.progressBg}`}
              style={{ width: `${Math.min(100, percent)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase">
            <span>{percent}% Utilisé</span>
            <span>Reste : {formatCurrency(remaining)}</span>
          </div>
        </div>

        {/* Detailed Variant Additional Insights */}
        {variant === 'detailed' && (
          <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100/50 space-y-2 text-[10px] font-bold text-slate-500">
            <div className="flex justify-between">
              <span>Projection d'épuisement :</span>
              <span className="font-extrabold text-slate-700">
                {percent >= 100 
                  ? "Dépassé" 
                  : remaining === 0 
                  ? "Épuisé" 
                  : `Dans ~${daysLeft}j (${daysLeft > 10 ? 'Sain' : 'Vitesse Élevée'})`}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Activité (7 derniers jours) :</span>
              <SparklineChart data={sparklineData} color={bucket.color} width={80} height={16} />
            </div>
          </div>
        )}
      </div>

      {/* Action buttons at bottom */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickAdd && onQuickAdd(bucket.id);
          }}
          className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-100/30"
        >
          <Icons.Plus size={12} />
          Saisie Rapide
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onTransfer && onTransfer(bucket);
          }}
          className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-100/30"
        >
          <Icons.ArrowRightLeft size={12} />
          Transférer
        </button>
      </div>

    </motion.div>
  );
}
