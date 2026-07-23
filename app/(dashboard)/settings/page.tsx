"use client";

import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  CreditCard, 
  Sparkles, 
  Languages, 
  Check, 
  RefreshCw, 
  HelpCircle, 
  X, 
  Download, 
  Upload, 
  Lock, 
  AlertTriangle, 
  Key, 
  FileJson, 
  CheckCircle2, 
  ShieldAlert,
  HeartPulse
} from 'lucide-react';
import { getTranslation, Language } from '../../../lib/i18n';
import { SUBSCRIPTION_TIERS, MOROCCAN_CITIES } from '../../../lib/constants';
import { useNotificationCenter } from '../../../hooks/use-notification-center';
import { NotificationPreferencesPanel } from '../../../components/notifications/NotificationPreferencesPanel';
import { getMREPreference, setMREPreference, SUPPORTED_CURRENCIES } from '../../../lib/currency-exchange';
import { useAccounts } from '../../../hooks/use-accounts';
import { formatCurrency } from '../../../lib/utils';

// New Backup Integration
import { useBackupRestore } from '../../../hooks/use-backup-restore';
import BackupPreviewCard from '../../../components/settings/BackupPreviewCard';
import { BackupPreview } from '../../../lib/full-backup';
import { SubscriptionStatusBadge } from '../../../components/shared/SubscriptionStatusBadge';

// Storage Health and Cleanup
import StorageHealthCard from '../../../components/settings/StorageHealthCard';
import StorageWarningBanner from '../../../components/shared/StorageWarningBanner';
import DataIntegrityPanel from '../../../components/settings/DataIntegrityPanel';

// Floussi Score Integration
import { useFloussiScore } from '../../../hooks/use-floussi-score';
import { FloussiScoreGauge } from '../../../components/score/FloussiScoreGauge';
import { ScoreBreakdownCard } from '../../../components/score/ScoreBreakdownCard';
import { NextTierTipCard } from '../../../components/score/NextTierTipCard';

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
  const userId = profile?.id || "mock-user-id-9999";
  const { score, nextTierTip, isLoading: scoreLoading } = useFloussiScore(userId, language as 'fr' | 'darija');
  const { notificationPreferences, updatePreferences } = useNotificationCenter(userId);
  const { 
    accounts, 
    createAccount, 
    updateAccount, 
    deleteAccount, 
    seedDefaultAccounts 
  } = useAccounts(userId);

  // Profile fields state
  const [fullName, setFullName] = useState(profile?.full_name || 'Karim Alaoui');
  const [city, setCity] = useState(profile?.city || 'Casablanca');
  const [phone, setPhone] = useState(profile?.phone || '+212661234567');
  const [updating, setUpdating] = useState(false);

  // MRE fields state
  const [mreEnabled, setMreEnabled] = useState(false);
  const [mreCurrency, setMreCurrency] = useState('EUR');

  // Sub-tab Navigation
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'backup' | 'integrity'>('general');

  // Backup state variables
  const {
    createBackup,
    isCreatingBackup,
    restoreBackup,
    previewBackup,
    isRestoring,
    lastBackupDate
  } = useBackupRestore(userId);

  const [backupPassword, setBackupPassword] = useState('');
  const [confirmBackupPassword, setConfirmBackupPassword] = useState('');
  const [backupStatus, setBackupStatus] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });

  // Restore state variables
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restorePassword, setRestorePassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [restorePreview, setRestorePreview] = useState<BackupPreview | null>(null);
  const [restoreError, setRestoreError] = useState('');
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

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
      alert(language === 'darija' ? "Profil t-updata b najah ! ✨" : "Profil mis à jour avec succès ! ✨");
    }, 1000);
  };

  // Triggered when creating an encrypted backup
  const handleCreateBackupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBackupStatus({ type: null, text: '' });

    if (backupPassword.length < 4) {
      setBackupStatus({
        type: 'error',
        text: language === 'darija' 
          ? "Khass koud t-tafawot ikon fih toul d 4 hrouf minimum !" 
          : "Le mot de passe de sauvegarde doit faire au moins 4 caractères !"
      });
      return;
    }

    if (backupPassword !== confirmBackupPassword) {
      setBackupStatus({
        type: 'error',
        text: language === 'darija' 
          ? "L-Koudat ma kaye t-chabhouche !" 
          : "Les mots de passe ne correspondent pas !"
      });
      return;
    }

    const success = await createBackup(backupPassword);
    if (success) {
      setBackupStatus({
        type: 'success',
        text: language === 'darija'
          ? "Nuskhah Ihtiyatiyah t-khelqat o t-telecharjat b najah ! h-fda koud dyalk s-s7i7."
          : "Sauvegarde chiffrée créée et téléchargée avec succès ! Conservez précieusement votre mot de passe."
      });
      setBackupPassword('');
      setConfirmBackupPassword('');
    } else {
      setBackupStatus({
        type: 'error',
        text: language === 'darija'
          ? "Khata2 f ncha2 l-backup !"
          : "Erreur lors de la création de la sauvegarde !"
      });
    }
  };

  // Triggered when file selected for restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setRestoreFile(files[0]);
      setRestorePreview(null);
      setRestoreError('');
      setShowRestoreConfirm(false);
    }
  };

  // Verify backup contents (Preview before committing)
  const handleVerifyBackupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreFile) return;

    setIsVerifying(true);
    setRestoreError('');
    setRestorePreview(null);

    const result = await previewBackup(restoreFile, restorePassword);

    setIsVerifying(false);
    if ('error' in result) {
      setRestoreError(result.error);
    } else {
      setRestorePreview(result);
    }
  };

  // Apply actual overwrite restore
  const handleApplyRestore = async () => {
    if (!restoreFile) return;

    const result = await restoreBackup(restoreFile, restorePassword);
    if (result.success) {
      alert(language === 'darija'
        ? "Stirja3 d l-m3loumat khdem b najah ! Radi n-recharger l'application."
        : "Données restaurées avec succès ! Rechargement de l'application."
      );
      window.location.reload();
    } else {
      setRestoreError(result.error || "Erreur lors de la restauration");
      setShowRestoreConfirm(false);
    }
  };

  // Calculate days since last backup for visual alerts
  const lastBackupWarning = React.useMemo(() => {
    if (!lastBackupDate) return true;
    const daysSince = (Date.now() - new Date(lastBackupDate).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 30;
  }, [lastBackupDate]);

  return (
    <div className="space-y-6">
      
      {/* Header & Sub-Tab Swapper */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Settings className="text-slate-700" />
            {getTranslation('settings', language)}
          </h2>
          <p className="text-xs text-gray-500">
            {language === 'darija' 
              ? "Tadbir dyal l-I3dadat o t-Tahfoud dyal m3loumatk localement" 
              : "Configuration de vos préférences, sécurité et sauvegarde locale"}
          </p>
        </div>

        {/* Sub-Tabs switchers */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto shadow-inner border border-slate-200/50">
          <button
            onClick={() => setActiveSubTab('general')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'general' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            {language === 'darija' ? "L-I3dadat l-3ama ⚙️" : "Général & Profil ⚙️"}
          </button>
          <button
            onClick={() => setActiveSubTab('backup')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'backup' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            <Shield size={13} className="text-emerald-600 animate-pulse" />
            <span>{language === 'darija' ? "S-Securité o l-Backup 🛡️" : "Sauvegarde & Sécurité 🛡️"}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('integrity')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'integrity' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            <HeartPulse size={13} className="text-indigo-600 animate-pulse" />
            <span>{language === 'darija' ? "Saha d l-m3loumat 🩺" : "Santé des données 🩺"}</span>
          </button>
        </div>
      </div>

      {/* Storage Warning Banner (warning or critical in Settings) */}
      <StorageWarningBanner 
        userId={userId} 
        language={language} 
        onNavigateToSettings={() => setActiveSubTab('backup')} 
        context="settings"
      />

      {/* RENDER ACTIVE SUB-TAB CONTENT */}
      {activeSubTab === 'general' ? (
        <div className="space-y-6">
          {/* Section Score Floussi */}
          {score && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              <div className="lg:col-span-1 bg-white border border-slate-100/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between items-center">
                <h3 className="font-extrabold text-sm text-gray-800 border-b border-gray-50 pb-3 w-full text-left">
                  {language === 'darija' ? "Moustawa d l-Taqaddom" : "Votre Progression Floussi"}
                </h3>
                <div className="py-4 flex flex-col items-center justify-center flex-grow">
                  <FloussiScoreGauge 
                    score={score.totalScore} 
                    tier={score.tier} 
                    trend={score.trend} 
                    variant="detailed" 
                    language={language as 'fr' | 'darija'} 
                  />
                </div>
              </div>
              <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
                <ScoreBreakdownCard components={score.components} language={language as 'fr' | 'darija'} />
                <NextTierTipCard currentScore={score.totalScore} nextTierTip={nextTierTip} language={language as 'fr' | 'darija'} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Profile Details Form */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-gray-800 border-b border-gray-50 pb-3">
                {language === 'darija' ? "M3loumat l-Khasah" : "Informations personnelles"}
              </h3>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {language === 'darija' ? "Smit-ek l-Kamla *" : "Nom Complet *"}
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
                      {language === 'darija' ? "L-Mdinah dyal s-Souknah" : "Ville de résidence"}
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
                      {language === 'darija' ? "Email" : "Adresse Email"}
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
                      {language === 'darija' ? "Ttilifoun (+212)" : "Téléphone (+212)"}
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
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {updating && <RefreshCw size={14} className="animate-spin" />}
                  <span>{language === 'darija' ? "Hfed l-tghyirat" : "Enregistrer les modifications"}</span>
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
                            {formatCurrency(acc.balance)}
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
                {language === 'darija' ? "Khtar l-Lughah" : "Choix de la langue"}
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
                {language === 'darija' ? "Ishtirakat Floussi" : "Abonnements Floussi"}
              </span>
              <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">
                {language === 'darija' ? "Zid l-gdam f t-tadbir dyal l-budget dyalk" : "Passez au niveau supérieur de gestion budgétaire"}
              </h3>
              <p className="text-xs text-gray-500 pb-2">
                {language === 'darija' 
                  ? "Khlles rassek o t-ba3 l-iddikhar dyalk b l-wasayil l-khasa dyalna." 
                  : "Libérez votre plein potentiel d'épargne avec nos outils de planification exclusifs."}
              </p>

              {/* Current active status detailed badge & cancellation */}
              <div className="flex flex-col items-center justify-center gap-2 pt-2 pb-4">
                <SubscriptionStatusBadge 
                  tier={profile?.subscription_tier || 'free'}
                  language={language as 'fr' | 'darija'}
                  variant="detailed"
                  className="w-full max-w-md mx-auto"
                />
                
                {profile?.subscription_tier && profile?.subscription_tier !== 'free' && (
                  <button
                    onClick={() => {
                      if (confirm(language === 'darija' ? "Wash mti9en bghiti t-cancel l-ishtirak dyalk?" : "Êtes-vous sûr de vouloir résilier votre abonnement ?")) {
                        onUpgrade('free');
                      }
                    }}
                    className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200/50 rounded-xl transition-all cursor-pointer"
                  >
                    {language === 'darija' ? "Ghi l'ishtirak (Downgrade l Fabor)" : "Résilier l'abonnement (Downgrade vers Gratuit)"}
                  </button>
                )}
              </div>
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
                            {language === 'darija' ? "Ma'rouf bzaff" : "Populaire"}
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
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer'
                      }`}
                    >
                      {isCurrent 
                        ? (language === 'darija' ? "L-Ishtirak dyal daba" : "Plan Actuel") 
                        : (language === 'darija' ? "Khtar had l-plan" : "Choisir ce plan")}
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
      ) : activeSubTab === 'backup' ? (
        /* BACKUP AND SECURITY TAB CONTENT */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Main Controls Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Create Backup Box */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
                  <Download className="text-emerald-600" size={16} />
                  {language === 'darija' ? "Créer une sauvegarde chiffrée" : "Créer une sauvegarde chiffrée"}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'darija'
                    ? "Had l-backup s-s7i7a t-khzen ga3 l-m3loumat dyalk b l-koud chiffré s7i7 s-skha dyal wallet o d-dyal l-ahdaf d-iddikhar."
                    : "Cette sauvegarde complète extrait l'intégralité de vos portefeuilles, enveloppes, transactions et progression sous un chiffrement robuste de niveau militaire."}
                </p>
              </div>

              {/* Security info note */}
              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                <ShieldAlert className="text-amber-700 shrink-0 mt-0.5" size={16} />
                <div className="space-y-1">
                  <h4 className="text-[11px] font-black text-amber-900 uppercase tracking-wider">
                    {language === 'darija' ? "Hadi m-himma bzaff !" : "Rappel de sécurité critique"}
                  </h4>
                  <p className="text-[11px] text-amber-800 leading-normal font-medium">
                    {language === 'darija'
                      ? "Khassk t-39al 3la l-mot de passe dyalk dial l-backup ! Ma kaye t-khzen f hta blassa,ila nsiteh mcha l-backup diyalik."
                      : "Le mot de passe que vous définissez ci-dessous n'est jamais stocké ni transmis. Si vous le perdez, votre fichier de sauvegarde sera définitivement illisible. Nous ne pourrons jamais le récupérer."}
                  </p>
                </div>
              </div>

              {/* Password submission form */}
              <form onSubmit={handleCreateBackupSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                      {language === 'darija' ? "Koud dyal l-backup" : "Mot de passe de sauvegarde"}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 text-slate-400" size={14} />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={backupPassword}
                        onChange={e => setBackupPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                      {language === 'darija' ? "T-ked l-koud" : "Confirmer le mot de passe"}
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-3 text-slate-400" size={14} />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirmBackupPassword}
                        onChange={e => setConfirmBackupPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {backupStatus.text && (
                  <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    backupStatus.type === 'success' 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                      : 'bg-rose-50 text-rose-800 border-rose-100'
                  }`}>
                    {backupStatus.type === 'success' ? <CheckCircle2 size={14} className="text-emerald-600" /> : <ShieldAlert size={14} className="text-rose-600" />}
                    <span>{backupStatus.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isCreatingBackup || !backupPassword || !confirmBackupPassword}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isCreatingBackup ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>{language === 'darija' ? "Kaye t-khlaq l-backup..." : "Création de l'archive chiffrée..."}</span>
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      <span>{language === 'darija' ? "Chiffrer et Télécharger l-Backup (.floussi-backup)" : "Chiffrer et Télécharger la sauvegarde (.floussi-backup)"}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Restore Backup Box */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
                  <Upload className="text-emerald-600" size={16} />
                  {language === 'darija' ? "Restaurer une sauvegarde chiffrée" : "Restaurer une sauvegarde chiffrée"}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'darija'
                    ? "Stirja3 l-m3loumat dyalk mn backup khdemha f tilifoun akhor. Khass t-khtar l-fichiy o d-khall l-koud dial l-backup."
                    : "Importez un fichier de sauvegarde (.floussi-backup) créé précédemment pour restaurer l'intégralité de vos comptes et transactions."}
                </p>
              </div>

              {/* Danger warning */}
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="text-rose-700 shrink-0 mt-0.5" size={16} />
                <div className="space-y-1">
                  <h4 className="text-[11px] font-black text-rose-900 uppercase tracking-wider">
                    {language === 'darija' ? "Attention : Khatar dyal l-ketba !" : "Attention : Écrasement des données"}
                  </h4>
                  <p className="text-[11px] text-rose-800 leading-normal font-medium">
                    {language === 'darija'
                      ? "Had Stirja3 radi i-mseh ga3 l-m3loumat l-li 3ndek f tilifoun dyalk daba o i-bdelha b m3loumat dyal l-backup."
                      : "La restauration est une action destructrice. Elle remplacera TOUTES vos données actuelles par celles contenues dans la sauvegarde. Cette opération est irréversible."}
                  </p>
                </div>
              </div>

              {/* Upload & verification form */}
              <form onSubmit={handleVerifyBackupSubmit} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    {language === 'darija' ? "Fichier dyal l-backup (.floussi-backup)" : "Sélectionner le fichier de sauvegarde"}
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FileJson className="w-8 h-8 mb-3 text-slate-400" />
                        <p className="mb-1 text-xs text-slate-500 font-semibold">
                          {restoreFile ? restoreFile.name : (language === 'darija' ? "Khtar l-fichiy dyal backup dyalk" : "Cliquez ou glissez-déposez votre sauvegarde")}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Format .floussi-backup uniquement</p>
                      </div>
                      <input 
                        type="file" 
                        accept=".floussi-backup" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>

                {restoreFile && (
                  <div className="space-y-3 animate-slideDown">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                        {language === 'darija' ? "Koud dyal dechiffrement" : "Mot de passe de déchiffrement"}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 text-slate-400" size={14} />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={restorePassword}
                          onChange={e => setRestorePassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>

                    {restoreError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
                        <ShieldAlert size={14} className="text-rose-600" />
                        <span>{restoreError}</span>
                      </div>
                    )}

                    {!restorePreview && (
                      <button
                        type="submit"
                        disabled={isVerifying || !restorePassword}
                        className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isVerifying ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" />
                            <span>{language === 'darija' ? "Kaye t-verifia..." : "Déchiffrement et Analyse..."}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={14} />
                            <span>{language === 'darija' ? "Verifier la sauvegarde" : "Vérifier la sauvegarde"}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </form>

              {/* DECRYPTED PREVIEW CARD */}
              {restorePreview && (
                <div className="space-y-4 pt-3 border-t border-slate-100 animate-slideDown">
                  <BackupPreviewCard preview={restorePreview} language={language} />

                  {!showRestoreConfirm ? (
                    <button
                      onClick={() => setShowRestoreConfirm(true)}
                      className="w-full px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs cursor-pointer text-center"
                    >
                      {language === 'darija' ? "Stirja3 l-m3loumat dyal l-backup ⚡" : "Démarrer la restauration des données ⚡"}
                    </button>
                  ) : (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-4">
                      <p className="text-xs font-bold text-rose-900 text-center">
                        {language === 'darija'
                          ? "Rak t-2ked t Stirja3 ? L-m3loumat dyalk dyal daba radi t-mseh kamla !"
                          : "Confirmez-vous le remplacement ? Les données actuelles de votre navigateur seront écrasées et l'application va redémarrer."}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowRestoreConfirm(false)}
                          className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs rounded-xl transition-colors cursor-pointer text-center"
                        >
                          {language === 'darija' ? "Gha r-je3" : "Annuler"}
                        </button>
                        <button
                          onClick={handleApplyRestore}
                          disabled={isRestoring}
                          className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1 text-center"
                        >
                          {isRestoring && <RefreshCw size={12} className="animate-spin" />}
                          <span>{language === 'darija' ? "Ah, stirja3 ⚡" : "Oui, restaurer ⚡"}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Backup History & Tips Sidebar Panel */}
          <div className="space-y-6 h-fit">
            
            {/* Storage Health & Cleanup suggestions */}
            <StorageHealthCard userId={userId} language={language} />
            
            {/* Status Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-3.5">
              <h3 className="font-extrabold text-xs text-gray-400 uppercase tracking-wider">
                {language === 'darija' ? "Hala dyal t-Tahfoud" : "État de sauvegarde"}
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    lastBackupWarning ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider leading-none">
                      {language === 'darija' ? "Nuskhah dyal l-Bakap" : "Dernier export"}
                    </p>
                    <p className="text-xs font-bold text-slate-800 mt-1">
                      {lastBackupDate ? (
                        new Date(lastBackupDate).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                      ) : (
                        language === 'darija' ? "Ga3 ma khelliti backup" : "Aucune sauvegarde"
                      )}
                    </p>
                  </div>
                </div>

                {lastBackupWarning ? (
                  <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-[10px] text-amber-800 font-semibold leading-relaxed">
                    {language === 'darija'
                      ? "N-ssiha: Ma dertich backup f had l-30 youm l-li fatet. Khasser d-ir backup f aqrab waqt !"
                      : "Conseil : Vous n'avez pas exporté de sauvegarde depuis plus de 30 jours. Faites-en une aujourd'hui pour garder l'esprit serein !"}
                  </div>
                ) : (
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-[10px] text-emerald-800 font-semibold leading-relaxed">
                    {language === 'darija'
                      ? "Nuskhah dyalk jdida dyal l-backup mzyana o m-hafdha ! ✨"
                      : "Votre sauvegarde est à jour et vos données sont protégées de manière optimale ! ✨"}
                  </div>
                )}
              </div>
            </div>

            {/* Quick backup instruction details */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-3.5">
              <h3 className="font-extrabold text-xs text-gray-400 uppercase tracking-wider">
                {language === 'darija' ? "F-ham khellik m3ana 💡" : "Comment ça marche ? 💡"}
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-slate-800">
                    {language === 'darija' ? "1. Chiffrement local s-s7i7" : "1. Cryptage client ultra-sécurisé"}
                  </h4>
                  <p className="text-[10px] font-medium text-slate-500 leading-normal">
                    {language === 'darija'
                      ? "M3loumatk ga3 t-chiffrat b algorithm AES-GCM 256. Hta blassa (hta serveur) ma t9dr t-choufha bla l-mot de passe dyalk."
                      : "Vos données sont assemblées puis cryptées avec la norme AES-GCM 256 bits directement dans votre navigateur. Floussi n'a jamais accès à vos secrets."}
                  </p>
                </div>

                <div className="space-y-1 pt-1.5 border-t border-slate-50">
                  <h4 className="text-xs font-extrabold text-slate-800">
                    {language === 'darija' ? "2. Stirja3 f khes l-waqt" : "2. Restauration instantanée"}
                  </h4>
                  <p className="text-[10px] font-medium text-slate-500 leading-normal">
                    {language === 'darija'
                      ? "Khtar l-fichiy o d-khall l-koud diyalik, radi t-stirja3 l-solde dyal l-wallet, enveloppes o l-transactions dyalk f talya."
                      : "Importez le fichier sur n'importe quel autre appareil, saisissez votre mot de passe de sauvegarde, et retrouvez l'intégralité de vos comptes et tontines."}
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* INTEGRITY/DATA HEALTH TAB CONTENT */
        <DataIntegrityPanel userId={userId} language={language} />
      )}

    </div>
  );
}
