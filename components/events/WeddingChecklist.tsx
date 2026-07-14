import React, { useState, useEffect } from 'react';
import { useMoroccanEvents } from '../../hooks/use-moroccan-events';
import { useFamily } from '../../hooks/use-family';
import { useFamilyMembers } from '../../hooks/use-family-members';
import { 
  WEDDING_POSTES, 
  WeddingRegion, 
  getWeddingBudgetEstimate, 
  WEDDING_REGIONS 
} from '../../lib/wedding-budget-template';
import { 
  Check, 
  Share2, 
  Users, 
  Sparkles, 
  Heart, 
  Calendar, 
  TrendingUp, 
  ChevronRight,
  Info
} from 'lucide-react';

interface WeddingChecklistProps {
  lang: 'fr' | 'darija';
}

export function WeddingChecklist({ lang }: WeddingChecklistProps) {
  const { events, createEvent, updateEvent } = useMoroccanEvents();
  const { familyGroup } = useFamily();
  const { members } = useFamilyMembers(familyGroup?.id || '');

  // Find existing wedding event or create default states
  const weddingEvent = events.find(e => e.type === 'wedding');

  // Input states
  const [selectedRegion, setSelectedRegion] = useState<WeddingRegion>('casa_rabat');
  const [customBudget, setCustomBudget] = useState<number>(100000);
  const [showConfig, setShowConfig] = useState(false);

  // States for Checklist item spending
  const [spentStates, setSpentStates] = useState<Record<string, number>>({});
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Split States
  const [splitRatios, setSplitRatios] = useState<Record<string, number>>({}); // memberId -> percentage
  const [splitLabel, setSplitLabel] = useState<string>('Mariage de ma Sœur');

  // Load estimates or load existing values from the Event
  const estimate = getWeddingBudgetEstimate(selectedRegion, customBudget);

  useEffect(() => {
    if (weddingEvent) {
      setCustomBudget(weddingEvent.budget_allocated);
      // Load stored checklist/spent states from localStorage to maintain details
      try {
        const storedSpent = localStorage.getItem(`floussi_wedding_spent_${weddingEvent.id}`);
        if (storedSpent) setSpentStates(JSON.parse(storedSpent));

        const storedChecked = localStorage.getItem(`floussi_wedding_checked_${weddingEvent.id}`);
        if (storedChecked) setCheckedItems(JSON.parse(storedChecked));
      } catch (_) {}
    }
  }, [weddingEvent]);

  // Set default splits if members change
  useEffect(() => {
    if (members && members.length > 0) {
      const defaultShare = Math.round(100 / members.length);
      const initialRatios: Record<string, number> = {};
      members.forEach((m, idx) => {
        initialRatios[m.id] = idx === members.length - 1 ? 100 - (defaultShare * (members.length - 1)) : defaultShare;
      });
      setSplitRatios(initialRatios);
    }
  }, [members]);

  // Sync state to local storage and update total budget spent on the Event
  const handleUpdateItem = async (itemId: string, isChecked: boolean, spentAmt: number) => {
    if (!weddingEvent) return;

    const nextChecked = { ...checkedItems, [itemId]: isChecked };
    const nextSpent = { ...spentStates, [itemId]: spentAmt };

    setCheckedItems(nextChecked);
    setSpentStates(nextSpent);

    localStorage.setItem(`floussi_wedding_checked_${weddingEvent.id}`, JSON.stringify(nextChecked));
    localStorage.setItem(`floussi_wedding_spent_${weddingEvent.id}`, JSON.stringify(nextSpent));

    // Recompute total spent
    const totalSpent = Object.keys(nextSpent).reduce((sum, key) => sum + (nextSpent[key] || 0), 0);
    await updateEvent(weddingEvent.id, { budget_spent: totalSpent });
  };

  const handleCreateWeddingEvent = async () => {
    const today = new Date();
    const eventDate = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());
    const dateStr = eventDate.toISOString().split('T')[0];

    await createEvent({
      name: `Mariage Traditional (${WEDDING_REGIONS[selectedRegion].labelFr})`,
      type: 'wedding',
      start_date: dateStr,
      end_date: dateStr,
      budget_allocated: customBudget,
      budget_spent: 0,
      notes: "Suivi des frais de la salle, traiteur et Neggafa.",
      is_recurring: false
    });
  };

  const handleRatioChange = (memberId: string, percentage: number) => {
    setSplitRatios(prev => ({
      ...prev,
      [memberId]: Math.max(0, Math.min(100, percentage))
    }));
  };

  const t = {
    title: lang === 'darija' ? 'Masrouf d-L3ors (Simulateur Mariage)' : 'Planificateur de Mariage Marocain',
    subtitle: lang === 'darija' ? 'Qedded sandoq d-farh dyalk m3a l-3aila' : 'Calculez les frais typiques selon votre région et divisez les factures en famille en toute sérénité.',
    regionSelect: lang === 'darija' ? 'Mantaqa (Région)' : 'Région du Mariage',
    budgetLabel: lang === 'darija' ? 'Sandoq kamel (Budget Total)' : 'Budget Global Alloué (DH)',
    createEventBtn: lang === 'darija' ? 'Sajel farh dyalk' : 'Activer l\'Événement Mariage',
    checklistTitle: lang === 'darija' ? 'Tafsil d-Diyouf o l-Makla' : 'Checklist & Suivi des Dépenses',
    splitTitle: lang === 'darija' ? 'Farreq l-Kraya m3a l-3aila (Split)' : 'Calculateur de Répartition Familiale',
    splitDesc: lang === 'darija' ? 'Koul wahed chhal ghadi y-khelass f l-farh' : 'Configurez la quote-part de chaque membre de la famille pour financer la fête.',
    allocatedCol: lang === 'darija' ? 'T-9dir' : 'Allocations estimées',
    spentCol: lang === 'darija' ? 'Chhal d-Khalti' : 'Montant Réel payé',
    totalText: lang === 'darija' ? 'L-Majmou3' : 'Total dépensé',
    countdownText: lang === 'darija' ? 'Baqi l l-farh' : 'Temps restant avant le mariage'
  };

  const totalSpent = weddingEvent ? weddingEvent.budget_spent : 0;
  const budgetAllocated = weddingEvent ? weddingEvent.budget_allocated : customBudget;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-3xs space-y-6" id="wedding-planner-card">
      
      {/* Header Traditional vibe */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-50 pb-5">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-black tracking-widest text-pink-600 flex items-center gap-1">
            <Heart size={12} className="fill-pink-600 animate-pulse" />
            <span>Lilet L-Omar • Mariage Traditionnel</span>
          </span>
          <h2 className="text-base font-black text-slate-800 uppercase tracking-tight">
            {t.title}
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Create or show countdown */}
        {!weddingEvent ? (
          <button
            onClick={handleCreateWeddingEvent}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl cursor-pointer transition-all active:scale-95"
          >
            <span>{t.createEventBtn}</span>
            <ChevronRight size={13} />
          </button>
        ) : (
          <div className="bg-pink-50 border border-pink-100 p-3 rounded-2xl flex items-center gap-2">
            <Calendar size={15} className="text-pink-600" />
            <div className="text-right">
              <span className="text-[9px] uppercase font-black text-pink-500 block">Cortège Activé</span>
              <span className="text-xs font-black font-mono text-pink-900">
                Date : {weddingEvent.start_date}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Simulator Inputs (Visible or toggled) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
            {t.regionSelect}
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as WeddingRegion)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden transition-all"
            disabled={!!weddingEvent}
          >
            {Object.keys(WEDDING_REGIONS).map(r => (
              <option key={r} value={r}>
                {lang === 'darija' ? WEDDING_REGIONS[r as WeddingRegion].labelDarija : WEDDING_REGIONS[r as WeddingRegion].labelFr}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
            {t.budgetLabel}
          </label>
          <div className="relative">
            <input
              type="number"
              value={customBudget}
              onChange={(e) => setCustomBudget(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 pr-10 text-xs font-black text-slate-700 focus:outline-hidden font-mono"
              disabled={!!weddingEvent}
              min="10000"
              step="5000"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 font-mono">
              DH
            </span>
          </div>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="space-y-4" id="wedding-checklist-items">
        <h3 className="font-black text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
          <TrendingUp size={14} className="text-pink-600" />
          <span>{t.checklistTitle}</span>
        </h3>

        <div className="space-y-2.5">
          {estimate.breakdown.map(item => {
            const isChecked = !!checkedItems[item.id];
            const spentVal = spentStates[item.id] || 0;
            const allocatedAmt = Math.round(budgetAllocated * item.percentage);

            return (
              <div 
                key={item.id} 
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isChecked 
                    ? 'bg-pink-500/5 border-pink-100' 
                    : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                {/* Checkbox and info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleUpdateItem(item.id, !isChecked, spentVal)}
                    disabled={!weddingEvent}
                    className={`mt-0.5 shrink-0 w-5 h-5 rounded-lg flex items-center justify-center border-2 transition-all cursor-pointer ${
                      isChecked 
                        ? 'bg-pink-600 border-pink-600 text-white' 
                        : 'border-slate-200 hover:border-slate-300 bg-white text-transparent'
                    }`}
                  >
                    <Check size={12} strokeWidth={3} />
                  </button>
                  <div>
                    <h4 className={`text-xs font-black uppercase tracking-wide ${isChecked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {lang === 'darija' ? item.nameDarija : item.nameFr}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                      {lang === 'darija' ? item.descriptionDarija : item.descriptionFr}
                    </p>
                  </div>
                </div>

                {/* Amounts allocation */}
                <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                  <div className="text-right">
                    <span className="text-[8px] uppercase font-black text-slate-400 block">{t.allocatedCol}</span>
                    <span className="font-black text-slate-700">{allocatedAmt.toLocaleString('fr-FR')} DH</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[8px] uppercase font-black text-slate-400 block">{t.spentCol}</span>
                    <input
                      type="number"
                      value={spentVal || ''}
                      onChange={(e) => handleUpdateItem(item.id, isChecked, Number(e.target.value))}
                      placeholder="MAD"
                      disabled={!weddingEvent}
                      className="w-20 bg-slate-50 border border-slate-150 focus:border-pink-500 text-right font-black font-mono rounded-lg px-2 py-1 text-xs focus:outline-hidden transition-all text-pink-900"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Total Bar */}
        {weddingEvent && (
          <div className="bg-slate-900 text-white rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
            <div>
              <span className="text-[8px] uppercase font-black text-slate-400 block">{t.totalText}</span>
              <span className="text-base font-black text-pink-400">
                {totalSpent.toLocaleString('fr-FR')} DH
              </span>
              <span className="text-[10px] text-slate-300 font-semibold uppercase block mt-0.5">
                Sur un budget de {weddingEvent.budget_allocated.toLocaleString('fr-FR')} DH
              </span>
            </div>

            <div className="h-2 flex-1 max-w-xs bg-slate-800 rounded-full overflow-hidden self-center mx-2 relative">
              <div 
                className="h-full bg-pink-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (totalSpent / weddingEvent.budget_allocated) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* FAMILY CONTRIBUTION SPLIT SYSTEM */}
      <div className="border-t border-slate-100 pt-5 space-y-4" id="wedding-split-panel">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="font-black text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
              <Users size={15} className="text-pink-600" />
              <span>{t.splitTitle}</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">
              {t.splitDesc}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-1 text-[9px] font-black uppercase text-pink-700 bg-pink-100 px-2 py-0.5 rounded-md">
            <Sparkles size={11} />
            <span>Smart Family Split</span>
          </div>
        </div>

        {/* Event Label descriptor */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-[8px] uppercase font-black text-slate-400 tracking-wider block mb-1">Motif de la split (Ex: Mariage d'Imane)</label>
            <input
              type="text"
              value={splitLabel}
              onChange={(e) => setSplitLabel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Multi-contributors list */}
        {members.length === 0 ? (
          <p className="text-[11px] text-slate-400 font-bold uppercase">Aucun membre de la famille configuré pour la répartition.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map(m => {
              const ratio = splitRatios[m.id] || 0;
              const computedShare = Math.round((budgetAllocated * ratio) / 100);

              return (
                <div key={m.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`} 
                      alt={m.name} 
                      className="w-8 h-8 rounded-full border border-slate-200 shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-tight">{m.name}</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase font-mono">{computedShare.toLocaleString('fr-FR')} DH ({ratio}%)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono">
                    <input
                      type="number"
                      value={ratio || ''}
                      min="0"
                      max="100"
                      onChange={(e) => handleRatioChange(m.id, Number(e.target.value))}
                      className="w-14 bg-white border border-slate-200 text-center font-black rounded-lg py-1 text-xs text-slate-700"
                    />
                    <span className="text-xs font-black text-slate-400">%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Sum validator */}
        <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl flex items-center justify-between font-mono text-[10px]">
          <span className="text-slate-400 uppercase font-bold flex items-center gap-1">
            <Info size={13} />
            <span>Contrôle d'intégrité</span>
          </span>
          {Object.values(splitRatios).reduce((s, r) => s + r, 0) === 100 ? (
            <span className="text-emerald-600 font-black uppercase">Répartition valide (100%)</span>
          ) : (
            <span className="text-amber-600 font-black uppercase">Incohérent: Total = {Object.values(splitRatios).reduce((s, r) => s + r, 0)}% (doit valoir 100%)</span>
          )}
        </div>
      </div>
    </div>
  );
}
export default WeddingChecklist;
