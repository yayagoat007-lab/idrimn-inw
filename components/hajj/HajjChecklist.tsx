import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, ClipboardList, ShieldAlert, Check } from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: 'docs' | 'gear' | 'health';
  textFr: string;
  textDarija: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Documents
  { id: 'passport', category: 'docs', textFr: 'Passeport biométrique valide (+6 mois)', textDarija: 'Passeport biométrique khdam' },
  { id: 'visa', category: 'docs', textFr: 'Visa Hajj ou Omra approuvé', textDarija: 'Visa maqboula' },
  { id: 'vaccin', category: 'docs', textFr: 'Carnet de vaccination (Méningite, Grippe, etc.)', textDarija: 'Daftar Talqi7at (Meningite)' },
  { id: 'photos', category: 'docs', textFr: 'Photos d\'identité récentes fond blanc', textDarija: 'Sowar d-Id' },
  { id: 'billets', category: 'docs', textFr: 'Billets d\'avion imprimés & réservation hôtel', textDarija: 'Tawssiyat d-Tayara o l-Outil' },

  // Gear/Clothing
  { id: 'ihram', category: 'gear', textFr: 'Vêtements de l\'Ihram (sans coutures, blanc)', textDarija: 'Lbsat l-Ihram (2 pieces, bda)' },
  { id: 'ceinture', category: 'gear', textFr: 'Ceinture porte-billets/téléphone sécurisée', textDarija: 'Smeta dyal l-flouss o l-bortabl' },
  { id: 'sandales', category: 'gear', textFr: 'Sandales confortables adaptées (sans coutures)', textDarija: 'Sndala rtaba o sahla' },
  { id: 'parapluie', category: 'gear', textFr: 'Parapluie pliant léger pour le soleil', textDarija: 'Mdal d-Chams' },
  { id: 'sac_dos', category: 'gear', textFr: 'Petit sac à dos pour les déplacements (Arafat)', textDarija: 'Saka d-Dahr sghira' },

  // Health
  { id: 'meds', category: 'health', textFr: 'Trousse de médicaments personnels prescrits', textDarija: 'Dwa dyalk l-khass' },
  { id: 'antalgic', category: 'health', textFr: 'Antalgiques (Paracétamol) & Anti-inflammatoires', textDarija: 'Dwa d-Rass (Paracetamol)' },
  { id: 'pansements', category: 'health', textFr: 'Pansements ampoules, désinfectant & compresses', textDarija: 'Fachat o m3aqim' },
  { id: 'hydratation', category: 'health', textFr: 'Sachets de réhydratation orale & crème anti-irritations', textDarija: 'Krimat d-Hok o r-Rtot' },
  { id: 'masques', category: 'health', textFr: 'Masques chirurgicaux protecteurs (poussière/foule)', textDarija: 'Kamamat d-Ghbar' },
];

interface HajjChecklistProps {
  lang: 'fr' | 'darija';
}

export function HajjChecklist({ lang }: HajjChecklistProps) {
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('floussi_hajj_checklist');
      if (stored) {
        setCheckedIds(JSON.parse(stored));
      }
    } catch (_) {}
  }, []);

  const toggleItem = (id: string) => {
    const next = { ...checkedIds, [id]: !checkedIds[id] };
    setCheckedIds(next);
    localStorage.setItem('floussi_hajj_checklist', JSON.stringify(next));
  };

  const t = {
    title: lang === 'darija' ? 'Wajibat o Lawazim (Checklist)' : 'Checklist de Préparation',
    docsTitle: lang === 'darija' ? 'Waraq o Wiraqat (Documents)' : 'Documents & Formalités',
    gearTitle: lang === 'darija' ? 'Hwayej o Lbsat (Vêtements & Équipements)' : 'Habits & Bagages',
    healthTitle: lang === 'darija' ? 'Se77a o Dwa (Santé & Pharmacie)' : 'Santé & Trousse Médicale',
    percentLabel: lang === 'darija' ? 'Mwajed b' : 'Préparé à',
    completedMsg: lang === 'darija' ? 'Allah y-Taqabbal ! Ga3 lawazim mwajdin ! 🕋✨' : 'Félicitations, tout est prêt ! Qu\'Allah accepte votre pèlerinage ! 🕋✨'
  };

  const totalCount = CHECKLIST_ITEMS.length;
  const completedCount = CHECKLIST_ITEMS.filter(item => checkedIds[item.id]).length;
  const percentage = Math.round((completedCount / totalCount) * 100) || 0;

  const renderCategory = (category: 'docs' | 'gear' | 'health', title: string) => {
    const items = CHECKLIST_ITEMS.filter(x => x.category === category);
    return (
      <div className="space-y-2.5">
        <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-400">{title}</h4>
        <div className="space-y-2">
          {items.map(item => {
            const isChecked = !!checkedIds[item.id];
            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full flex items-center gap-3 text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isChecked 
                    ? 'bg-emerald-500/5 border-emerald-100 text-slate-700' 
                    : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600'
                }`}
              >
                <div className={`shrink-0 transition-transform active:scale-90 ${isChecked ? 'text-emerald-600' : 'text-slate-300'}`}>
                  {isChecked ? (
                    <div className="w-5 h-5 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="w-5 h-5 border-2 border-slate-200 rounded-lg" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-black transition-all ${isChecked ? 'line-through text-slate-400 font-bold' : 'text-slate-800'}`}>
                    {lang === 'darija' ? item.textDarija : item.textFr}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-3xs space-y-5" id="hajj-preparation-checklist">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
          <ClipboardList size={16} className="text-emerald-600" />
          <span>{t.title}</span>
        </h3>
        <span className="text-[10px] font-mono font-black bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md">
          {completedCount}/{totalCount} ({percentage}%)
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
        <div 
          className="h-full bg-emerald-600 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {percentage === 100 && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center">
          <p className="text-xs text-emerald-800 font-black tracking-tight">{t.completedMsg}</p>
        </div>
      )}

      {/* Checklist Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {renderCategory('docs', t.docsTitle)}
        {renderCategory('gear', t.gearTitle)}
        {renderCategory('health', t.healthTitle)}
      </div>
    </div>
  );
}
export default HajjChecklist;
