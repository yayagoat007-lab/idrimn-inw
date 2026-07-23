import React from 'react';
import { useTranslation } from '../../hooks/use-translation';

interface SidiQuickChipsProps {
  onChipClick: (text: string) => void;
}

const CHIPS_FR = [
  { label: "Voir mon solde 💰", text: "Chhal andi flouss ?" },
  { label: "Ajouter dépense 💸", text: "Sraft 45 DH f l'makla" },
  { label: "Prochaine Jmâa 🤝", text: "Quand est ma prochaine tontine daret ?" },
  { label: "Mes objectifs 🕋", text: "Progrès de mon objectif épargne" },
  { label: "Raconte une nokta ! 😂", text: "Raconte moi une blague sidi floussi !" },
  { label: "Comment économiser ? 💡", text: "Donne moi des conseils d'épargne" }
];

const CHIPS_DARIJA = [
  { label: "Chouf r-rassid 💰", text: "Chhal andi flouss ?" },
  { label: "Zid masrouf 💸", text: "Sraft 45 DH f l'makla" },
  { label: "Daret l-jayya 🤝", text: "Quand est ma prochaine tontine daret ?" },
  { label: "Ahdaf dyali 🕋", text: "Progrès de mon objectif épargne" },
  { label: "Awed lya nokta ! 😂", text: "Raconte moi une blague sidi floussi !" },
  { label: "Kifach n-khbi l-flouss ? 💡", text: "Donne moi des conseils d'épargne" }
];

export function SidiQuickChips({ onChipClick }: SidiQuickChipsProps) {
  const { lang } = useTranslation();
  const chips = lang === 'darija' ? CHIPS_DARIJA : CHIPS_FR;

  return (
    <div
      className="flex items-center gap-2 overflow-x-auto pb-2 px-4 no-scrollbar scroll-smooth"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      id="sidi-quick-chips"
    >
      {chips.map((chip, idx) => (
        <button
          key={idx}
          id={`quick-chip-${idx}`}
          onClick={() => onChipClick(chip.text)}
          className="shrink-0 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:text-slate-800 rounded-full shadow-sm transition-all text-left"
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
export default SidiQuickChips;
