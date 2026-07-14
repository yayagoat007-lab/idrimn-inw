import React, { useState, useEffect } from 'react';
import { 
  calculateRefund, 
  MedicalRegime, 
  MedicalAct, 
  ActType, 
  TNR_TABLE 
} from '../../../lib/cnss-calculator';
import { 
  ShieldAlert, 
  Plus, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Activity, 
  TrendingUp, 
  DollarSign, 
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface Dossier {
  id: string;
  name: string;
  regime: MedicalRegime;
  submissionDate: string;
  status: 'sent' | 'processing' | 'refunded' | 'rejected';
  acts: MedicalAct[];
  estimatedRefund: number;
  actualRefund?: number;
}

export default function CnssTrackerPage({ language }: { language: 'fr' | 'darija' }) {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [dossierName, setDossierName] = useState('');
  const [regime, setRegime] = useState<MedicalRegime>('CNSS');
  const [submissionDate, setSubmissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentActs, setCurrentActs] = useState<MedicalAct[]>([]);

  // Individual act builder state
  const [actType, setActType] = useState<ActType>('generalist');
  const [actCost, setActCost] = useState<string>('');
  const [actDays, setActDays] = useState<number>(1);

  // Load dossiers
  useEffect(() => {
    try {
      const stored = localStorage.getItem('floussi_cnss_dossiers');
      if (stored) {
        setDossiers(JSON.parse(stored));
      } else {
        // Seed default medical folder so they don't see an empty page
        const seedDossiers: Dossier[] = [
          {
            id: 'cnss-1',
            name: 'Consultation Ophtalmo & Lunettes',
            regime: 'CNSS',
            submissionDate: '2026-06-12',
            status: 'refunded',
            acts: [
              { type: 'specialist', costPaid: 300 },
              { type: 'pharma', costPaid: 850 }
            ],
            estimatedRefund: 700,
            actualRefund: 700
          },
          {
            id: 'cnss-2',
            name: 'Grippe Saisonnière Enfant',
            regime: 'CNSS',
            submissionDate: '2026-07-05',
            status: 'processing',
            acts: [
              { type: 'generalist', costPaid: 150 },
              { type: 'pharma', costPaid: 210 }
            ],
            estimatedRefund: 203
          }
        ];
        setDossiers(seedDossiers);
        localStorage.setItem('floussi_cnss_dossiers', JSON.stringify(seedDossiers));
      }
    } catch (_) {}
  }, []);

  const saveDossiers = (next: Dossier[]) => {
    setDossiers(next);
    localStorage.setItem('floussi_cnss_dossiers', JSON.stringify(next));
  };

  const handleAddAct = () => {
    const cost = parseFloat(actCost);
    if (isNaN(cost) || cost <= 0) return;

    const newAct: MedicalAct = {
      type: actType,
      costPaid: cost,
      daysCount: (actType === 'hospital_public' || actType === 'hospital_private') ? actDays : undefined
    };

    setCurrentActs([...currentActs, newAct]);
    setActCost('');
    setActDays(1);
  };

  const handleRemoveAct = (index: number) => {
    setCurrentActs(currentActs.filter((_, i) => i !== index));
  };

  const handleCreateDossier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dossierName.trim() || currentActs.length === 0) return;

    // Run simulation
    const calc = calculateRefund(regime, currentActs);

    const newDossier: Dossier = {
      id: `cnss-${Date.now()}`,
      name: dossierName.trim(),
      regime,
      submissionDate,
      status: 'sent',
      acts: currentActs,
      estimatedRefund: calc.refundAmount
    };

    const next = [newDossier, ...dossiers];
    saveDossiers(next);

    // Reset Form
    setDossierName('');
    setCurrentActs([]);
    setShowForm(false);
  };

  const handleDeleteDossier = (id: string) => {
    const next = dossiers.filter(d => d.id !== id);
    saveDossiers(next);
  };

  const handleUpdateStatus = (id: string, status: Dossier['status'], actualRefundAmt?: number) => {
    const next = dossiers.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status,
          actualRefund: status === 'refunded' ? (actualRefundAmt || d.estimatedRefund) : undefined
        };
      }
      return d;
    });
    saveDossiers(next);
  };

  // Stats calculation
  const totalDossiers = dossiers.length;
  const pendingRefundAmount = dossiers
    .filter(d => d.status === 'sent' || d.status === 'processing')
    .reduce((sum, d) => sum + d.estimatedRefund, 0);

  const totalRefundedAmount = dossiers
    .filter(d => d.status === 'refunded')
    .reduce((sum, d) => sum + (d.actualRefund || d.estimatedRefund), 0);

  const t = {
    title: language === 'darija' ? 'Tafsil d-AMO (CNSS Tracker)' : 'Suivi des Remboursements CNSS / CNOPS',
    subtitle: language === 'darija' ? 'Hsab o tbe3 dossier d-Sbi7at dyalk m3a l-AMO' : 'Estimez vos remboursements médicaux (TNR) et suivez l\'avancement de vos dossiers de soins.',
    disclaimer: language === 'darija' ? 'Had l-arqam ghir ta9ribiya o machi rasmiya mn l-CNSS.' : 'Attention: Ces simulations s\'appuient sur le Tarif National de Référence (TNR) marocain de l\'ANAM. Les montants exacts dépendent de la nomenclature officielle des actes de soins.',
    regimeLabel: language === 'darija' ? 'Sandouq (Régime)' : 'Régime d\'Assurance',
    statusSent: language === 'darija' ? 'Msa7el' : 'Déposé',
    statusProcessing: language === 'darija' ? 'Khdam (En cours)' : 'En cours de traitement',
    statusRefunded: language === 'darija' ? 'Rje3 l-Flouss' : 'Remboursé',
    statusRejected: language === 'darija' ? 'Maqboulich' : 'Rejeté / Dossier incomplet',
    addDossierBtn: language === 'darija' ? 'Zid Dossier jdid' : 'Déposer un nouveau dossier',
    statsPending: language === 'darija' ? 'Flouss f t-Tbe3' : 'Remboursements en attente',
    statsRefunded: language === 'darija' ? 'Flouss li rj3ou' : 'Cumul Remboursé',
    formTitle: language === 'darija' ? 'Simulateur d-AMO' : 'Nouveau Dossier & Simulateur de Remboursement',
    actTypeLabel: language === 'darija' ? 'Chkoune dar s-sbiha' : 'Type d\'Acte médical',
    costPaidLabel: language === 'darija' ? 'Chhal khallasti (MAD)' : 'Tarif Réel Payé (DH)',
    addActBtn: language === 'darija' ? 'Zid l-act' : 'Ajouter l\'acte',
    estimatedRefundLabel: language === 'darija' ? 'T-9dir d-Rjou3' : 'Estimation du Remboursement',
    outOfPocketLabel: language === 'darija' ? 'Gha t-khallass' : 'Reste à votre charge',
  };

  // Preview current acts refund estimation
  const currentCalc = calculateRefund(regime, currentActs);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8 pb-24 font-sans" id="cnss-tracker-page">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-3xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-1.5 relative z-10">
            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 flex items-center gap-1.5">
              <Activity className="animate-pulse" size={13} />
              <span>Assurance Maladie Obligatoire (AMO)</span>
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
              <span>{t.title}</span>
              <span className="text-emerald-600">🏥</span>
            </h1>
            <p className="text-xs text-slate-500 font-bold max-w-2xl leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-950 text-white text-xs font-black uppercase tracking-widest rounded-2xl cursor-pointer transition-all active:scale-95 shadow-xs shrink-0 self-start md:self-center"
          >
            <Plus size={14} />
            <span>{showForm ? 'Masquer le simulateur' : t.addDossierBtn}</span>
          </button>
        </div>

        {/* Key Medical Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-3xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <span className="text-[8px] uppercase font-black text-slate-400 block">Dossiers déposés</span>
              <span className="text-xl font-black font-mono text-slate-800">{totalDossiers}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-3xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock size={20} className="animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <span className="text-[8px] uppercase font-black text-slate-400 block">{t.statsPending}</span>
              <span className="text-xl font-black font-mono text-amber-600">+{pendingRefundAmount.toLocaleString('fr-FR')} DH</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-3xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp size={20} />
            </div>
            <div>
              <span className="text-[8px] uppercase font-black text-slate-400 block">{t.statsRefunded}</span>
              <span className="text-xl font-black font-mono text-emerald-600">{totalRefundedAmount.toLocaleString('fr-FR')} DH</span>
            </div>
          </div>
        </div>

        {/* SIMULATION & DEPOSIT FORM (Toggled) */}
        {showForm && (
          <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-md space-y-6" id="cnss-simulator-form">
            <h2 className="font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
              <Activity size={16} className="text-emerald-600" />
              <span>{t.formTitle}</span>
            </h2>

            <form onSubmit={handleCreateDossier} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Dossier Information */}
              <div className="md:col-span-1 space-y-4 border-r border-slate-100 pr-0 md:pr-6">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    Nom du Dossier (Ex: Dentiste Imane)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Saisissez un titre explicite"
                    value={dossierName}
                    onChange={(e) => setDossierName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    {t.regimeLabel}
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRegime('CNSS')}
                      className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all cursor-pointer ${
                        regime === 'CNSS' 
                          ? 'bg-emerald-600 border-transparent text-white' 
                          : 'bg-slate-50 border-slate-150 text-slate-600'
                      }`}
                    >
                      CNSS (Salarie)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegime('CNOPS')}
                      className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all cursor-pointer ${
                        regime === 'CNOPS' 
                          ? 'bg-emerald-600 border-transparent text-white' 
                          : 'bg-slate-50 border-slate-150 text-slate-600'
                      }`}
                    >
                      CNOPS (Public)
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    Date de dépôt
                  </label>
                  <input
                    type="date"
                    value={submissionDate}
                    onChange={(e) => setSubmissionDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Acts construction panel */}
              <div className="md:col-span-1 space-y-4">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block">Actes médicaux à inclure</span>
                
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                      {t.actTypeLabel}
                    </label>
                    <select
                      value={actType}
                      onChange={(e) => setActType(e.target.value as ActType)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden"
                    >
                      <option value="generalist">Consultation Généraliste (TNR 80-150 DH)</option>
                      <option value="specialist">Consultation Spécialiste (TNR 150-250 DH)</option>
                      <option value="hospital_public">Hôpital Public (TNR 150 DH/jour)</option>
                      <option value="hospital_private">Clinique Privée (TNR 600 DH/jour)</option>
                      <option value="pharma">Pharmacie / Médicaments</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                      {t.costPaidLabel}
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 300"
                      value={actCost}
                      onChange={(e) => setActCost(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold font-mono text-slate-700 focus:outline-hidden"
                    />
                  </div>

                  {(actType === 'hospital_public' || actType === 'hospital_private') && (
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                        Nombre de jours
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={actDays}
                        onChange={(e) => setActDays(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold font-mono text-slate-700 focus:outline-hidden"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAddAct}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer"
                  >
                    {t.addActBtn}
                  </button>
                </div>
              </div>

              {/* Estimations Summary & Save */}
              <div className="md:col-span-1 space-y-4 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-2">Simulateur de remboursement</span>
                  
                  {currentActs.length === 0 ? (
                    <div className="bg-slate-50 border border-dashed border-slate-200 p-6 rounded-2xl text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">Aucun acte ajouté. Ajoutez des actes pour simuler.</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="max-h-36 overflow-y-auto space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        {currentActs.map((act, index) => (
                          <div key={index} className="flex items-center justify-between text-[10px] font-semibold text-slate-600 border-b border-slate-100 pb-1 last:border-0 last:pb-0 font-mono">
                            <span className="capitalize">{act.type.replace('_', ' ')}</span>
                            <div className="flex items-center gap-1.5">
                              <span>{act.costPaid} DH</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveAct(index)}
                                className="text-red-500 hover:text-red-700 cursor-pointer"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Display calculations */}
                      <div className="bg-emerald-950 text-white p-4 rounded-2xl space-y-2 relative overflow-hidden shadow-xs">
                        <div className="flex justify-between items-center text-[10px] font-mono text-emerald-300">
                          <span>Total Payé:</span>
                          <span className="font-bold">{currentCalc.totalPaid} DH</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-mono text-emerald-400 font-black">
                          <span>{t.estimatedRefundLabel}:</span>
                          <span>+{currentCalc.refundAmount} DH</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-300">
                          <span>{t.outOfPocketLabel}:</span>
                          <span>{currentCalc.patientShare} DH</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={currentActs.length === 0}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Valider et Enregistrer le Dossier
                </button>
              </div>

            </form>
          </div>
        )}

        {/* DOSSIERS TRACKER LIST */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-3xs space-y-4" id="cnss-dossiers-list">
          <h2 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
            <FileText size={16} className="text-emerald-600" />
            <span>Vos dossiers en cours & historiques ({dossiers.length})</span>
          </h2>

          {dossiers.length === 0 ? (
            <div className="p-12 text-center text-slate-400 uppercase font-black text-xs">
              Aucun dossier de remboursement enregistré.
            </div>
          ) : (
            <div className="space-y-3.5">
              {dossiers.map(d => {
                const calc = calculateRefund(d.regime, d.acts);
                const actualVal = d.status === 'refunded' ? (d.actualRefund ?? d.estimatedRefund) : 0;

                return (
                  <div 
                    key={d.id} 
                    className="border border-slate-100 rounded-2xl p-4.5 bg-white hover:border-slate-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Title, regime and actions list */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">{d.name}</h3>
                        <span className="text-[9px] font-mono font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                          {d.regime}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 font-bold">{d.submissionDate}</span>
                      </div>

                      {/* Display small items preview */}
                      <div className="flex gap-2.5 flex-wrap">
                        {d.acts.map((act, i) => (
                          <span key={i} className="text-[9px] font-mono font-bold uppercase text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-2 py-0.5">
                            {act.type.replace('_', ' ')} : {act.costPaid} DH
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Estimations summary */}
                    <div className="flex items-center gap-6 shrink-0 flex-wrap md:flex-nowrap">
                      
                      <div className="text-right font-mono text-xs">
                        <span className="text-[8px] uppercase font-black text-slate-400 block">Est. Remboursement</span>
                        <span className="font-extrabold text-emerald-600">+{d.estimatedRefund} DH</span>
                      </div>

                      {d.status === 'refunded' && (
                        <div className="text-right font-mono text-xs">
                          <span className="text-[8px] uppercase font-black text-slate-400 block">Montant Reçu</span>
                          <span className="font-extrabold text-blue-600">+{actualVal} DH</span>
                        </div>
                      )}

                      {/* Status selectors */}
                      <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
                        {d.status === 'sent' && (
                          <button
                            onClick={() => handleUpdateStatus(d.id, 'processing')}
                            className="px-2 py-1 rounded-md text-[9px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200 cursor-pointer"
                          >
                            Passer en traitement
                          </button>
                        )}
                        {d.status === 'processing' && (
                          <button
                            onClick={() => handleUpdateStatus(d.id, 'refunded')}
                            className="px-2 py-1 rounded-md text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer"
                          >
                            Valider remboursement
                          </button>
                        )}
                        {d.status === 'refunded' ? (
                          <span className="px-2.5 py-1.5 rounded-full text-[9px] font-black uppercase bg-blue-100 text-blue-800 flex items-center gap-1">
                            <CheckCircle size={10} />
                            <span>{t.statusRefunded}</span>
                          </span>
                        ) : d.status === 'processing' ? (
                          <span className="px-2.5 py-1.5 rounded-full text-[9px] font-black uppercase bg-amber-100 text-amber-800 flex items-center gap-1">
                            <Clock size={10} />
                            <span>AMO Traitement</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1.5 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-600 flex items-center gap-1">
                            <Clock size={10} />
                            <span>Dossier Déposé</span>
                          </span>
                        )}

                        <button
                          onClick={() => handleDeleteDossier(d.id)}
                          className="p-1 text-slate-300 hover:text-red-500 cursor-pointer transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Disclaimer Warning */}
        <div className="bg-amber-50 border border-amber-150 p-4.5 rounded-2xl flex gap-3">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
          <p className="text-[10px] text-amber-800 font-bold uppercase leading-relaxed">
            {t.disclaimer}
          </p>
        </div>

      </div>
    </div>
  );
}
export { CnssTrackerPage };
