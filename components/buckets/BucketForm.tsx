import React, { useState, useEffect } from 'react';
import { Bucket } from '../../types';
import { formatCurrency } from '../../lib/utils';
import * as Icons from 'lucide-react';
import { Language, t } from '../../lib/i18n';

interface BucketFormProps {
  bucket?: Bucket | null;
  buckets: Bucket[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  limitReached: boolean;
  language: Language;
}

const AVAILABLE_COLORS = [
  '#10B981', // Emerald / Green
  '#3B82F6', // Blue / Housing
  '#EF4444', // Red / Food
  '#8B5CF6', // Purple / Tontine
  '#D97706', // Gold / Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#14B8A6', // Teal
  '#F59E0B', // Saffron / Orange
  '#6366F1', // Indigo
];

const AVAILABLE_ICONS = [
  'Utensils', 'Home', 'Users', 'Coins', 'Car', 'ShoppingBag', 'Tv', 
  'HeartPulse', 'GraduationCap', 'Plane', 'TrendingUp', 'Smartphone', 'HelpCircle'
];

export function BucketForm({
  bucket,
  buckets,
  onSubmit,
  onCancel,
  limitReached,
  language
}: BucketFormProps) {
  const [name, setName] = useState('');
  const [allocatedAmount, setAllocatedAmount] = useState<number>(0);
  const [color, setColor] = useState(AVAILABLE_COLORS[0]);
  const [icon, setIcon] = useState(AVAILABLE_ICONS[0]);
  const [isEssential, setIsEssential] = useState(true);
  const [category, setCategory] = useState('alimentation');
  const [parentId, setParentId] = useState<string | null>(null);

  // Load existing values if we are editing
  useEffect(() => {
    if (bucket) {
      setName(bucket.name);
      setAllocatedAmount(bucket.allocated_amount);
      setColor(bucket.color);
      setIcon(bucket.icon);
      setIsEssential(bucket.is_essential);
      setCategory(bucket.category);
      setParentId(bucket.parent_id || null);
    }
  }, [bucket]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert(t('nameRequired', language));
      return;
    }
    if (allocatedAmount < 0) {
      alert(t('amountPositive', language));
      return;
    }

    onSubmit({
      name,
      allocated_amount: Number(allocatedAmount),
      spent_amount: bucket ? bucket.spent_amount : 0,
      color,
      icon,
      is_essential: isEssential,
      category,
      parent_id: parentId || null,
      auto_allocate_percent: bucket ? bucket.auto_allocate_percent : 0,
      order_index: bucket ? bucket.order_index : buckets.length
    });
  };

  const IconComponent = (Icons as any)[icon] || Icons.HelpCircle;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans items-start">
      
      {/* Form Container */}
      <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl space-y-5 shadow-xs">
        <div>
          <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
            {bucket ? t('editSandoq', language) : t('newSandoq', language)}
          </h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            {t('configureSandoq', language)}
          </p>
        </div>

        {limitReached && !bucket && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-xs font-semibold text-rose-700">
            {t('freeLimitReached', language)}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nom du sandoq */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">{t('compartmentName', language)}</label>
            <input
              type="text"
              required
              value={name}
              disabled={limitReached && !bucket}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('placeholderTransport', language)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
            />
          </div>

          {/* Allocation mensuelle cible */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">{t('monthlyAllocation', language)}</label>
            <input
              type="number"
              required
              min="0"
              value={allocatedAmount}
              disabled={limitReached && !bucket}
              onChange={(e) => setAllocatedAmount(Number(e.target.value))}
              placeholder="ex: 1200"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Catégorie */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">{t('expenseType', language)}</label>
            <select
              value={category}
              disabled={limitReached && !bucket}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
            >
              <option value="alimentation">{language === 'darija' ? "Alimentation (Mawla l-Makla)" : "Alimentation"}</option>
              <option value="logement">{language === 'darija' ? "Logement (Dar)" : "Logement"}</option>
              <option value="transport">{language === 'darija' ? "Transport (Taxi/Tobis)" : "Transport"}</option>
              <option value="telecom">{language === 'darija' ? "Télécom (Inwi/MarocTel)" : "Télécom"}</option>
              <option value="factures">{language === 'darija' ? "Factures (Kahraba/Ma)" : "Factures"}</option>
              <option value="sante">{language === 'darija' ? "Santé (Sbitar)" : "Santé"}</option>
              <option value="education">{language === 'darija' ? "Éducation (Madrassa)" : "Éducation"}</option>
              <option value="loisirs">{language === 'darija' ? "Loisirs & Café (Kawa)" : "Loisirs & Café"}</option>
              <option value="epargne">{language === 'darija' ? "Épargne (Khbi l-Flouss)" : "Épargne"}</option>
              <option value="tontine">{language === 'darija' ? "Tontine (Daret)" : "Tontine (Daret)"}</option>
              <option value="impots">{language === 'darija' ? "Impôts & Cotisations" : "Impôts & Cotisations"}</option>
              <option value="non_categorise">{language === 'darija' ? "Autre (Hwayej khrin)" : "Autre / Divers"}</option>
            </select>
          </div>

          {/* Parent Bucket (for hierarchy) */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">{t('parentSandoq', language)}</label>
            <select
              value={parentId || ''}
              disabled={limitReached && !bucket}
              onChange={(e) => setParentId(e.target.value ? e.target.value : null)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
            >
              <option value="">{t('nonePrincipalSandoq', language)}</option>
              {buckets
                .filter(b => b.id !== bucket?.id && !b.parent_id) // only allow root buckets as parents
                .map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
            </select>
          </div>
        </div>

        {/* Essential Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
          <div className="space-y-0.5">
            <p className="text-xs font-black text-slate-800">{t('essentialSandoq', language)}</p>
            <p className="text-[10px] text-slate-400 font-bold">{t('essentialSandoqDesc', language)}</p>
          </div>
          <button
            type="button"
            disabled={limitReached && !bucket}
            onClick={() => setIsEssential(!isEssential)}
            className={`w-12 h-6.5 rounded-full p-1 transition-all ${isEssential ? 'bg-emerald-500' : 'bg-slate-200'} cursor-pointer disabled:opacity-50`}
          >
            <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transition-transform ${isEssential ? 'translate-x-5.5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Color selection */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400">{t('visualColor', language)}</label>
          <div className="flex flex-wrap gap-2.5">
            {AVAILABLE_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 cursor-pointer ${color === c ? 'border-slate-800 scale-105 shadow-sm' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Icon picker selection */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400">{t('illustrativeIcon', language)}</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_ICONS.map(i => {
              const CurIcon = (Icons as any)[i] || Icons.HelpCircle;
              const isSelected = icon === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs scale-105' : 'border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-700'}`}
                >
                  <CurIcon size={16} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Form controls */}
        <div className="flex justify-end gap-3.5 pt-4 border-t border-slate-50">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-colors cursor-pointer"
          >
            {t('cancel', language)}
          </button>
          <button
            type="submit"
            disabled={limitReached && !bucket}
            className="px-5.5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            {bucket ? t('save', language) : t('createSandoq', language)}
          </button>
        </div>

      </form>

      {/* Live Preview Column */}
      <div className="space-y-4">
        <div>
          <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">{t('livePreview', language)}</h4>
          <p className="text-[10px] text-slate-400 font-bold">{t('livePreviewDesc', language)}</p>
        </div>

        <div 
          className="bg-white border rounded-3xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between h-48 space-y-4 border-slate-100"
        >
          {/* Glow effect */}
          <div className="absolute -right-8 -top-8 w-16 h-16 rounded-full filter blur-2xl opacity-10" style={{ backgroundColor: color }} />

          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-3">
              <div 
                className="p-3 rounded-2xl text-white flex items-center justify-center shadow-xs"
                style={{ backgroundColor: color }}
              >
                <IconComponent size={18} />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-800 leading-snug line-clamp-1">
                  {name || t('newCompartment', language)}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-black uppercase text-slate-400">
                    {category.toUpperCase()}
                  </span>
                  {parentId && (
                    <span className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 text-[8px] font-black uppercase text-slate-500 rounded-md">
                      Sous-bucket
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <span className={`px-2 py-0.5 border text-[9px] font-black uppercase rounded-full ${isEssential ? 'bg-amber-50 text-amber-800 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
              {isEssential ? 'Daroni' : 'Optionnel'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-baseline text-[10px] font-bold text-slate-400">
              <span>{t('spentLabel', language)}{formatCurrency(0)}</span>
              <span>{t('allocatedLabel', language)}{formatCurrency(allocatedAmount)}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: '0%', backgroundColor: color }}
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
