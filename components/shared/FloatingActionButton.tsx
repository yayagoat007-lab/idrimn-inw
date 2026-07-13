import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ArrowUpRight, ArrowDownRight, RefreshCw, Camera, X } from 'lucide-react';

interface FloatingActionButtonProps {
  onAddExpense: () => void;
  onAddIncome: () => void;
  onAddTransfer: () => void;
  onScanReceipt: () => void;
}

export function FloatingActionButton({
  onAddExpense,
  onAddIncome,
  onAddTransfer,
  onScanReceipt
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const triggerHaptic = () => {
    // Navigator HTML5 vibration API for premium PWA feel
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
    // Also Capacitor haptics can be called if available, or logging:
    console.log('[Floussi Haptic] Button trigger ripple');
  };

  const handleToggle = () => {
    triggerHaptic();
    setIsOpen(!isOpen);
  };

  const handleAction = (callback: () => void) => {
    triggerHaptic();
    setIsOpen(false);
    callback();
  };

  const menuItems = [
    {
      icon: ArrowDownRight,
      label: 'Dépense',
      color: 'bg-rose-500 hover:bg-rose-600 text-white',
      action: onAddExpense
    },
    {
      icon: ArrowUpRight,
      label: 'Revenu',
      color: 'bg-emerald-500 hover:bg-emerald-600 text-white',
      action: onAddIncome
    },
    {
      icon: RefreshCw,
      label: 'Transfert',
      color: 'bg-blue-500 hover:bg-blue-600 text-white',
      action: onAddTransfer
    },
    {
      icon: Camera,
      label: 'Scanner Reçu',
      color: 'bg-purple-600 hover:bg-purple-700 text-white',
      action: onScanReceipt
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-end gap-2 mb-2">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, scale: 0.8, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 15 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => handleAction(item.action)}
                className={`flex items-center gap-2 px-3 py-2 rounded-2xl shadow-lg border border-white/10 ${item.color} text-xs font-black uppercase tracking-wider cursor-pointer`}
              >
                <item.icon size={14} />
                <span>{item.label}</span>
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      <button
        onClick={handleToggle}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all hover:scale-105 cursor-pointer ${isOpen ? 'bg-slate-800 rotate-45' : 'bg-emerald-600 hover:bg-emerald-700'}`}
      >
        {isOpen ? <X size={24} /> : <Plus size={24} />}
      </button>
    </div>
  );
}
