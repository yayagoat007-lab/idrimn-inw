import React, { useState } from 'react';
import { useDataIntegrity } from '../../hooks/use-data-integrity';
import { 
  HeartPulse, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  RefreshCw, 
  Wrench, 
  Sparkles, 
  HelpCircle 
} from 'lucide-react';

interface DataIntegrityPanelProps {
  userId: string;
  language: 'fr' | 'darija';
}

export default function DataIntegrityPanel({ userId, language }: DataIntegrityPanelProps) {
  const {
    issues,
    isChecking,
    runCheck,
    applyFix,
    fixedCount
  } = useDataIntegrity(userId);

  const [hasScanned, setHasScanned] = useState(false);
  const [fixingId, setFixingId] = useState<string | null>(null);
  const [fixStatus, setFixStatus] = useState<{ [key: string]: 'success' | 'error' | null }>({});

  const handleStartScan = async () => {
    await runCheck();
    setHasScanned(true);
  };

  const handleApplyFix = async (issueId: string) => {
    setFixingId(issueId);
    const success = await applyFix(issueId);
    setFixStatus(prev => ({
      ...prev,
      [issueId]: success ? 'success' : 'error'
    }));
    setFixingId(null);
  };

  const t = {
    title: language === 'darija' ? "Saha o Slamat l-M3loumat" : "Santé & Cohérence des données",
    subtitle: language === 'darija' ? "Kellef o sallah machakil l-m3loumat f l-khazna dyalk" : "Analysez et réparez les anomalies de votre base de données locale",
    startBtn: language === 'darija' ? "Lancer le diagnostic de santé 🩺" : "Lancer le diagnostic de santé 🩺",
    running: language === 'darija' ? "Kaye t-kellef daba... Sabr chwiya" : "Analyse en cours...",
    fixedCountLabel: language === 'darija' ? "Machakil li t-sallhat :" : "Problèmes résolus :",
    allHealthyTitle: language === 'darija' ? "M3loumatk kamla n9iya o salma ! ✨" : "Données parfaitement saines ! ✨",
    allHealthyDesc: language === 'darija'
      ? "Ma l9ina hta khata2 f l-khazna dyalk. Ga3 l-mu3amalat, l-buckets o d-daret m-hafdha o m-3awna mzyan."
      : "Aucune incohérence détectée ! Tous vos buckets, transactions, tontines et objectifs sont parfaitement alignés et cohérents.",
    issuesFound: language === 'darija' ? "L9ina ba3d l-machakil f l-m3loumat :" : "Anomalies détectées :",
    autoFixBtn: language === 'darija' ? "Réparer automatiquement ⚡" : "Réparer automatiquement ⚡",
    manualFixLabel: language === 'darija' ? "Khassk t-sallahha rasek :" : "Action manuelle requise :",
    manualFixDesc: language === 'darija'
      ? "Had l-hadira d l-budget khass t-bedal f l-enveloppes dyal l-budget dyalk."
      : "Veuillez ajuster les enveloppes et allocations depuis vos paramètres de budget.",
    fixingText: language === 'darija' ? "Kaye t-sallah..." : "Réparation...",
    successFix: language === 'darija' ? "T-sallah b najah !" : "Réparé avec succès !",
    errorFix: language === 'darija' ? "Khata2 f t-sallah" : "Erreur de réparation",
    safetyNoteTitle: language === 'darija' ? "Amân d l-flouss dialk :" : "Garantie financière :",
    safetyNoteDesc: language === 'darija'
      ? "Had t-sallah ma ghadi i-mseh lina hta mu3amalat fiha l-flouss d l-khlass. Gha i-bdel l-koudat li khassha t-gad."
      : "Aucun montant financier ou transaction réelle n'est supprimé. Seuls les liens cassés sont nettoyés pour restaurer la fluidité de l'application."
  };

  // Group issues by severity
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const infos = issues.filter(i => i.severity === 'info');

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Intro Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
            <HeartPulse className="text-indigo-600" size={18} />
            {t.title}
          </h3>
          <p className="text-xs text-gray-500 max-w-xl">
            {t.subtitle}
          </p>
        </div>

        <button
          onClick={handleStartScan}
          disabled={isChecking}
          className="w-full md:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          {isChecking ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              <span>{t.running}</span>
            </>
          ) : (
            <>
              <HeartPulse size={14} />
              <span>{t.startBtn}</span>
            </>
          )}
        </button>
      </div>

      {/* Statistics Indicator when fixed items exist */}
      {fixedCount > 0 && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-800">
            <Sparkles size={16} className="text-emerald-600" />
            <span className="text-xs font-black">{t.fixedCountLabel}</span>
          </div>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-xs">
            {fixedCount}
          </span>
        </div>
      )}

      {/* Safety Note */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3">
        <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">{t.safetyNoteTitle}</h4>
          <p className="text-[10px] font-medium text-slate-500 leading-normal">{t.safetyNoteDesc}</p>
        </div>
      </div>

      {/* Scan results render */}
      {hasScanned && !isChecking && (
        <div className="space-y-6">
          {issues.length === 0 ? (
            /* Perfectly healthy state card */
            <div className="bg-emerald-50/40 border border-emerald-100 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-emerald-950">{t.allHealthyTitle}</h4>
                <p className="text-xs font-medium text-emerald-800 leading-relaxed">
                  {t.allHealthyDesc}
                </p>
              </div>
            </div>
          ) : (
            /* Issues exist */
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                {t.issuesFound} ({issues.length})
              </h4>

              <div className="space-y-3">
                {issues.map(issue => {
                  const isError = issue.severity === 'error';
                  const isWarning = issue.severity === 'warning';
                  
                  const severityConfig = isError 
                    ? { bg: 'bg-rose-50/50', border: 'border-rose-100', text: 'text-rose-950', icon: <ShieldAlert className="text-rose-600 shrink-0" size={16} /> }
                    : isWarning
                    ? { bg: 'bg-amber-50/50', border: 'border-amber-100', text: 'text-amber-950', icon: <AlertTriangle className="text-amber-600 shrink-0" size={16} /> }
                    : { bg: 'bg-sky-50/50', border: 'border-sky-100', text: 'text-sky-950', icon: <Info className="text-sky-600 shrink-0" size={16} /> };

                  const status = fixStatus[issue.id];

                  return (
                    <div 
                      key={issue.id}
                      className={`p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${severityConfig.bg} ${severityConfig.border}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {severityConfig.icon}
                        </div>
                        <div className="space-y-1">
                          <p className={`text-xs font-bold leading-normal ${severityConfig.text}`}>
                            {language === 'darija' ? issue.description.darija : issue.description.fr}
                          </p>
                          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            <span>Id: {issue.affectedEntityId}</span>
                            <span>•</span>
                            <span>Type: {issue.affectedEntityType}</span>
                          </div>
                        </div>
                      </div>

                      {/* Fixing Actions */}
                      <div className="shrink-0 self-end sm:self-center">
                        {status === 'success' ? (
                          <span className="text-[11px] font-black text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 size={13} />
                            {t.successFix}
                          </span>
                        ) : status === 'error' ? (
                          <span className="text-[11px] font-black text-rose-600 flex items-center gap-1">
                            <ShieldAlert size={13} />
                            {t.errorFix}
                          </span>
                        ) : issue.autoFixable ? (
                          <button
                            onClick={() => handleApplyFix(issue.id)}
                            disabled={fixingId !== null}
                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-extrabold text-[10px] rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            {fixingId === issue.id ? (
                              <>
                                <RefreshCw size={11} className="animate-spin" />
                                <span>{t.fixingText}</span>
                              </>
                            ) : (
                              <>
                                <Wrench size={11} />
                                <span>{t.autoFixBtn}</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5">
                            <HelpCircle size={12} className="text-slate-400" />
                            <span>{t.manualFixLabel}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
