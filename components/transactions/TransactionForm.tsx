import React, { useState, useRef } from 'react';
import { Camera, Upload, AlertCircle, Calendar, DollarSign, FileText } from 'lucide-react';
import { getTranslation, Language } from '../../lib/i18n';
import { formatCurrency } from '../../lib/utils';
import { useOcr } from '../../hooks/use-ocr';
import { BUCKET_CATEGORIES, MOROCCAN_BANKS } from '../../lib/constants';

interface TransactionFormProps {
  onClose: () => void;
  onSave: (data: any) => void;
  language: Language;
  buckets: any[];
}

export function TransactionForm({ onClose, onSave, language, buckets }: TransactionFormProps) {
  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [merchant, setMerchant] = useState<string>('');
  const [category, setCategory] = useState<string>('food');
  const [accountId, setAccountId] = useState<string>('acc-cash');
  const [bucketId, setBucketId] = useState<string>('');
  const [tags, setTags] = useState<string>('cash');
  const [transactionDate, setTransactionDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // OCR state
  const { scanReceipt, scanning, progress, error: ocrError } = useOcr();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await scanReceipt(file);
      // Fill the form fields dynamically with high precision!
      setAmount(parsed.amount.toString());
      setMerchant(parsed.merchant);
      setDescription(`Skan dyal waraqa (${parsed.merchant})`);
      setCategory(parsed.category);
      setTransactionDate(parsed.date);
      setTags("ocr, " + parsed.category);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount))) return;

    onSave({
      account_id: accountId,
      bucket_id: bucketId || null,
      type,
      amount: parseFloat(amount),
      description,
      merchant: merchant || null,
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      receipt_url: null,
      is_recurring: false,
      recurring_frequency: null,
      transaction_date: transactionDate
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Form Header */}
        <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between text-white">
          <div>
            <h3 className="font-extrabold text-base tracking-tight">
              {getTranslation('addTransaction', language)}
            </h3>
            <p className="text-[10px] text-emerald-100 uppercase tracking-widest font-bold">
              Floussi Cash & Banque
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white font-bold text-sm bg-emerald-700/50 px-2.5 py-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* OCR section */}
        <div className="p-4 bg-emerald-50/50 border-b border-emerald-100/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-emerald-800">
            <Camera size={18} className="text-emerald-600 animate-pulse" />
            <div>
              <p className="font-bold">{getTranslation('scanTicketLabel', language)}</p>
              <p className="text-[10px] text-emerald-600">{getTranslation('scanTicketDesc', language)}</p>
            </div>
          </div>
          
          <div className="w-full sm:w-auto">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <button
              type="button"
              disabled={scanning}
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              {scanning ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{language === 'darija' ? 'Khddam...' : 'Scan...'} ({progress}%)</span>
                </>
              ) : (
                <>
                  <Upload size={14} />
                  <span>{getTranslation('scanReceipt', language)}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main form */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Transaction type toggle */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
            {(['expense', 'income', 'transfer'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                  type === t 
                    ? t === 'expense' ? 'bg-rose-600 text-white shadow-sm' : t === 'income' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {getTranslation(t as any, language)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {getTranslation('amount', language)} (DH) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-bold text-xs">
                  DH
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {getTranslation('date', language)}
              </label>
              <input
                type="date"
                required
                value={transactionDate}
                onChange={e => setTransactionDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {getTranslation('description', language)} *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={getTranslation('descPlaceholder', language)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Account / Bank */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {getTranslation('paymentMethodLabel', language)}
              </label>
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500 transition-colors"
              >
                {MOROCCAN_BANKS.map(bank => (
                  <option key={bank.id} value={bank.id}>
                    {bank.id === 'cash' ? (language === 'darija' ? "Cash (Flouss l'jib)" : "Espèces (Cash)") : bank.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {getTranslation('category', language)}
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500 transition-colors"
              >
                {BUCKET_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Bucket / Compartment allocation */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {getTranslation('linkToSandoqLabel', language)}
              </label>
              <select
                value={bucketId}
                onChange={e => setBucketId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500 transition-colors"
              >
                <option value="">{getTranslation('noCompartmentOption', language)}</option>
                {buckets.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {getTranslation('tagsLabel', language)}
              </label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder={getTranslation('tagsPlaceholder', language)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Merchant */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {getTranslation('merchant', language)}
            </label>
            <input
              type="text"
              value={merchant}
              onChange={e => setMerchant(e.target.value)}
              placeholder={getTranslation('merchantPlaceholder', language)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
            >
              {getTranslation('cancel', language)}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              {getTranslation('save', language)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default TransactionForm;
