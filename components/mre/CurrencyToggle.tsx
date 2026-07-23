import React, { useState, useEffect } from 'react';
import { SUPPORTED_CURRENCIES, getMREPreference, setMREPreference, getExchangeRates, saveExchangeRates } from '../../lib/currency-exchange';
import { Settings, Check, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { t } from '../../lib/i18n';

interface CurrencyToggleProps {
  language: 'fr' | 'darija';
  onChanged?: () => void;
}

export function CurrencyToggle({ language, onChanged }: CurrencyToggleProps) {
  const [enabled, setEnabled] = useState(false);
  const [selectedCurr, setSelectedCurr] = useState('EUR');
  const [rates, setRates] = useState<Record<string, number>>({});
  const [editingRate, setEditingRate] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const pref = getMREPreference();
    setEnabled(pref.enabled);
    setSelectedCurr(pref.currency);
    const currentRates = getExchangeRates();
    setRates(currentRates);
    setEditingRate(currentRates[pref.currency]?.toString() || '');
  }, []);

  const handleToggleMode = (val: boolean) => {
    setEnabled(val);
    setMREPreference(val, selectedCurr);
    if (onChanged) onChanged();
  };

  const handleSelectCurrency = (code: string) => {
    setSelectedCurr(code);
    setMREPreference(enabled, code);
    setEditingRate(rates[code]?.toString() || '');
    if (onChanged) onChanged();
  };

  const handleRateChange = (val: string) => {
    setEditingRate(val);
  };

  const handleSaveRate = () => {
    const num = parseFloat(editingRate);
    if (!isNaN(num) && num > 0) {
      const updated = { ...rates, [selectedCurr]: num };
      setRates(updated);
      saveExchangeRates(updated);
      setIsEditing(false);
      if (onChanged) onChanged();
    }
  };

  return (
    <div className="bg-white p-5 border border-slate-100 rounded-3xl space-y-4 font-sans shadow-sm">
      <div className="flex justify-between items-center pb-2 border-b border-slate-50">
        <div className="space-y-0.5">
          <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <Sparkles size={16} className="text-emerald-600" />
            {t('mreCurrencyToggleTitle', language)}
          </h4>
          <p className="text-[10px] text-slate-400 font-semibold">
            {t('mreCurrencyToggleDesc', language)}
          </p>
        </div>
        
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            id="mre-mode-switch"
            type="checkbox"
            checked={enabled}
            onChange={(e) => handleToggleMode(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-100 rounded-full peer peer-focus:ring-2 peer-focus:ring-emerald-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
        </label>
      </div>

      {enabled && (
        <div className="space-y-4 animate-fade-in">
          {/* Currency Selection */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              {t('selectSecondaryCurrency', language)}
            </span>
            <div className="grid grid-cols-5 gap-2">
              {Object.values(SUPPORTED_CURRENCIES).map((c) => {
                const isSelected = selectedCurr === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelectCurrency(c.code)}
                    className={`py-2 px-1 rounded-xl text-center border-2 transition-all flex flex-col items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/10 text-emerald-900 font-extrabold'
                        : 'border-slate-100 hover:border-slate-200 text-slate-500 font-semibold'
                    }`}
                  >
                    <span className="text-xs">{c.code}</span>
                    <span className="text-[9px] text-slate-400 font-bold">{c.symbol}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rate Editor */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-2.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <Settings size={14} className="text-slate-500" />
                <span className="text-xs font-extrabold text-slate-700">
                  {t('exchangeRateTitle', language)} {selectedCurr}
                </span>
              </div>
              
              {!isEditing ? (
                <button
                  id="edit-rate-btn"
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer"
                >
                  {t('editRate', language)}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    id="cancel-rate-btn"
                    type="button"
                    onClick={() => {
                      setEditingRate(rates[selectedCurr]?.toString() || '');
                      setIsEditing(false);
                    }}
                    className="text-[10px] font-bold text-slate-400 hover:underline cursor-pointer"
                  >
                    {t('cancel', language)}
                  </button>
                  <button
                    id="save-rate-btn"
                    type="button"
                    onClick={handleSaveRate}
                    className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    {t('save', language)}
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    id="exchange-rate-input"
                    type="number"
                    step="0.01"
                    value={editingRate}
                    onChange={(e) => handleRateChange(e.target.value)}
                    className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                  />
                  <span className="text-xs font-bold text-slate-500">MAD</span>
                </div>
              ) : (
                <span className="text-sm font-black text-slate-900">
                  {rates[selectedCurr]} <span className="text-xs text-slate-500 font-bold">DH (MAD)</span>
                </span>
              )}
              
              <span className="text-[9px] text-amber-600 font-extrabold bg-amber-50 border border-amber-100/50 px-1.5 py-0.5 rounded flex items-center gap-1">
                <AlertCircle size={10} />
                {t('indicativeRateWarning', language)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CurrencyToggle;
