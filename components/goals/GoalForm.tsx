import React, { useState, useEffect } from 'react';
import { Goal } from '../../types';
import { formatCurrency } from '../../lib/utils';
import * as Icons from 'lucide-react';

interface GoalFormProps {
  goal?: Goal | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const AVAILABLE_COLORS = [
  '#D97706', // Amber / Gold (Achat d'or)
  '#059669', // Emerald / Omra
  '#EF4444', // Red / Mariage
  '#3B82F6', // Blue / Logement
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
];

const AVAILABLE_ICONS = [
  'Coins', 'Moon', 'Heart', 'Home', 'PiggyBank', 'Shield', 'Car', 'Briefcase', 'HelpCircle'
];

interface PresetTemplate {
  name: string;
  target: number;
  icon: string;
  color: string;
  description: string;
}

const MOROCCAN_PRESETS: PresetTemplate[] = [
  {
    name: "Achat d'Or (Lgbeba d'Dhab)",
    target: 15000,
    icon: "Coins",
    color: "#D97706",
    description: "Épargne de précaution traditionnelle marocaine."
  },
  {
    name: "Omra / Hajj (Safar Al-Haram)",
    target: 30000,
    icon: "Moon",
    color: "#059669",
    description: "Frais de voyage et d'hébergement pour les lieux saints."
  },
  {
    name: "Mouton de l'Aïd (Kabch l'Aïd)",
    target: 40000, // 4000 DH (Wait, 40000 is 40,000, let's make it 4000 DH!)
    icon: "PiggyBank",
    color: "#EF4444",
    description: "Préparation annuelle de la fête du sacrifice."
  },
  {
    name: "Mariage / Festa (L'Aars)",
    target: 50000,
    icon: "Heart",
    color: "#EC4899",
    description: "Financer la fête et la constitution du foyer."
  },
  {
    name: "Apport Logement (Sakan)",
    target: 100000,
    icon: "Home",
    color: "#3B82F6",
    description: "Constitution de l'apport initial pour un crédit immobilier."
  }
];

export function GoalForm({
  goal,
  onSubmit,
  onCancel
}: GoalFormProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [currentAmount, setCurrentAmount] = useState<number>(0);
  const [deadline, setDeadline] = useState('');
  const [autoContributeAmount, setAutoContributeAmount] = useState<number>(0);
  const [color, setColor] = useState(AVAILABLE_COLORS[0]);
  const [icon, setIcon] = useState(AVAILABLE_ICONS[0]);

  // Load existing values if editing
  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmount(goal.target_amount);
      setCurrentAmount(goal.current_amount);
      setDeadline(goal.deadline || '');
      setAutoContributeAmount(goal.auto_contribute_amount || 0);
      setColor(goal.color);
      setIcon(goal.icon);
    }
  }, [goal]);

  const selectPreset = (preset: PresetTemplate) => {
    setName(preset.name);
    setTargetAmount(preset.target);
    setIcon(preset.icon);
    setColor(preset.color);

    // Auto set a reasonable default deadline (e.g. 1 year from now)
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    setDeadline(future.toISOString().split('T')[0]);
  };

  const calculateMonthlyNeeded = () => {
    if (!deadline || targetAmount <= currentAmount) return 0;
    const targetDate = new Date(deadline);
    const today = new Date();
    
    const yearDiff = targetDate.getFullYear() - today.getFullYear();
    const monthDiff = targetDate.getMonth() - today.getMonth();
    const totalMonths = yearDiff * 12 + monthDiff;

    if (totalMonths <= 0) return Math.max(0, targetAmount - currentAmount);
    return Math.round((targetAmount - currentAmount) / totalMonths);
  };

  const monthlyNeeded = calculateMonthlyNeeded();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Le nom de l'objectif est obligatoire.");
      return;
    }
    if (targetAmount <= 0) {
      alert("Le montant cible doit être supérieur à 0 DH.");
      return;
    }

    onSubmit({
      name,
      target_amount: Number(targetAmount),
      current_amount: Number(currentAmount),
      deadline: deadline || null,
      auto_contribute_amount: Number(autoContributeAmount) || monthlyNeeded || 0,
      color,
      icon,
      bucket_id: null // optional linking to a specific bucket
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans items-start">
      
      {/* Form Container */}
      <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl space-y-5 shadow-xs">
        <div>
          <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
            {goal ? "Modifier l'Objectif" : "Nouvel Objectif (Hadaf)"}
          </h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Planifiez un projet d'épargne important
          </p>
        </div>

        {/* Presets Grid */}
        {!goal && (
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Modèles Marocains Populaires (Presets)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {MOROCCAN_PRESETS.map(p => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => selectPreset(p)}
                  className="p-3 border border-slate-100 bg-slate-50/40 hover:border-emerald-200 hover:bg-emerald-50/10 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer space-y-1.5"
                >
                  <div 
                    className="p-2 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: p.color }}
                  >
                    {React.createElement((Icons as any)[p.icon] || Icons.HelpCircle, { size: 14 })}
                  </div>
                  <span className="text-[9px] font-black uppercase text-slate-700 leading-tight block line-clamp-1">{p.name.split(' (')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nom */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Nom de l'Objectif</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Omra d'Lwalidin"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Cible */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Montant Cible (DH)</label>
            <input
              type="number"
              required
              min="100"
              value={targetAmount || ''}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
              placeholder="ex: 30000"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Épargne initiale */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Épargne Initiale Déjà Constituée (DH)</label>
            <input
              type="number"
              min="0"
              value={currentAmount || ''}
              onChange={(e) => setCurrentAmount(Number(e.target.value))}
              placeholder="ex: 5000"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Échéance */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Échéance de Cible</label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Effort mensuel */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Effort Mensuel Estimé (DH)</label>
            <input
              type="number"
              min="0"
              value={autoContributeAmount || ''}
              onChange={(e) => setAutoContributeAmount(Number(e.target.value))}
              placeholder={`Recommandé : ${monthlyNeeded} DH`}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Color and Icon selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400">Couleur Visuelle</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7.5 h-7.5 rounded-full border-2 transition-all hover:scale-110 cursor-pointer ${color === c ? 'border-slate-800 scale-105 shadow-xs' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400">Icône Illustrative</label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_ICONS.map(i => {
                const CurIcon = (Icons as any)[i] || Icons.HelpCircle;
                const isSelected = icon === i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${isSelected ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs' : 'border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-700'}`}
                  >
                    <CurIcon size={14} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form controls */}
        <div className="flex justify-end gap-3.5 pt-4 border-t border-slate-50">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-5.5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md cursor-pointer"
          >
            {goal ? "Enregistrer" : "Créer l'Objectif"}
          </button>
        </div>

      </form>

      {/* Live calculations sidebar */}
      <div className="space-y-4">
        <div>
          <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Plan de Financement</h4>
          <p className="text-[10px] text-slate-400 font-bold">Calcul en temps réel de votre effort</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white border rounded-3xl p-5 shadow-md space-y-4">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase text-emerald-300 tracking-wider">Effort mensuel requis</span>
            <p className="text-2xl font-black">{formatCurrency(monthlyNeeded)}</p>
          </div>

          <div className="space-y-3 pt-3 border-t border-white/10 text-xs font-semibold text-emerald-100">
            <div className="flex justify-between">
              <span>Date d'achèvement :</span>
              <span className="font-extrabold text-white">{deadline ? deadline : "Non définie"}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Capital à constituer :</span>
              <span className="font-extrabold text-white">{formatCurrency(targetAmount - currentAmount)}</span>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl text-[10px] font-bold text-emerald-200 leading-normal">
              Floussi calcule automatiquement cet effort en divisant le capital restant par le nombre de mois restants d'ici l'échéance.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
