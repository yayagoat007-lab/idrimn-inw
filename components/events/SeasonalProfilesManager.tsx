import React, { useState } from 'react';
import { useSeasonalProfiles, SeasonalProfile } from '../../hooks/use-seasonal-profiles';
import { useAuth } from '../../hooks/use-auth';
import { formatCurrency } from '../../lib/utils';
import { Sparkles, CalendarDays, CheckCircle, RefreshCw, Eye, ArrowRight, Check } from 'lucide-react';

export function SeasonalProfilesManager() {
  const { profile } = useAuth();
  const userId = profile?.id || "mock-user-id-9999";
  const { profiles, history, activateProfile, deactivateAllProfiles, getPreviewAdjustments } = useSeasonalProfiles(userId);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  const formatMAD = (val: number) => formatCurrency(val, 'fr').replace('MAD', 'DH');

  const previewList = selectedProfile ? getPreviewAdjustments(selectedProfile) : [];
  const activeProfile = profiles.find(p => p.isActive);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
      <div>
        <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Profils Budgétaires Adaptatifs</span>
        </h3>
        <p className="text-[10px] text-slate-400 font-semibold">
          Activez temporairement des profils de dépenses ajustés aux fêtes nationales et religieuses sans dérégler vos enveloppes de base.
        </p>
      </div>

      {activeProfile ? (
        <div className="flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <p>
              Le profil <strong>{activeProfile.nameFr}</strong> est actuellement actif ! Vos compartiments de dépenses ont été adaptés.
            </p>
          </div>
          <button
            onClick={deactivateAllProfiles}
            className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-black px-2.5 py-1.5 rounded-lg transition-all shadow-sm"
          >
            Réinitialiser
          </button>
        </div>
      ) : (
        <p className="text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-100 p-3 rounded-xl italic">
          Aucun profil adaptatif actif. Vos compartiments budgétaires appliquent leur grille nominale.
        </p>
      )}

      {/* Profiles list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {profiles.map(p => (
          <div 
            key={p.id}
            className={`border rounded-2xl p-4 flex flex-col justify-between transition-all ${
              p.isActive 
                ? 'border-emerald-500 bg-emerald-50/10' 
                : 'border-slate-200 hover:border-emerald-400'
            }`}
          >
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-black text-slate-800">{p.nameFr}</span>
                {p.isActive && (
                  <span className="text-[8px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded-full uppercase">
                    Actif
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                {p.descriptionFr}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => setSelectedProfile(p.id)}
                className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg py-1.5 text-[9px] font-black flex items-center justify-center gap-1 shadow-sm transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Simuler</span>
              </button>

              {!p.isActive && (
                <button
                  onClick={() => activateProfile(p.id)}
                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg py-1.5 text-[9px] font-black transition-all"
                >
                  Activer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selected profile simulation comparative table */}
      {selectedProfile && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Aperçu comparatif avant/après
            </span>
            <button 
              onClick={() => setSelectedProfile(null)}
              className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
            >
              Fermer l'aperçu
            </button>
          </div>

          <div className="space-y-1.5 text-xs font-semibold text-slate-700">
            {previewList.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic">Aucun compartiment correspondant configuré.</p>
            ) : (
              previewList.map(item => (
                <div key={item.bucketName} className="flex justify-between items-center gap-4 bg-white border border-slate-100 p-2.5 rounded-xl">
                  <span>{item.bucketName}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400">{formatMAD(item.original)}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-emerald-600 font-extrabold">{formatMAD(item.adjusted)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* History logs */}
      {history.length > 0 && (
        <div className="space-y-1.5">
          <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-widest">
            Historique d'activation
          </span>
          <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
            {history.map(hist => (
              <div key={hist.id} className="flex justify-between items-center text-[10px] text-slate-500 bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
                <span className="font-semibold">Profil {hist.profileName} activé</span>
                <span className="font-mono text-[9px] text-slate-400">
                  {new Date(hist.activatedAt).toLocaleString('fr-FR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
