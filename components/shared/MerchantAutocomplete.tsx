import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface MerchantAutocompleteProps {
  value: string;
  onChange: (val: string, autoCategory?: string) => void;
  language: 'fr' | 'darija';
}

const HISTORICAL_MERCHANTS = [
  { name: 'Marjane', category: 'alimentation' },
  { name: 'BIM Stores', category: 'alimentation' },
  { name: 'Carrefour', category: 'alimentation' },
  { name: 'Lydec', category: 'factures' },
  { name: 'Maroc Telecom', category: 'telecom' },
  { name: 'Inwi', category: 'telecom' },
  { name: 'Orange', category: 'telecom' },
  { name: 'Decathlon', category: 'loisirs' },
  { name: 'Glovo', category: 'alimentation' },
  { name: 'Aswak Assalam', category: 'alimentation' },
  { name: 'Sidi Ali', category: 'alimentation' },
  { name: 'Afriquia Gaz', category: 'transport' },
  { name: 'Moul Hanout', category: 'alimentation' }
];

export function MerchantAutocomplete({
  value,
  onChange,
  language
}: MerchantAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<typeof HISTORICAL_MERCHANTS>([]);
  const [showSug, setShowSug] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    if (val.trim() === '') {
      setSuggestions([]);
    } else {
      const filtered = HISTORICAL_MERCHANTS.filter(m => 
        m.name.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
    }
  };

  const handleSelect = (merchant: typeof HISTORICAL_MERCHANTS[0]) => {
    onChange(merchant.name, merchant.category);
    setSuggestions([]);
    setShowSug(false);
  };

  return (
    <div className="space-y-1.5 relative font-sans">
      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
        Bénéficiaire / Marchand (Fayda)
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setShowSug(true)}
          onBlur={() => setTimeout(() => setShowSug(false), 200)}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          placeholder="Ex: Marjane, Moul Hanout, Lydec..."
        />
        {value &&suggestions.length === 0 && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
            Nouveau
          </span>
        )}
      </div>

      {showSug && suggestions.length > 0 && (
        <div className="absolute top-16 left-0 right-0 bg-white border border-slate-100 rounded-3xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
          {suggestions.map(sug => (
            <button
              key={sug.name}
              type="button"
              onMouseDown={() => handleSelect(sug)}
              className="w-full text-left px-4.5 py-2.5 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>{sug.name}</span>
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-100">
                <Sparkles size={10} /> Auto-cat : {sug.category}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
