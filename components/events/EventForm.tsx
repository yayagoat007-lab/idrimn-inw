import React, { useState, useEffect } from 'react';
import { MoroccanEvent, MoroccanEventType } from '../../types';
import { useTranslation } from '../../hooks/use-translation';
import { Calendar, Check, X, ShieldAlert } from 'lucide-react';

interface EventFormProps {
  event?: MoroccanEvent; // If provided we are in edit mode
  onSave: (data: Omit<MoroccanEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  language?: 'fr' | 'darija';
}

const getEventTypes = (language: 'fr' | 'darija'): { value: MoroccanEventType; label: string }[] => [
  { value: 'ramadan', label: 'Ramadan' },
  { value: 'aid_al_fitr', label: language === 'darija' ? 'Eid s-Sghir' : 'Aïd al-Fitr (Sghir)' },
  { value: 'aid_al_adha', label: language === 'darija' ? 'Eid l-Kbir' : 'Aïd al-Adha (Kbir)' },
  { value: 'mawlid', label: language === 'darija' ? 'Mawlid Nabawi' : 'Mawlid al-Nabawi' },
  { value: 'hijri_new_year', label: language === 'darija' ? 'Fatih Moharram' : 'Nouvel an Hijri' },
  { value: 'custom', label: language === 'darija' ? 'Monasaba khassa / 3ailiya' : 'Événement Familial / Perso' }
];

export function EventForm({ event, onSave, onCancel, language: propLanguage }: EventFormProps) {
  const { lang } = useTranslation();
  const language = propLanguage || lang;
  const EVENT_TYPES = getEventTypes(language);

  const [name, setName] = useState(event?.name || '');
  const [type, setType] = useState<MoroccanEventType>(event?.type || 'custom');
  const [startDate, setStartDate] = useState(event?.start_date || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(event?.end_date || new Date().toISOString().split('T')[0]);
  const [budgetAllocated, setBudgetAllocated] = useState<number>(event?.budget_allocated || 0);
  const [budgetSpent, setBudgetSpent] = useState<number>(event?.budget_spent || 0);
  const [notes, setNotes] = useState(event?.notes || '');
  const [isRecurring, setIsRecurring] = useState<boolean>(event?.is_recurring || true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Strict validation
    if (!name.trim()) {
      setError(language === 'darija' ? "3afak dkhil smya dyal l-monasaba." : "Veuillez renseigner le nom de l'événement.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError(language === 'darija' ? "Tarikh d l-bidaya khass ykoun qbel mn tarikh d l-nihaya." : "La date de début doit être antérieure à la date de fin.");
      return;
    }

    if (budgetAllocated <= 0) {
      setError(language === 'darija' ? "Mizaniya khass tkoun kbegh mn 0 DH." : "Le budget alloué doit être supérieur à 0 DH.");
      return;
    }

    onSave({
      name: name.trim(),
      type,
      start_date: startDate,
      end_date: endDate,
      budget_allocated: budgetAllocated,
      budget_spent: budgetSpent,
      notes: notes.trim() || undefined,
      is_recurring: isRecurring
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>
            {event 
              ? (language === 'darija' ? "Beddel l-Monasaba" : "Modifier l'Événement") 
              : (language === 'darija' ? "Zid Monasaba" : "Ajouter un Événement")}
          </span>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name input */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
            {language === 'darija' ? "Smya dyal l-monasaba" : "Nom de l'événement"}
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={language === 'darija' ? "Achoura, Sbou3 d Salma..." : "Ex: Achoura, Mariage de Salma..."}
            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:border-emerald-500 focus:outline-none font-medium"
          />
        </div>

        {/* Type selection */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
            {language === 'darija' ? "No3 d l-monasaba" : "Type d'occasion"}
          </label>
          <select
            value={type}
            onChange={(e: any) => setType(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:border-emerald-500 focus:outline-none font-bold bg-white"
          >
            {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Start Date */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
            {language === 'darija' ? "Tarikh l-bidaya" : "Date de début"}
          </label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:border-emerald-500 focus:outline-none font-mono font-bold"
          />
        </div>

        {/* End Date */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
            {language === 'darija' ? "Tarikh l-nihaya" : "Date de fin"}
          </label>
          <input
            type="date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:border-emerald-500 focus:outline-none font-mono font-bold"
          />
        </div>

        {/* Budget Allocated */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
            {language === 'darija' ? "Mizaniya l-moukhassasa (DH)" : "Budget alloué (MAD)"}
          </label>
          <input
            type="number"
            required
            value={budgetAllocated || ''}
            onChange={(e) => setBudgetAllocated(parseFloat(e.target.value) || 0)}
            placeholder="Cagnotte globale estimée"
            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:border-emerald-500 focus:outline-none font-mono"
          />
        </div>

        {/* Budget Spent */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
            {language === 'darija' ? "Mizaniya lli tsrfa7 (DH)" : "Budget dépensé (MAD)"}
          </label>
          <input
            type="number"
            required
            value={budgetSpent}
            onChange={(e) => setBudgetSpent(parseFloat(e.target.value) || 0)}
            placeholder="Montant déjà réglé"
            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:border-emerald-500 focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* notes */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
          {language === 'darija' ? "Molahadat o details" : "Notes d'organisation / Détails"}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={language === 'darija' ? "Ex: Adoul, khlass d t-traiteur, kwayej l-kessba..." : "Ex: Achat auprès de l'Adoul, réservation traiteur, liste d'achats..."}
          rows={3}
          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:border-emerald-500 focus:outline-none font-medium leading-relaxed"
        />
      </div>

      {/* Recurrence checkbox */}
      <label className="flex items-center gap-2 cursor-pointer pt-1">
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
        />
        <span className="text-xs text-slate-600 font-bold">
          {language === 'darija' ? "Monasaba sanawya (Hijri/Gregorian t-taqribi)" : "Événement annuel récurrent (Calendrier Hijri/Grégorien estimé)"}
        </span>
      </label>

      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-black text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
        >
          {language === 'darija' ? "Yelghi" : "Annuler"}
        </button>
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 px-5 text-xs font-black tracking-wide shadow-md shadow-emerald-500/10 flex items-center gap-1 transition-all"
        >
          <Check className="w-4 h-4" />
          <span>
            {event 
              ? (language === 'darija' ? "Beddel l-monasaba" : "Modifier l'événement") 
              : (language === 'darija' ? "Sajel l-monasaba" : "Créer l'événement")}
          </span>
        </button>
      </div>
    </form>
  );
}
