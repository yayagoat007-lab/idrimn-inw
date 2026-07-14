import React from 'react';
import { useMicroSavings } from '../../hooks/use-micro-savings';
import { useBuckets } from '../../hooks/use-buckets';
import { useAuth } from '../../hooks/use-auth';
import { ToggleLeft, ToggleRight, Target, HelpCircle, Coins, Sparkles } from 'lucide-react';

interface RoundUpSettingsProps {
  lang: 'fr' | 'darija';
}

export function RoundUpSettingsComponent({ lang }: RoundUpSettingsProps) {
  const { user } = useAuth();
  const { buckets } = useBuckets(user?.id || '');
  const { settings, updateRoundUpSettings } = useMicroSavings(user?.id || '');

  if (!settings) return null;

  const thresholds: (5 | 10 | 20 | 50)[] = [5, 10, 20, 50];

  const t = {
    title: lang === 'darija' ? 'Khedem L-Arrondi (Round-up)' : 'Épargne par Arrondi automatique',
    desc: lang === 'darija' ? 'Arrondir kol kherdja l-a9rab 3adad o ssa7e7 l-far9 f sandoq' : 'Arrondir chaque dépense à la tranche supérieure et placer la différence de côté automatiquement.',
    enabled: lang === 'darija' ? 'Mkhdem' : 'Activé',
    disabled: lang === 'darija' ? 'Mteffi' : 'Désactivé',
    thresholdLabel: lang === 'darija' ? 'A9rab 3adad (Seuil) :' : 'Arrondir au multiple de :',
    bucketLabel: lang === 'darija' ? 'Sandoq l-mousstafid (Cible) :' : 'Sandoq de destination :',
    selectBucket: lang === 'darija' ? 'Khtar sandoq' : 'Sélectionner un sandoq...',
    savedTotal: lang === 'darija' ? 'Kamline jme3ti :' : 'Total épargné par arrondi :',
    noBuckets: lang === 'darija' ? 'Khass t-khtar sandoq s-sghir lowwel' : 'Veuillez créer un sandoq (enveloppe) dans l\'onglet Budget d\'abord.'
  };

  const handleToggle = () => {
    updateRoundUpSettings(!settings.enabled, settings.threshold, settings.targetBucketId);
  };

  const handleThresholdChange = (val: 5 | 10 | 20 | 50) => {
    updateRoundUpSettings(settings.enabled, val, settings.targetBucketId);
  };

  const handleBucketChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value === '' ? null : e.target.value;
    updateRoundUpSettings(settings.enabled, settings.threshold, val);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4 font-sans">
      
      {/* Title & Toggle */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Coins size={16} className="text-emerald-600 animate-pulse" />
            <span>{t.title}</span>
          </h4>
          <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{t.desc}</p>
        </div>

        <button 
          type="button"
          onClick={handleToggle}
          className="text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
        >
          {settings.enabled ? (
            <ToggleRight className="text-emerald-600" size={38} />
          ) : (
            <ToggleLeft className="text-slate-300" size={38} />
          )}
        </button>
      </div>

      {settings.enabled && (
        <div className="space-y-4 pt-2 border-t border-slate-50 animate-fadeIn">
          
          {/* Threshold Selection chips */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block flex items-center gap-1">
              <HelpCircle size={11} />
              <span>{t.thresholdLabel}</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {thresholds.map((th) => (
                <button
                  key={th}
                  type="button"
                  onClick={() => handleThresholdChange(th)}
                  className={`py-1.5 rounded-xl text-center text-[11px] font-black font-mono transition-all cursor-pointer ${
                    settings.threshold === th
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-50 border border-slate-150 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {th} DH
                </button>
              ))}
            </div>
          </div>

          {/* Destination Envelope / Bucket Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block flex items-center gap-1">
              <Target size={11} />
              <span>{t.bucketLabel}</span>
            </label>
            {buckets.length === 0 ? (
              <p className="text-[9px] text-rose-500 font-bold bg-rose-50 p-2.5 rounded-xl">{t.noBuckets}</p>
            ) : (
              <select
                value={settings.targetBucketId || ''}
                onChange={handleBucketChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl py-2 px-3 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
              >
                <option value="">{t.selectBucket}</option>
                {buckets.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} (Budget : {(b.allocated_amount - b.spent_amount).toFixed(0)} DH)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Stats saved total indicator */}
          <div className="bg-emerald-50/30 border border-emerald-100/50 rounded-2xl p-3 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-bold flex items-center gap-1">
              <Sparkles size={12} className="text-emerald-600 animate-spin" style={{ animationDuration: '3s' }} />
              {t.savedTotal}
            </span>
            <span className="font-black text-emerald-800 font-mono text-sm">
              +{settings.totalSaved.toFixed(2)} DH
            </span>
          </div>

        </div>
      )}

    </div>
  );
}
