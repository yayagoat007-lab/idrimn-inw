import React, { useState } from 'react';
import { X, Sparkles, Check, RefreshCw } from 'lucide-react';
import { AmountInput } from './AmountInput';
import { CategorySelector } from './CategorySelector';
import { AccountSelector } from './AccountSelector';
import { BucketSelector } from './BucketSelector';
import { MerchantAutocomplete } from './MerchantAutocomplete';
import { TagInput } from './TagInput';
import { ReceiptUploader } from './ReceiptUploader';
import { Bucket } from '../../types';
import { useOcr } from '../../hooks/use-ocr';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  buckets: Bucket[];
  onAddTransaction: (txData: any) => Promise<void>;
  language: 'fr' | 'darija';
}

export function QuickAddModal({
  isOpen,
  onClose,
  buckets,
  onAddTransaction,
  language
}: QuickAddModalProps) {
  const [transactionType, setTransactionType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<string>('other');
  const [accountId, setAccountId] = useState<string>('acc-cash');
  const [bucketId, setBucketId] = useState<string | null>(null);
  const [merchant, setMerchant] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [keepOpen, setKeepOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // OCR
  const { scanning: isScanning, scanReceipt } = useOcr();

  if (!isOpen) return null;

  const handleScanReceipt = async (file: File) => {
    try {
      const result = await scanReceipt(file);
      if (result) {
        if (result.amount) setAmount(result.amount);
        if (result.merchant) setMerchant(result.merchant);
        if (result.date) {
          // Can set transaction date if applicable
        }
        // Auto-categorize based on parsed merchant or general
        if (result.merchant?.toLowerCase().includes('marjane') || result.merchant?.toLowerCase().includes('carrefour')) {
          setCategory('food');
          setTags(prev => Array.from(new Set([...prev, 'marjane', 'ocr'])));
        } else {
          setTags(prev => Array.from(new Set([...prev, 'ocr'])));
        }
      }
    } catch (err) {
      console.error("OCR parse error:", err);
    }
  };

  const handleMerchantSelect = (val: string, autoCategory?: string) => {
    setMerchant(val);
    if (autoCategory) {
      setCategory(autoCategory);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert("Veuillez saisir un montant valide supérieur à 0 DH");
      return;
    }

    setIsSaving(true);
    const finalDesc = description.trim() || `${transactionType === 'expense' ? 'Achat' : 'Revenu'} ${merchant || 'sans nom'}`;

    try {
      const payload = {
        account_id: accountId,
        bucket_id: bucketId,
        type: transactionType,
        amount,
        description: finalDesc,
        merchant: merchant || 'Moul Hanout',
        category,
        tags: [...tags, transactionType === 'expense' && accountId === 'acc-cash' ? 'cash' : 'carte'],
        receipt_url: receiptUrl,
        is_recurring: isRecurring,
        recurring_frequency: isRecurring ? 'monthly' : null,
        transaction_date: new Date().toISOString().split('T')[0]
      };

      await onAddTransaction(payload);

      // Trigger a light haptic sensation
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([10, 30, 10]);
      }

      if (keepOpen) {
        // Reset primary fields but keep configuration
        setAmount(0);
        setMerchant('');
        setDescription('');
        setReceiptUrl(null);
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Error saving transaction:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slideUp font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
              Enregistrer un Flux (Flouss)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-150 text-slate-400 hover:text-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Transaction Type Tabs */}
        <div className="grid grid-cols-3 p-1.5 bg-slate-100 m-4 rounded-2xl gap-1">
          {(['expense', 'income', 'transfer'] as const).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setTransactionType(type)}
              className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${transactionType === type ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {type === 'expense' ? 'Dépense' : type === 'income' ? 'Revenu' : 'Transfert'}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* Amount input */}
          <AmountInput 
            value={amount} 
            onChange={setAmount} 
            language={language} 
          />

          {/* Merchant Autocomplete */}
          <MerchantAutocomplete
            value={merchant}
            onChange={handleMerchantSelect}
            language={language}
          />

          {/* Description input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Note / Description (Bayan)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              placeholder="Ajouter un mémo rapide..."
            />
          </div>

          {/* Category Selector */}
          {transactionType === 'expense' && (
            <CategorySelector
              selectedCategoryId={category}
              onChange={setCategory}
              language={language}
            />
          )}

          {/* Account Selector */}
          <AccountSelector
            selectedAccountId={accountId}
            onChange={setAccountId}
            language={language}
          />

          {/* Bucket Selector */}
          {transactionType === 'expense' && (
            <BucketSelector
              buckets={buckets}
              selectedBucketId={bucketId}
              onChange={setBucketId}
              language={language}
            />
          )}

          {/* Tag Input */}
          <TagInput
            tags={tags}
            onChange={setTags}
            language={language}
          />

          {/* Receipt Uploader */}
          <ReceiptUploader
            receiptUrl={receiptUrl}
            onChange={setReceiptUrl}
            onScanTrigger={handleScanReceipt}
            isScanning={isScanning}
            language={language}
          />

          {/* Recurring Options */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-800">Transaction récurrente ?</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Automatique chaque mois</p>
            </div>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded-md"
            />
          </div>

          {/* Keep open option */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 pl-1">
            <input
              type="checkbox"
              id="keepOpenCheck"
              checked={keepOpen}
              onChange={(e) => setKeepOpen(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="keepOpenCheck" className="cursor-pointer select-none">
              Créer une autre transaction après celle-ci
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Sauvegarder</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
