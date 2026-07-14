import React, { useState, useEffect } from 'react';
import { 
  simulateEligibleAids, 
  ChildDetail, 
  AID_PROGRAMS, 
  EligibleResult 
} from '../../../lib/aid-programs';
import { useGoals } from '../../../hooks/use-goals';
import { 
  ShieldAlert, 
  Sliders, 
  Plus, 
  Sparkles, 
  CheckCircle, 
  Home, 
  Gift, 
  GraduationCap, 
  PiggyBank, 
  Calendar,
  AlertTriangle,
  Info,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function AidProgramsPage({ language }: { language: 'fr' | 'darija' }) {
  const { createGoal } = useGoals();

  // Score RSU (Standard threshold for direct aid is 9.743)
  const [rsuScore, setRsuScore] = useState<number>(9.5);
  const [hasFirstBirth, setHasFirstBirth] = useState<boolean>(false);
  const [hasSecondBirth, setHasSecondBirth] = useState<boolean>(false);
  const [children, setChildren] = useState<ChildDetail[]>([
    { id: 'c1', age: 8, inSchool: true },
    { id: 'c2', age: 14, inSchool: true }
  ]);
  const [housePrice, setHousePrice] = useState<number>(280000);
  const [applyHouseAid, setApplyHouseAid] = useState<boolean>(false);

  // Success action state
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Individual child builder state
  const [newAge, setNewAge] = useState<number>(6);
  const [newInSchool, setNewInSchool] = useState<boolean>(true);

  // Run simulation
  const result = simulateEligibleAids(
    rsuScore,
    hasFirstBirth,
    hasSecondBirth,
    children,
    applyHouseAid ? housePrice : undefined
  );

  const handleAddChild = () => {
    const newChild: ChildDetail = {
      id: `c-${Date.now()}`,
      age: newAge,
      inSchool: newInSchool
    };
    setChildren([...children, newChild]);
  };

  const handleRemoveChild = (id: string) => {
    setChildren(children.filter(c => c.id !== id));
  };

  // Auto-generate house saving goal offset by state aid
  const handleCreateHousingGoal = async (subsidyAmt: number) => {
    const goalName = `Apport Sakan (Subvention de ${subsidyAmt / 1000}k)`;
    // Traditional target is usually 10% to 20% of house price, offset by the subsidy
    const targetAmt = Math.max(20000, housePrice - subsidyAmt);
    
    await createGoal({
      name: goalName,
      target_amount: targetAmt,
      current_amount: 0,
      deadline: '2028-12-31',
      bucket_id: null,
      color: '#3b82f6', // Blue
      icon: 'Home',
      auto_contribute_amount: 1000
    });

    setSuccessMsg(
      language === 'darija'
        ? 'Ma9boula ! Hadaf d-Apport sakan t-khla9 b s-subvention dyalk !'
        : 'Objectif d\'apport logement créé ! Le montant cible a été déduit de la subvention de l\'État.'
    );
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const t = {
    title: language === 'darija' ? 'Da3m d-Doulat (Social Aids)' : 'Simulateur d\'Aides Sociales Directes',
    subtitle: language === 'darija' ? 'Simula dyal RSU, Da3m Sakane, o l-mou3awanat dyal l-Maghrib' : 'Calculez votre éligibilité aux aides RSU, allocations familiales et subventions au logement principal au Maroc.',
    rsuLabel: language === 'darija' ? 'Moyenne d-Indice d-RSU' : 'Score / Indice RSU',
    rsuHelp: language === 'darija' ? 'Chouf rsu.ma dyalk' : 'Indice calculé lors de votre enregistrement au Registre Social Unique (seuil d\'aide <= 9.743).',
    birthsLabel: language === 'darija' ? 'Naissances Jdad' : 'Naissances Récentes dans le Foyer',
    birth1: language === 'darija' ? 'Naissances d-ewwel weld' : 'Naissance du 1er enfant (Prime 2000 DH)',
    birth2: language === 'darija' ? 'Naissances d-tani weld' : 'Naissance du 2e enfant (Prime 1000 DH)',
    houseLabel: language === 'darija' ? 'Da3m d-Sakan (Logement)' : 'Projet d\'Aide au Logement Principal',
    houseCheckbox: language === 'darija' ? 'Chra d-Dar f 2026' : 'Simuler l\'achat d\'un logement principal',
    housePriceLabel: language === 'darija' ? 'Taman d-Dar (DH)' : 'Valeur d\'acquisition du bien (DH)',
    catalogTitle: language === 'darija' ? 'Da3m li Maqboula (Aides Éligibles)' : 'Aides & Allocations Éligibles Simulées',
    statsMonthly: language === 'darija' ? 'Majmou3 chahri' : 'Aide Mensuelle Cumulée',
    statsOneTime: language === 'darija' ? 'Majmou3 prime' : 'Aides Ponctuelles Unique',
    disclaimer: language === 'darija' ? 'Had l-arqam ghir ta9ribiya o machi rasmiya mn l-Doulat.' : 'Avertissement: Cette simulation se base sur les décrets d\'application des aides directes et du programme Daam Sakane en vigueur au Maroc. L\'attribution finale requiert l\'inscription officielle sur les portails asd.ma et daamsakane.ma.',
    applyHousingBtn: language === 'darija' ? 'Dir Hadaf Sakan b Da3m' : 'Créer un Objectif de Financement offset',
    childAge: language === 'darija' ? '3mar' : 'Âge',
    childSchool: language === 'darija' ? 'Madrassa' : 'Scolarisé'
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8 pb-24 font-sans" id="aid-programs-page">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Block */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-3xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute right-0 top-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-1.5 relative z-10">
            <span className="text-[10px] uppercase font-black tracking-widest text-blue-600 flex items-center gap-1.5">
              <Gift size={13} />
              <span>Programmes de Solidarité Nationale</span>
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
              <span>{t.title}</span>
              <span className="text-blue-600">🇲🇦</span>
            </h1>
            <p className="text-xs text-slate-500 font-bold max-w-2xl leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 text-blue-800 px-3 py-2.5 rounded-2xl flex items-center gap-2 max-w-xs shrink-0 font-sans">
            <Info size={16} className="text-blue-600" />
            <span className="text-[10px] uppercase font-black leading-snug">Connecté à votre simulateur d'apport de fonds Floussi</span>
          </div>
        </div>

        {/* Success notify banner */}
        {successMsg && (
          <div className="bg-blue-50 border border-blue-100 text-blue-800 text-xs font-black p-4 rounded-2xl text-center shadow-3xs animate-fadeIn">
            {successMsg}
          </div>
        )}

        {/* Simulator Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Simulator Inputs */}
          <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-6 shadow-3xs space-y-6">
            <h2 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-3">
              <Sliders size={14} className="text-blue-600" />
              <span>Paramètres du Foyer</span>
            </h2>

            {/* RSU Score Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase font-black">
                <span className="text-slate-400">{t.rsuLabel}</span>
                <span className={`font-mono text-xs px-2 py-0.5 rounded-md ${rsuScore <= 9.743 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {rsuScore}
                </span>
              </div>
              <input
                type="range"
                min="8.0"
                max="12.0"
                step="0.01"
                value={rsuScore}
                onChange={(e) => setRsuScore(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed">
                {t.rsuHelp}
              </p>
            </div>

            {/* Recent Births checkboxes */}
            <div className="space-y-2 border-t border-slate-50 pt-4">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-1">
                {t.birthsLabel}
              </label>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 text-xs font-black text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasFirstBirth}
                    onChange={(e) => setHasFirstBirth(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-200 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span>{t.birth1}</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-black text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasSecondBirth}
                    onChange={(e) => setHasSecondBirth(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-200 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span>{t.birth2}</span>
                </label>
              </div>
            </div>

            {/* Children list configuration */}
            <div className="space-y-3 border-t border-slate-50 pt-4">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block">Enfants à charge ({children.length})</span>
              
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {children.map((child) => (
                  <div key={child.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold">
                    <span className="text-slate-700 uppercase font-mono">
                      {child.age} ans • {child.inSchool ? t.childSchool : 'Non scolarisé'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChild(child.id)}
                      className="text-red-500 hover:text-red-700 font-bold uppercase text-[10px] cursor-pointer"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>

              {/* Add child inputs */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 flex flex-col gap-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase font-black text-slate-400">Âge</label>
                    <input
                      type="number"
                      min="0"
                      max="25"
                      value={newAge}
                      onChange={(e) => setNewAge(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold font-mono text-slate-700"
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-1.5 text-[9px] uppercase font-black text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newInSchool}
                        onChange={(e) => setNewInSchool(e.target.checked)}
                        className="w-3.5 h-3.5 text-blue-600"
                      />
                      <span>Scolarisé</span>
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddChild}
                  className="py-1 bg-slate-800 hover:bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg cursor-pointer"
                >
                  Ajouter un Enfant
                </button>
              </div>
            </div>

            {/* Housing Aid */}
            <div className="space-y-3 border-t border-slate-50 pt-4">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
                {t.houseLabel}
              </label>

              <label className="flex items-center gap-2.5 text-xs font-black text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyHouseAid}
                  onChange={(e) => setApplyHouseAid(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-200 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span>{t.houseCheckbox}</span>
              </label>

              {applyHouseAid && (
                <div className="space-y-1">
                  <label className="text-[8px] uppercase font-black text-slate-400 block">{t.housePriceLabel}</label>
                  <input
                    type="number"
                    step="10000"
                    value={housePrice}
                    onChange={(e) => setHousePrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-150 rounded-xl px-2.5 py-1.5 text-xs font-bold font-mono text-slate-700 focus:outline-hidden"
                  />
                </div>
              )}
            </div>

          </div>

          {/* Results Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Direct Social Aid Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-3xs flex items-center justify-between gap-4 font-mono">
                <div className="space-y-1">
                  <span className="text-[8px] uppercase font-black text-slate-400 block">{t.statsMonthly}</span>
                  <h3 className="text-xl font-black text-blue-600">
                    +{result.totalAidsMonthly.toLocaleString('fr-FR')} DH <span className="text-xs text-slate-400 font-semibold uppercase">/mois</span>
                  </h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Alloué au budget familial</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Calendar size={20} />
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-3xs flex items-center justify-between gap-4 font-mono">
                <div className="space-y-1">
                  <span className="text-[8px] uppercase font-black text-slate-400 block">{t.statsOneTime}</span>
                  <h3 className="text-xl font-black text-emerald-600">
                    +{result.totalAidsOneTime.toLocaleString('fr-FR')} DH <span className="text-xs text-slate-400 font-semibold">unique</span>
                  </h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Subventions d'investissements</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Gift size={20} />
                </div>
              </div>

            </div>

            {/* Catalog list of eligible grants */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-3xs space-y-4">
              <h2 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-3">
                <CheckCircle size={15} className="text-blue-600" />
                <span>{t.catalogTitle} ({result.eligiblePrograms.length})</span>
              </h2>

              {result.eligiblePrograms.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-150 rounded-2xl p-8 text-center">
                  <AlertTriangle className="text-amber-500 mx-auto mb-2" size={20} />
                  <p className="text-xs text-slate-500 font-black uppercase">Votre configuration n'indique aucune aide éligible.</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 leading-relaxed">
                    Augmentez le nombre d'enfants, simulez Daam Sakane, ou ajustez le score RSU (en dessous de 9.743).
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {result.eligiblePrograms.map((aid) => (
                    <div 
                      key={aid.id} 
                      className="border border-slate-100 rounded-2xl p-4 bg-white hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                            {language === 'darija' ? aid.nameDarija : aid.nameFr}
                          </h3>
                          <span className={`text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded-md ${aid.type === 'monthly' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {aid.type === 'monthly' ? 'Mensuel' : 'Prime Unique'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                          {language === 'darija' ? aid.descriptionDarija : aid.descriptionFr}
                        </p>
                      </div>

                      {/* Right amount layout & button action */}
                      <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                        <div className="text-right">
                          <span className="text-[8px] uppercase font-black text-slate-400 block">Montant Estimé</span>
                          <span className={`text-base font-black ${aid.type === 'monthly' ? 'text-blue-600' : 'text-emerald-600'}`}>
                            +{aid.amount.toLocaleString('fr-FR')} DH
                          </span>
                        </div>

                        {/* Special interactive option for Housing Aid to turn it directly into an active target savings Goal */}
                        {aid.id.startsWith('housing_aid') && (
                          <button
                            onClick={() => handleCreateHousingGoal(aid.amount)}
                            className="p-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all"
                            title={t.applyHousingBtn}
                          >
                            <PiggyBank size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* General Disclaimer */}
            <div className="bg-amber-50 border border-amber-150 p-4.5 rounded-2xl flex gap-3">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
              <p className="text-[10px] text-amber-800 font-bold uppercase leading-relaxed">
                {t.disclaimer}
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
export { AidProgramsPage };
