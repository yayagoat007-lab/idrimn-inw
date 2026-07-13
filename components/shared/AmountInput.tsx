import React from 'react';

interface AmountInputProps {
  value: number;
  onChange: (val: number) => void;
  language: 'fr' | 'darija';
}

export function AmountInput({
  value,
  onChange,
  language
}: AmountInputProps) {
  
  const formatDisplay = (num: number) => {
    // Moroccan format: "1 250,00"
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    const num = rawVal ? parseInt(rawVal, 10) / 100 : 0;
    onChange(num);
  };

  return (
    <div className="space-y-1.5 font-sans">
      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
        Montant de la Transaction (DH)
      </label>
      <div className="relative rounded-2xl bg-slate-50 border border-slate-100 p-4 flex items-center justify-between">
        <input
          type="text"
          value={formatDisplay(value)}
          onChange={handleInputChange}
          className="bg-transparent border-none outline-hidden text-2xl font-black text-slate-900 tracking-tight w-full"
          placeholder="0,00"
        />
        <span className="text-sm font-black text-emerald-600 tracking-widest shrink-0 ml-2 select-none">
          DH
        </span>
      </div>
    </div>
  );
}
