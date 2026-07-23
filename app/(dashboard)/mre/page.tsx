"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { useRemittances } from '../../../hooks/use-remittances';
import { useRemoteFamilyOverview } from '../../../hooks/use-remote-family-overview';
import { CurrencyToggle } from '../../../components/mre/CurrencyToggle';
import { RemittanceForm } from '../../../components/mre/RemittanceForm';
import { RemittanceHistory } from '../../../components/mre/RemittanceHistory';
import { DualCurrencyAmount } from '../../../components/mre/DualCurrencyAmount';
import { getMREPreference, setMREPreference, SUPPORTED_CURRENCIES } from '../../../lib/currency-exchange';
import { Globe, Heart, ArrowRight, ShieldAlert, Sparkles, Send, Users, Compass, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Language, t } from '../../../lib/i18n';

interface MREPageProps {
  language: Language;
}

export default function MREPage({ language }: MREPageProps) {
  const { profile } = useAuth();
  const userId = profile?.id || "mock-user-id-9999";

  const [mreEnabled, setMreEnabled] = useState(false);
  const [prefCurrency, setPrefCurrency] = useState('EUR');
  
  // Custom hooks for MRE feature set
  const { remittances, createRemittance, deleteRemittance, getRemittanceStats, getRemittanceTrend } = useRemittances(userId);
  const { familyGroup, stats: familyStats, activeTontines, loading: familyLoading } = useRemoteFamilyOverview(userId);

  const loadPreferences = () => {
    const pref = getMREPreference();
    setMreEnabled(pref.enabled);
    setPrefCurrency(pref.currency);
  };

  useEffect(() => {
    loadPreferences();
    
    // Check if the persona template was set to 'mre' and we need to pre-activate
    const currentPersona = localStorage.getItem('floussi_selected_persona');
    if (currentPersona === 'mre' && !localStorage.getItem('floussi_mre_enabled')) {
      setMREPreference(true, 'EUR');
      setMreEnabled(true);
    }
  }, []);

  const handlePreferenceChange = () => {
    loadPreferences();
  };

  const handleAddRemittance = async (data: any) => {
    await createRemittance(data);
  };

  const handleDeleteRemittance = async (id: string) => {
    await deleteRemittance(id);
  };

  const stats = getRemittanceStats();
  const trendData = getRemittanceTrend(6);

  return (
    <div className="space-y-6 font-sans">
      {/* Hero Header Section */}
      <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/4 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="space-y-2 relative z-10">
          <span className="bg-emerald-700/50 text-emerald-200 border border-emerald-500/30 text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider inline-flex items-center gap-1">
            <Globe size={11} />
            MRE - Marocains du Monde
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {t('mreSpace', language)}
          </h2>
          <p className="text-xs text-emerald-100/80 font-medium max-w-2xl leading-relaxed">
            {t('mreDesc', language)}
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      {!mreEnabled ? (
        /* Disabled State (Intro Board) */
        <div className="bg-white p-8 border border-slate-100 rounded-3xl space-y-6 text-center max-w-2xl mx-auto shadow-sm">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl">
            🌍
          </div>
          <div className="space-y-2">
            <h3 className="font-extrabold text-base text-slate-800">
              {t('activateMreMode', language)}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {t('activateMreDesc', language)}
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl max-w-md mx-auto space-y-2 text-left">
            <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5 uppercase">
              <Sparkles size={12} className="text-emerald-600" />
              {t('mreFeaturesTitle', language)}
            </h4>
            <ul className="text-[11px] text-slate-500 font-bold space-y-1 pl-4 list-disc">
              <li>{t('mreFeature1', language)}</li>
              <li>{t('mreFeature2', language)}</li>
              <li>{t('mreFeature3', language)}</li>
            </ul>
          </div>

          <div className="pt-2">
            <button
              id="activate-mre-btn"
              type="button"
              onClick={() => {
                setMREPreference(true, 'EUR');
                setMreEnabled(true);
              }}
              className="py-3 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-600/15 transition-all hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2"
            >
              <span>{t('activateMreNow', language)}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ) : (
        /* Enabled Dashboard State */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Configuration & Form */}
          <div className="space-y-6 lg:col-span-1">
            {/* Currency settings controller */}
            <CurrencyToggle language={language} onChanged={handlePreferenceChange} />
            
            {/* Log a remittance form */}
            <RemittanceForm language={language} onAddSuccess={handleAddRemittance} />

            {/* Remote family overview card */}
            <div className="bg-white p-5 border border-slate-100 rounded-3xl space-y-4 shadow-sm">
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Users size={16} className="text-indigo-600" />
                  {t('foyerMaroc', language)}
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold">
                  {t('foyerMarocDesc', language)}
                </p>
              </div>

              {familyLoading ? (
                <div className="py-6 text-center text-slate-400 text-xs font-bold flex items-center justify-center gap-2">
                  <RefreshCw size={14} className="animate-spin text-emerald-600" />
                  <span>{t('updatingLive', language)}</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Total Foyer Spent */}
                  <div className="p-3 bg-indigo-50/40 border border-indigo-100/50 rounded-2xl flex justify-between items-center">
                    <div>
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wider block">
                        {t('foyerSpentThisMonth', language)}
                      </span>
                      <span className="font-extrabold text-xs text-indigo-900 block mt-0.5">
                        {familyGroup ? familyGroup.name : 'Aila El Alami'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-sm text-indigo-950 block">
                        <DualCurrencyAmount amountMAD={familyStats?.totalSpentThisMonth || 7200} />
                      </span>
                    </div>
                  </div>

                  {/* Family Budget Alerts */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                      {t('familyAlertsFlow', language)}
                    </span>

                    {familyStats?.familyAlerts && familyStats.familyAlerts.length > 0 ? (
                      <div className="space-y-2">
                        {familyStats.familyAlerts.map((alert: string, index: number) => (
                          <div key={index} className="p-2.5 bg-amber-50 border border-amber-100/60 rounded-xl text-[10px] font-extrabold text-amber-900 flex items-start gap-2">
                            <AlertCircle size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <span>{alert}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 font-semibold italic">
                        {t('noCriticalAlerts', language)}
                      </p>
                    )}
                  </div>

                  {/* Active Jmâas */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                      {t('daretFamilyJmaas', language)}
                    </span>

                    {activeTontines.length > 0 ? (
                      <div className="space-y-2">
                        {activeTontines.map((t) => {
                          const progress = Math.round((t.current_round / t.total_members) * 100);
                          return (
                            <div key={t.id} className="p-2.5 bg-slate-50 border border-slate-100/50 rounded-xl space-y-1.5">
                              <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-700">
                                <span>{t.name}</span>
                                <span className="text-emerald-600">Tour {t.current_round}/{t.total_members}</span>
                              </div>
                              {/* progress bar */}
                              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 font-semibold italic">
                        {t('noActiveTontine', language)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Column 2 & 3: History & Trend charts */}
          <div className="space-y-6 lg:col-span-2">
            <RemittanceHistory
              language={language}
              remittances={remittances}
              onDelete={handleDeleteRemittance}
              trendData={trendData}
              stats={stats}
            />
          </div>

        </div>
      )}
    </div>
  );
}
