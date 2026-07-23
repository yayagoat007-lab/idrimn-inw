import React, { useState } from 'react';
import { Eye, EyeOff, ShieldAlert, RotateCcw, AlertTriangle, Lock, Check } from 'lucide-react';
import { DASHBOARD_WIDGETS_REGISTRY, DashboardWidget } from '../../lib/dashboard-widgets-registry';
import { UserWidgetLayout } from '../../hooks/use-dashboard-layout';
import { Language } from '../../lib/i18n';

interface WidgetVisibilityPanelProps {
  layout: UserWidgetLayout[];
  onToggleVisibility: (id: string) => void;
  onReset: () => void;
  userTier: string;
  language: Language;
}

const TIER_RANKS: Record<string, number> = {
  'free': 0,
  'premium': 1,
  'family': 2,
  'analyse': 3,
  'elite': 4
};

export function WidgetVisibilityPanel({
  layout,
  onToggleVisibility,
  onReset,
  userTier = 'free',
  language
}: WidgetVisibilityPanelProps) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Map category ids to labels
  const categoryLabels: Record<string, { fr: string; darija: string }> = {
    financial: { fr: "Finances & Soldes", darija: "Maliya o Solde" },
    social: { fr: "Social & Traditions", darija: "Daret o Mounasabate" },
    progress: { fr: "Progression & Score", darija: "Ahdaf o Score" },
    info: { fr: "Informations & Alertes", darija: "Ma'loumat o Tanbihate" }
  };

  // Map widget ids to names and descriptions
  const widgetDetails: Record<string, { nameFr: string; nameDarija: string; descFr: string; descDarija: string }> = {
    solde: {
      nameFr: "Solde Disponible",
      nameDarija: "Solde l-jib",
      descFr: "Affiche vos soldes bancaires totaux et par type de compte.",
      descDarija: "Kaye'teek ch'hal 3endek f l-kounte l-courant o l-epargne."
    },
    score: {
      nameFr: "Score Financier Floussi",
      nameDarija: "Floussi Score",
      descFr: "Votre santé financière représentée par notre algorithme intelligent.",
      descDarija: "Mouchir d l-seha l-maliya dyalek b t-tafsil."
    },
    free_to_spend: {
      nameFr: "Reste à dépenser & Projections",
      nameDarija: "Ch'hal bqa l l-sarf",
      descFr: "Gauges de sécurité de reste à dépenser et projections de fin de mois.",
      descDarija: "Kay hseb ch'hal baqi lik l l-sarf bla ma tqis l-epargne."
    },
    buckets: {
      nameFr: "Compartiments (Sanadiq)",
      nameDarija: "Sanadiq l-maliya",
      descFr: "Vos enveloppes budgétaires virtuelles pour vos charges.",
      descDarija: "L-ghilafat d l-flous dyal l-masarif s-sahla."
    },
    events: {
      nameFr: "Événements & Traditions",
      nameDarija: "Al-Mounasabate s-sa3ida",
      descFr: "Compte à rebours et cagnottes pour l'Aïd, Ramadan, etc.",
      descDarija: "Teqyid l-mounasabate l-marocaniya bhal l-3id o l-moussem."
    },
    tontine: {
      nameFr: "Tontine Collective (Daret)",
      nameDarija: "Daret l-taclidiya",
      descFr: "Suivi de votre d’épargne collective traditionnelle.",
      descDarija: "Teb3 daret dyalek m3a l-3aila o l-asdiqa."
    },
    goals: {
      nameFr: "Objectifs d'Épargne",
      nameDarija: "Ahdaf d l-epargne",
      descFr: "Suivi de vos projets d’achat et d’investissement.",
      descDarija: "Teb3 l-mouchari3 dyalek li baghi techri f l-moustaqbal."
    },
    transactions: {
      nameFr: "Saisies Récentes",
      nameDarija: "Teqyidat l-khra",
      descFr: "Liste rapide de vos dernières transactions de cash et carte.",
      descDarija: "L-khlassat dyal l-masarif l-khra li derti."
    },
    alertes: {
      nameFr: "Alertes Budgétaires",
      nameDarija: "Al-Tanbihate",
      descFr: "Bannières d’alerte en cas de dépassement ou d'anomalie.",
      descDarija: "Meyzat l-indare ila kenti ghad t-fout l-budget."
    }
  };

  const hasWidgetAccess = (widget: DashboardWidget) => {
    if (!widget.minSubscriptionTier) return true;
    const userRank = TIER_RANKS[userTier.toLowerCase()] || 0;
    const requiredRank = TIER_RANKS[widget.minSubscriptionTier.toLowerCase()] || 0;
    return userRank >= requiredRank;
  };

  // Group widgets by category
  const categories = ['financial', 'progress', 'social', 'info'] as const;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-50 pb-4">
        <div>
          <h2 className="text-base font-black text-slate-800 uppercase tracking-tight">
            {language === 'fr' ? "Organisation des Widgets" : "Tanzim l-Widgets"}
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            {language === 'fr'
              ? "Affichez ou masquez les modules selon vos priorités quotidiennes."
              : "Bayen oula khbi l-ajza' d l-Dashboard dyalek 3la hsab chnou bghiti."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {showConfirmReset ? (
            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 p-1.5 rounded-xl animate-fadeIn">
              <span className="text-[10px] text-rose-700 font-bold px-1">
                {language === 'fr' ? "Confirmer ?" : "Met'aqed ?"}
              </span>
              <button
                onClick={() => {
                  onReset();
                  setShowConfirmReset(false);
                }}
                className="px-2 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase cursor-pointer hover:bg-rose-700 transition-colors"
              >
                {language === 'fr' ? "Oui" : "Iyeh"}
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-[10px] font-black uppercase cursor-pointer hover:bg-slate-300 transition-colors"
              >
                {language === 'fr' ? "Non" : "La"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="flex items-center gap-1 px-3 py-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? "Réinitialiser" : "Rejja3 kif kan"}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(cat => {
          const widgetsInCat = DASHBOARD_WIDGETS_REGISTRY.filter(w => w.category === cat);
          if (widgetsInCat.length === 0) return null;

          return (
            <div key={cat} className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {language === 'fr' ? categoryLabels[cat].fr : categoryLabels[cat].darija}
              </h3>

              <div className="space-y-2.5">
                {widgetsInCat.map(widget => {
                  const details = widgetDetails[widget.id] || {
                    nameFr: widget.id,
                    nameDarija: widget.id,
                    descFr: "",
                    descDarija: ""
                  };

                  const layoutConfig = layout.find(l => l.id === widget.id);
                  const isVisible = layoutConfig ? layoutConfig.visible : widget.defaultVisible;
                  const isAccessible = hasWidgetAccess(widget);

                  return (
                    <div
                      key={widget.id}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all ${
                        !isAccessible
                          ? 'bg-slate-50/50 border-slate-100 opacity-60'
                          : isVisible
                          ? 'bg-emerald-50/30 border-emerald-100/50 hover:bg-emerald-50/50'
                          : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      {/* Checkbox / Toggle wrapper */}
                      <div className="pt-0.5 shrink-0">
                        {isAccessible ? (
                          <button
                            onClick={() => onToggleVisibility(widget.id)}
                            className={`w-9 h-5 rounded-full p-0.5 transition-all cursor-pointer duration-300 flex items-center ${
                              isVisible ? 'bg-emerald-500 justify-end' : 'bg-slate-200 justify-start'
                            }`}
                            aria-label={`Toggle ${details.nameFr}`}
                          >
                            <span className="w-4 h-4 rounded-full bg-white shadow-sm transition-all" />
                          </button>
                        ) : (
                          <div className="w-5 h-5 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                            <Lock className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      {/* Info and Description */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-xs font-black tracking-tight ${!isAccessible ? 'text-slate-400' : 'text-slate-800'}`}>
                            {language === 'fr' ? details.nameFr : details.nameDarija}
                          </span>
                          
                          {!isAccessible && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 border border-amber-200/50 text-amber-700 rounded-full text-[9px] font-extrabold uppercase tracking-wide">
                              <Lock className="w-2.5 h-2.5" />
                              <span>{language === 'fr' ? "Premium requis" : "Khass Premium"}</span>
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] leading-normal font-semibold ${!isAccessible ? 'text-slate-400/80' : 'text-slate-400'}`}>
                          {language === 'fr' ? details.descFr : details.descDarija}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
