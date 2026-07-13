import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, AlertTriangle, AlertOctagon, CheckCircle2, X } from 'lucide-react';

interface AlertBannerProps {
  type: 'info' | 'warning' | 'danger' | 'success';
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  autoDismissMs?: number;
  id?: string;
}

export function AlertBanner({
  type,
  message,
  actionLabel,
  onAction,
  autoDismissMs = 5000,
  id
}: AlertBannerProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoDismissMs && autoDismissMs > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [autoDismissMs]);

  if (!visible) return null;

  const styleMap = {
    info: {
      bg: 'bg-blue-50 border-blue-100 text-blue-800',
      icon: Info,
      button: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    warning: {
      bg: 'bg-amber-50 border-amber-100 text-amber-800',
      icon: AlertTriangle,
      button: 'bg-amber-600 hover:bg-amber-700 text-white'
    },
    danger: {
      bg: 'bg-rose-50 border-rose-100 text-rose-800',
      icon: AlertOctagon,
      button: 'bg-rose-600 hover:bg-rose-700 text-white'
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-100 text-emerald-800',
      icon: CheckCircle2,
      button: 'bg-emerald-600 hover:bg-emerald-700 text-white'
    }
  };

  const current = styleMap[type] || styleMap.info;
  const Icon = current.icon;

  return (
    <AnimatePresence>
      <motion.div
        id={id || "alert-banner"}
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`border p-4.5 rounded-2xl flex items-start gap-3.5 shadow-xs relative ${current.bg}`}
      >
        <div className="mt-0.5 shrink-0">
          <Icon size={18} />
        </div>
        
        <div className="flex-1 space-y-2 min-w-0 pr-6">
          <p className="text-xs font-bold leading-relaxed">{message}</p>
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors shadow-xs ${current.button}`}
            >
              {actionLabel}
            </button>
          )}
        </div>

        <button
          onClick={() => setVisible(false)}
          className="absolute right-3.5 top-3.5 p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
