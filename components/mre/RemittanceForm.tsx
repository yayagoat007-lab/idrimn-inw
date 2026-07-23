import React, { useState, useEffect } from 'react';
import { SUPPORTED_CURRENCIES, getMREPreference, convertToMAD, getExchangeRates } from '../../lib/currency-exchange';
import { Send, Plus, ArrowRightLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { t } from '../../lib/i18n';

interface RemittanceFormProps {
  language: 'fr' | 'darija';
  onAddSuccess: (record: any) => void;
  isLoading?: boolean;
}

export function RemittanceForm({ language, onAddSuccess, isLoading = false }: RemittanceFormProps) {
  const [pref, setPref] = useState({ enabled: true, currency: 'EUR' });
  const [amountForeign, setAmountForeign] = useState('');
  const [foreignCurrency, setForeignCurrency] = useState('EUR');
  const [exchangeRate, setExchangeRate] = useState<number>(11.0);
  const [recipientName, setRecipientName] = useState('');
  const [recipientRelation, setRecipientRelation] = useState<'parent'|'conjoint'|'enfant'|'autre'>('parent');
  const [method, setMethod] = useState<'virement'|'wafacash'|'cashplus'|'autre'>('virement');
  const [purpose, setPurpose] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const p = getMREPreference();
    setPref(p);
    setForeignCurrency(p.currency);
    const rates = getExchangeRates();
    setExchangeRate(rates[p.currency] || 11.0);
  }, []);

  const handleCurrencyChange = (curr: string) => {
    setForeignCurrency(curr);
    const rates = getExchangeRates();
    setExchangeRate(rates[curr] || SUPPORTED_CURRENCIES[curr]?.defaultRateToMAD || 11.0);
  };

  const amountMAD = parseFloat(amountForeign) ? Math.round(parseFloat(amountForeign) * exchangeRate * 100) / 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountForeign || parseFloat(amountForeign) <= 0) return;
    if (!recipientName) return;

    const record = {
      amountForeign: parseFloat(amountForeign),
      foreignCurrency,
      amountMAD,
      exchangeRateUsed: exchangeRate,
      recipientName,
      recipientRelation,
      method,
      purpose: purpose || undefined,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined
    };

    onAddSuccess(record);

    // Reset Form
    setAmountForeign('');
    setRecipientName('');
    setPurpose('');
    setIsRecurring(false);

    setSuccessMsg(t('remittanceLoggedSuccess', language));
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-5 border border-slate-100 rounded-3xl space-y-4 font-sans shadow-sm">
      <div className="space-y-1">
        <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Send id="remittance-send-icon" size={16} className="text-emerald-600 rotate-[-15deg]" />
          {t('logRemittanceTitle', language)}
        </h4>
        <p className="text-[10px] text-slate-400 font-semibold">
          {t('logRemittanceDesc', language)}
        </p>
      </div>

      {successMsg && (
        <div id="remittance-success-banner" className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle size={16} className="text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* Foreign Amount */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
            {t('foreignAmountLabel', language)}
          </label>
          <div className="relative">
            <input
              id="amount-foreign-input"
              type="number"
              step="any"
              required
              value={amountForeign}
              onChange={(e) => setAmountForeign(e.target.value)}
              placeholder="e.g. 150"
              className="w-full pl-3 pr-16 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
            <select
              id="foreign-currency-select"
              value={foreignCurrency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="absolute right-1 top-1 bottom-1 px-2 py-0 bg-white border border-slate-100 rounded-lg text-[10px] font-bold text-slate-700 focus:outline-none"
            >
              {Object.keys(SUPPORTED_CURRENCIES).map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Exchange Rate (Readonly or editable) */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
            {t('exchangeRateUsedLabel', language)}
          </label>
          <input
            id="exchange-rate-used-input"
            type="number"
            step="0.01"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Conversion Preview */}
      {amountMAD > 0 && (
        <div id="conversion-preview-box" className="p-3 bg-emerald-50/50 border border-emerald-100/60 rounded-2xl flex items-center justify-between text-xs font-extrabold text-emerald-900">
          <span className="flex items-center gap-1">
            <ArrowRightLeft size={13} className="text-emerald-600" />
            {t('estimatedCounterValue', language)}
          </span>
          <span className="text-sm font-black">
            {formatCurrency(amountMAD)}
          </span>
        </div>
      )}

      {/* Recipient Details */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              {t('recipientNameLabel', language)}
            </label>
            <input
              id="recipient-name-input"
              type="text"
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder={language === 'darija' ? 'مثلا: الوالدة، فاطمة...' : 'ex: Maman, Conjoint...'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              {t('recipientRelationLabel', language)}
            </label>
            <select
              id="recipient-relation-select"
              value={recipientRelation}
              onChange={(e) => setRecipientRelation(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
            >
              <option value="parent">{t('relationParent', language)}</option>
              <option value="conjoint">{t('relationConjoint', language)}</option>
              <option value="enfant">{t('relationEnfant', language)}</option>
              <option value="autre">{t('relationAutre', language)}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              {t('transferMethodLabel', language)}
            </label>
            <select
              id="remittance-method-select"
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
            >
              <option value="virement">{t('methodVirement', language)}</option>
              <option value="wafacash">Wafacash</option>
              <option value="cashplus">Cash Plus</option>
              <option value="autre">{t('methodAutreAgency', language)}</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              {t('optionalPurposeLabel', language)}
            </label>
            <input
              id="remittance-purpose-input"
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder={language === 'darija' ? 'مثال: الكراء، التقدية...' : 'ex: Loyer, Hanout...'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Recurrence Switch */}
      <div className="pt-1 flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-xs font-extrabold text-slate-700 block">
            {t('recurringTransferLabel', language)}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold block">
            {t('recurringTransferDesc', language)}
          </span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            id="remittance-recurring-toggle"
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
        </label>
      </div>

      {isRecurring && (
        <div id="recurrence-freq-box" className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
          <span className="text-[10px] font-black text-slate-400 uppercase block tracking-wider">
            {t('remittanceFrequencyLabel', language)}
          </span>
          <select
            id="recurrence-freq-select"
            value={recurringFrequency}
            onChange={(e) => setRecurringFrequency(e.target.value)}
            className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="weekly">{t('weekly', language)}</option>
            <option value="monthly">{t('monthly', language)}</option>
            <option value="quarterly">{t('trimestriel', language)}</option>
          </select>
        </div>
      )}

      {/* Submit Button */}
      <button
        id="submit-remittance-btn"
        type="submit"
        disabled={isLoading || !amountForeign || !recipientName}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-600/15 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-1.5"
      >
        {isLoading ? (
          <RefreshCw size={14} className="animate-spin" />
        ) : (
          <Plus size={14} />
        )}
        <span>{t('addRemittanceButton', language)}</span>
      </button>
    </form>
  );
}

export default RemittanceForm;
