import React, { useState } from 'react';
import { Sparkles, Calendar, HelpCircle, ShieldAlert } from 'lucide-react';
import { FrequencyType } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { t, Language } from '../../lib/i18n';

interface TontineFormProps {
  onSubmit: (data: {
    name: string;
    description: string;
    contribution_amount: number;
    frequency: FrequencyType;
    total_members: number;
    start_date: string;
    allocation_type: 'classic' | 'random' | 'urgency';
    custom_rules: string;
  }) => void;
  onCancel: () => void;
  language: Language;
}

export function TontineForm({ onSubmit, onCancel, language }: TontineFormProps) {
  const isDarija = language === 'darija';
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contribution, setContribution] = useState(1000);
  const [members, setMembers] = useState(10);
  const [frequency, setFrequency] = useState<FrequencyType>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [allocationType, setAllocationType] = useState<'classic' | 'random' | 'urgency'>('classic');
  const [rules, setRules] = useState('');

  // Calculations
  const rounds = members;
  const totalReceivedPerMember = contribution * members;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contribution < 100) {
      alert(isDarija ? "L-Mousahama l-qasira hiya 100 DH." : "La contribution minimale est de 100 DH.");
      return;
    }
    if (members < 2 || members > 20) {
      alert(isDarija ? "Khass l-a3da' ikon bin 2 o 20 de nass." : "Le nombre de membres doit être compris entre 2 et 20.");
      return;
    }

    onSubmit({
      name,
      description,
      contribution_amount: contribution,
      frequency,
      total_members: members,
      start_date: startDate,
      allocation_type: allocationType,
      custom_rules: rules
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto bg-white p-5 rounded-2xl border border-slate-150">
      <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
        <Sparkles className="w-4.5 h-4.5 text-emerald-600" />
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
          {isDarija ? "Dir Jmâa / Daret jdid" : "Créer une Jmâa / Daret"}
        </h3>
      </div>

      <div className="space-y-3">
        {/* Name */}
        <div className="text-[10px] font-bold text-slate-500">
          <label className="block mb-1">{isDarija ? "Smiya dyal Jmâa" : "Nom de la Jmâa"}</label>
          <input 
            type="text" 
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500"
            placeholder={isDarija ? "مثلا: دارت الخير" : "Ex: Daret El Kheir"}
          />
        </div>

        {/* Description */}
        <div className="text-[10px] font-bold text-slate-500">
          <label className="block mb-1">{isDarija ? "Tafsil" : "Description"}</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 min-h-[50px]"
            placeholder={isDarija ? "دارت بين العائلة..." : "Solidarité de dar entre cousins..."}
          />
        </div>

        {/* Contribution & Members */}
        <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-slate-500">
          <div>
            <label className="block mb-1">
              {isDarija ? "Mousahama dyal koula membru (min 100 DH)" : "Cotisation par membre (min 100 DH)"}
            </label>
            <input 
              type="number" 
              required
              min="100"
              value={contribution}
              onChange={(e) => setContribution(Number(e.target.value))}
              className="w-full border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block mb-1">{isDarija ? "A3da' (2 bin 20)" : "Membres (2 à 20)"}</label>
            <input 
              type="number" 
              required
              min="2"
              max="20"
              value={members}
              onChange={(e) => setMembers(Number(e.target.value))}
              className="w-full border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Frequency & Start Date */}
        <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-slate-500">
          <div>
            <label className="block mb-1">{isDarija ? "Doora (Fréquence)" : "Fréquence"}</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as any)}
              className="w-full border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-700 bg-white cursor-pointer"
            >
              <option value="weekly">{isDarija ? "Simana" : "Hebdomadaire"}</option>
              <option value="monthly">{isDarija ? "Chhriya" : "Mensuelle"}</option>
              <option value="quarterly">{isDarija ? "Koul 3 chhour" : "Trimestrielle"}</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">{isDarija ? "Tarikh dyal l-bdyan" : "Date de début"}</label>
            <input 
              type="date" 
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Allocation types */}
        <div className="text-[10px] font-bold text-slate-500">
          <label className="block mb-1">{isDarija ? "Tariqa dyal t-teqssim (Ordre)" : "Type de Répartition (Ordre)"}</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'classic', label: isDarija ? 'Classique (B\'noba)' : 'Classique (Ordre fixe)' },
              { id: 'random', label: isDarija ? 'Qor\'a (Aléatoire)' : 'Tirage (Aléatoire)' },
              { id: 'urgency', label: isDarija ? 'Mosta\'jala (Vote)' : 'Urgence (Vote)' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setAllocationType(t.id as any)}
                className={`p-2 border text-center rounded-lg transition-all cursor-pointer ${
                  allocationType === t.id 
                    ? 'border-emerald-500 bg-emerald-50/10 text-emerald-800 font-bold' 
                    : 'border-slate-150 hover:border-slate-300 text-slate-600'
                }`}
              >
                <span className="text-[8px] uppercase tracking-wide leading-tight">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Rules text area */}
        <div className="text-[10px] font-bold text-slate-500">
          <label className="block mb-1">{isDarija ? "Qawanin aw chourout khassa" : "Règles ou clauses spécifiques"}</label>
          <textarea 
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 min-h-[40px]"
            placeholder={isDarija ? "مثلا: خاص كود PIN باش نأكدو..." : "Ex: Le code PIN 4 chiffres est obligatoire pour valider..."}
          />
        </div>

        {/* Dynamic Preview panel */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-[10px] font-bold text-slate-600 space-y-1">
          <div className="flex justify-between">
            <span>{isDarija ? "Majmou3 dyal mousahamat :" : "Contributions totales :"}</span>
            <span className="text-slate-800">{rounds} {isDarija ? "marat" : "fois"} x {contribution} DH</span>
          </div>
          <div className="flex justify-between text-emerald-700">
            <span>{isDarija ? "Koulchi lli ghayakhod l-membru :" : "Total collecté par membre :"}</span>
            <span>{formatCurrency(totalReceivedPerMember)}</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-slate-200 hover:border-slate-300 text-slate-600 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all text-center cursor-pointer"
        >
          {t('cancel', language)}
        </button>

        <button
          type="submit"
          className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all text-center cursor-pointer"
        >
          {isDarija ? "Kteb o bda" : "Valider & Créer"}
        </button>
      </div>
    </form>
  );
}
export default TontineForm;
