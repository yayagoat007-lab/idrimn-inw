import React, { useState, useEffect } from 'react';
import { 
  getHajjBudgetEstimate, 
  HajjSeason, 
  ProximityLevel 
} from '../../../lib/hajj-budget-template';
import { HajjBudgetBreakdown } from '../../../components/hajj/HajjBudgetBreakdown';
import { HajjChecklist } from '../../../components/hajj/HajjChecklist';
import { useGoals } from '../../../hooks/use-goals';
import { useFamily } from '../../../hooks/use-family';
import { useFamilyMembers } from '../../../hooks/use-family-members';
import { useAuth } from '../../../hooks/use-auth';
import { 
  Moon, 
  Target, 
  Calendar, 
  Plus, 
  Users, 
  Heart, 
  Compass, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';

interface HajjPlannerPageProps {
  language: 'fr' | 'darija';
}

export default function HajjPlannerPage({ language }: HajjPlannerPageProps) {
  const [season, setSeason] = useState<HajjSeason>('hajj');
  const [proximity, setProximity] = useState<ProximityLevel>('mid');
  const [targetDate, setTargetDate] = useState<string>('2027-05-15');
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  // Load hooks
  const { profile } = useAuth();
  const userId = profile?.id || "mock-user-id-9999";
  const { goals, createGoal, contributeToGoal, loading: goalsLoading } = useGoals(userId);
  const { familyGroup } = useFamily();
  const { members, loading: familyLoading } = useFamilyMembers(familyGroup?.id || '');

  // Contribution Form states
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState<string>('');
  const [contributionAmount, setContributionAmount] = useState<string>('');
  const [contributionNote, setContributionNote] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Calculate Hajj Budget Estimate
  const estimate = getHajjBudgetEstimate(proximity, season);

  // Check if Hajj goal exists
  const hajjGoal = goals.find(g => g.name.toLowerCase().includes('hajj') || g.name.toLowerCase().includes('omra'));

  useEffect(() => {
    if (targetDate) {
      const target = new Date(targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diff = target.getTime() - today.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      setDaysRemaining(days > 0 ? days : 0);
    } else {
      setDaysRemaining(null);
    }
  }, [targetDate]);

  // Set default family member
  useEffect(() => {
    if (members && members.length > 0) {
      setSelectedFamilyMemberId(members[0].id);
    }
  }, [members]);

  const handleCreateGoal = async () => {
    // Generate average of min and max for goal target
    const targetAmt = Math.round((estimate.total.min + estimate.total.max) / 2);
    await createGoal({
      name: `Objectif Omra / Hajj (${season === 'hajj' ? 'Hajj' : 'Omra'})`,
      target_amount: targetAmt,
      current_amount: 0,
      deadline: targetDate || '2027-05-15',
      bucket_id: null,
      color: '#059669', // Emerald / Green
      icon: 'Moon',
      auto_contribute_amount: 1500
    });
    setSuccessMsg(language === 'darija' ? 'Hadaf d-Hajj t-zad ! 🕋' : 'Objectif d\'épargne Hajj créé avec succès ! 🕋');
    setTimeout(() => setSuccessMsg(''), 4000);

    // Unlock Hajj pilgrim badge
    import('../../../lib/gamification').then(({ unlockGlobalBadge }) => {
      unlockGlobalBadge(userId, 'hajj_pilgrim');
    }).catch(err => console.error(err));
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hajjGoal) return;
    const amountNum = parseFloat(contributionAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const member = members.find(m => m.id === selectedFamilyMemberId);
    const memberName = member ? member.name : 'Famille';
    const noteText = contributionNote.trim() || `Sandoq d-Hajj par ${memberName}`;

    await contributeToGoal(hajjGoal.id, amountNum, noteText);
    setContributionAmount('');
    setContributionNote('');
    setSuccessMsg(
      language === 'darija' 
        ? `Zidna ${amountNum} DH l hadaf ! Chokran ${memberName}` 
        : `Contribution de ${amountNum} DH enregistrée pour ${memberName} !`
    );
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const t = {
    title: language === 'darija' ? 'Rawaj d-Hajj o l-Omra' : 'Planificateur Hajj & Omra',
    subtitle: language === 'darija' ? 'Ihmi d-Diba o bni l-Budget dyalk l-Safar al-Haram' : 'Simulez votre budget, configurez votre cagnotte et préparez les rituels sacrés en famille.',
    optionsTitle: language === 'darija' ? 'Khiyarat l-Safar' : 'Options du Voyage',
    seasonLabel: language === 'darija' ? 'Moussem' : 'Saison de voyage',
    seasonHajj: language === 'darija' ? 'Hajj' : 'Hajj (Saison officielle)',
    seasonOmraRamadan: language === 'darija' ? 'Omra (Ramadan)' : 'Omra - Ramadan (Pic)',
    seasonOmraLow: language === 'darija' ? 'Omra (Kharij Moussem)' : 'Omra - Basse Saison',
    proximityLabel: language === 'darija' ? '9orb l-Outil m Kaaba' : 'Proximité de l\'Hôtel à Makkah',
    proxNear: language === 'darija' ? '9rib bzaf (0-300m)' : 'Très proche (0-300m, Luxe)',
    proxMid: language === 'darija' ? '9rib chwiya (300m-1km)' : 'Moyenne (300m-1km, Standard)',
    proxFar: language === 'darija' ? 'B3id (+1km / Bus)' : 'Éloigné (+1km / Navettes)',
    estimatedTotal: language === 'darija' ? 'Budget l-Kamel' : 'Estimation Budget Total',
    daysLeft: language === 'darija' ? 'Yom baqi' : 'jours restants',
    goalLinkTitle: language === 'darija' ? 'Hadaf dyal l-Iddikhar' : 'Suivi de l\'Épargne Hajj',
    createGoalBtn: language === 'darija' ? 'Dir Hadaf d-Hajj f Floussi' : 'Créer un Objectif d\'Épargne',
    goalStatusText: language === 'darija' ? 'Jma3ti' : 'Épargné',
    familyContributionTitle: language === 'darija' ? 'Mosahamat l-Aila' : 'Contribution Familiale Collective',
    familyDesc: language === 'darija' ? 'Koul wahed f l-Aila y-qdar y-sara3 had l-hadaf' : 'Partagez l\'effort : enregistrez des contributions de différents membres de la famille pour cet objectif sacré.',
    memberSelect: language === 'darija' ? 'Chkoune ghadi y-sara3' : 'Membre contributeur',
    contributeBtn: language === 'darija' ? 'Sajel Contribution' : 'Enregistrer la Contribution',
    officialDisclaimer: language === 'darija' ? 'Had l-arqam ghir ta9ribiya o machi rasmiya mn l-Wizara.' : 'Ces fourchettes sont des estimations de marché indicatives basées sur les tarifs marocains récents et ne constituent pas une offre officielle du Ministère des Habous ou d\'une agence agréée.'
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8 pb-24 font-sans" id="hajj-planner-page">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Moroccan Islamic Theme Banner */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-3xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2 relative z-10">
            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 flex items-center gap-1.5">
              <Compass className="animate-spin" size={13} style={{ animationDuration: '6s' }} />
              <span>Safar Al-Haram • Voyage Sacré</span>
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
              <span>{t.title}</span>
              <span className="text-emerald-600">🕋</span>
            </h1>
            <p className="text-xs text-slate-500 font-bold max-w-2xl leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          {/* Countdown timer widget */}
          {daysRemaining !== null && (
            <div className="bg-emerald-950 text-emerald-100 p-4 rounded-2xl border border-emerald-800 shrink-0 text-center flex flex-col items-center justify-center min-w-36 shadow-md shadow-emerald-950/10 font-mono">
              <Calendar size={18} className="text-emerald-400 mb-1" />
              <span className="text-2xl font-black tracking-tight">{daysRemaining}</span>
              <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-300">{t.daysLeft}</span>
            </div>
          )}
        </div>

        {/* Info Alerts & Success messages */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-black p-4 rounded-2xl text-center shadow-3xs animate-fadeIn">
            {successMsg}
          </div>
        )}

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Options & Simulator Column */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-3xs space-y-6">
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Target size={16} className="text-emerald-600" />
                <span>{t.optionsTitle}</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Season Field */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    {t.seasonLabel}
                  </label>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setSeason('hajj')}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all text-xs font-black cursor-pointer flex items-center justify-between ${
                        season === 'hajj' 
                          ? 'bg-emerald-600 border-transparent text-white shadow-md shadow-emerald-100' 
                          : 'bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{t.seasonHajj}</span>
                      <span className={season === 'hajj' ? 'text-white/80' : 'text-slate-400 font-mono'}>
                        Hajj
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSeason('ramadan')}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all text-xs font-black cursor-pointer flex items-center justify-between ${
                        season === 'ramadan' 
                          ? 'bg-emerald-600 border-transparent text-white shadow-md shadow-emerald-100' 
                          : 'bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{t.seasonOmraRamadan}</span>
                      <span className={season === 'ramadan' ? 'text-white/80' : 'text-slate-400 font-mono'}>
                        Umrah
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSeason('low')}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all text-xs font-black cursor-pointer flex items-center justify-between ${
                        season === 'low' 
                          ? 'bg-emerald-600 border-transparent text-white shadow-md shadow-emerald-100' 
                          : 'bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{t.seasonOmraLow}</span>
                      <span className={season === 'low' ? 'text-white/80' : 'text-slate-400 font-mono'}>
                        Umrah
                      </span>
                    </button>
                  </div>
                </div>

                {/* Proximity Field */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    {t.proximityLabel}
                  </label>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setProximity('near')}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all text-xs font-black cursor-pointer flex items-center justify-between ${
                        proximity === 'near' 
                          ? 'bg-emerald-600 border-transparent text-white shadow-md shadow-emerald-100' 
                          : 'bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{t.proxNear}</span>
                      <span className={proximity === 'near' ? 'text-white/80 font-mono text-[9px]' : 'text-slate-400 font-mono text-[9px]'}>
                        ⭐⭐⭐⭐⭐
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProximity('mid')}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all text-xs font-black cursor-pointer flex items-center justify-between ${
                        proximity === 'mid' 
                          ? 'bg-emerald-600 border-transparent text-white shadow-md shadow-emerald-100' 
                          : 'bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{t.proxMid}</span>
                      <span className={proximity === 'mid' ? 'text-white/80 font-mono text-[9px]' : 'text-slate-400 font-mono text-[9px]'}>
                        ⭐⭐⭐
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProximity('far')}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all text-xs font-black cursor-pointer flex items-center justify-between ${
                        proximity === 'far' 
                          ? 'bg-emerald-600 border-transparent text-white shadow-md shadow-emerald-100' 
                          : 'bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{t.proxFar}</span>
                      <span className={proximity === 'far' ? 'text-white/80 font-mono text-[9px]' : 'text-slate-400 font-mono text-[9px]'}>
                        🚌 Shuttle
                      </span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Date setting */}
              <div className="pt-4 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                    <Calendar size={13} />
                    <span>Définir votre date cible</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    Pour calibrer le compte à rebours et l'échéancier
                  </p>
                </div>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="bg-slate-50 border border-slate-150 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-emerald-600 transition-all font-mono"
                />
              </div>

              {/* Total Summary box with dynamic calculations */}
              <div className="bg-emerald-950 text-white rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase tracking-widest font-black text-emerald-400 block">{t.estimatedTotal}</span>
                    <h3 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-emerald-300">
                      {estimate.total.min.toLocaleString('fr-FR')} - {estimate.total.max.toLocaleString('fr-FR')} DH
                    </h3>
                    <p className="text-[9px] text-slate-300 font-bold uppercase">
                      Calculé selon l'option choisie ({proximity === 'near' ? 'Hôtel Proche' : 'Hôtel Standard'}, {season === 'hajj' ? 'Saison Hajj' : 'Umrah'})
                    </p>
                  </div>

                  {/* Goal Trigger Button */}
                  {!hajjGoal ? (
                    <button
                      onClick={handleCreateGoal}
                      className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl cursor-pointer transition-all active:scale-95 shadow-md shadow-emerald-950"
                    >
                      <Plus size={14} />
                      <span>{t.createGoalBtn}</span>
                    </button>
                  ) : (
                    <div className="bg-emerald-900/50 border border-emerald-800 p-3 rounded-2xl text-center shrink-0">
                      <span className="text-[9px] text-emerald-300 uppercase font-black flex items-center gap-1.5">
                        <Award size={12} />
                        <span>Objectif Activé</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Recharts visual breakdown */}
            <HajjBudgetBreakdown postes={estimate.postes} lang={language} />

          </div>

          {/* Savings Progress & Family split Sidebar */}
          <div className="space-y-6">
            
            {/* Savings goal card */}
            {hajjGoal && (
              <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-5 shadow-md relative overflow-hidden" id="hajj-goal-progress">
                <div className="absolute right-0 top-0 w-16 h-16 bg-white/5 rounded-full blur-xl pointer-events-none" />
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-300 flex items-center gap-1">
                      <Target size={11} />
                      <span>{t.goalLinkTitle}</span>
                    </span>
                    <span className="text-[10px] font-mono font-extrabold text-emerald-400 bg-white/10 px-2 py-0.5 rounded-full">
                      {Math.round((hajjGoal.current_amount / hajjGoal.target_amount) * 100)}%
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-xs uppercase tracking-wider">{hajjGoal.name}</h4>
                    <p className="text-[10px] text-slate-300 font-bold mt-0.5">Échéance : {hajjGoal.deadline}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="h-2.5 bg-emerald-950/80 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (hajjGoal.current_amount / hajjGoal.target_amount) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono font-black text-slate-300">
                      <span>{hajjGoal.current_amount.toLocaleString('fr-FR')} DH</span>
                      <span>/ {hajjGoal.target_amount.toLocaleString('fr-FR')} DH</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Family splits section */}
            {hajjGoal && (
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-3xs space-y-4" id="hajj-family-split">
                <div className="space-y-1">
                  <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={15} className="text-emerald-600" />
                    <span>{t.familyContributionTitle}</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">
                    {t.familyDesc}
                  </p>
                </div>

                {familyLoading ? (
                  <span className="text-[10px] text-slate-400 font-bold uppercase animate-pulse block">Chargement des membres de la famille...</span>
                ) : (
                  <form onSubmit={handleContribute} className="space-y-3 pt-2">
                    {/* Select family member */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">
                        {t.memberSelect}
                      </label>
                      <select
                        value={selectedFamilyMemberId}
                        onChange={(e) => setSelectedFamilyMemberId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-150 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden transition-all"
                      >
                        {members.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Amount field */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">
                        Montant de la Contribution (DH)
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="Ex: 5000"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-150 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden transition-all font-mono"
                      />
                    </div>

                    {/* Note field */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">
                        Note ou Souhait (Optionnel)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Épargne Mouhimma"
                        value={contributionNote}
                        onChange={(e) => setContributionNote(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-150 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-hidden transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Heart size={12} className="text-emerald-400" />
                      <span>{t.contributeBtn}</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Quick checklist summary card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-3xs space-y-3">
              <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={14} className="text-emerald-600" />
                <span>Conseil Discipline</span>
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Le Hajj demande de la discipline. Activez les micro-virements automatiques sur Floussi (par exemple en arrondissant vos dépenses quotidiennes de café ou de taxi) pour accumuler votre budget sans vous en rendre compte.
              </p>
            </div>

          </div>

        </div>

        {/* Interactive Hajj Checklists */}
        <HajjChecklist lang={language} />

        {/* Official Disclaimer */}
        <p className="text-[9px] text-slate-400 font-bold leading-relaxed uppercase text-center pt-4 border-t border-slate-100 max-w-4xl mx-auto">
          ⚠️ {t.officialDisclaimer}
        </p>

      </div>
    </div>
  );
}
