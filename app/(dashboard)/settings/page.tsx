"use client";

import React, { useState } from 'react';
import { Settings, Shield, CreditCard, Sparkles, Languages, Check, Star, RefreshCw } from 'lucide-react';
import { getTranslation, Language } from '../../../lib/i18n';
import { SUBSCRIPTION_TIERS, MOROCCAN_CITIES } from '../../../lib/constants';

interface SettingsPageProps {
  profile: any;
  onUpdateProfile: (updates: any) => void;
  onUpgrade: (tier: any) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export default function SettingsPage({
  profile,
  onUpdateProfile,
  onUpgrade,
  language,
  setLanguage
}: SettingsPageProps) {
  const [fullName, setFullName] = useState(profile?.full_name || 'Karim Alaoui');
  const [city, setCity] = useState(profile?.city || 'Casablanca');
  const [phone, setPhone] = useState(profile?.phone || '+212661234567');
  const [updating, setUpdating] = useState(false);

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

    </div>
  );
}
