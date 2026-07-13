"use client";

import React, { useState } from 'react';
import { useBuckets } from '../../../../hooks/use-buckets';
import { useBudgetSettings } from '../../../../hooks/use-budget-settings';
import { AllocationRulesEditor } from '../../../../components/buckets/AllocationRulesEditor';
import { BucketForm } from '../../../../components/buckets/BucketForm';
import { formatCurrency } from '../../../../lib/utils';
import { Language, getTranslation } from '../../../../lib/i18n';
import { ArrowLeft, Sliders, ShieldAlert, Sparkles, BellRing, Save, Trash2 } from 'lucide-react';

interface BucketsSettingsPageProps {
  language?: Language;
  onNavigate?: (screen: string) => void;
}

export default function BucketsSettingsPage({
  language = 'fr',
  onNavigate
}: BucketsSettingsPageProps) {
  const { buckets, createBucket, updateBucket, deleteBucket } = useBuckets();
  const { 
    incomes, 
    alerts, 
    totalMonthlyIncome, 
    updateIncome, 
    updateAllocationRules, 
    applyTemplateRules, 
    updateAlertSettings 
  } = useBudgetSettings();

  const [activeFormBucket, setActiveFormBucket] = useState<any | null>(null);
  const [showBucketCreator, setShowBucketCreator] = useState(false);
  const [salaryInput, setSalaryInput] = useState<number>(totalMonthlyIncome || 10000);

  // Success states
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleApplyTemplate = async (template: '503020' | '602020') => {
    if (incomes.length === 0) return;
    const incomeId = incomes[0].id;
    await applyTemplateRules(incomeId, template, buckets);
    triggerSuccess("Règles du modèle appliquées !");
  };

  const handleSaveRules = async (rules: Record<string, number>) => {
    if (incomes.length === 0) return;
    const incomeId = incomes[0].id;
    await updateAllocationRules(incomeId, rules);
    
    // Also save corresponding salary if modified
    if (salaryInput !== totalMonthlyIncome) {
      await updateIncome(incomeId, { amount: salaryInput });
    }
    triggerSuccess("Pourcentages de répartition enregistrés avec succès !");
  };

  const handleUpdateAlerts = async (key: string, value: any) => {
    await updateAlertSettings({ [key]: value });
    triggerSuccess("Paramètres d'alertes mis à jour !");
  };

  const triggerSuccess = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const activeRules = incomes.length > 0 ? incomes[0].auto_allocate_rules : {};

  return (
    <div className="space-y-6 font-sans pb-12">
      
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate && onNavigate('buckets')}
          className="p-2.5 bg-white hover:bg-slate-50 text-slate-500 rounded-2xl border border-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
            <span>Configuration des Sanadiq</span>
          </h2>
          <p className="text-xs text-slate-400 font-semibold">
            Gérez vos enveloppes budgétaires, règles de répartition de salaire, et alertes de dépassement.
          </p>
        </div>
      </div>

      {/* Save Success Notice */}
      {saveStatus && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-3xl text-xs font-black text-emerald-800 flex items-center gap-2 animate-pulse shadow-xs">
          <Sparkles size={16} className="text-amber-500" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Grid containing Config Editor and Alerts Config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Rules Editor & Monthly Salary */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Monthly Salary Card */}
          <div className="bg-white border border-slate-100 p-5 rounded-3xl space-y-4 shadow-3xs">
            <div>
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">Base de salaire mensuelle</h4>
              <p className="text-[10px] text-slate-400 font-bold">Le salaire ou revenu de base utilisé pour calculer la répartition en DH réels</p>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                value={salaryInput}
                onChange={(e) => setSalaryInput(Number(e.target.value))}
                className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-800 focus:outline-hidden w-48"
              />
              <span className="text-xs font-bold text-slate-400">DH par mois</span>
            </div>
          </div>

          <AllocationRulesEditor
            buckets={buckets}
            initialRules={activeRules}
            monthlySalary={salaryInput}
            onSave={handleSaveRules}
            onApplyTemplate={handleApplyTemplate}
          />
        </div>

        {/* Alerts Configuration & Buckets List Panel */}
        <div className="space-y-6">
          
          {/* Alerts configuration */}
          <div className="bg-white border border-slate-100 p-5 rounded-3xl space-y-4 shadow-3xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
              <div className="p-2 bg-rose-50 text-rose-700 rounded-xl">
                <BellRing size={16} />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">Notification d'alertes</h4>
                <p className="text-[10px] text-slate-400 font-bold">Seuils de dépassement et canaux d'alertes</p>
              </div>
            </div>

            {/* Global Threshold slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Seuil de warning global :</span>
                <span className="font-extrabold text-slate-800">{alerts.globalThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={alerts.globalThreshold}
                onChange={(e) => handleUpdateAlerts('globalThreshold', Number(e.target.value))}
                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                Vous recevrez un avertissement lorsque votre jauge de sandoq dépasse ce pourcentage.
              </p>
            </div>

            {/* Notification Toggles */}
            <div className="space-y-3 pt-3 border-t border-slate-50">
              {/* Push Toggle */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Alertes de Push Mobile</span>
                <button
                  onClick={() => handleUpdateAlerts('enablePush', !alerts.enablePush)}
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-all ${alerts.enablePush ? 'bg-emerald-500' : 'bg-slate-200'} cursor-pointer`}
                >
                  <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transition-transform ${alerts.enablePush ? 'translate-x-4.5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Email Toggle */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Alertes par Email</span>
                <button
                  onClick={() => handleUpdateAlerts('enableEmail', !alerts.enableEmail)}
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-all ${alerts.enableEmail ? 'bg-emerald-500' : 'bg-slate-200'} cursor-pointer`}
                >
                  <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transition-transform ${alerts.enableEmail ? 'translate-x-4.5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* SMS Toggle */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  <span>Alertes SMS (+212)</span>
                  <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[8px] font-black uppercase rounded-md">PRO</span>
                </span>
                <button
                  onClick={() => handleUpdateAlerts('enableSms', !alerts.enableSms)}
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-all ${alerts.enableSms ? 'bg-emerald-500' : 'bg-slate-200'} cursor-pointer`}
                >
                  <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transition-transform ${alerts.enableSms ? 'translate-x-4.5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

          </div>

          {/* Quick Creator list */}
          <div className="bg-white border border-slate-100 p-5 rounded-3xl space-y-4 shadow-3xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-50">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">Modifier mes Sanadiq</h4>
              <button
                onClick={() => {
                  setActiveFormBucket(null);
                  setShowBucketCreator(true);
                }}
                className="text-[10px] font-black uppercase text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                + Ajouter
              </button>
            </div>

            <div className="divide-y divide-slate-50 max-h-60 overflow-y-auto pr-1">
              {buckets.map(b => (
                <div key={b.id} className="py-2.5 flex justify-between items-center text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                    <span className="line-clamp-1">{b.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveFormBucket(b);
                        setShowBucketCreator(true);
                      }}
                      className="text-[10px] font-black text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Éditer
                    </button>
                    <button
                      onClick={() => deleteBucket(b.id)}
                      className="text-[10px] font-black text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      Mseh
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Floating Popup Bucket Creator form */}
      {showBucketCreator && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <BucketForm
              bucket={activeFormBucket}
              buckets={buckets}
              onSubmit={async (data) => {
                if (activeFormBucket) {
                  await updateBucket(activeFormBucket.id, data);
                  triggerSuccess("Compartiment mis à jour !");
                } else {
                  await createBucket(data);
                  triggerSuccess("Compartiment créé !");
                }
                setShowBucketCreator(false);
              }}
              onCancel={() => setShowBucketCreator(false)}
              limitReached={buckets.length >= 3 && !activeFormBucket}
            />
          </div>
        </div>
      )}

    </div>
  );
}
