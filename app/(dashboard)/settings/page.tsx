"use client";

import React, { useState } from 'react';
import { Settings, Shield, CreditCard, Sparkles, Languages, Check, Star, RefreshCw, HelpCircle, X } from 'lucide-react';
import { getTranslation, Language } from '../../../lib/i18n';
import { SUBSCRIPTION_TIERS, MOROCCAN_CITIES } from '../../../lib/constants';
import { useNotificationCenter } from '../../../hooks/use-notification-center';
import { NotificationPreferencesPanel } from '../../../components/notifications/NotificationPreferencesPanel';
import { getMREPreference, setMREPreference, SUPPORTED_CURRENCIES } from '../../../lib/currency-exchange';
import { useAccounts } from '../../../hooks/use-accounts';

interface SettingsPageProps {
  profile: any;
  onUpdateProfile: (updates: any) => void;
  onUpgrade: (tier: any) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onNavigate?: (route: string) => void;
}

export default function SettingsPage({
  profile,
  onUpdateProfile,
  onUpgrade,
  language,
  setLanguage,
  onNavigate
}: SettingsPageProps) {
  const { notificationPreferences, updatePreferences } = useNotificationCenter(profile?.id || "mock-user-id-9999");
  const { 
    accounts, 
    createAccount, 
    updateAccount, 
    deleteAccount, 
    seedDefaultAccounts 
  } = useAccounts(profile?.id || "mock-user-id-9999");
  const [fullName, setFullName] = useState(profile?.full_name || 'Karim Alaoui');
  const [city, setCity] = useState(profile?.city || 'Casablanca');
  const [phone, setPhone] = useState(profile?.phone || '+212661234567');
  const [updating, setUpdating] = useState(false);

  const [mreEnabled, setMreEnabled] = useState(false);
  const [mreCurrency, setMreCurrency] = useState('EUR');

  React.useEffect(() => {
    const pref = getMREPreference();
    setMreEnabled(pref.enabled);
    setMreCurrency(pref.currency);
  }, []);

  const handleMREToggle = (enabled: boolean) => {
    setMreEnabled(enabled);
    setMREPreference(enabled, mreCurrency);
  };

  const handleMRECurrencyChange = (curr: string) => {
    setMreCurrency(curr);
    setMREPreference(mreEnabled, curr);
  };


  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setTimeout(() => {
      onUpdateProfile({
        full_name: fullName,
        city,
        phone
      });
      setUpdating(false);
      alert("Profil mis à jour avec succès !");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <Settings className="text-slate-700" />
          {getTranslation('settings', language)}
        </h2>
        <p className="text-xs text-gray-500">Configuration de vos préférences, langue d'affichage et abonnement</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Details Form */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-gray-800 border-b border-gray-50 pb-3">
            Informations personnelles
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nom Complet *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Ville de résidence
                </label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500 transition-colors"
                >
                  {MOROCCAN_CITIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Adresse Email
                </label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || 'karim.alaoui@gmail.com'}
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Téléphone (+212)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
            >
              {updating && <RefreshCw size={14} className="animate-spin" />}
              <span>Enregistrer les modifications</span>
            </button>
          </form>
        </div>

        {/* Accounts & Portefeuilles Form/Section */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-gray-800 border-b border-gray-50 pb-3 flex items-center gap-2">
            <CreditCard className="text-emerald-600" size={16} />
            {language === 'darija' ? "El-Hssabate o El-Pouretfeuyat 💳" : "Comptes & Portefeuilles 💳"}
          </h3>

          {accounts.length === 0 ? (
            <div className="text-center py-6 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-3">
              <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-sm mx-auto">
                {language === 'darija'
                  ? "Ma 3ndek tta hssab m'f3el daba. Khassk t-f3el l-hssabate l-3adiya dyal Floussi awla t-zid hssab jdid."
                  : "Aucun compte ou portefeuille n'est actif pour le moment. Activez les comptes recommandés par défaut ou créez-en un nouveau."}
              </p>
              <button
                onClick={seedDefaultAccounts}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
              >
                {language === 'darija' ? "F3el el-hssabate l-3adiya" : "⚡ Activer les comptes recommandés"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {accounts.map(acc => (
                  <div 
                    key={acc.id} 
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${acc.is_active ? 'border-slate-150 bg-slate-50/30' : 'border-slate-100 bg-slate-50/10 opacity-60'}`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-xs font-black text-slate-800 leading-tight truncate">{acc.name}</p>
                        <button
                          onClick={() => updateAccount(acc.id, { is_active: !acc.is_active })}
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider transition-colors cursor-pointer ${acc.is_active ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' : 'bg-slate-100 border border-slate-200 text-slate-400'}`}
                        >
                          {acc.is_active ? (language === 'darija' ? 'Khaddam' : 'Actif') : (language === 'darija' ? 'Mwaqqaf' : 'Inactif')}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 leading-none">{acc.type}</p>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      <span className="text-xs font-black text-slate-950 font-mono">
                        {acc.balance.toLocaleString('fr-FR')} DH
                      </span>
                      <button
                        onClick={() => deleteAccount(acc.id)}
                        className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Custom Account Inline Form */}
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {language === 'darija' ? "Zid Hssab Jdid" : "Ajouter un compte personnalisé"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder={language === 'darija' ? "Smit el-Hssab (ex: CIH)" : "Nom du compte (ex: CIH)"}
                    id="new-acc-name"
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                  />
                  <select
                    id="new-acc-type"
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="checking">Courant (Checking)</option>
                    <option value="savings">Épargne (Savings)</option>
                    <option value="cash">Cash (Portefeuille)</option>
                  </select>
                  <input
                    type="number"
                    placeholder={language === 'darija' ? "Solde (DH)" : "Solde initial (DH)"}
                    id="new-acc-balance"
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      const nameInput = document.getElementById('new-acc-name') as HTMLInputElement;
                      const typeSelect = document.getElementById('new-acc-type') as HTMLSelectElement;
                      const balanceInput = document.getElementById('new-acc-balance') as HTMLInputElement;
                      
                      if (nameInput && typeSelect && balanceInput && nameInput.value && balanceInput.value) {
                        createAccount({
                          name: nameInput.value,
                          type: typeSelect.value as any,
                          balance: parseFloat(balanceInput.value) || 0,
                          currency: 'MAD',
                          is_active: true,
                          color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                          icon: typeSelect.value === 'cash' ? 'Wallet' : typeSelect.value === 'savings' ? 'Landmark' : 'CreditCard'
                        });
                        nameInput.value = '';
                        balanceInput.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-950 text-white font-extrabold text-[10px] rounded-xl transition-all cursor-pointer"
                  >
                    {language === 'darija' ? "Zid l'hssab" : "Ajouter"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Language switch quick widget */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4 h-fit">
          <h3 className="font-extrabold text-sm text-gray-800 border-b border-gray-50 pb-3 flex items-center gap-1.5">
            <Languages size={16} className="text-emerald-600" />
            Choix de la langue
          </h3>

          <div className="space-y-2">
            <button
              onClick={() => setLanguage('fr')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                language === 'fr' ? 'border-emerald-600 bg-emerald-50/30 text-emerald-950' : 'border-slate-100 bg-slate-50/50 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span>Français</span>
              {language === 'fr' && <Check size={14} className="text-emerald-600" />}
            </button>
            <button
              onClick={() => setLanguage('darija')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                language === 'darija' ? 'border-emerald-600 bg-emerald-50/30 text-emerald-950' : 'border-slate-100 bg-slate-50/50 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span>Darija (Latin)</span>
              {language === 'darija' && <Check size={14} className="text-emerald-600" />}
            </button>
          </div>
        </div>

        {/* MRE Preference Widget */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4 h-fit">
          <h3 className="font-extrabold text-sm text-gray-800 border-b border-gray-50 pb-3 flex items-center gap-1.5">
            <Sparkles size={16} className="text-emerald-600" />
            {language === 'darija' ? "مغاربة العالم (Mode MRE)" : "Mode MRE (Marocains du Monde)"}
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-gray-700 block">
                  {language === 'darija' ? "أنا مقيم بالخارج" : "Je suis MRE"}
                </span>
                <span className="text-[10px] text-gray-400 block max-w-xs leading-normal">
                  {language === 'darija' ? "تفعيل العرض المزدوج للعملات وتتبع الحوالات العائلية عن بعد." : "Active l'affichage secondaire en devises et le suivi des transferts familiaux à distance."}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="settings-mre-checkbox"
                  type="checkbox"
                  checked={mreEnabled}
                  onChange={(e) => handleMREToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {mreEnabled && (
              <div className="space-y-1.5 pt-2 animate-fade-in">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  {language === 'darija' ? "العملة الثانية المفضلة" : "Devise secondaire de référence"}
                </label>
                <select
                  id="settings-mre-currency"
                  value={mreCurrency}
                  onChange={(e) => handleMRECurrencyChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  {Object.keys(SUPPORTED_CURRENCIES).map((code) => (
                    <option key={code} value={code}>
                      {code} ({SUPPORTED_CURRENCIES[code].symbol}) - {language === 'darija' ? SUPPORTED_CURRENCIES[code].nameDarija : SUPPORTED_CURRENCIES[code].nameFr}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Notification Preferences */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-gray-800 border-b border-gray-50 pb-3 flex items-center gap-1.5">
          <Settings size={16} className="text-slate-700" />
          {language === 'darija' ? "Tadabir d-Tanbihat" : "Préférences des Notifications"}
        </h3>
        <NotificationPreferencesPanel
          preferences={notificationPreferences}
          onUpdatePreferences={updatePreferences}
          language={language}
        />
      </div>

      {/* Subscription Tiers Pricing grid */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-[10px] bg-amber-50 text-amber-700 font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">
            Abonnements Floussi
          </span>
          <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">
            Passez au niveau supérieur de gestion budgétaire
          </h3>
          <p className="text-xs text-gray-500">
            Libérez votre plein potentiel d'épargne avec nos outils de planification exclusifs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {Object.entries(SUBSCRIPTION_TIERS).slice(0, 3).map(([key, value]) => {
            const isCurrent = profile?.subscription_tier === key;
            return (
              <div 
                key={key} 
                className={`border rounded-2xl p-5 flex flex-col justify-between space-y-5 transition-all ${
                  isCurrent 
                    ? 'border-emerald-600 bg-emerald-50/20 shadow-xs ring-1 ring-emerald-600' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-gray-900 capitalize">
                      {value.name}
                    </h4>
                    {key === 'premium' && (
                      <span className="bg-amber-100 text-amber-800 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded">
                        Populaire
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-extrabold text-gray-900">
                    {value.price}
                  </p>
                  
                  <ul className="space-y-1.5 pt-3">
                    {value.features.map((feat: string, idx: number) => (
                      <li key={idx} className="text-[11px] text-gray-600 flex items-start gap-1.5">
                        <Check size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onUpgrade(key as any)}
                  disabled={isCurrent}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                    isCurrent 
                      ? 'bg-emerald-50 text-emerald-800 cursor-not-allowed font-extrabold' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  {isCurrent ? "Plan Actuel" : "Choisir ce plan"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Help Section & Tour Restart */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-gray-800 border-b border-gray-50 pb-3 flex items-center gap-1.5">
          <HelpCircle size={16} className="text-emerald-600" />
          {language === 'darija' ? "Aide o t-Tawjih" : "Aide & Tutoriel"}
        </h3>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100/60">
          <div className="space-y-1">
            <h4 className="text-xs font-extrabold text-slate-800">
              {language === 'darija' ? "N-choufou t-Tutoriel t-Tafao3oli" : "Revoir le tutoriel du Dashboard"}
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-xl font-medium">
              {language === 'darija' 
                ? "3ndek chi chak f kifach khaddam Dashboard Floussi? 3awed rray l-guide dyalna l-mouchawir bach t-fham l-fada'at d-Dashboard chwiya b chwiya."
                : "Vous avez un doute sur le fonctionnement du Dashboard Floussi ? Relancez notre guide interactif pour une démonstration pas à pas de chaque section clé."}
            </p>
          </div>
          
          <button
            onClick={() => {
              localStorage.setItem('floussi_restart_dashboard_tour', 'true');
              if (onNavigate) {
                onNavigate('dashboard');
              }
            }}
            className="px-4 py-2 bg-slate-150 hover:bg-slate-200 text-slate-800 rounded-xl font-extrabold text-xs transition-all shrink-0 cursor-pointer text-center"
          >
            {language === 'darija' ? "Dda'e l-Guide" : "Lancer le Guide"}
          </button>
        </div>
      </div>

    </div>
  );
}
