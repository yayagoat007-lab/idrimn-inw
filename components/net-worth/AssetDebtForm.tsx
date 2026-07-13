import React, { useState, useEffect } from 'react';
import { NetWorthItemExtended } from '../../hooks/use-net-worth';
import { Landmark, ShieldAlert, Check, X } from 'lucide-react';

interface AssetDebtFormProps {
  item?: NetWorthItemExtended; // Optional, if provided we are in edit mode
  onSave: (data: Omit<NetWorthItemExtended, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const ASSET_CATEGORIES = [
  "Immobilier", "Véhicule", "Investissements", "Compte bancaire / Épargne / Cash", 
  "Or / Bijoux", "Bétail", "Commerce / Entreprise", "Retraite", "Autres"
];

const LIABILITY_CATEGORIES = [
  "Crédit immobilier", "Crédit auto / Crédit consommation", "Carte crédit", 
  "Prêt étudiant", "Prêt tontine", "Dette familiale", "Autres"
];

export function AssetDebtForm({ item, onSave, onCancel }: AssetDebtFormProps) {
  const [type, setType] = useState<'asset' | 'liability'>(item?.type || 'asset');
  const [name, setName] = useState(item?.name || '');
  const [category, setCategory] = useState('');
  const [currentValue, setCurrentValue] = useState<number>(item?.current_value || 0);
  const [originalValue, setOriginalValue] = useState<number>(item?.original_value || 0);
  const [interestRate, setInterestRate] = useState<string>(item?.interest_rate?.toString() || '');
  const [institution, setInstitution] = useState(item?.institution || '');
  const [acquisitionDate, setAcquisitionDate] = useState(item?.acquisition_date || new Date().toISOString().split('T')[0]);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(item?.monthly_payment || 0);
  const [notes, setNotes] = useState(item?.notes || '');
  const [error, setError] = useState('');

  // Switch category list and select first category by default on type change
  useEffect(() => {
    if (item && item.type === type) {
      setCategory(item.category);
    } else {
      const defaultCats = type === 'asset' ? ASSET_CATEGORIES : LIABILITY_CATEGORIES;
      setCategory(defaultCats[0]);
    }
  }, [type, item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!name.trim()) {
      setError("Veuillez renseigner un nom ou libellé.");
      return;
    }
    if (currentValue <= 0) {
      setError("Le montant ou solde actuel doit être supérieur à 0 DH.");
      return;
    }
    if (originalValue <= 0) {
      setError("Le montant ou valeur d'achat d'origine doit être supérieur à 0 DH.");
      return;
    }

    const rate = interestRate ? parseFloat(interestRate) : null;
    if (rate !== null && (isNaN(rate) || rate < 0 || rate > 100)) {
      setError("Le taux d'intérêt doit être un pourcentage valide entre 0 et 100.");
      return;
    }

    onSave({
      name,
      type,
      category,
      current_value: currentValue,
      original_value: originalValue,
      interest_rate: rate,
      institution: institution.trim() || null,
      acquisition_date: acquisitionDate,
      monthly_payment: type === 'liability' ? monthlyPayment : undefined,
      notes: notes.trim() || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5">
          <Landmark className="w-4 h-4 text-emerald-600" />
          <span>{item ? "Modifier l'élément de Patrimoine" : "Ajouter un élément de Patrimoine"}</span>
        </h3>
        <button 
          type="button" 
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold">
          <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Type selection slider */}
      <div>
        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
          Nature du Patrimoine
        </label>
        <div className="bg-slate-100 p-1 rounded-xl flex">
          <button
            type="button"
            onClick={() => setType('asset')}
            className={`flex-1 text-center font-black py-2 text-xs rounded-lg transition-all ${type === 'asset' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Actif (Ce que je possède - Amlak)
          </button>
          <button
            type="button"
            onClick={() => setType('liability')}
            className={`flex-1 text-center font-black py-2 text-xs rounded-lg transition-all ${type === 'liability' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Dette / Passif (Ce que je dois - Doyoun)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name input */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Libellé / Nom de l'élément
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Appartement à Sidi Maarouf, Crédit Auto..."
            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:border-emerald-500 focus:outline-none font-medium"
          />
        </div>

        {/* Category selector */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Catégorie
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:border-emerald-500 focus:outline-none font-bold"
          >
            {type === 'asset' 
              ? ASSET_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)
              : LIABILITY_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)
            }
          </select>
        </div>

        {/* Current value */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
            {type === 'asset' ? 'Solde ou Valeur Actuelle (MAD)' : 'Capital Restant Dû (MAD)'}
          </label>
          <input
            type="number"
            required
            value={currentValue || ''}
            onChange={(e) => setCurrentValue(parseFloat(e.target.value))}
            placeholder="Solde en Dirham"
            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:border-emerald-500 focus:outline-none font-mono"
          />
        </div>

        {/* Original value */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
            {type === 'asset' ? "Valeur d'acquisition d'origine" : 'Montant Emprunté Initial (MAD)'}
          </label>
          <input
            type="number"
            required
            value={originalValue || ''}
            onChange={(e) => setOriginalValue(parseFloat(e.target.value))}
            placeholder="Montant initial en Dirham"
            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:border-emerald-500 focus:outline-none font-mono"
          />
        </div>

        {/* Institution */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Banque / Établissement (Optionnel)
          </label>
          <input
            type="text"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="Ex: Attijariwafa Bank, CIH..."
            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:border-emerald-500 focus:outline-none font-medium"
          />
        </div>

        {/* Acquisition Date */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Date d'acquisition / d'ouverture
          </label>
          <input
            type="date"
            required
            value={acquisitionDate}
            onChange={(e) => setAcquisitionDate(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:border-emerald-500 focus:outline-none font-mono font-bold"
          />
        </div>

        {/* Interest rate */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Taux d'intérêt annuel (%) (Optionnel)
          </label>
          <input
            type="number"
            step="0.01"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="Ex: 4.25 pour un crédit immobilier"
            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:border-emerald-500 focus:outline-none font-mono"
          />
        </div>

        {/* Monthly payment (Only for debts) */}
        {type === 'liability' && (
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Mensualité à payer (DH/mois)
            </label>
            <input
              type="number"
              value={monthlyPayment || ''}
              onChange={(e) => setMonthlyPayment(parseFloat(e.target.value))}
              placeholder="Montant payé par mois"
              className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:border-rose-500 focus:outline-none font-mono"
            />
          </div>
        )}
      </div>

      {/* Notes / Comments */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
          Commentaire / Notes supplémentaires (Optionnel)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Renseignez toute information utile (Ex: Titre foncier numéro 12345/C...)"
          rows={3}
          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:border-emerald-500 focus:outline-none font-medium leading-relaxed"
        />
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-black text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 px-5 text-xs font-black tracking-wide shadow-md shadow-emerald-500/10 flex items-center gap-1 transition-all"
        >
          <Check className="w-4 h-4" />
          <span>Enregistrer l'élément</span>
        </button>
      </div>
    </form>
  );
}
